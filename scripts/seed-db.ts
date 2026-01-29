import { cert, initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration
const ORG_ID = 'don-candido-finanzas';
const USERS = [
    {
        email: 'admin@doncandido.com',
        password: 'password123',
        displayName: 'Admin Sistema',
        role: 'admin',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    {
        email: 'rafael@empresa.com',
        password: 'password123',
        displayName: 'Rafael Usuario',
        role: 'user',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafael'
    },
    {
        email: 'sergio@empresa.com',
        password: 'password123',
        displayName: 'Sergio Usuario',
        role: 'user',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sergio'
    }
];

const STANDARD_ACCOUNTS = [
    // ACTIVOS
    { codigo: '1.0.00.000', nombre: 'ACTIVO', tipo: 'activo', naturaleza: 'deudora', nivel: 1, admiteMovimientos: false },
    { codigo: '1.1.00.000', nombre: 'ACTIVO CORRIENTE', tipo: 'activo', naturaleza: 'deudora', nivel: 2, admiteMovimientos: false, cuentaPadreCodigo: '1.0.00.000' },
    { codigo: '1.1.01.000', nombre: 'DISPONIBILIDADES', tipo: 'activo', naturaleza: 'deudora', nivel: 3, admiteMovimientos: false, cuentaPadreCodigo: '1.1.00.000' },
    { codigo: '1.1.01.001', nombre: 'Caja Pesos', tipo: 'activo', naturaleza: 'deudora', nivel: 4, admiteMovimientos: true, moneda: 'ARS', cuentaPadreCodigo: '1.1.01.000' },
    { codigo: '1.1.01.002', nombre: 'Caja Dólares', tipo: 'activo', naturaleza: 'deudora', nivel: 4, admiteMovimientos: true, moneda: 'USD', cuentaPadreCodigo: '1.1.01.000' },
    { codigo: '1.1.01.003', nombre: 'Banco Galicia CC', tipo: 'activo', naturaleza: 'deudora', nivel: 4, admiteMovimientos: true, moneda: 'ARS', cuentaPadreCodigo: '1.1.01.000' },

    // BIENES DE CAMBIO
    { codigo: '1.1.03.000', nombre: 'BIENES DE CAMBIO', tipo: 'activo', naturaleza: 'deudora', nivel: 3, admiteMovimientos: false, cuentaPadreCodigo: '1.1.00.000' },
    { codigo: '1.1.03.001', nombre: 'Mercaderías de Reventa', tipo: 'activo', naturaleza: 'deudora', nivel: 4, admiteMovimientos: true, esCuentaStock: true, cuentaPadreCodigo: '1.1.03.000' },

    // PASIVOS
    { codigo: '2.0.00.000', nombre: 'PASIVO', tipo: 'pasivo', naturaleza: 'acreedora', nivel: 1, admiteMovimientos: false },
    { codigo: '2.1.00.000', nombre: 'PASIVO CORRIENTE', tipo: 'pasivo', naturaleza: 'acreedora', nivel: 2, admiteMovimientos: false, cuentaPadreCodigo: '2.0.00.000' },
    { codigo: '2.1.01.000', nombre: 'DEUDAS COMERCIALES', tipo: 'pasivo', naturaleza: 'acreedora', nivel: 3, admiteMovimientos: false, cuentaPadreCodigo: '2.1.00.000' },
    { codigo: '2.1.01.001', nombre: 'Proveedores Varios', tipo: 'pasivo', naturaleza: 'acreedora', nivel: 4, admiteMovimientos: true, cuentaPadreCodigo: '2.1.01.000' },

    // PATRIMONIO
    { codigo: '3.0.00.000', nombre: 'PATRIMONIO NETO', tipo: 'patrimonio', naturaleza: 'acreedora', nivel: 1, admiteMovimientos: false },
    { codigo: '3.1.00.000', nombre: 'CAPITAL', tipo: 'patrimonio', naturaleza: 'acreedora', nivel: 2, admiteMovimientos: false, cuentaPadreCodigo: '3.0.00.000' },
    { codigo: '3.1.01.000', nombre: 'Capital Social', tipo: 'patrimonio', naturaleza: 'acreedora', nivel: 3, admiteMovimientos: true, cuentaPadreCodigo: '3.1.00.000' },

    // INGRESOS
    { codigo: '4.0.00.000', nombre: 'INGRESOS', tipo: 'ingreso', naturaleza: 'acreedora', nivel: 1, admiteMovimientos: false },
    { codigo: '4.1.00.000', nombre: 'VENTAS', tipo: 'ingreso', naturaleza: 'acreedora', nivel: 2, admiteMovimientos: false, cuentaPadreCodigo: '4.0.00.000' },
    { codigo: '4.1.01.000', nombre: 'Ventas de Mercaderías', tipo: 'ingreso', naturaleza: 'acreedora', nivel: 3, admiteMovimientos: true, cuentaPadreCodigo: '4.1.00.000' },

    // GASTOS
    { codigo: '5.0.00.000', nombre: 'GASTOS', tipo: 'gasto', naturaleza: 'deudora', nivel: 1, admiteMovimientos: false },
    { codigo: '5.1.00.000', nombre: 'GASTOS OPERATIVOS', tipo: 'gasto', naturaleza: 'deudora', nivel: 2, admiteMovimientos: false, cuentaPadreCodigo: '5.0.00.000' },
    { codigo: '5.1.01.000', nombre: 'Costo de Mercaderías Vendidas', tipo: 'gasto', naturaleza: 'deudora', nivel: 3, admiteMovimientos: true, cuentaPadreCodigo: '5.1.00.000' },
    { codigo: '5.1.02.000', nombre: 'Gastos de Librería', tipo: 'gasto', naturaleza: 'deudora', nivel: 3, admiteMovimientos: true, cuentaPadreCodigo: '5.1.00.000' }
];

async function initializeFirebase() {
    if (getApps().length === 0) {
        const serviceAccountKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (!serviceAccountKey) {
            throw new Error('FIREBASE_PRIVATE_KEY is missing in .env.local');
        }

        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: serviceAccountKey,
            }),
        });
        console.log('Firebase initialized successfully');
    }
}

