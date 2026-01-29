import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">DC</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                Don Cándido Finanzas
                            </span>
                        </Link>
                        <p className="text-slate-500 max-w-sm">
                            Sistema contable automático diseñado específicamente para comercios de electrodomésticos y retail. Simplifica tu gestión hoy mismo.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Producto</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#features" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Características
                                </Link>
                            </li>
                            <li>
                                <Link href="#how-it-works" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Cómo Funciona
                                </Link>
                            </li>
                            <li>
                                <Link href="#pricing" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Precios
                                </Link>
                            </li>
                            <li>
                                <Link href="/demo" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Demo
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Términos
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Don Cándido Finanzas. Todos los derechos reservados.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors">
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors">
                            <Github className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors">
                            <Linkedin className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
