# Phoenix E-wallet Solutions

## Project Description

Phoenix E-wallet Solutions is a web application built with Vue.js and Firebase, designed to manage user accounts, membership transactions, and provide an interactive gaming experience. The application features distinct interfaces for regular users and administrators, including functionalities like user authentication (email/password and facial recognition), membership payment tracking, transaction history, an admin dashboard for managing members and viewing reports, and a simple game.

## Key Features

- **User Authentication:** Secure login/signup with email and password.
- **Face Recognition Login/Registration:** Convenient facial recognition for login and setup in user profiles.
- **User Dashboard:** View personal information, wallet balance, and game tokens.
- **Membership Management:** Track user membership status (Phoenix/Half-Winged Phoenix) and payment history.
- **Deposit Functionality:** Simulate money deposits with transaction tracking.
- **Admin Dashboard:** Overview of recent activities, membership payments, and user management.
- **Admin History:** View detailed transaction history with filtering options.
- **PDF Report Generation:** Export membership transaction reports from the Admin History.
- **Official Members Management:** Admin view and management of registered members.
- **2048 Game:** An integrated game where users can earn in-app tokens.

## Technologies Used

- Vue.js (Frontend Framework)
- Firebase (Authentication, Firestore Database, Storage, Cloud Functions)
- html2pdf.js (for PDF report generation)
- face-api.js (for face detection and recognition)
- Material Icons
- CSS3 / SCSS (for styling)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (LTS version recommended)
- npm or Yarn package manager
- Firebase Account and Project set up (including Authentication, Firestore, and Storage enabled)
- Firebase CLI installed (`npm install -g firebase-tools`)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd phoenix-p
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or using Yarn
    # yarn install
    ```

3.  **Set up Firebase Configuration:**

    - Go to your Firebase project settings in the Firebase console.
    - Find your project's web app configuration snippet.
    - Create a file named `src/firebase.js` (if it doesn't exist) and add your Firebase configuration:

      ```javascript
      // src/firebase.js
      import { initializeApp } from "firebase/app";
      import { getAnalytics } from "firebase/analytics";

      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID", // Optional
      };

      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app); // Optional

      export { app };
      ```

    - Replace the placeholder values with your actual Firebase project configuration.

4.  **Set up Firebase Service Account Key (for Admin SDK usage, e.g., in functions or scripts):**

    - Go to your Firebase project settings > Service accounts.
    - Generate a new private key and download the JSON file.
    - Place this JSON file (e.g., `serviceAccountKey.json`) in the root directory of your project.
    - _Note: Ensure this file is kept secure and is not committed to public repositories._ (It is already listed in your directory structure, but ensure it's handled securely).

5.  **Deploy Firebase Functions (if applicable):**

    - Navigate to the `functions` directory:
      ```bash
      cd functions
      ```
    - Install functions dependencies:
      ```bash
      npm install
      # or using Yarn
      # yarn install
      ```
    - Deploy your functions:
      ```bash
      firebase deploy --only functions
      ```
    - Navigate back to the root directory:
      ```bash
      cd ..
      ```

## Running the Project

To start the development server:

```bash
npm run serve
# or using Yarn
# yarn serve
```

The application will be available at `http://localhost:8080/` (or another port if 8080 is in use).

## Building for Production

To build the application for production:

```bash
npm run build
# or using Yarn
# yarn build
```

This will generate a `dist` directory with the production-ready files.

## Deployment

This project can be deployed to Firebase Hosting:

1.  Initialize Firebase Hosting (if you haven't already):

    ```bash
    firebase init hosting
    ```

    (Select the `dist` directory as your public directory).

2.  Deploy your project:
    ```bash
    firebase deploy --only hosting
    ```

## File Structure Overview

- `public/`: Static assets.
- `src/`: Application source code.
  - `assets/`: Images, fonts, etc.
  - `components/`: Reusable Vue components.
  - `router/`: Vue Router configuration.
  - `views/`: Vue components for different pages.
  - `App.vue`: Main application component.
  - `main.js`: Application entry point.
  - `firebase.js`: Firebase initialization.
- `functions/`: Firebase Cloud Functions code.
- `dist/`: Production build output.
- `serviceAccountKey.json`: Firebase Admin SDK service account key (KEEP SECURE).
- `package.json`: Project dependencies and scripts.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[Specify your project's license here, e.g., MIT, Apache 2.0, etc.]
