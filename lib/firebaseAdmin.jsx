// lib/firebaseAdmin.js
import * as admin from 'firebase-admin';
//*******************//
//DO NOT USE THIS SERVICE ACCOUNTS IF ON PRODUCTION MODE. USE ADMIN DIRECTLY
//*******************//
// admin.initializeApp()

// // Ensure that this code only runs on the server.
if (!admin.apps.length) {
  // Construct the service account object from environment variables.
  const serviceAccount = {
    type: process.env.SERVICE_ACCOUNT_TYPE,
    project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    // Replace escaped newlines (\\n) with actual newlines.
    private_key:
      process.env.SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
    token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
  };

 
  for (const [key, value] of Object.entries(serviceAccount)) {
    if (!value) {
      throw new Error(
        `Missing required environment variable for Firebase Admin: ${key}`
      );
    }
  }

  // Initialize the Firebase Admin app.
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally, you can add a storage bucket or other options:
      // storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

// Ensure Firebase Admin is only initialized once
// if (!admin.apps.length) {
//   try {
//     admin.initializeApp(); // No service account needed in Firebase-hosted environments
//     console.log('✅ Firebase Admin initialized without service account');
//   } catch (error) {
//     console.error('❌ Firebase Admin initialization error:', error);
//   }
// }

// Now that the app is initialized, export Firestore and Storage.
const db = admin.firestore();
const storage = admin.storage();

export { db, storage };
