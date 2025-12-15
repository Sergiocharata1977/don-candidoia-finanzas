// Service para Clientes Unificados
// Combina funcionalidad de Retail y Tarjeta de Crédito

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type {
  Customer,
  CustomerFormData,
  CurrentAccount,
} from '@/types/finanzas';

const CUSTOMERS_COLLECTION = 'customers';
const CURRENT_ACCOUNTS_COLLECTION = 'current_accounts';

// ==========================================
// CLIENTES
// ==========================================

export async function getCustomers(
  organizationId: string
): Promise<Customer[]> {
  const customersRef = collection(
    db,
    'organizations',
    organizationId,
    CUSTOMERS_COLLECTION
  );
  const q = query(customersRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    doc =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Customer
  );
}

export async function getCustomerById(
  organizationId: string,
  customerId: string
): Promise<Customer | null> {
  const customerRef = doc(
    db,
    'organizations',
    organizationId,
    CUSTOMERS_COLLECTION,
    customerId
  );
  const snapshot = await getDoc(customerRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Customer;
}

export async function createCustomer(
  organizationId: string,
  data: CustomerFormData
): Promise<string> {
  const customersRef = collection(
    db,
    'organizations',
    organizationId,
    CUSTOMERS_COLLECTION
  );

  const customerData = {
    ...data,
    organizationId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(customersRef, customerData);

  // Si tiene cuenta corriente, crearla automáticamente
  if (data.hasCurrentAccount) {
    await createCurrentAccount(organizationId, docRef.id, data.creditLimit);
  }

  return docRef.id;
}

export async function updateCustomer(
  organizationId: string,
  customerId: string,
  data: Partial<CustomerFormData>
): Promise<void> {
  const customerRef = doc(
    db,
    'organizations',
    organizationId,
    CUSTOMERS_COLLECTION,
    customerId
  );

  await updateDoc(customerRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });

  // Si se activó la cuenta corriente, crearla
  if (data.hasCurrentAccount && data.creditLimit) {
    const existingAccount = await getCurrentAccountByCustomer(
      organizationId,
      customerId
    );
    if (!existingAccount) {
      await createCurrentAccount(organizationId, customerId, data.creditLimit);
    }
  }
}

export async function deleteCustomer(
  organizationId: string,
  customerId: string
): Promise<void> {
  const customerRef = doc(
    db,
    'organizations',
    organizationId,
    CUSTOMERS_COLLECTION,
    customerId
  );
  await deleteDoc(customerRef);
}

// ==========================================
// CUENTA CORRIENTE
// ==========================================

export async function createCurrentAccount(
  organizationId: string,
  customerId: string,
  creditLimit: number
): Promise<string> {
  const accountsRef = collection(
    db,
    'organizations',
    organizationId,
    CURRENT_ACCOUNTS_COLLECTION
  );

  const accountData: Omit<CurrentAccount, 'id'> = {
    customerId,
    organizationId,
    creditLimit,
    balance: 0,
    lastMovementDate: Timestamp.now(),
    status: 'active',
  };

  const docRef = await addDoc(accountsRef, accountData);
  return docRef.id;
}

export async function getCurrentAccountByCustomer(
  organizationId: string,
  customerId: string
): Promise<CurrentAccount | null> {
  const accountsRef = collection(
    db,
    'organizations',
    organizationId,
    CURRENT_ACCOUNTS_COLLECTION
  );
  const q = query(accountsRef, where('customerId', '==', customerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as CurrentAccount;
}

export async function updateAccountBalance(
  organizationId: string,
  accountId: string,
  amount: number,
  type: 'charge' | 'payment'
): Promise<void> {
  const accountRef = doc(
    db,
    'organizations',
    organizationId,
    CURRENT_ACCOUNTS_COLLECTION,
    accountId
  );

  await runTransaction(db, async transaction => {
    const accountDoc = await transaction.get(accountRef);
    if (!accountDoc.exists()) {
      throw new Error('Cuenta no encontrada');
    }

    const currentBalance = accountDoc.data().balance || 0;
    const newBalance =
      type === 'charge' ? currentBalance + amount : currentBalance - amount;

    transaction.update(accountRef, {
      balance: newBalance,
      lastMovementDate: Timestamp.now(),
    });
  });
}

export async function getCustomersWithDebt(
  organizationId: string
): Promise<(Customer & { currentAccount: CurrentAccount })[]> {
  const accountsRef = collection(
    db,
    'organizations',
    organizationId,
    CURRENT_ACCOUNTS_COLLECTION
  );
  const q = query(accountsRef, where('balance', '>', 0));
  const snapshot = await getDocs(q);

  const results: (Customer & { currentAccount: CurrentAccount })[] = [];

  for (const accountDoc of snapshot.docs) {
    const account = {
      id: accountDoc.id,
      ...accountDoc.data(),
    } as CurrentAccount;
    const customer = await getCustomerById(organizationId, account.customerId);
    if (customer) {
      results.push({ ...customer, currentAccount: account });
    }
  }

  return results;
}
