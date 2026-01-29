'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Producto {
    id: string;
    nombre: string;
    precioContado: number;
    precioLista: number;
    stock: number;
    categoria: string;
    imagenes: string[];
}

export default function TiendaPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    // Simular org ID por ahora
    const orgId = 'org_default';

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            // Nota: En prod, esto usaría la API pública con API Key
            // Aquí simulamos llamando al endpoint interno o directo a Firestore si fuera dentro del mismo app
            // Para el demo, usamos el endpoint que creamos
            const res = await fetch(`/api/v1/productos?limit=20`, {
                headers: {
                    'X-API-Key': 'DEMO_KEY', // Necesitaremos crear una key demo en DB o mockear la validación
                    'X-Org-Id': orgId
                }
            });
            if (res.ok) {
                const data = await res.json();
                setProductos(data.data);
            } else {
                // Fallback mock data if API fails (likely due to missing header/key setup in dev)
                setProductos([
                    { id: '1', nombre: 'Heladera Samsung', precioContado: 850000, precioLista: 1100000, stock: 5, categoria: 'Electro', imagenes: [] },
                    { id: '2', nombre: 'Taladro Bosch', precioContado: 120000, precioLista: 150000, stock: 10, categoria: 'Herramientas', imagenes: [] },
                    { id: '3', nombre: 'Smart TV 50"', precioContado: 600000, precioLista: 780000, stock: 3, categoria: 'Electro', imagenes: [] },
                ]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (producto: Producto) => {
        // Simple cart logic using localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.id === producto.id);

        if (existing) {
            existing.cantidad += 1;
        } else {
            cart.push({ ...producto, cantidad: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Visual feedback could be added here
        router.push('/checkout'); // Direct to checkout for demo simplicity
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Catálogo</h1>
                        <p className="text-muted-foreground">Productos disponibles para financiación</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/checkout')}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ver Carrito
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productos.map((prod) => (
                        <Card key={prod.id} className="bg-card border-border flex flex-col">
                            <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center text-muted-foreground">
                                {prod.imagenes[0] ? (
                                    <img src={prod.imagenes[0]} alt={prod.nombre} className="h-full object-cover" />
                                ) : (
                                    <span className="text-sm">Sin imagen</span>
                                )}
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="mb-2">{prod.categoria}</Badge>
                                    {prod.stock < 5 && <Badge variant="destructive">Poco Stock</Badge>}
                                </div>
                                <CardTitle className="text-xl text-foreground">{prod.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Contado:</span>
                                    <span className="text-xl font-bold text-green-500">${prod.precioContado.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Lista (Cuotas):</span>
                                    <span className="text-lg text-foreground/80">${prod.precioLista.toLocaleString()}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => addToCart(prod)}>
                                    Agregar al Carrito
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
