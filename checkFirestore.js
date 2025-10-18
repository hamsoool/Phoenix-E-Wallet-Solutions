const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAndCleanFirestore(email) {
  try {
    // Query users collection for the email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('No matching documents found in Firestore.');
      return;
    }

    // Delete each matching document
    const batch = db.batch();
    snapshot.forEach(doc => {
      console.log('Found document to delete:', doc.id);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Successfully deleted all matching documents from Firestore');
  } catch (error) {
    console.error('Error checking/cleaning Firestore:', error);
  }
}

// Check and clean Firestore for the specific email
checkAndCleanFirestore('202300001@gordoncollege.edu.ph')
  .then(() => {
    console.log('Firestore check and clean process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 