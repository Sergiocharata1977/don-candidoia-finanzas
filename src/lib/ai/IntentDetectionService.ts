/**
 * Servicio de Detección de Intenciones para Retail
 * Detecta intenciones del usuario en contexto de retail/finanzas
 */

export type IntentType =
    | 'product_query'
    | 'inventory_check'
    | 'sales_analysis'
    | 'customer_management'
    | 'financial_report'
    | 'price_update'
    | 'general_question';

export interface DetectedIntent {
    type: IntentType;
    confidence: number; // 0-1
    keywords: string[];
    context: Record<string, any>;
    suggestedAction?: string;
}

export class IntentDetectionService {
    /**
     * Detectar intención del usuario
     */
    static detectIntent(message: string, userContext?: any): DetectedIntent {
        const messageLower = message.toLowerCase();
        const keywords = this.extractKeywords(messageLower);

        // Detectar intención basada en palabras clave
        if (this.matchesProductIntent(messageLower, keywords)) {
            return {
                type: 'product_query',
                confidence: this.calculateConfidence(messageLower, [
                    'producto',
                    'artículo',
                    'item',
                    'sku',
                ]),
                keywords: keywords.filter(k =>
                    ['producto', 'artículo', 'item', 'sku'].includes(k)
                ),
                context: { module: 'products' },
                suggestedAction: 'Buscar productos',
            };
        }

        if (this.matchesInventoryIntent(messageLower, keywords)) {
            return {
                type: 'inventory_check',
                confidence: this.calculateConfidence(messageLower, [
                    'inventario',
                    'stock',
                    'existencia',
                    'disponible',
                ]),
                keywords: keywords.filter(k =>
                    ['inventario', 'stock', 'existencia', 'disponible'].includes(k)
                ),
                context: { module: 'inventory' },
                suggestedAction: 'Verificar inventario',
            };
        }

        if (this.matchesSalesIntent(messageLower, keywords)) {
            return {
                type: 'sales_analysis',
                confidence: this.calculateConfidence(messageLower, [
                    'venta',
                    'ventas',
                    'factura',
                    'cobro',
                ]),
                keywords: keywords.filter(k =>
                    ['venta', 'ventas', 'factura', 'cobro'].includes(k)
                ),
                context: { module: 'sales' },
                suggestedAction: 'Analizar ventas',
            };
        }

        if (this.matchesCustomerIntent(messageLower, keywords)) {
            return {
                type: 'customer_management',
                confidence: this.calculateConfidence(messageLower, [
                    'cliente',
                    'comprador',
                    'contacto',
                ]),
                keywords: keywords.filter(k =>
                    ['cliente', 'comprador', 'contacto'].includes(k)
                ),
                context: { module: 'customers' },
                suggestedAction: 'Gestionar clientes',
            };
        }

        if (this.matchesFinancialIntent(messageLower, keywords)) {
            return {
                type: 'financial_report',
                confidence: this.calculateConfidence(messageLower, [
                    'reporte',
                    'informe',
                    'finanzas',
                    'ganancia',
                ]),
                keywords: keywords.filter(k =>
                    ['reporte', 'informe', 'finanzas', 'ganancia'].includes(k)
                ),
                context: { module: 'reports' },
                suggestedAction: 'Generar reporte financiero',
            };
        }

        if (this.matchesPriceIntent(messageLower, keywords)) {
            return {
                type: 'price_update',
                confidence: this.calculateConfidence(messageLower, [
                    'precio',
                    'costo',
                    'valor',
                    'actualizar',
                ]),
                keywords: keywords.filter(k =>
                    ['precio', 'costo', 'valor', 'actualizar'].includes(k)
                ),
                context: { module: 'pricing' },
                suggestedAction: 'Actualizar precios',
            };
        }

        // Intención por defecto
        return {
            type: 'general_question',
            confidence: 0.5,
            keywords,
            context: {},
            suggestedAction: 'Responder pregunta general',
        };
    }

