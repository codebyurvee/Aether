import admin from 'firebase-admin';

// Initialize Firebase Admin (for token verification)
// In production, use service account key file
const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
};

export const verifyFirebaseToken = async (token) => {
  try {
    initializeFirebase();
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};

export default admin;
