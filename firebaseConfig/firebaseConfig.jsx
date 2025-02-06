import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration for Firebase project 1




// Configuration for Firebase project 2
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_AUTH_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_EXTENSION_MEASUREMENT_ID,
  };
  

// Initialize Firebase for project 1

// Initialize Firebase for project 2

export const projectExtensionFirebase = initializeApp(firebaseConfig);
// export const projectExtensionAuth = getAuth(projectExtensionFirebase);
export const projectExtensionFirestore = getFirestore(projectExtensionFirebase);
export const projectExtensionStorage = getStorage(projectExtensionFirebase);