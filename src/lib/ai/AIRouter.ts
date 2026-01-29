/**
 * Router de IA - Permite elegir entre diferentes proveedores de IA
 * según el caso de uso (velocidad vs calidad)
 */

import { GroqMessage, GroqService } from '@/lib/groq/GroqService';
import {
    IntentDetectionService,
    type DetectedIntent,
} from './IntentDetectionService';

export type AIProvider = 'groq';
export type AIMode = 'fast' | 'quality';

interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface AIAnalyticsEvent {
    timestamp: Date;
    provider: AIProvider;
    mode: AIMode;
    intent: string;
    responseTime: number;
    success: boolean;
    error?: string;
}

export class AIRouter {
    /**
     * Determinar qué proveedor usar según el modo
     */
    private static getProvider(mode: AIMode): AIProvider {
        // Por ahora solo Groq está disponible
        return 'groq';
    }

    /**
     * Enviar mensaje con streaming
     */
    static async chatStream(
        mensaje: string,
        historial: AIMessage[] = [],
        systemPrompt?: string,
        mode: AIMode = 'fast'
    ): Promise<ReadableStream> {
        const provider = this.getProvider(mode);

        console.log(`[AIRouter] Usando ${provider} en modo ${mode}`);

        const groqHistorial: GroqMessage[] = historial.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));

        return GroqService.enviarMensajeStream(
            mensaje,
            groqHistorial,
            systemPrompt
        );
    }

    /**
     * Enviar mensaje sin streaming (respuesta completa)
     */
    static async chat(
        mensaje: string,
        historial: AIMessage[] = [],
        systemPrompt?: string,
        mode: AIMode = 'fast'
    ): Promise<string> {
        const provider = this.getProvider(mode);

        console.log(`[AIRouter] Usando ${provider} en modo ${mode}`);

        const groqHistorial: GroqMessage[] = historial.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));

        const response = await GroqService.enviarMensaje(
            mensaje,
            groqHistorial,
            systemPrompt
        );
        return response.content || '';
    }

    /**
     * Obtener información del proveedor actual
     */
    static getProviderInfo(mode: AIMode): {
        provider: AIProvider;
        latency: string;
        cost: string;
        quality: string;
    } {
        return {
            provider: 'groq',
            latency: '2-3 segundos',
            cost: 'Muy bajo',
            quality: 'Alta',
        };
    }

    /**
     * Verificar si un proveedor está disponible
     */
    static isProviderAvailable(provider: AIProvider): boolean {
        if (provider === 'groq') {
            return !!process.env.GROQ_API_KEY;
        }
        return false;
    }

    /**
     * Obtener lista de proveedores disponibles
     */
    static getAvailableProviders(): AIProvider[] {
        const providers: AIProvider[] = [];

        if (this.isProviderAvailable('groq')) {
            providers.push('groq');
        }

        return providers;
    }

    /**
     * Chat inteligente con detección de intención
     */
    static async smartChat(
        mensaje: string,
        historial: AIMessage[] = [],
        userContext?: any,
        mode: AIMode = 'fast'
    ): Promise<{ response: string; intent: DetectedIntent }> {
        const startTime = Date.now();

        try {
            // Detectar intención
            const intent = IntentDetectionService.detectIntent(mensaje, userContext);

            // Obtener prompt del sistema basado en intención
            const systemPrompt = IntentDetectionService.getSystemPromptForIntent(
                intent.type
            );

            // Enviar mensaje con prompt especializado
            const response = await this.chat(mensaje, historial, systemPrompt, mode);

            // Registrar evento de analytics
            this.logAnalyticsEvent({
                timestamp: new Date(),
                provider: this.getProvider(mode),
                mode,
                intent: intent.type,
                responseTime: Date.now() - startTime,
                success: true,
            });

            return { response, intent };
        } catch (error) {
            this.logAnalyticsEvent({
                timestamp: new Date(),
                provider: this.getProvider(mode),
                mode,
                intent: 'error',
                responseTime: Date.now() - startTime,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            throw error;
        }
    }

    /**
     * Chat inteligente con streaming
     */
    static async smartChatStream(
        mensaje: string,
        historial: AIMessage[] = [],
        userContext?: any,
        mode: AIMode = 'fast'
    ): Promise<{ stream: ReadableStream; intent: DetectedIntent }> {
        // Detectar intención
        const intent = IntentDetectionService.detectIntent(mensaje, userContext);

        // Obtener prompt del sistema basado en intención
        const systemPrompt = IntentDetectionService.getSystemPromptForIntent(
            intent.type
        );

        // Obtener stream con prompt especializado
        const stream = await this.chatStream(
            mensaje,
            historial,
            systemPrompt,
            mode
        );

        return { stream, intent };
    }

    /**
     * Analizar contexto del usuario
     */
    static analyzeUserContext(userContext: any): {
        department?: string;
        role?: string;
        recentModules: string[];
        preferences: Record<string, any>;
    } {
        return {
            department: userContext?.department,
            role: userContext?.role,
            recentModules: userContext?.recentModules || [],
            preferences: userContext?.preferences || {},
        };
    }

    /**
     * Obtener recomendación de proveedor basada en contexto
     */
    static recommendProvider(
        messageLength: number,
        complexity: 'simple' | 'medium' | 'complex'
    ): AIProvider {
        // Por ahora solo Groq está disponible
        return 'groq';
    }

    /**
     * Registrar evento de analytics
     */
    private static logAnalyticsEvent(event: AIAnalyticsEvent): void {
        // Aquí se podría enviar a un servicio de analytics
        console.log('[AIRouter Analytics]', {
            timestamp: event.timestamp.toISOString(),
            provider: event.provider,
            mode: event.mode,
            intent: event.intent,
            responseTime: `${event.responseTime}ms`,
            success: event.success,
            error: event.error,
        });
    }

    /**
     * Obtener estadísticas de uso
     */
    static getUsageStats(): {
        totalRequests: number;
        successRate: number;
        averageResponseTime: number;
        providerDistribution: Record<AIProvider, number>;
    } {
        // Aquí se retornarían estadísticas reales desde una base de datos
        return {
            totalRequests: 0,
            successRate: 0,
            averageResponseTime: 0,
            providerDistribution: { groq: 0 },
        };
    }
}

export type { AIAnalyticsEvent, AIMessage };
