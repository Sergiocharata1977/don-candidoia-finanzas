'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [orgId, setOrgId] = useState(searchParams.get('org') || 'org_default'); // Default/Example org

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni, organizationId: orgId }),
            });

            const data = await res.json();

            if (data.success) {
                setSent(true);
                // For demo purposes, if devLink is present, we could show it or auto-fill
                if (data.devLink) {
                    console.log('Dev Link:', data.devLink);
                    // Opcional: Auto redirect en desarrollo si se quiere
                    // router.push(data.devLink.replace(process.env.NEXT_PUBLIC_APP_URL || '', ''));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md bg-card border-border text-foreground">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">¡Enlace enviado!</CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            Revisá tu correo o SMS. Te enviamos un enlace mágico para ingresar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                            <p className="text-green-500 text-sm">
                                Si estás probando en desarrollo, revisá la consola del navegador o del servidor para ver el link.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-border hover:bg-accent"
                            onClick={() => setSent(false)}
                        >
                            Volver
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md bg-card border-border text-foreground">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Mi Cuenta</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Ingresá tu DNI para ver tu estado de cuenta y pagar cuotas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI / Documento</Label>
                            <Input
                                id="dni"
                                placeholder="Ej: 12345678"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                className="bg-background border-input"
                                required
                            />
                        </div>

                        {/* Hidden org selector for demo if needed, or just assume context */}

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
