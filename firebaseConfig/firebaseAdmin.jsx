import * as admin from 'firebase-admin';



const db = admin.firestore();
const storage = admin.storage();

export { db, storage };

