'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface ClienteData {
    cliente: {
        id: string;
        nombre: string;
        dni: string;
    };
    saldo: {
        total: number;
        cuotasVencidas: number;
        limiteCredito: number;
        creditoDisponible: number;
    };
    proximasCuotas: any[];
}

export default function MiCuentaPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const orgId = searchParams.get('org') || 'org_default'; // Debería venir del contexto

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ClienteData | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            router.push('/mi-cuenta/login');
            return;
        }

        // Validar token y cargar datos
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            // Nota: En un sistema real, primero validamos el token contra /api/auth/validate-token
            // que nos daría una cookie de sesión o un JWT.
            // Para este prototipo, enviamos el token como "auth" temporario o usamos el API Key approach
            // Vamos a invocar un endpoint nuevo que acepte el token para obtener los datos del cliente
            // GET /api/v1/portal/init?token=...&org=...

            const res = await fetch(`/api/portal/init?token=${token}&org=${orgId}`);
            if (!res.ok) throw new Error('Sesión inválida o expirada');

            const result = await res.json();
            setData(result.data);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar tu cuenta. El enlace puede haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (monto: number, cuotasIds: string[]) => {
        // Redirigir a crear preferencia
        try {
            const res = await fetch('/api/pagos/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: orgId,
                    cliente: data?.cliente,
                    items: [{
                        id: 'pago-cuotas',
                        title: 'Pago de Cuotas - Don Cándido',
                        quantity: 1,
                        unit_price: monto,
                        currency_id: 'ARS'
                    }],
                    backUrls: {
                        success: window.location.href, // Volver aquí mismo
                        failure: window.location.href,
                        pending: window.location.href
                    }
                })
            });

            const result = await res.json();
            if (result.init_point) {
                window.location.href = result.init_point;
            }
        } catch (e) {
            console.error(e);
            alert('Error al iniciar pago');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 font-mono">
                <Card className="max-w-md bg-card border-destructive text-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-500">
                            <AlertCircle className="mr-2" />
                            Error de Acceso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => router.push('/mi-cuenta/login')} variant="secondary">
                            Ir al Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                            Hola, {data.cliente.nombre.split(' ')[0]}
                        </h1>
                        <p className="text-muted-foreground">Panel de Cliente</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-card border-border">
                            DNI: {data.cliente.dni}
                        </Badge>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Saldo Card */}
                    <Card className="bg-gradient-to-br from-card to-muted border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Saldo Total a Pagar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground mb-1">
                                ${data.saldo.total.toLocaleString()}
                            </div>
                            {data.saldo.cuotasVencidas > 0 && (
                                <div className="flex items-center text-red-400 text-sm mt-2">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {data.saldo.cuotasVencidas} cuota(s) vencida(s)
                                </div>
                            )}
                            <div className="mt-6">
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={() => handlePay(data.saldo.total, [])}
                                    disabled={data.saldo.total <= 0}
                                >
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Pagar Total
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disponible Card */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Crédito Disponible
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-emerald-400 mb-1">
                                ${data.saldo.creditoDisponible.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                De tu límite de ${data.saldo.limiteCredito.toLocaleString()}
                            </p>
                            <div className="mt-6">
                                <Button variant="outline" className="w-full border-border hover:bg-accent" onClick={() => router.push('/tienda')}>
                                    Ver Catálogo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Integration with Payment Logic Mocked Here for now via generic button, can be enhanced */}

                {/* Cuotas List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Próximos Vencimientos</h2>
                    <div className="space-y-3">
                        {data.proximasCuotas.length === 0 ? (
                            <p className="text-muted-foreground italic">No tenés cuotas pendientes próximamente.</p>
                        ) : (
                            data.proximasCuotas.map((cuota: any) => (
                                <div
                                    key={cuota.cuotaId}
                                    className={`
                                        flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border
                                        ${new Date(cuota.vencimiento) < new Date()
                                            ? 'bg-destructive/10 border-destructive/50'
                                            : 'bg-card border-border'}
                                    `}
                                >
                                    <div className="mb-2 sm:mb-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Cuota #{cuota.numero}</span>
                                            {new Date(cuota.vencimiento) < new Date() && (
                                                <Badge variant="destructive" className="text-xs">Vencida</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Vence: {new Date(cuota.vencimiento).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="text-lg font-bold text-foreground">
                                            ${cuota.saldoPendiente.toLocaleString()}
                                        </span>
                                        <Button
                                            size="sm"
                                            className="ml-auto sm:ml-0"
                                            onClick={() => handlePay(cuota.saldoPendiente, [cuota.cuotaId])}
                                        >
                                            Pagar
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
