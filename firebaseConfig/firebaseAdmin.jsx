import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT &&
    process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');

  if (!serviceAccountString) {
    // During build, you can opt to skip initialization.
    console.warn('Firebase service account not set; skipping initialization.');
  } else {
    const serviceAccount = JSON.parse(serviceAccountString);
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  }
}