    /**
     * Extraer palabras clave del mensaje
     */
    private static extractKeywords(message: string): string[] {
        const stopWords = new Set([
            'el',
            'la',
            'de',
            'que',
            'y',
            'a',
            'en',
            'un',
            'es',
            'se',
            'no',
            'por',
            'con',
            'su',
            'para',
            'al',
            'lo',
            'como',
            'más',
            'o',
            'pero',
            'sus',
            'le',
            'ya',
            'este',
            'sí',
            'porque',
            'esta',
            'son',
            'entre',
            'está',
            'cuando',
            'muy',
            'sin',
            'sobre',
            'ser',
            'tiene',
            'también',
            'me',
            'hasta',
            'hay',
            'donde',
            'han',
            'quien',
            'están',
        ]);

        const words = message
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .map(word => word.replace(/[^\w]/g, ''));

        return [...new Set(words)];
    }

    /**
     * Calcular confianza de la intención
     */
    private static calculateConfidence(
        message: string,
        keywords: string[]
    ): number {
        let matches = 0;
        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                matches++;
            }
        }
        return Math.min(0.95, 0.5 + (matches / keywords.length) * 0.45);
    }

    /**
     * Verificar intenciones específicas
     */
    private static matchesProductIntent(
        message: string,
        keywords: string[]
    ): boolean {
        const productKeywords = [
            'producto',
            'artículo',
            'item',
            'sku',
            'catálogo',
        ];
        return productKeywords.some(k => message.includes(k));
    }

    private static matchesInventoryIntent(
        message: string,
        keywords: string[]
    ): boolean {
        const inventoryKeywords = [
            'inventario',
            'stock',
            'existencia',
            'disponible',
            'almacén',
        ];
        return inventoryKeywords.some(k => message.includes(k));
    }

    private static matchesSalesIntent(
        message: string,
        keywords: string[]
    ): boolean {
        const salesKeywords = ['venta', 'ventas', 'factura', 'cobro', 'pedido'];
        return salesKeywords.some(k => message.includes(k));
    }

    private static matchesCustomerIntent(
        message: string,
        keywords: string[]
    ): boolean {
        const customerKeywords = ['cliente', 'comprador', 'contacto', 'consumidor'];
        return customerKeywords.some(k => message.includes(k));
    }

    private static matchesFinancialIntent(
        message: string,
        keywords: string[]
    ): boolean {
        const financialKeywords = [
            'reporte',
            'informe',
            'finanzas',
            'ganancia',
            'pérdida',
            'balance',
        ];
        return financialKeywords.some(k => message.includes(k));
    }

    private static matchesPriceIntent(
        message: string,
        keywords: string[]
    ): boolean {
        const priceKeywords = ['precio', 'costo', 'valor', 'actualizar', 'tarifa'];
        return priceKeywords.some(k => message.includes(k));
    }

    /**
     * Obtener prompt del sistema basado en intención
     */
    static getSystemPromptForIntent(intent: IntentType): string {
        const prompts: Record<IntentType, string> = {
            product_query: `Eres un asistente especializado en gestión de productos retail. 
        Ayuda al usuario a buscar, analizar y gestionar productos del catálogo.
        Proporciona información detallada sobre productos, categorías y características.`,

            inventory_check: `Eres un asistente especializado en control de inventario.
        Ayuda al usuario a verificar stock, existencias y disponibilidad de productos.
        Proporciona información sobre niveles de inventario y alertas de reposición.`,

            sales_analysis: `Eres un asistente especializado en análisis de ventas.
        Ayuda al usuario a analizar ventas, facturación y tendencias comerciales.
        Proporciona información sobre métricas de ventas y rendimiento.`,

            customer_management: `Eres un asistente especializado en gestión de clientes.
        Ayuda al usuario a gestionar clientes, contactos y relaciones comerciales.
        Proporciona información sobre historial de compras y preferencias.`,

            financial_report: `Eres un asistente especializado en reportes financieros.
        Ayuda al usuario a generar reportes, análisis financieros y estados de resultados.
        Proporciona información sobre ingresos, gastos y rentabilidad.`,

            price_update: `Eres un asistente especializado en gestión de precios.
        Ayuda al usuario a actualizar precios, costos y márgenes de productos.
        Proporciona información sobre estrategias de pricing y competitividad.`,

            general_question: `Eres un asistente inteligente para gestión de retail y finanzas.
        Ayuda al usuario con preguntas generales sobre productos, ventas, inventario y más.
        Proporciona respuestas útiles y precisas basadas en el contexto del negocio.`,
        };

        return prompts[intent];
    }
}
