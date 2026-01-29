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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Product, ProductFormData } from '@/types/products';

const COLLECTION_NAME = 'products';

export class ProductService {
  /**
   * Obtener todos los productos de una organización
   */
  static async getAll(organizationId: string): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('organizationId', '==', organizationId),
      orderBy('nombre', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];
  }

  /**
   * Obtener un producto por ID
   */
  static async getById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as Product;
  }

  /**
   * Crear un nuevo producto
   */
  static async create(
    data: ProductFormData,
    organizationId: string,
    userId: string
  ): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      organizationId,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  /**
   * Actualizar un producto existente
   */
  static async update(
    id: string,
    data: Partial<ProductFormData>
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Eliminar un producto
   */
  static async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  /**
   * Buscar productos por nombre o código
   */
  static async search(
    organizationId: string,
    searchTerm: string
  ): Promise<Product[]> {
    const allProducts = await this.getAll(organizationId);
    const term = searchTerm.toLowerCase();

    return allProducts.filter(
      product =>
        product.nombre.toLowerCase().includes(term) ||
        product.codigo.toLowerCase().includes(term)
    );
  }

  /**
   * Actualizar stock de un producto
   */
  static async updateStock(
    id: string,
    cantidad: number,
    operacion: 'suma' | 'resta'
  ): Promise<void> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const nuevoStock =
      operacion === 'suma'
        ? product.stock + cantidad
        : product.stock - cantidad;

    if (nuevoStock < 0) {
      throw new Error('Stock insuficiente');
    }

    await this.update(id, { stock: nuevoStock });
  }
}
