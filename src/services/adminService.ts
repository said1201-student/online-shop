import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  isApproved: boolean;
  createdAt: any;
}

export const getPendingVendors = async () => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'vendor'),
    where('isApproved', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const approveVendor = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { isApproved: true });
};

export const rejectVendor = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role: 'user', isApproved: true }); // Reset to normal user
};
