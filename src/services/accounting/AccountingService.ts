// Accounting Service - Chart of Accounts, Journal Entries, Products, Stock
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Account,
  JournalEntry,
  JournalEntryLine,
  Product,
  StockMovement,
  CreateAccountData,
  CreateJournalEntryData,
  CreateProductData,
} from '@/types/accounting';

const ORGANIZATIONS_COLLECTION = 'organizations';

// ============================================
// ACCOUNTS (Chart of Accounts)
// ============================================

export const AccountService = {
  /**
   * Create a new account
   */
  async create(orgId: string, data: CreateAccountData): Promise<Account> {
    try {
      const accountsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/accounts`
      );
      const now = new Date();

      const accountData = {
        codigo: data.codigo,
        nombre: data.nombre,
        tipo: data.tipo,
        naturaleza: data.naturaleza,
        nivel: data.nivel || 1,
        cuentaPadreId: data.cuentaPadreId || undefined,
        admiteMovimientos: data.admiteMovimientos ?? true,
        esCuentaStock: data.esCuentaStock ?? false,
        moneda: data.moneda || 'ARS',
        active: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = await addDoc(accountsRef, accountData);

      return {
        id: docRef.id,
        orgId,
        ...accountData,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  /**
   * Get all active accounts
   */
  async getAll(orgId: string): Promise<Account[]> {
    try {
      const accountsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/accounts`
      );
      const q = query(
        accountsRef,
        where('active', '==', true),
        orderBy('codigo', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          codigo: data.codigo,
          nombre: data.nombre,
          tipo: data.tipo,
          naturaleza: data.naturaleza,
          nivel: data.nivel,
          cuentaPadreId: data.cuentaPadreId,
          admiteMovimientos: data.admiteMovimientos,
          esCuentaStock: data.esCuentaStock,
          moneda: data.moneda,
          active: data.active,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };
      });
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  },

  /**
   * Update account
   */
  async update(
    orgId: string,
    accountId: string,
    data: Partial<Account>
  ): Promise<void> {
    try {
      const accountRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/accounts`,
        accountId
      );
      await updateDoc(accountRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  /**
   * Deactivate account (soft delete)
   */
  async deactivate(orgId: string, accountId: string): Promise<void> {
    try {
      const accountRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/accounts`,
        accountId
      );
      await updateDoc(accountRef, {
        active: false,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  },
};

// ============================================
// JOURNAL ENTRIES (Asientos Contables)
// ============================================

export const JournalEntryService = {
  /**
   * Create a new journal entry with auto-incrementing number
   */
  async create(
    orgId: string,
    data: CreateJournalEntryData,
    createdBy: string
  ): Promise<JournalEntry> {
    try {
      const result = await runTransaction(db, async transaction => {
        // Get last entry number
        const entriesRef = collection(
          db,
          `${ORGANIZATIONS_COLLECTION}/${orgId}/journal_entries`
        );
        const q = query(entriesRef, orderBy('numero', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        let nextNumber = 1;
        if (!snapshot.empty) {
          nextNumber = snapshot.docs[0].data().numero + 1;
        }

        // Calculate totals
        const totalDebe = data.lineas.reduce((sum, l) => sum + l.debe, 0);
        const totalHaber = data.lineas.reduce((sum, l) => sum + l.haber, 0);

        // Validate balance
        if (Math.abs(totalDebe - totalHaber) > 0.01) {
          throw new Error('El asiento no está balanceado: Debe != Haber');
        }

        const now = new Date();
        const newDocRef = doc(
          collection(db, `${ORGANIZATIONS_COLLECTION}/${orgId}/journal_entries`)
        );

        const entryData = {
          numero: nextNumber,
          fecha: Timestamp.fromDate(data.fecha),
          tipo: data.tipo,
          concepto: data.concepto,
          lineas: data.lineas,
          totalDebe,
          totalHaber,
          estado: 'borrador',
          referenceId: data.referenceId || null,
          referenceType: data.referenceType || null,
          createdBy,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        };

        transaction.set(newDocRef, entryData);

        return {
          id: newDocRef.id,
          orgId,
          ...entryData,
          fecha: data.fecha,
          createdAt: now,
          updatedAt: now,
        };
      });

      return result as JournalEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  /**
   * Get journal entries
   */
  async getAll(orgId: string, limitCount = 50): Promise<JournalEntry[]> {
    try {
      const entriesRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/journal_entries`
      );
      const q = query(
        entriesRef,
        orderBy('fecha', 'desc'),
        orderBy('numero', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          numero: data.numero,
          fecha: data.fecha?.toDate?.() || new Date(data.fecha),
          tipo: data.tipo,
          concepto: data.concepto,
          lineas: data.lineas,
          totalDebe: data.totalDebe,
          totalHaber: data.totalHaber,
          estado: data.estado,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };
      });
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  /**
   * Get single entry
   */
  async getById(orgId: string, entryId: string): Promise<JournalEntry | null> {
    try {
      const entryRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/journal_entries`,
        entryId
      );
      const snapshot = await getDoc(entryRef);

      if (!snapshot.exists()) return null;

      const data = snapshot.data();
      return {
        id: snapshot.id,
        orgId,
        numero: data.numero,
        fecha: data.fecha?.toDate?.() || new Date(data.fecha),
        tipo: data.tipo,
        concepto: data.concepto,
        lineas: data.lineas,
        totalDebe: data.totalDebe,
        totalHaber: data.totalHaber,
        estado: data.estado,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error getting journal entry:', error);
      throw error;
    }
  },

  /**
   * Post entry (change status from draft to posted)
   */
  async post(orgId: string, entryId: string): Promise<void> {
    try {
      const entryRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/journal_entries`,
        entryId
      );
      await updateDoc(entryRef, {
        estado: 'contabilizado',
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error posting journal entry:', error);
      throw error;
    }
  },

  /**
   * Void entry
   */
  async void(orgId: string, entryId: string): Promise<void> {
    try {
      const entryRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/journal_entries`,
        entryId
      );
      await updateDoc(entryRef, {
        estado: 'anulado',
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error voiding journal entry:', error);
      throw error;
    }
  },
};

// ============================================
// PRODUCTS (Productos/Inventario)
// ============================================

export const ProductService = {
  /**
   * Create product
   */
  async create(orgId: string, data: CreateProductData): Promise<Product> {
    try {
      const productsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/products`
      );
      const now = new Date();

      const productData = {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        categoria: data.categoria,
        unidadMedida: data.unidadMedida,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        stockMinimo: data.stockMinimo || 0,
        stockActual: 0,
        cuentaStockId: data.cuentaStockId || undefined,
        active: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = await addDoc(productsRef, productData);

      return {
        id: docRef.id,
        orgId,
        ...productData,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Get all active products
   */
  async getAll(orgId: string): Promise<Product[]> {
    try {
      const productsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/products`
      );
      const q = query(
        productsRef,
        where('active', '==', true),
        orderBy('nombre', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          categoria: data.categoria,
          unidadMedida: data.unidadMedida,
          precioCompra: data.precioCompra,
          precioVenta: data.precioVenta,
          stockMinimo: data.stockMinimo,
          stockActual: data.stockActual,
          cuentaStockId: data.cuentaStockId,
          active: data.active,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };
      });
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  /**
   * Update product
   */
  async update(
    orgId: string,
    productId: string,
    data: Partial<Product>
  ): Promise<void> {
    try {
      const productRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/products`,
        productId
      );
      await updateDoc(productRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
};
