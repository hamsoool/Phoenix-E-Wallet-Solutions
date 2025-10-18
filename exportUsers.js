const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin with your service account credentials
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function exportUsers() {
  try {
    console.log('Starting user export...');
    const userRecords = [];
    let nextPageToken;
    
    // Firebase returns users in batches, so we need to loop through all pages
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      // Process each user and add to our array
      listUsersResult.users.forEach(userRecord => {
        // Extract the user data you want to export
        const userData = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime
          },
          customClaims: userRecord.customClaims
        };
        
        userRecords.push(userData);
      });
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    // Write to JSON file
    fs.writeFileSync('users.json', JSON.stringify(userRecords, null, 2));
    
    console.log(`Successfully exported ${userRecords.length} users to users.json`);
  } catch (error) {
    console.error('Error exporting users:', error);
  } finally {
    // Terminate the app
    admin.app().delete();
  }
}

// Run the export
exportUsers(); 