'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: '¿Necesito conocimientos de contabilidad para usar el sistema?',
        answer:
            'No. El sistema está diseñado para que cualquier persona pueda registrar operaciones sin conocer de contabilidad. Solo completas formularios simples y el sistema calculas las cuentas y genera los asientos automáticamente.',
    },
    {
        question: '¿Qué es un asiento de doble partida?',
        answer:
            'Es el método contable profesional que garantiza que tus registros estén siempre balanceados (Debe = Haber). Don Cándido Finanzas lo hace automáticamente por ti, asegurando la integridad de tu información.',
    },
    {
        question: '¿Puedo gestionar varios negocios?',
        answer:
            'Sí, el sistema es multi-empresa. Puedes crear y gestionar múltiples organizaciones desde una sola cuenta, manteniendo los datos completamente separados entre sí.',
    },
    {
        question: '¿Mis datos están seguros?',
        answer:
            'Sí, utilizamos Firebase de Google, una plataforma de nivel empresarial con encriptación, autenticación segura y respaldos automáticos en la nube.',
    },
    {
        question: '¿Funciona en mi celular?',
        answer:
            'Sí, la plataforma es totalmente responsiva y puedes acceder desde cualquier dispositivo con navegador web: computadora, tablet o smartphone.',
    },
    {
        question: '¿Qué pasa si cometo un error al registrar una operación?',
        answer:
            'Puedes consultar el historial completo de movimientos, ver el detalle de cada asiento y rastrear cualquier operación hasta su origen para realizar las correcciones necesarias.',
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-slate-900 border-t border-slate-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Todo lo que necesitas saber antes de empezar
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl border transition-all duration-300 ${openIndex === index
                                    ? 'bg-slate-800/50 border-emerald-500/50'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <button
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                onClick={() =>
                                    setOpenIndex(openIndex === index ? null : index)
                                }
                            >
                                <span className="font-semibold text-white text-lg pr-8">
                                    {faq.question}
                                </span>
                                <span className="flex-shrink-0 text-emerald-400">
                                    {openIndex === index ? (
                                        <Minus className="w-6 h-6" />
                                    ) : (
                                        <Plus className="w-6 h-6" />
                                    )}
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
