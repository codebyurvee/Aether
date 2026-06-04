import admin from 'firebase-admin';

let initialized = false;

const initializeFirebase = () => {
  if (initialized || admin.apps.length > 0) return;

  try {
    // On Render: set FIREBASE_PROJECT_ID env variable
    // No service account needed for just token verification with projectId
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    initialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error.message);
  }
};

export const verifyFirebaseToken = async (idToken) => {
  try {
    initializeFirebase();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token: ' + error.message);
  }
};

export default admin;
