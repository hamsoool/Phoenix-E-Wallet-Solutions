const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteUserByEmail(email) {
  try {
    // 1. Delete from Firebase Auth
    console.log('Checking Firebase Auth...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user in Auth:', userRecord.uid);
    await admin.auth().deleteUser(userRecord.uid);
    console.log('Successfully deleted user from Auth:', email);

    // 2. Delete from Firestore
    console.log('\nChecking Firestore...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('No matching documents found in Firestore.');
    } else {
      const batch = db.batch();
      snapshot.forEach(doc => {
        console.log('Found document to delete:', doc.id);
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Successfully deleted all matching documents from Firestore');
    }

    console.log('\nUser deletion process completed successfully!');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('User not found in Firebase Auth');
    } else {
      console.error('Error:', error);
    }
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address as an argument.');
  console.log('Usage: node deleteUser.js <email>');
  console.log('Example: node deleteUser.js user@example.com');
  process.exit(1);
}

// Delete the user
deleteUserByEmail(email)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 