/**
 * Script para crear usuario Super Admin
 * Ejecutar con: node scripts/create-super-admin.js
 * 
 * Este script usa variables de entorno de .env.local
 */

require('dotenv').config({ path: '.env.local' });

const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Configuración del Super Admin
const SUPER_ADMIN_EMAIL = 'sergio@empresa.com';
const SUPER_ADMIN_PASSWORD = 'Sergio123';

async function createSuperAdmin() {
    console.log('🚀 Iniciando creación de Super Admin...\n');

    // Inicializar Firebase Admin si no está inicializado
    if (getApps().length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

        if (!projectId || !clientEmail || !privateKey) {
            console.error('❌ Faltan variables de entorno de Firebase Admin');
            console.error('   Requeridas: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
            process.exit(1);
        }

        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket,
        });

        console.log(`📦 Firebase Admin inicializado para proyecto: ${projectId}`);
    }

    const auth = getAuth();

    try {
        // Intentar obtener usuario existente
        let user;
        try {
            user = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
            console.log(`✅ Usuario existente encontrado: ${user.uid}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Crear usuario si no existe
                user = await auth.createUser({
                    email: SUPER_ADMIN_EMAIL,
                    password: SUPER_ADMIN_PASSWORD,
                    displayName: 'Super Admin',
                    emailVerified: true,
                });
                console.log(`✅ Usuario creado: ${user.uid}`);
            } else {
                throw error;
            }
        }

        // Asignar custom claims de Super Admin
        await auth.setCustomUserClaims(user.uid, {
            superAdmin: true,
            role: 'super_admin'
        });

        console.log(`✅ Claims de Super Admin asignados a ${SUPER_ADMIN_EMAIL}`);
        console.log('\n🎉 ¡Super Admin configurado exitosamente!');
        console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
        console.log(`   UID: ${user.uid}`);
        console.log(`   Claims: { superAdmin: true, role: 'super_admin' }`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

createSuperAdmin();
