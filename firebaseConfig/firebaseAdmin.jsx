import admin from 'firebase-admin';

export function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      // In production on Cloud Run this will be injected.
      // For local testing, make sure you have a .env.local file.
      throw new Error('Missing required environment variable: FIREBASE_SERVICE_ACCOUNT');
    }

    // Replace escaped newlines if necessary
    const formattedServiceAccount = serviceAccountString.replace(/\\n/g, '\n');

    // Parse the JSON string to an object.
    const serviceAccount = JSON.parse(formattedServiceAccount);

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      throw error;
    }
  }
}
