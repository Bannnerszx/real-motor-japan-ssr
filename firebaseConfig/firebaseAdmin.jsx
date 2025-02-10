import admin from 'firebase-admin';
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountString) {
  throw new Error('Missing required environment variable: FIREBASE_SERVICE_ACCOUNT');
}

// Parse the JSON string to an object.
const serviceAccount = JSON.parse(serviceAccountString);


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
