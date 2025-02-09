import admin from 'firebase-admin';

// Helper function to remove surrounding quotes
const stripQuotes = (val) => {
  if (typeof val === 'string') {
    return val.replace(/^"(.*)"$/, '$1');
  }
  return val;
};

// Retrieve the raw private key value
const rawPrivateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
if (!rawPrivateKey) {
  throw new Error('Missing required environment variable: SERVICE_ACCOUNT_PRIVATE_KEY');
}

// Process it: remove quotes and convert escaped newlines to actual newlines.
const private_key = stripQuotes(rawPrivateKey).replace(/\\n/g, '\n');

// Construct the service account object
const serviceAccount = {
  type: process.env.SERVICE_ACCOUNT_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: private_key,
  client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
  token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
  universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
};

// Optionally, check that none of the fields are missing:
for (const [key, value] of Object.entries(serviceAccount)) {
  if (!value) {
    throw new Error(`Missing required environment variable for Firebase Admin: ${key}`);
  }
}

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
