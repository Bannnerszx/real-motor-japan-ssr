// lib/firebaseAdmin.js
import * as admin from 'firebase-admin';

admin.initializeApp();

// Now that the app is initialized, export Firestore and Storage.
const db = admin.firestore();
const storage = admin.storage();

export { db, storage };
