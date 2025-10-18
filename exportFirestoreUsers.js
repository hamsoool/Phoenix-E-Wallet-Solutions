const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin with your service account credentials
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function exportFirestoreUsers() {
  try {
    console.log('Starting Firestore users export...');
    const db = admin.firestore();
    
    // Get all documents from the users collection
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in Firestore.');
      return;
    }
    
    const users = [];
    
    // Process each document
    usersSnapshot.forEach(doc => {
      // Add document ID and data to our array
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Write to JSON file
    fs.writeFileSync('firestore_users.json', JSON.stringify(users, null, 2));
    
    console.log(`Successfully exported ${users.length} users to firestore_users.json`);
  } catch (error) {
    console.error('Error exporting Firestore users:', error);
  } finally {
    // Terminate the app
    admin.app().delete();
  }
}

// Run the export
exportFirestoreUsers(); 