import admin from 'firebase-admin';
import serviceAccount from '../firebase-admin-key.json'
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const db = admin.firestore();
const storage = admin.storage();

export { db, storage };