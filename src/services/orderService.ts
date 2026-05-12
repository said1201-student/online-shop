import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  runTransaction,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
}

const ORDERS_COLLECTION = 'orders';

export const placeOrder = async (items: OrderItem[], total: number) => {
  if (!auth.currentUser) throw new Error("Lazima uingie kwenye akaunti ili kuweka oda.");

  const userId = auth.currentUser.uid;

  return await runTransaction(db, async (transaction) => {
    // 1. Check and Update Stock for each item
    for (const item of items) {
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await transaction.get(productRef);
      
      if (!productSnap.exists()) {
        throw new Error(`Bidhaa ${item.name} haipo tena.`);
      }

      const currentStock = productSnap.data().stock;
      if (currentStock < item.quantity) {
        throw new Error(`Samahani, bidhaa ya ${item.name} haina idadi ya kutosha stoo.`);
      }

      transaction.update(productRef, {
        stock: currentStock - item.quantity
      });
    }

    // 2. Create the Order
    const orderData = {
      userId,
      items,
      totalPrice: total,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const ordersRef = collection(db, ORDERS_COLLECTION);
    const newOrderRef = doc(ordersRef);
    transaction.set(newOrderRef, orderData);

    return newOrderRef.id;
  });
};

export const getMyOrders = async () => {
  if (!auth.currentUser) return [];

  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const getAllOrders = async () => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, { status });
};
