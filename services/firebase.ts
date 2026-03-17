// @ts-ignore
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, 
  updateProfile,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const registerUser = async (name: string, email: string, pass: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    return res.user;
  } catch (error) {
    console.error("Error registering", error);
    throw error;
  }
};

export const loginUser = async (email: string, pass: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error) {
    console.error("Error logging in", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

// Helper to subscribe to meals
export const subscribeToMeals = (userId: string, callback: (meals: any[]) => void) => {
  // NOTE: We removed orderBy('timestamp', 'desc') from the query.
  // Using both where() and orderBy() on different fields often requires a composite index in Firestore.
  // To keep the app simple and avoid manual console configuration, we filter by ID here and sort in JavaScript.
  const q = query(
    collection(db, 'meals'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      // Handle timestamp normalization: if it's a Firestore Timestamp, convert to millis. 
      // If it's a number, keep it. If missing, default to Date.now().
      let timestamp = docData.timestamp;
      if (timestamp && typeof timestamp.toMillis === 'function') {
        timestamp = timestamp.toMillis();
      } else if (typeof timestamp !== 'number') {
        timestamp = Date.now(); 
      }

      return { 
        id: doc.id, 
        ...docData,
        timestamp 
      };
    });
    
    // Sort client-side: Newest first
    data.sort((a: any, b: any) => b.timestamp - a.timestamp);
    callback(data);
  }, (error) => {
    console.error("Error subscribing to meals:", error);
  });
};

// Helper to subscribe to history
export const subscribeToHistory = (userId: string, callback: (history: any[]) => void) => {
  // Similar client-side sort strategy
  const q = query(
    collection(db, 'history'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let timestamp = docData.timestamp;
        if (timestamp && typeof timestamp.toMillis === 'function') {
          timestamp = timestamp.toMillis();
        } else if (typeof timestamp !== 'number') {
          timestamp = Date.now();
        }
        return { id: doc.id, ...docData, timestamp };
    });
    // Sort client-side: Newest first
    data.sort((a: any, b: any) => b.timestamp - a.timestamp);
    callback(data);
  }, (error) => {
    console.error("Error subscribing to history:", error);
  });
};