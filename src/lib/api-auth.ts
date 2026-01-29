/**
 * API Authentication Middleware
 * Validates API keys for external integrations
 */

import { NextRequest } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface ApiAuthResult {
    valid: boolean;
    organizationId: string;
    message?: string;
}

/**
 * Validate API key from request headers
 * Headers required:
 * - X-API-Key: The secret API key
 * - X-Org-Id: The organization ID (optional if key is org-specific)
 */
export async function validateApiKey(request: NextRequest): Promise<ApiAuthResult> {
    const apiKey = request.headers.get('X-API-Key');
    const orgId = request.headers.get('X-Org-Id');

    if (!apiKey) {
        return {
            valid: false,
            organizationId: '',
            message: 'Missing X-API-Key header',
        };
    }

    try {
        // Look for API key in the api_keys collection
        const apiKeysRef = collection(db, 'api_keys');
        const q = query(apiKeysRef, where('key', '==', apiKey), where('active', '==', true));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return {
                valid: false,
                organizationId: '',
                message: 'Invalid or inactive API key',
            };
        }

        const keyDoc = snapshot.docs[0].data();
        const organizationId = keyDoc.organizationId;

        // If X-Org-Id is provided, verify it matches the key's organization
        if (orgId && orgId !== organizationId) {
            return {
                valid: false,
                organizationId: '',
                message: 'Organization ID does not match API key',
            };
        }

        // Check expiration if set
        if (keyDoc.expiresAt && keyDoc.expiresAt.toDate() < new Date()) {
            return {
                valid: false,
                organizationId: '',
                message: 'API key has expired',
            };
        }

        return {
            valid: true,
            organizationId,
        };

    } catch (error) {
        console.error('Error validating API key:', error);
        return {
            valid: false,
            organizationId: '',
            message: 'Error validating API key',
        };
    }
}

/**
 * API Key type definition for Firestore
 */
export interface ApiKeyDocument {
    id: string;
    organizationId: string;
    key: string; // The actual API key (should be hashed in production)
    name: string; // Friendly name (e.g., "Confina SA - Production")
    active: boolean;
    permissions: string[]; // e.g., ['productos:read', 'pedidos:write', 'creditos:write']
    createdAt: Date;
    expiresAt?: Date;
    lastUsed?: Date;
}
