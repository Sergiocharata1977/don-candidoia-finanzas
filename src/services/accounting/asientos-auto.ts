/**
 * Servicio de Asientos Automáticos
 * Genera asientos contables desde operaciones estándar
 * El usuario NO interactúa con este servicio directamente
 * 
 * Basado en SIG-Agro: asientos-auto.ts
 */

import {
    collection,
    addDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
    TipoOperacion,
    AsientoAutomatico,
    LineaAsientoAuto,
    DatosOperacion,
    DatosIngresoDinero,
    DatosGastoPago,
    DatosCompraCredito,
    DatosPagoDeuda,
    DatosVentaProducto,
    DatosCobroCliente,
    DatosTransferencia,
    PLAN_CUENTAS_FINANZAS,
    CUENTA_POR_MEDIO_PAGO,
    CUENTA_POR_CATEGORIA_INGRESO,
    CUENTA_POR_CATEGORIA_GASTO,
} from '@/types/contabilidad-auto';
import { registrarMovimientoTercero } from './terceros';
import { registrarMovimientoCajaBanco } from './cuentas-bancarias';

const getAsientosPath = (orgId: string) => `organizations/${orgId}/asientos_auto`;

// ============================================
// FUNCIÓN PRINCIPAL: GENERAR ASIENTO AUTOMÁTICO
// ============================================

/**
 * Genera un asiento contable automático según el tipo de operación
 * Esta función es llamada internamente por los formularios de operaciones
 */
