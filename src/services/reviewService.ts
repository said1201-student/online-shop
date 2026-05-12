import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: any;
}

const REVIEWS_COLLECTION = 'reviews';

export const addReview = async (productId: string, username: string, rating: number, comment: string) => {
  if (!auth.currentUser) throw new Error("Ingia ili utoe maoni.");

  const reviewData = {
    productId,
    userId: auth.currentUser.uid,
    username,
    rating,
    comment,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);
  return docRef.id;
};

export const getProductReviews = async (productId: string) => {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
};
