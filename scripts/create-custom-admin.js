/**
 * Script para crear usuario admin personalizado
 * Ejecutar con: node scripts/create-custom-admin.js
 */

require('dotenv').config({ path: '.env.local' });

const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Nuevas credenciales
const NEW_ADMIN_EMAIL = 'admin@doncandido.com';
const NEW_ADMIN_PASSWORD = 'DonCandido2026!';

async function createCustomAdmin() {
    console.log('🚀 Iniciando creación de Usuario Admin...\n');

    if (getApps().length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

        if (!projectId || !clientEmail || !privateKey) {
            console.error('❌ Faltan variables de entorno de Firebase Admin');
            process.exit(1);
        }

        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket,
        });
    }

    const auth = getAuth();

    try {
        let user;
        try {
            user = await auth.getUserByEmail(NEW_ADMIN_EMAIL);
            console.log(`⚠️ Usuario existente encontrado: ${user.uid}. Actualizando password...`);

            // Si existe, actualizamos password
            user = await auth.updateUser(user.uid, {
                password: NEW_ADMIN_PASSWORD,
                emailVerified: true
            });
            console.log(`✅ Password actualizado.`);

        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Crear usuario si no existe
                user = await auth.createUser({
                    email: NEW_ADMIN_EMAIL,
                    password: NEW_ADMIN_PASSWORD,
                    displayName: 'Nuevo Admin',
                    emailVerified: true,
                });
                console.log(`✅ Usuario creado: ${user.uid}`);
            } else {
                throw error;
            }
        }

        // Asignar custom claims (Super Admin + Organization)
        // IMPORTANTE: Asignamos una organizationId por defecto si el sistema lo requiere
        // Basado en el contexto de multi-tenancy mencionado en los docs.
        const claims = {
            superAdmin: true,
            role: 'super_admin',
            organizationId: 'org_default_admin' // Valor seguro por defecto o placeholder
        };

        await auth.setCustomUserClaims(user.uid, claims);

        console.log(`✅ Claims asignados a ${NEW_ADMIN_EMAIL}`);
        console.log('\n🎉 ¡Nuevo usuario listo!');
        console.log(`   Email: ${NEW_ADMIN_EMAIL}`);
        console.log(`   Pass:  ${NEW_ADMIN_PASSWORD}`);
        console.log(`   Claims:`, claims);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

createCustomAdmin();