export async function generarAsientoAutomatico(
    orgId: string,
    tipoOperacion: TipoOperacion,
    datos: DatosOperacion,
    operacionId: string
): Promise<string> {
    let lineas: LineaAsientoAuto[] = [];
    let descripcion = '';
    let terceroId: string | undefined;
    let terceroNombre: string | undefined;
    let fecha: Date;

    // Según el tipo de operación, generar las líneas correspondientes
    switch (tipoOperacion) {
        case 'ingreso_dinero': {
            const d = datos as DatosIngresoDinero;
            const cuentaCaja = d.medioPago === 'efectivo' ? '1.1.1' : '1.1.2';
            const cuentaIngreso = CUENTA_POR_CATEGORIA_INGRESO[d.categoria];

            lineas = [
                {
                    cuentaId: cuentaCaja,
                    cuentaNombre: obtenerNombreCuenta(cuentaCaja),
                    debe: d.monto,
                    haber: 0,
                },
                {
                    cuentaId: cuentaIngreso,
                    cuentaNombre: obtenerNombreCuenta(cuentaIngreso),
                    debe: 0,
                    haber: d.monto,
                },
            ];
            descripcion = `Ingreso: ${d.descripcion}`;
            fecha = d.fecha;

            // Registrar movimiento en caja/banco
            if (d.cuentaBancariaId) {
                await registrarMovimientoCajaBanco(orgId, {
                    cuentaId: d.cuentaBancariaId,
                    fecha: d.fecha,
                    tipo: 'ingreso',
                    monto: d.monto,
                    descripcion,
                    asientoId: operacionId,
                });
            }
            break;
        }

        case 'gasto_pago': {
            const d = datos as DatosGastoPago;
            const cuentaCaja = CUENTA_POR_MEDIO_PAGO[d.medioPago];
            const cuentaGasto = CUENTA_POR_CATEGORIA_GASTO[d.categoria];

            lineas = [
                {
                    cuentaId: cuentaGasto,
                    cuentaNombre: obtenerNombreCuenta(cuentaGasto),
                    debe: d.monto,
                    haber: 0,
                },
                {
                    cuentaId: cuentaCaja,
                    cuentaNombre: obtenerNombreCuenta(cuentaCaja),
                    debe: 0,
                    haber: d.monto,
                },
            ];
            descripcion = `Gasto: ${d.descripcion}`;
            terceroId = d.terceroId;
            fecha = d.fecha;

            // Registrar movimiento en caja/banco
            if (d.cuentaBancariaId) {
                await registrarMovimientoCajaBanco(orgId, {
                    cuentaId: d.cuentaBancariaId,
                    fecha: d.fecha,
                    tipo: 'egreso',
                    monto: -d.monto,  // Negativo para egreso
                    descripcion,
                    asientoId: operacionId,
                });
            }
            break;
        }

        case 'compra_credito': {
            const d = datos as DatosCompraCredito;
            const cuentaGasto = CUENTA_POR_CATEGORIA_GASTO[d.categoria];

            lineas = [
                {
                    cuentaId: cuentaGasto,
                    cuentaNombre: obtenerNombreCuenta(cuentaGasto),
                    debe: d.monto,
                    haber: 0,
                },
                {
                    cuentaId: '2.1.1', // Proveedores
                    cuentaNombre: 'Proveedores',
                    debe: 0,
                    haber: d.monto,
                },
            ];
            descripcion = `Compra a crédito: ${d.descripcion}`;
            terceroId = d.terceroId;
            fecha = d.fecha;

            // Registrar movimiento en tercero (aumenta saldoProveedor)
            await registrarMovimientoTercero(orgId, {
                terceroId: d.terceroId,
                fecha: d.fecha,
                tipoOperacion: 'compra_credito',
                descripcion,
                montoCliente: 0,
                montoProveedor: d.monto, // Les debemos más
                asientoId: operacionId,
            });
            break;
        }

        case 'pago_deuda': {
            const d = datos as DatosPagoDeuda;
            const cuentaCaja = CUENTA_POR_MEDIO_PAGO[d.medioPago];

            lineas = [
                {
                    cuentaId: '2.1.1', // Proveedores
                    cuentaNombre: 'Proveedores',
                    debe: d.monto,
                    haber: 0,
                },
                {
                    cuentaId: cuentaCaja,
                    cuentaNombre: obtenerNombreCuenta(cuentaCaja),
                    debe: 0,
                    haber: d.monto,
                },
            ];
            descripcion = `Pago de deuda: ${d.descripcion}`;
            terceroId = d.terceroId;
            fecha = d.fecha;

            // Registrar movimiento en tercero (reduce saldoProveedor)
            await registrarMovimientoTercero(orgId, {
                terceroId: d.terceroId,
                fecha: d.fecha,
                tipoOperacion: 'pago_deuda',
                descripcion,
                montoCliente: 0,
                montoProveedor: -d.monto, // Les debemos menos
                asientoId: operacionId,
            });

            // Registrar movimiento en caja/banco
            if (d.cuentaBancariaId) {
                await registrarMovimientoCajaBanco(orgId, {
                    cuentaId: d.cuentaBancariaId,
                    fecha: d.fecha,
                    tipo: 'egreso',
                    monto: -d.monto,
                    descripcion,
                    asientoId: operacionId,
                });
            }
            break;
        }

        case 'venta_producto': {
            const d = datos as DatosVentaProducto;
            const montoTotal = d.cantidad * d.precioUnitario;

            lineas = [
                {
                    cuentaId: '1.2.1', // Clientes
                    cuentaNombre: 'Clientes',
                    debe: montoTotal,
                    haber: 0,
                },
                {
                    cuentaId: '4.1.1', // Ventas de Productos
                    cuentaNombre: 'Ventas de Productos',
                    debe: 0,
                    haber: montoTotal,
                },
            ];
            descripcion = d.descripcion;
            terceroId = d.terceroId;
            fecha = d.fecha;

            // Registrar movimiento en tercero (aumenta saldoCliente)
            await registrarMovimientoTercero(orgId, {
                terceroId: d.terceroId,
                fecha: d.fecha,
                tipoOperacion: 'venta_producto',
                descripcion,
                montoCliente: montoTotal, // Nos deben más
                montoProveedor: 0,
                asientoId: operacionId,
            });
            break;
        }

        case 'cobro_cliente': {
            const d = datos as DatosCobroCliente;
            const cuentaCaja = CUENTA_POR_MEDIO_PAGO[d.medioPago];

            lineas = [
                {
                    cuentaId: cuentaCaja,
                    cuentaNombre: obtenerNombreCuenta(cuentaCaja),
                    debe: d.monto,
                    haber: 0,
                },
                {
                    cuentaId: '1.2.1', // Clientes
                    cuentaNombre: 'Clientes',
                    debe: 0,
                    haber: d.monto,
                },
            ];
            descripcion = `Cobro de cliente: ${d.descripcion}`;
            terceroId = d.terceroId;
            fecha = d.fecha;

            // Registrar movimiento en tercero (reduce saldoCliente)
            await registrarMovimientoTercero(orgId, {
                terceroId: d.terceroId,
                fecha: d.fecha,
                tipoOperacion: 'cobro_cliente',
                descripcion,
                montoCliente: -d.monto, // Nos deben menos
                montoProveedor: 0,
                asientoId: operacionId,
            });

            // Registrar movimiento en caja/banco
            if (d.cuentaBancariaId) {
                await registrarMovimientoCajaBanco(orgId, {
                    cuentaId: d.cuentaBancariaId,
                    fecha: d.fecha,
                    tipo: 'ingreso',
                    monto: d.monto,
                    descripcion,
                    asientoId: operacionId,
                });
            }
            break;
        }

        case 'transferencia': {
            const d = datos as DatosTransferencia;

            lineas = [
                {
                    cuentaId: d.cuentaDestinoId,
                    cuentaNombre: 'Cuenta Destino',
                    debe: d.monto,
                    haber: 0,
                },
                {
                    cuentaId: d.cuentaOrigenId,
                    cuentaNombre: 'Cuenta Origen',
                    debe: 0,
                    haber: d.monto,
                },
            ];
            descripcion = `Transferencia: ${d.descripcion}`;
            fecha = d.fecha;

            // Registrar movimientos en ambas cuentas
            await registrarMovimientoCajaBanco(orgId, {
                cuentaId: d.cuentaOrigenId,
                fecha: d.fecha,
                tipo: 'transferencia',
                monto: -d.monto,
                descripcion: `${descripcion} (salida)`,
                asientoId: operacionId,
            });

            await registrarMovimientoCajaBanco(orgId, {
                cuentaId: d.cuentaDestinoId,
                fecha: d.fecha,
                tipo: 'transferencia',
                monto: d.monto,
                descripcion: `${descripcion} (entrada)`,
                asientoId: operacionId,
            });
            break;
        }
    }

    // Validar doble partida
    const totalDebe = lineas.reduce((sum, l) => sum + l.debe, 0);
    const totalHaber = lineas.reduce((sum, l) => sum + l.haber, 0);

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
        throw new Error(`Error de balance: Debe=${totalDebe}, Haber=${totalHaber}`);
    }

    // Guardar asiento
    const asientosRef = collection(db, getAsientosPath(orgId));

    const asientoData: Omit<AsientoAutomatico, 'id'> = {
        organizationId: orgId,
        tipoOperacion,
        operacionId,
        descripcion,
        fecha: fecha!,
        lineas,
        totalDebe,
        totalHaber,
        terceroId,
        terceroNombre,
        createdAt: new Date(),
    };

    const docRef = await addDoc(asientosRef, {
        ...asientoData,
        fecha: Timestamp.fromDate(fecha!),
        createdAt: Timestamp.now(),
    });

    return docRef.id;
}

// ============================================
// HELPERS
// ============================================

function obtenerNombreCuenta(cuentaId: string): string {
    const cuenta = PLAN_CUENTAS_FINANZAS.find(c => c.id === cuentaId);
    return cuenta?.nombre || 'Cuenta desconocida';
}