async function seed() {
    await initializeFirebase();
    const db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    const auth = getAuth();

    console.log(`Starting seed for Organization: ${ORG_ID}`);

    // 1. Create Organization
    const orgRef = db.collection('organizations').doc(ORG_ID);
    await orgRef.set({
        id: ORG_ID,
        name: 'Don Cándido Finanzas',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        active: true
    }, { merge: true });
    console.log('Organization created/updated');

    // 2. Create Users
    for (const user of USERS) {
        try {
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(user.email);
                console.log(`User ${user.email} already exists`);
            } catch (error) {
                userRecord = await auth.createUser({
                    email: user.email,
                    password: user.password,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: true
                });
                console.log(`User ${user.email} created`);
            }

            // Set custom claims
            await auth.setCustomUserClaims(userRecord.uid, {
                role: user.role,
                orgId: ORG_ID
            });

            // Create User Document in Firestore Main Collection
            await db.collection('users').doc(userRecord.uid).set({
                id: userRecord.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                currentOrganizationId: ORG_ID,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                roles: [user.role] // Basic role array
            }, { merge: true });

        } catch (error) {
            console.error(`Error processing user ${user.email}:`, error);
        }
    }

    // 3. Create Chart of Accounts
    const accountsRef = orgRef.collection('accounts');
    const existingAccounts = await accountsRef.get();

    if (existingAccounts.empty) {
        console.log('Seeding Chart of Accounts...');

        // First create a map of code -> id to handle hierarchy later if needed
        // For simplicity we just insert them in order, assuming parent exists or isn't validated strictly here

        // We need to resolve parent IDs. 
        // Strategy: Insert all, then map codes to IDs, then update parentIds if we wanted strict linking.
        // But the schema uses `cuentaPadreId`. 

        const codeToIdMap = new Map<string, string>();

        for (const account of STANDARD_ACCOUNTS) {
            // Find parent ID if exists in our map
            let parentId = null;
            if (account.cuentaPadreCodigo && codeToIdMap.has(account.cuentaPadreCodigo)) {
                parentId = codeToIdMap.get(account.cuentaPadreCodigo);
            }

            // Remove internal field cuentaPadreCodigo from doc data to be clean
            const { cuentaPadreCodigo, ...accountData } = account as any;

            const docRef = accountsRef.doc();
            await docRef.set({
                ...accountData,
                id: docRef.id,
                orgId: ORG_ID,
                cuentaPadreId: parentId,
                active: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            codeToIdMap.set(account.codigo, docRef.id);
            console.log(`Created account: ${account.codigo} - ${account.nombre}`);
        }
    } else {
        console.log('Accounts already exist, skipping account seeding.');
    }

    // 4. Create Sample Journal Entry (Asiento de Apertura)
    const journalRef = orgRef.collection('journal_entries');
    const existingEntries = await journalRef.where('tipo', '==', 'apertura').get();

    if (existingEntries.empty) {
        console.log('Creating initial Journal Entry (Apertura)...');

        // Need to find IDs for 'Caja Pesos' and 'Capital Social'
        const accountsSnapshot = await accountsRef.get();
        const accounts = accountsSnapshot.docs.map(doc => doc.data());

        const caja = accounts.find(a => a.nombre === 'Caja Pesos');
        const capital = accounts.find(a => a.nombre === 'Capital Social');

        if (caja && capital) {
            const entryDoc = journalRef.doc();
            await entryDoc.set({
                id: entryDoc.id,
                orgId: ORG_ID,
                numero: 1,
                fecha: Timestamp.now(),
                tipo: 'apertura',
                concepto: 'Asiento de Inicio de Actividades',
                lineas: [
                    {
                        cuentaId: caja.id,
                        cuentaNombre: caja.nombre,
                        debe: 1000000,
                        haber: 0
                    },
                    {
                        cuentaId: capital.id,
                        cuentaNombre: capital.nombre,
                        debe: 0,
                        haber: 1000000
                    }
                ],
                totalDebe: 1000000,
                totalHaber: 1000000,
                estado: 'contabilizado',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: 'system'
            });
            console.log('Created opening journal entry.');
        } else {
            console.warn('Could not find Caja or Capital accounts for opening entry.');
        }
    } else {
        console.log('Opening entry already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
