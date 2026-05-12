import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';

const PRODUCTS_COLLECTION = 'products';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  createdAt?: any;
  vendorId?: string;
}

export const getProducts = async (vendorId?: string) => {
  let q;
  if (vendorId) {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Product));
};

export const getProductById = async (id: string) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() as any } as Product;
  }
  return null;
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'vendorId'>) => {
  const userId = auth.currentUser?.uid || 'unknown';
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    vendorId: userId,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, updates);
};

export const seedProducts = async () => {
  const samples = [
    {
      name: "iPhone 15 Pro",
      description: "Experience the ultimate performance with the A17 Pro chip and a stunning titanium design.",
      price: 999.99,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800",
      categoryId: "electronics",
    },
    {
      name: "Premium Wireless Headphones",
      description: "Active noise cancelling with 40-hour battery life and superior sound quality.",
      price: 249.50,
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      categoryId: "electronics",
    },
    {
      name: "Classic White Sneakers",
      description: "Minimalist design with maximum comfort. Perfect for any casual outfit.",
      price: 85.00,
      stock: 200,
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
      categoryId: "fashion",
    },
    {
      name: "Modern Table Lamp",
      description: "Elegant lighting solution with adjustable brightness and wireless charging base.",
      price: 45.99,
      stock: 85,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
      categoryId: "home",
    }
  ];

  for (const product of samples) {
    await addProduct(product);
  }
};
