import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require('../service-account-key.json'))
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const db = admin.firestore();
const storage = admin.storage();

export { db, storage };