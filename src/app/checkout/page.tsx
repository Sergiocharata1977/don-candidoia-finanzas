'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
    });

    // Payment state
    const [formaPago, setFormaPago] = useState<'contado' | 'credito'>('contado');
    const [cuotas, setCuotas] = useState('3');
    const [simulacion, setSimulacion] = useState<any>(null);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    // Calcular totales
    const totalContado = cart.reduce((acc, item) => acc + item.precioContado * item.cantidad, 0);
    const totalLista = cart.reduce((acc, item) => acc + item.precioLista * item.cantidad, 0);

    // Simular cuotas cuando cambia la selección
    useEffect(() => {
        if (formaPago === 'credito') {
            simularCredito();
        }
    }, [formaPago, cuotas, totalLista]);

    const simularCredito = async () => {
        // Mock simulation for UI responsiveness
        // Real impl would call /api/v1/creditos/simular
        const tasa = 0.05; // 5% mensual
        const n = parseInt(cuotas);
        const capital = totalLista;

        // French formula
        const valorCuota = capital * (tasa * Math.pow(1 + tasa, n)) / (Math.pow(1 + tasa, n) - 1);

        setSimulacion({
            valorCuota: Math.round(valorCuota),
            totalAPagar: Math.round(valorCuota * n),
            cantidadCuotas: n
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                organizationId: 'org_default', // Demo ID
                cliente: {
                    nombre: formData.nombre,
                    dni: formData.dni,
                    email: formData.email,
                    telefono: formData.telefono,
                    direccion: formData.direccion,
                },
                items: cart.map(item => ({
                    productoId: item.id,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: formaPago === 'credito' ? item.precioLista : item.precioContado
                })),
                formaPago,
                credito: formaPago === 'credito' ? {
                    cuotas: parseInt(cuotas),
                    tasaMensual: 0.05 // Harcoded demo rate
                } : undefined,
                backUrls: {
                    success: window.location.origin + '/tienda/success',
                    failure: window.location.origin + '/tienda/failure',
                }
            };

            const res = await fetch('/api/v1/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'DEMO_KEY',
                    'X-Org-Id': 'org_default'
                },
                body: JSON.stringify(orderData)
            });

            const result = await res.json();

            if (result.success) {
                setSuccess(true);
                localStorage.removeItem('cart');
            } else {
                alert('Error al procesar pedido: ' + (result.message || result.error));
            }

        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md bg-card border-green-500/50 text-foreground w-full">
                    <CardHeader className="text-center">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="text-2xl text-green-500">¡Pedido Confirmado!</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Gracias por tu compra. Te enviamos los detalles por email.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={() => window.location.href = '/tienda'} variant="outline">
                            Volver a la Tienda
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
                <p className="text-xl mb-4">Tu carrito está vacío</p>
                <Button onClick={() => window.location.href = '/tienda'}>Ir a comprar</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Resumen del Pedido */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Checkout</h2>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Tu Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">
                                        {item.cantidad}x {item.nombre}
                                    </span>
                                    <span className="font-mono text-slate-400">
                                        ${(formaPago === 'credito' ? item.precioLista : item.precioContado).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className={formaPago === 'credito' ? 'text-primary' : 'text-green-500'}>
                                    ${(formaPago === 'credito' ? totalLista : totalContado).toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Simulación de Crédito */}
                    {formaPago === 'credito' && simulacion && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-primary text-lg">Plan de Financiación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Cuotas:</span>
                                    <span className="font-bold">{simulacion.cantidadCuotas} mensuales</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valor Cuota:</span>
                                    <span className="font-bold text-white">${simulacion.valorCuota.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Total Final:</span>
                                    <span>${simulacion.totalAPagar.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Formulario */}
                <div>
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Datos y Pago</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Datos Personales */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nombre</Label>
                                            <Input required className="bg-background text-foreground"
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>DNI</Label>
                                            <Input required className="bg-background text-foreground"
                                                onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" required className="bg-background text-foreground"
                                            onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dirección de Entrega</Label>
                                        <Input required className="bg-background text-foreground"
                                            onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
                                    </div>
                                </div>

                                {/* Forma de Pago */}
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <Label className="text-lg">Forma de Pago</Label>
                                    <RadioGroup value={formaPago} onValueChange={(v: any) => setFormaPago(v)} className="grid grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="contado" id="contado" className="peer sr-only" />
                                            <Label
                                                htmlFor="contado"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                                            >
                                                <span className="font-bold text-green-500">Contado</span>
                                                <span className="text-xs text-muted-foreground">Mejor precio</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="credito" id="credito" className="peer sr-only" />
                                            <Label
                                                htmlFor="credito"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <span className="font-bold text-primary">Crédito</span>
                                                <span className="text-xs text-muted-foreground">En cuotas</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Selector de Cuotas */}
                                {formaPago === 'credito' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                        <Label>Plazo</Label>
                                        <Select value={cuotas} onValueChange={setCuotas}>
                                            <SelectTrigger className="bg-background border-input">
                                                <SelectValue placeholder="Seleccionar cuotas" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                <SelectItem value="3">3 Cuotas</SelectItem>
                                                <SelectItem value="6">6 Cuotas</SelectItem>
                                                <SelectItem value="12">12 Cuotas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="animate-spin mr-2" />
                                    ) : (
                                        'Confirmar Pedido'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
