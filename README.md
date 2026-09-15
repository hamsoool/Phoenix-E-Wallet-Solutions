# Phoenix E-Wallet Solutions

**Phoenix E-Wallet Solutions** is an all-in-one digital wallet and membership management platform built with Vue 3 and Firebase. Designed for student organizations and member communities, the platform provides membership tracking, simulated wallet transactions, fee payments, automated PDF/Excel reports, and a biometric facial recognition login system.

---

## Key Features

### User Experience
- **Biometric Face Login & Registration**: Optional webcam-based facial recognition powered by `face-api.js` for instant authentication alongside standard email and password login.
- **Digital Wallet Dashboard**: Real-time view of wallet balance, game tokens, and current membership status.
- **Deposit & Payment System**: Deposit simulation with transaction logging and status notifications.
- **Membership Tier Tracking**: View active status (e.g., Phoenix / Half-Winged Phoenix / Elite tiers) and pay organization dues.
- **Integrated 2048 Game**: Earn in-app tokens and achievements through a fully integrated mini-game.
- **Profile Management**: Custom avatar upload with image cropping (`cropperjs`), personal info management, and Face ID enrollment.
- **Transaction History**: Searchable history of deposits, payments, and rewards.
- **Help & Support**: Send inquiries directly to support via integrated EmailJS messaging.

### Admin Portal (Role-Protected)
- **Admin Dashboard**: Overview metrics including total active members, fees collected, and visual activity analytics with `Chart.js`.
- **Member Directory**: Manage registered members, verify membership levels, and export directory data to **Excel (`.xlsx`)**.
- **Audit Logs & PDF Reports**: Full audit history of organization transactions with exportable **PDF reports** (`jspdf` & `html2pdf.js`).
- **Elite Tier Management**: Dedicated interface for managing high-tier member privileges.
- **Support Inbox**: Review and address incoming inquiries from users.
- **Route Guard Security**: Automatic client-side navigation guards verifying Firestore `isAdmin` privileges.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Vue.js 3](https://vuejs.org/) (Vue CLI, Vue Router 4) |
| **Backend & Database** | [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Storage) |
| **Biometrics & AI** | [face-api.js](https://justadudewhohacks.github.io/face-api.js/) (TensorFlow.js face detection & landmark models) |
| **Charts & Media** | [Chart.js](https://www.chartjs.org/), [Cropper.js](https://fengyuanchen.github.io/cropperjs/) |
| **Report Generation** | [jspdf](https://github.com/parallax/jsPDF), [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable), [xlsx](https://sheetjs.com/) |
| **Notifications** | [EmailJS](https://www.emailjs.com/) |
| **Hosting Support** | [Vercel](https://vercel.com/) / [Firebase Hosting](https://firebase.google.com/docs/hosting) |

---

## Project Structure

```text
phoenix-p/
├── public/                 # Static assets, HTML shell, and pre-trained face-api models
│   └── models/             # Face detection and landmark weights for face-api.js
├── src/
│   ├── assets/             # Images, logos, and global stylesheets
│   ├── router/             # Vue Router route definitions and authentication guards
│   ├── views/              # Page components (Dashboard, Login, Game, Admin views, etc.)
│   ├── App.vue             # Root Vue layout component
│   ├── firebase.js         # Firebase client SDK initialization via environment variables
│   └── main.js             # Application bootstrap entry point
├── .env.example            # Sample template for required environment variables
├── firebase.json           # Firebase hosting and rewrite configuration
├── vercel.json             # Vercel Single-Page-App (SPA) rewrite rules
├── vue.config.js           # Vue CLI and Webpack configuration
└── package.json            # Project dependencies and npm scripts
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.x`, `v20.x`, or `v22.x` (LTS recommended)
- **npm** (comes with Node.js)
- A **Firebase Project** with Authentication and Cloud Firestore enabled.

### 1. Clone & Install
```bash
git clone https://github.com/hamsoool/Phoenix-E-Wallet-Solutions.git
cd Phoenix-E-Wallet-Solutions
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to a local file:
```bash
cp .env.example .env.local
```

Fill in your configuration details inside `.env.local`:
```env
# EmailJS
VUE_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
VUE_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VUE_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Firebase Client Configuration
VUE_APP_FIREBASE_API_KEY=your_firebase_api_key
VUE_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=your-project-id
VUE_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VUE_APP_FIREBASE_APP_ID=your_app_id
VUE_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run Locally
To start the local development server:
```bash
npm run dev
# or
npm run serve
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Runs the development server with live reloading |
| `serve` | `npm run serve` | Standard Vue CLI dev server alias |
| `build` | `npm run build` | Compiles and minifies for production into the `dist/` folder |

---

## Deployment

### Deploying to Vercel
1. Push your code to your GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. In **Settings > Environment Variables**, add the keys defined in `.env.example`.
4. In **Settings > General**, ensure the **Node.js Version** is set to `20.x` or `22.x`.
5. Deploy. The repository includes `vercel.json` to handle SPA routing automatically.

### Deploying to Firebase Hosting
The repository includes `firebase.json` configured to serve the `dist/` directory.

```bash
# 1. Build the production files
npm run build

# 2. Log in and deploy
npx firebase login
npx firebase deploy --only hosting
```
