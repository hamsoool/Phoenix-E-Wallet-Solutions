// src/App.vue
<template>
  <div class="form-container">
    <div class="col col-1">
      <div class="image-layer">
        <img src="../assets/images/newlogo.png" class="form-image-1" alt="Phoenix Logo">
      </div>
      <p class="featured-words">
        Copyright<span> @Phoenix E-wallet Solutions</span> By P-pay,
        <span>"From ashes to assets"</span>
      </p>
    </div>

    <div class="col col-2">
      <div class="btn-box">
        <button 
          class="btn" 
          :class="{ active: activeForm === 'login' }" 
          @click="setActiveForm('login')"
        >
          Log in
        </button>
        <button 
          class="btn" 
          :class="{ active: activeForm === 'faceLogin' }" 
          @click="setActiveForm('faceLogin')"
        >
          Face Recognition
        </button>
      </div>

      <!-- Login form -->
      <div 
        class="login-form" 
        :style="{
          opacity: activeForm === 'login' ? 1 : 0,
          left: activeForm === 'login' ? '50%' : '150%',
          pointerEvents: activeForm === 'login' ? 'auto' : 'none'
        }"
      >
        <div class="form-title">
          <span>Log In</span>
        </div>
        <div class="form-inputs">
          <div class="input-box">
            <input 
              type="text" 
              class="input-field" 
              placeholder="Email" 
              v-model="loginForm.email" 
              required
            >
            <i class="bx bx-user icon"></i>
          </div>
          <div class="input-box">
            <input 
              type="password" 
              class="input-field" 
              placeholder="Password" 
              v-model="loginForm.password" 
              required
            >
            <i class="bx bx-lock-alt icon"></i>
          </div>

          <div class="forgot-pass">
            <a href="#" @click.prevent="openForgotPasswordModal">Forgot password</a>
          </div>
          <div class="input-box">
            <button class="input-submit" @click="handleLogin">
              <span>Sign In</span>
              <i class="bx bx-right-arrow-alt"></i>
            </button>
          </div>
          <div class="sign-link">
            <p>By using our app, you agree to our <a href="#" @click.prevent="openTermsModal">Terms and Services</a>.</p>
          </div>
        </div>
      </div>
      
      <!-- Face Login -->
      <div 
        class="face-login" 
        :style="{
          opacity: activeForm === 'faceLogin' ? 1 : 0,
          left: activeForm === 'faceLogin' ? '50%' : '150%',
          pointerEvents: activeForm === 'faceLogin' ? 'auto' : 'none'
        }"
      >
        <div class="form-title">
          <span>Face Recognition</span>
        </div>
        <div class="video-container">
          <video ref="videoElement" autoplay playsinline style="width: 320px; height: 240px;"></video>
          <div class="face-guide-oval"></div>
        </div>
        <div class="input-box">
          <button class="input-submit" @click="startFacialRecognition">
            <span>Start Face Recognition</span>
            <i class="bx bx-camera"></i>
          </button>
        </div>
        <p id="faceStatus">{{ faceStatus }}</p>
      </div>
    </div>
  </div>

  <!-- Add this inside your template, at the same level as your form-container -->
  <div class="modal-overlay" v-if="showEmailExistsModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-envelope'></i>
        </div>
        <h3>Email Already Registered</h3>
        <p>This email address is already registered. Would you like to login instead?</p>
        <div class="modal-buttons">
          <button class="modal-button cancel" @click="closeEmailExistsModal">
            Cancel
          </button>
          <button class="modal-button confirm" @click="switchToLogin">
            Login Instead
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Invalid Credentials Modal -->
  <div class="modal-overlay" v-if="showInvalidCredentialsModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-error-circle'></i>
        </div>
        <h3>Invalid Credentials</h3>
        <p>The email or password you entered is incorrect. Please try again.</p>
        <div class="modal-buttons">
          <button class="modal-button confirm" @click="closeInvalidCredentialsModal">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Forgot Password Modal -->
  <div class="modal-overlay" v-if="showForgotPasswordModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-lock-open'></i>
        </div>
        <h3>Reset Password</h3>
        <p>Enter your registered email address and we'll send you a password reset link.</p>
        <input
          class="input-field"
          type="email"
          v-model="forgotPasswordEmail"
          placeholder="Enter your email"
          style="margin-bottom: 15px;"
        />
        <div class="modal-buttons">
          <button class="modal-button cancel" @click="closeForgotPasswordModal">Cancel</button>
          <button class="modal-button confirm" @click="sendPasswordReset">Send Link</button>
        </div>
        <div v-if="forgotPasswordMessage" style="margin-top:10px; color:#fff;">
          {{ forgotPasswordMessage }}
        </div>
      </div>
    </div>
  </div>

  <!-- Add this with your other modals -->
  <div class="modal-overlay" v-if="showFaceLoginModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-lock-alt'></i>
        </div>
        <h3>Enter Password</h3>
        <p>Please enter your password to complete the login process.</p>
        <input
          class="input-field"
          type="password"
          v-model="faceLoginPassword"
          placeholder="Enter your password"
          style="margin-bottom: 15px;"
        />
        <div class="modal-buttons">
          <button class="modal-button cancel" @click="cancelFaceLogin">Cancel</button>
          <button class="modal-button confirm" @click="completeFaceLogin">Login</button>
        </div>
        <div v-if="faceLoginError" style="margin-top:10px; color:#fff;">
          {{ faceLoginError }}
        </div>
      </div>
    </div>
  </div>

  <!-- Add this new modal for unverified email -->
  <div class="modal-overlay" v-if="showEmailNotVerifiedModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-envelope'></i>
        </div>
        <h3>Email Not Verified</h3>
        <p>
          Please verify your email address by clicking the link sent to your email.<br>
          <b>Didn't get the email?</b>
        </p>
        <div class="modal-buttons">
          <button class="modal-button cancel" @click="showEmailNotVerifiedModal = false">
            Cancel
          </button>
          <button class="modal-button confirm" @click="resendVerificationEmail">
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Registration Success Modal -->
  <div class="modal-overlay" v-if="showRegistrationSuccessModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-check-circle'></i>
        </div>
        <h3>Account Created!</h3>
        <p>
          Your account was created successfully.<br>
          <b>Please check your email and click the verification link to activate your account.</b><br>
          You can log in after verifying your email.
        </p>
        <div class="modal-buttons">
          <button class="modal-button confirm" @click="closeRegistrationSuccessModal">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Terms and Services Modal -->
  <div class="modal-overlay" v-if="showTermsModal">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">
          <i class='bx bx-file'></i>
        </div>
        <h3>Terms and Services</h3>
        <div class="terms-text">
          <p><b>Welcome to Phoenix E-wallet Solutions!</b></p>
          <p>By using our web application, you agree to the following terms:</p>
          <ul style="text-align:left; margin: 0 0 1em 1.5em;">
            <li>Your data will be used solely for the purpose of providing and improving our e-wallet services.</li>
            <li>We will not sell or share your personal information with third parties except as required by law or for service provision.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>Improper use of the platform may result in account suspension or termination.</li>
            <li>We may update these terms from time to time. Continued use constitutes acceptance of the new terms.</li>
          </ul>

          <p><b>Data Privacy Act of 2012 (Republic Act No. 10173)</b></p>
          <p>In compliance with the Data Privacy Act of 2012, we ensure the following:</p>
          <ul style="text-align:left; margin: 0 0 1em 1.5em;">
            <li>Your personal information is collected and processed in accordance with the law.</li>
            <li>We implement reasonable and appropriate organizational, physical, and technical security measures to protect your data.</li>
            <li>You have the right to access, correct, and delete your personal information.</li>
            <li>We will notify you of any security breach that may affect your personal information.</li>
            <li>Your data will be retained only for as long as necessary to fulfill the purposes for which it was collected.</li>
            <li>We will obtain your consent before collecting and processing your personal information.</li>
            <li>You have the right to object to the processing of your personal information.</li>
            <li>We will not use your personal information for purposes other than those for which it was collected.</li>
          </ul>

          <p>For more details about our data privacy practices or to exercise your rights under the Data Privacy Act, please contact our Data Protection Officer at support@phoenix-ewallet.com.</p>
        </div>
        <div class="modal-buttons">
          <button class="modal-button confirm" @click="closeTermsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, fetchSignInMethodsForEmail, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';
import * as faceapi from 'face-api.js';
import bcrypt from 'bcryptjs';

export default {
  name: 'App',
  data() {
    return {
      activeForm: 'login',
      faceStatus: '',
      stream: null,
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        firstName: '',
        lastName: '',
        collegeYear: '',
        block: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      auth: null,
      db: null,
      router: null,
      verificationStep: 'email', // 'email', 'verification', 'complete'
      verificationCode: '',
      generatedCode: '',
      formErrors: {
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: ''
      },
      countdown: 0,
      countdownInterval: null,
      showEmailExistsModal: false,
      existingEmail: '',
      showInvalidCredentialsModal: false,
      showForgotPasswordModal: false,
      forgotPasswordEmail: '',
      forgotPasswordMessage: '',
      showFaceLoginModal: false,
      faceLoginPassword: '',
      faceLoginError: '',
      matchedUserEmail: null,
      showEmailNotVerifiedModal: false,
      showRegistrationSuccessModal: false,
      justRegistered: false,
      agreeTerms: false,
      consentData: false,
      showTermsModal: false,
    }
  },
  created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.router = useRouter();

    // Check if user is already logged in
    onAuthStateChanged(this.auth, async (user) => {
      // If justRegistered is true, we're in the registration flow
      // Don't redirect to dashboard or show email verification modal
      if (this.justRegistered) {
        return;
      }
      
      if (user) {
        await user.reload();
        // Only show Email Not Verified modal if not just registered
        if (!user.emailVerified) {
          this.showEmailNotVerifiedModal = true;
          return;
        }
        // Check if user is admin
        const userDoc = await getDoc(doc(this.db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
          this.router.push('/admin');
        } else {
          this.router.push('/dashboard');
        }
      }
    });

    // Load face-api.js models
    this.loadFaceApiModels();
  },
  async mounted() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  },
  methods: {
    setActiveForm(formName) {
      // Stop any active camera stream when switching forms
      if (this.stream && formName !== 'faceLogin') {
        this.stopCameraStream();
      }
      this.activeForm = formName;
    },
    stopCameraStream() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    },
    async startFacialRecognition() {
      this.faceStatus = "Accessing camera...";
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.videoElement.srcObject = this.stream;
        this.faceStatus = "Scanning face...";

        // Wait for the video to be ready
        await new Promise(resolve => {
          this.$refs.videoElement.onloadedmetadata = resolve;
        });

        // Wait a moment for the camera to adjust
        await new Promise(resolve => setTimeout(resolve, 500));

        // Run face detection
        const detection = await faceapi
          .detectSingleFace(this.$refs.videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          this.faceStatus = "No face detected. Please try again.";
          return;
        }

        // Fetch all users' face descriptors from Firestore
        const usersSnapshot = await getDocs(collection(this.db, "users"));
        let matchFound = false;

        usersSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.faceDescriptor) {
            const distance = faceapi.euclideanDistance(
              detection.descriptor,
              new Float32Array(data.faceDescriptor)
            );
            if (distance < 0.5) { // 0.5 is a common threshold
              matchFound = true;
              this.matchedUserEmail = data.email;
            }
          }
        });

        if (matchFound && this.matchedUserEmail) {
          this.faceStatus = "Face recognized!";
          this.showFaceLoginModal = true;
        } else {
          this.faceStatus = "Face not recognized.";
        }

      } catch (err) {
        this.faceStatus = "Camera access denied or not available.";
        console.error("Error accessing camera:", err);
      } finally {
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
      }
    },
    async completeFaceLogin() {
      if (!this.faceLoginPassword) {
        this.faceLoginError = "Please enter your password";
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          this.matchedUserEmail,
          this.faceLoginPassword
        );
        
        console.log("Logged in successfully with face recognition");
        this.router.push('/dashboard');
      } catch (error) {
        console.error("Login error:", error);
        this.faceLoginError = "Invalid password. Please try again.";
      }
    },
    cancelFaceLogin() {
      this.showFaceLoginModal = false;
      this.faceLoginPassword = '';
      this.faceLoginError = '';
      this.matchedUserEmail = null;
      this.faceStatus = "Face recognition cancelled.";
    },
    async handleLogin() {
      if (!this.loginForm.email || !this.loginForm.password) {
        this.showInvalidCredentialsModal = true;
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          this.loginForm.email,
          this.loginForm.password
        );
        const user = userCredential.user;
        await user.reload();
        if (!user.emailVerified) {
          this.showEmailNotVerifiedModal = true;
          return;
        }
        const userDoc = await getDoc(doc(this.db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          this.router.push('/admin');
        } else {
          this.router.push('/dashboard');
        }
        // Update lastActive on login
        const userRef = doc(this.db, 'users', user.uid);
        await updateDoc(userRef, {
          lastActive: serverTimestamp()
        });
      } catch (error) {
        this.showInvalidCredentialsModal = true;
      }
    },
    validateGordonEmail(email) {
      // Format: YYYYXXXXX@gordoncollege.edu.ph
      // YYYY = year enrolled (4 digits)
      // XXXXX = student ID (5 digits)
      const gordonEmailRegex = /^(\d{4})(\d{5})@gordoncollege\.edu\.ph$/;
      const match = email.match(gordonEmailRegex);
      
      if (!match) {
        return {
          isValid: false,
          error: 'Invalid email format. Must be your School Domain'
        };
      }

      const yearEnrolled = parseInt(match[1]);
      const currentYear = new Date().getFullYear();
      
      // Validate year enrolled (should be current year or past 4 years)
      if (yearEnrolled < currentYear - 4 || yearEnrolled > currentYear) {
        return {
          isValid: false,
          error: 'Invalid enrollment year'
        };
      }

      return {
        isValid: true,
        yearEnrolled: yearEnrolled,
        studentId: match[2]
      };
    },
    generateVerificationCode() {
      // Generate a 6-digit code
      return Math.floor(100000 + Math.random() * 900000).toString();
    },
    startCountdown() {
      this.countdown = 300; // 5 minutes
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.countdownInterval);
          this.generatedCode = ''; // Clear the code after timeout
        }
      }, 1000);
    },
    formatCountdown() {
      const minutes = Math.floor(this.countdown / 60);
      const seconds = this.countdown % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    async sendVerificationEmail(email) {
      try {
        // Generate verification code
        this.generatedCode = this.generateVerificationCode();
        
        // Here you would typically send the email using your backend service
        // For now, we'll simulate it with an alert
        alert(`Verification code: ${this.generatedCode}\n\nIn a real implementation, this would be sent to your email.`);
        
        this.verificationStep = 'verification';
        this.startCountdown();
      } catch (error) {
        console.error('Error sending verification email:', error);
        alert('Error sending verification code. Please try again.');
      }
    },
    async handleRegistration() {
      // Reset form errors
      this.formErrors = {
        email: '',
        password: '',
        confirmPassword: ''
      };

      // Basic validation
      if (!this.registerForm.firstName || !this.registerForm.lastName || !this.registerForm.email || 
          !this.registerForm.password || !this.registerForm.confirmPassword) {
        alert("Please fill in all fields");
        return;
      }

      // Validate Gordon College email
      const emailValidation = this.validateGordonEmail(this.registerForm.email);
      if (!emailValidation.isValid) {
        this.formErrors.email = emailValidation.error;
        return;
      }

      // Password validation
      if (this.registerForm.password.length < 6) {
        this.formErrors.password = 'Password must be at least 6 characters long';
        return;
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.formErrors.confirmPassword = 'Passwords do not match';
        return;
      }

      // Add new validation
      if (!this.registerForm.collegeYear) {
        this.formErrors.collegeYear = 'Please select your current college year';
        return;
      }
      if (!this.registerForm.block) {
        this.formErrors.block = 'Please select your block';
        return;
      }

      try {
        // First, check if the email is already registered in Firebase Auth
        const methods = await fetchSignInMethodsForEmail(this.auth, this.registerForm.email);
        
        if (methods && methods.length > 0) {
          // Check if the user exists in Firestore
          const usersRef = collection(this.db, "users");
          const q = query(usersRef, where("email", "==", this.registerForm.email));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // User exists in Auth but not in Firestore - show a different message
            alert("This email was previously registered but the account was deleted. Please contact support to reactivate your account.");
            return;
          } else {
            // User exists in both Auth and Firestore
            this.existingEmail = this.registerForm.email;
            this.showEmailExistsModal = true;
          }
          return;
        }

        // If email is not registered anywhere, proceed with registration
        const fullStudentId = `${emailValidation.yearEnrolled}${emailValidation.studentId}`;
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          this.registerForm.email,
          this.registerForm.password
        );

        // Create a custom token for face recognition login
        const customToken = await this.auth.currentUser.getIdToken();

        // Store additional user data in Firestore
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(this.registerForm.password, salt);
        
        // Create user document with all required fields
        const userData = {
          firstName: this.registerForm.firstName,
          lastName: this.registerForm.lastName,
          email: this.registerForm.email,
          studentId: fullStudentId,
          yearEnrolled: emailValidation.yearEnrolled,
          studentIdShort: emailValidation.studentId,
          createdAt: new Date().toISOString(),
          walletBalance: 0,
          gameBalance: 0,
          isVerified: true,
          customToken: customToken,
          isAdmin: false,
          isPaid: false,
          paymentType: 'none',
          passwordHash: hashedPassword,
          phone: '',
          dob: '',
          avatarUrl: '',
          joinDate: serverTimestamp(),
          lastActive: serverTimestamp(),
          collegeYear: this.registerForm.collegeYear,
          block: this.registerForm.block
        };

        // Save to Firestore
        await setDoc(doc(this.db, "users", userCredential.user.uid), userData);

        // Reload user before sending verification email
        await userCredential.user.reload();
        await sendEmailVerification(userCredential.user)
          .then(() => {
            console.log('Verification email sent automatically after registration.');
          })
          .catch((error) => {
            console.error('Error sending verification email:', error);
          });

        // Store the registered email before resetting the form
        const registeredEmail = this.registerForm.email;

        // Show success modal
        this.showRegistrationSuccessModal = true;
        
        // Reset the form
        this.resetRegistrationForm();
        
        // Pre-fill the login form with the registered email
        this.loginForm.email = registeredEmail;

        // Log successful registration
        console.log('User registered successfully:', userData);
      } catch (error) {
        console.error("Registration error:", error);
        if (error.code === 'auth/email-already-in-use') {
          this.existingEmail = this.registerForm.email;
          this.showEmailExistsModal = true;
        } else {
          this.error = error.message;
        }
      }
    },
    resetRegistrationForm() {
      this.registerForm = {
        firstName: '',
        lastName: '',
        collegeYear: '',
        block: '',
        email: '',
        password: '',
        confirmPassword: ''
      };
      this.verificationStep = 'email';
      this.verificationCode = '';
      this.generatedCode = '';
      this.countdown = 0;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    },
    closeEmailExistsModal() {
      this.showEmailExistsModal = false;
      this.existingEmail = '';
    },
    switchToLogin() {
      this.showEmailExistsModal = false;
      this.setActiveForm('login');
      this.loginForm.email = this.existingEmail;
    },
    closeInvalidCredentialsModal() {
      this.showInvalidCredentialsModal = false;
    },
    openForgotPasswordModal() {
      this.forgotPasswordEmail = this.loginForm.email || '';
      this.forgotPasswordMessage = '';
      this.showForgotPasswordModal = true;
    },
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
      this.forgotPasswordEmail = '';
      this.forgotPasswordMessage = '';
    },
    async sendPasswordReset() {
      if (!this.forgotPasswordEmail) {
        this.forgotPasswordMessage = "Please enter your email address.";
        return;
      }
      try {
        await sendPasswordResetEmail(this.auth, this.forgotPasswordEmail);
        this.forgotPasswordMessage = "Password reset link sent! Please check your email.";
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          this.forgotPasswordMessage = "No account found with this email.";
        } else if (error.code === 'auth/invalid-email') {
          this.forgotPasswordMessage = "Please enter a valid email address.";
        } else {
          this.forgotPasswordMessage = "An error occurred. Please try again.";
        }
      }
    },
    async loadFaceApiModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    },
    async resendVerificationEmail() {
      try {
        const user = this.auth.currentUser;
        if (user && !user.emailVerified) {
          await sendEmailVerification(user);
          alert('Verification email resent! Please check your inbox.');
        }
      } catch (error) {
        alert('Failed to resend verification email. Please try again.');
      }
    },
    closeRegistrationSuccessModal() {
      this.showRegistrationSuccessModal = false;
      this.setActiveForm('login');
      // The login form's email is already pre-filled above
    },
    openTermsModal() {
      this.showTermsModal = true;
    },
    closeTermsModal() {
      this.showTermsModal = false;
    },
    onBlockInput(e) {
      // Only allow uppercase A-F
      let val = e.target.value.toUpperCase();
      if (!/^[A-F]?$/.test(val)) {
        val = val.replace(/[^A-F]/g, '');
      }
      this.registerForm.block = val;
      if (val && !/^[A-F]$/.test(val)) {
        this.formErrors.block = 'Block must be a letter from A to F';
      } else {
        this.formErrors.block = '';
      }
    },
  },
  beforeUnmount() {
    // Ensure camera is stopped when component is unmounted
    this.stopCameraStream();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

body {
  background-image: url('../assets/images/backg.png');
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 20px;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* Form Container */
.form-container {
  display: flex;
  width: 900px;
  height: 550px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

/* Left Column */
.col-1 {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 50%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 20% 20% 0;
  transition: border-radius 0.3s;
  padding: 20px;
}

.image-layer {
  margin-bottom: 20px;
}

.form-image-1 {
  width: 400px;
  height: 400px;
}

.featured-words {
  color: white;
  width: 280px;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
  line-height: 1.5;
}

.featured-words span {
  color: #ff6a00;
  font-weight: 600;
}

/* Right Column */
.col-2 {
  position: relative;
  width: 50%;
  padding: 30px 20px;
  overflow: hidden;
  min-height: 600px;
}

/* Button Navigation */
.btn-box {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.btn {
  font-weight: 500;
  padding: 8px 16px;
  border: none;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.active {
  background: #ff6a00;
}

.btn:hover {
  background: rgba(255, 106, 0, 0.7);
}

/* Forms */
.login-form,
.register-form,
.face-login {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding: 0 20px;
  transition: all 0.4s ease;
}

/* Form Inputs */
.form-title {
  margin-bottom: 25px;
  color: white;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.form-inputs {
  width: 100%;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 32px;
}

.input-box {
  position: relative;
  margin-bottom: 18px;
  z-index: 2;
}

.input-box:last-of-type {
  margin-bottom: 32px;
}

.input-box.has-error {
  margin-bottom: 22px;
}

.input-box input[type='email'] {
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  height: 50px;
  padding: 0 15px 0 40px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(5px);
  transition: border-color 0.3s ease;
}

.input-field:focus {
  border-color: #ff6a00;
  outline: none;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.input-field option,
.input-field select {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.input-box .icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: white;
  font-size: 18px;
}

.forgot-pass {
  text-align: right;
  margin-bottom: 15px;
}

.forgot-pass a {
  color: white;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s ease;
}

.forgot-pass a:hover {
  color: #ff6a00;
  text-decoration: underline;
}

.sign-link {
  text-align: center;
  margin-top: 15px;
  color: white;
  font-size: 14px;
}

.sign-link a {
  color: #ff6a00;
  text-decoration: none;
  font-weight: 500;
}

.sign-link a:hover {
  text-decoration: underline;
}

/* Submit Button */
.input-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 50px;
  background: #ff6a00;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  z-index: 3;
}

.input-submit:hover {
  background: #e65c00;
  gap: 15px;
}

/* Video for Face Recognition */
.video-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative; /* Add relative positioning */
}

video {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

#faceStatus {
  text-align: center;
  color: white;
  margin-top: 15px;
  font-size: 14px;
}

/* Add these new styles */
.face-guide-oval {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%; /* Adjust size as needed */
  height: 80%; /* Adjust size as needed to make it oval */
  border: 2px dashed #ff6a00; /* Phoenix color, dashed border */
  border-radius: 50%; /* Make it an oval */
  z-index: 10;
  box-sizing: border-box;
  pointer-events: none; /* Allow clicks/touches to pass through to video */
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .form-container {
    width: 95%;
    max-width: 1000px;
    margin: 20px auto;
    height: auto;
    min-height: 600px;
  }

  .col-1 {
    padding: 30px;
  }

  .form-image-1 {
    width: 320px;
    height: auto;
  }
}

@media (max-width: 992px) {
  .form-container {
    width: 90%;
    height: auto;
    min-height: 550px;
  }

  .col-1 {
    padding: 25px;
  }

  .form-image-1 {
    width: 280px;
  }

  .featured-words {
    font-size: 13px;
    max-width: 300px;
  }

  .btn-box {
    gap: 8px;
  }

  .btn {
    padding: 10px 18px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  body {
    padding: 0;
    min-height: 100vh;
    display: block;
  }

  .form-container {
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 100vh;
    border-radius: 0;
    margin: 0;
    border: none;
    background: rgba(0, 0, 0, 0.85);
  }

  .col-1 {
    width: 100%;
    border-radius: 0;
    padding: 25px 20px;
    min-height: auto;
    background: rgba(0, 0, 0, 0.9);
    order: 2;
  }

  .col-2 {
    width: 100%;
    padding: 25px 20px;
    min-height: 0;
    background: rgba(0, 0, 0, 0.85);
    order: 1;
  }

  .form-image-1 {
    width: 160px;
    height: auto;
    margin: 0 auto;
    transition: width 0.3s ease;
  }

  .featured-words {
    width: 100%;
    max-width: 300px;
    margin: 15px auto;
    font-size: 13px;
    line-height: 1.6;
  }

  .btn-box {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .btn {
    flex: 1;
    min-width: 120px;
    max-width: 200px;
    text-align: center;
    padding: 12px 20px;
    font-size: 14px;
    white-space: nowrap;
    transition: all 0.3s ease;
  }

  .input-row {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  .input-row .input-box,
  .input-row .input-box + .input-box {
    margin: 0 !important;
    width: 100%;
  }

  .input-submit {
    margin-top: 12px;
    height: 46px;
    font-size: 15px;
  }

  .form-title {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .input-field {
    height: 46px;
    font-size: 15px;
    padding: 0 15px 0 40px;
  }

  .input-box .icon {
    left: 15px;
    font-size: 18px;
  }

  .forgot-pass {
    margin: 12px 0;
  }

  .sign-link {
    margin-top: 15px;
    font-size: 14px;
  }

  /* Video container for face recognition */
  .video-container {
    margin: 15px 0;
    display: flex;
    justify-content: center;
  }

  video {
    max-width: 280px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* Modal improvements */
  .modal-container {
    width: 90%;
    max-width: 400px;
    margin: 20px;
    border-radius: 16px;
    overflow: hidden;
  }

  .modal-content {
    padding: 25px 20px;
  }

  .modal-icon {
    font-size: 42px;
    margin-bottom: 15px;
  }

  .modal-content h3 {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .modal-content p {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .modal-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .form-container {
    background: rgba(0, 0, 0, 0.9);
  }

  .col-1, .col-2 {
    padding: 20px 15px;
  }

  .form-image-1 {
    width: 140px;
  }

  .featured-words {
    font-size: 12px;
    max-width: 260px;
    margin: 12px auto;
  }

  .btn-box {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .btn {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 12px 20px;
    font-size: 14px;
  }

  .form-title {
    font-size: 20px;
    margin-bottom: 18px;
  }

  .input-field {
    height: 44px;
    font-size: 14px;
    padding: 0 12px 0 36px;
  }

  .input-box .icon {
    left: 12px;
    font-size: 16px;
  }

  .input-submit {
    height: 44px;
    font-size: 14px;
    padding: 0 20px;
  }

  .forgot-pass {
    margin: 10px 0;
    font-size: 13px;
  }

  .sign-link {
    font-size: 13px;
    margin-top: 12px;
  }

  /* Face recognition specific */
  .video-container {
    margin: 12px 0;
  }

  video {
    max-width: 240px;
  }

  #faceStatus {
    font-size: 13px;
    margin-top: 10px;
  }

  /* Modal improvements for small screens */
  .modal-container {
    width: 95%;
    margin: 15px;
    border-radius: 12px;
  }

  .modal-content {
    padding: 20px 15px;
  }

  .modal-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .modal-content h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .modal-content p {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 15px;
  }

  .modal-button {
    padding: 10px 18px;
    font-size: 14px;
  }
}

/* Enhanced landscape mode optimization */
@media (max-height: 600px) and (orientation: landscape) {
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }

  .form-container {
    flex-direction: row;
    height: auto;
    min-height: 400px;
    max-height: 90vh;
    margin: 20px auto;
    border-radius: 16px;
    overflow: hidden;
  }

  .col-1 {
    width: 35%;
    min-height: auto;
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .col-2 {
    width: 65%;
    min-height: auto;
    padding: 20px 15px;
    overflow-y: auto;
  }

  .form-image-1 {
    width: 120px;
    margin-bottom: 15px;
  }

  .featured-words {
    font-size: 12px;
    margin: 10px auto;
    max-width: 200px;
  }

  .btn-box {
    margin-bottom: 15px;
    flex-wrap: nowrap;
  }

  .btn {
    padding: 8px 15px;
    font-size: 13px;
  }

  .form-title {
    margin-bottom: 12px;
    font-size: 20px;
  }

  .input-field {
    height: 40px;
    font-size: 13px;
  }

  .input-submit {
    height: 40px;
    font-size: 13px;
    margin-top: 10px;
  }

  .input-row {
    margin-bottom: 10px;
  }

  /* Scrollable register form in landscape */
  .scrollable-register {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 5px;
  }
}

/* Fix for very small screens */
@media (max-width: 320px) {
  .form-container {
    background: rgba(0, 0, 0, 0.95);
  }

  .col-1, .col-2 {
    padding: 15px 12px;
  }

  .form-image-1 {
    width: 120px;
  }

  .featured-words {
    font-size: 11px;
    max-width: 240px;
    margin: 10px auto;
  }

  .btn {
    padding: 10px 15px;
    font-size: 13px;
  }

  .input-field {
    height: 42px;
    font-size: 13px;
    padding: 0 10px 0 32px;
  }

  .input-box .icon {
    left: 10px;
    font-size: 15px;
  }

  .input-submit {
    height: 42px;
    font-size: 13px;
    padding: 0 15px;
  }

  .form-title {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .forgot-pass {
    margin: 8px 0;
    font-size: 12px;
  }

  .sign-link {
    font-size: 12px;
    margin-top: 10px;
  }

  /* Face recognition specific */
  video {
    max-width: 200px;
  }

  /* Modal improvements for very small screens */
  .modal-container {
    width: 98%;
    margin: 10px;
    padding: 15px;
  }

  .modal-content {
    padding: 15px 12px;
  }

  .modal-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .modal-content h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .modal-content p {
    font-size: 12px;
    line-height: 1.3;
    margin-bottom: 12px;
  }

  .modal-button {
    padding: 8px 15px;
    font-size: 13px;
  }
}

/* Enhanced touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn {
    padding: 12px 20px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .input-field {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0 15px 0 40px;
  }

  .input-submit {
    min-height: 44px;
    padding: 0 20px;
  }

  .modal-button {
    min-height: 44px;
    padding: 12px 20px;
  }

  /* Increase touch targets */
  .forgot-pass a,
  .sign-link a,
  .checkbox-label,
  .checkbox-label input[type="checkbox"] {
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
}

/* Add smooth transitions */
.form-container,
.col-1,
.col-2,
.form-image-1,
.btn,
.input-field,
.input-submit,
.modal-container,
.modal-content {
  transition: all 0.3s ease-in-out;
}

/* Improve form animations */
.login-form,
.register-form,
.face-login {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Add loading state styles */
.input-submit:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Improve scrollbar styles */
.scrollable-register {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 106, 0, 0.5) rgba(0, 0, 0, 0.2);
}

.scrollable-register::-webkit-scrollbar {
  width: 6px;
}

.scrollable-register::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.scrollable-register::-webkit-scrollbar-thumb {
  background: rgba(255, 106, 0, 0.5);
  border-radius: 3px;
}

.scrollable-register::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 106, 0, 0.7);
}

/* Add focus styles for better accessibility */
.input-field:focus,
.btn:focus,
.input-submit:focus,
.modal-button:focus {
  outline: 2px solid #ff6a00;
  outline-offset: 2px;
}

/* Add active state styles */
.btn:active,
.input-submit:active,
.modal-button:active {
  transform: translateY(1px);
}

/* Add these styles to your existing styles */
.input-box.has-error .input-field {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* Add these new styles */
.verification-step {
  text-align: center;
  margin-bottom: 20px;
}

.verification-info {
  color: white;
  margin-bottom: 20px;
  line-height: 1.5;
}

.countdown {
  color: #ff6a00;
  font-size: 14px;
  margin: 10px 0;
}

.resend-code {
  background: none;
  border: none;
  color: #ff6a00;
  cursor: pointer;
  font-size: 14px;
  padding: 5px;
  margin-top: 10px;
}

.resend-code:disabled {
  color: #666;
  cursor: not-allowed;
}

/* Update these styles in your existing <style> section */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}


.modal-content {
background: #ff6a00;
  text-align: center;
   width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  text-align: center;
  height: 100%;
}

.modal-icon {
  font-size: 48px;
  color: #ff6a00;
  margin-bottom: 20px;
}

.modal-content h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #fff; /* White text */
}

.modal-content p {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 25px;
  color: #fff; /* White text */
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-button {
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button.cancel {
  background: #fff;
  color: #ff6a00;
  font-weight: 600;
}

.modal-button.confirm {
  background: #222;
  color: #fff;
  font-weight: 600;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-button.cancel:hover {
  background: #ffe0c2;
}

.modal-button.confirm:hover {
  background: #111;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 480px) {
  .modal-container {
    width: 95%;
    padding: 20px;
  }

  .modal-content h3 {
    font-size: 20px;
  }

  .modal-content p {
    font-size: 14px;
  }

  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .modal-button {
    width: 100%;
  }
}

.input-row {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}
.input-row:first-of-type {
  padding-top: 6px;
}
.input-row .input-box {
  flex: 1;
  margin-bottom: 0;
}
.input-row .input-box + .input-box {
  margin-left: 6px;
}

.consent-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  margin-top: 4px;
}
.checkbox-label {
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  accent-color: #ff6a00;
  width: 18px;
  height: 18px;
  margin-right: 6px;
}
.checkbox-label a {
  color: #ff6a00;
  text-decoration: underline;
  cursor: pointer;
}
.checkbox-label a:hover {
  color: #fff;
  background: #ff6a00;
  border-radius: 4px;
  padding: 0 4px;
}
.input-submit:disabled {
  background: #aaa;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.7;
}
.terms-text {
  color: #fff;
  font-size: 15px;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 18px;
}
.scrollable-register {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #ff6a00 #2d0a00;
}
.scrollable-register::-webkit-scrollbar {
  width: 8px;
  background: #2d0a00;
  border-radius: 8px;
}
.scrollable-register::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ff6a00 60%, #ffb366 100%);
  border-radius: 8px;
  min-height: 40px;
}
.scrollable-register::-webkit-scrollbar-thumb:hover {
  background: #ff6a00;
}
.scrollable-register::-webkit-scrollbar-track {
  background: #2d0a00;
  border-radius: 8px;
}
@media (max-width: 768px) {
  .scrollable-register {
    max-height: 340px;
  }
}
.input-field,
.input-field option,
.input-field select {
  background: rgba(60, 20, 10, 0.95) !important;
  color: #fff !important;
}
.input-field:focus,
.input-field:active {
  background: rgba(60, 20, 10, 1) !important;
  color: #fff !important;
}
.input-field option[disabled] {
  color: #ccc !important;
  background: #444 !important;
}

/* Add viewport meta tag handling */
@media screen and (max-width: 768px) {
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    position: fixed;
    width: 100%;
    height: 100%;
    background-attachment: fixed;
    background-size: cover;
    background-position: center;
  }

  .form-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    min-height: -webkit-fill-available;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    flex-direction: column;
  }

  .col-1 {
    order: 2;
    width: 100%;
    padding: 15px;
    min-height: auto;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .col-2 {
    order: 1;
    width: 100%;
    padding: 20px 15px;
    min-height: auto;
    background: transparent;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .form-image-1 {
    width: 120px;
    height: auto;
    margin: 0 auto 10px;
  }

  .featured-words {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
    padding: 0 10px;
  }

  .btn-box {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    width: 100%;
    margin: 0 0 20px;
    padding: 0;
  }

  .btn {
    width: 100%;
    height: 44px;
    padding: 0 15px;
    margin: 0;
    font-size: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  .form-title {
    font-size: 20px;
    margin: 0 0 20px;
    padding: 0 10px;
  }

  .form-inputs {
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .input-box {
    margin-bottom: 15px;
    width: 100%;
  }

  .input-field {
    width: 100%;
    height: 44px;
    padding: 0 15px 0 40px;
    font-size: 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .input-box .icon {
    left: 12px;
    font-size: 18px;
  }

  .input-row {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: 0 0 15px;
  }

  .input-row .input-box {
    margin: 0;
    width: 100%;
  }

  .input-submit {
    width: 100%;
    height: 44px;
    margin: 10px 0 0;
    padding: 0 20px;
    font-size: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .forgot-pass {
    margin: 10px 0;
    text-align: center;
  }

  .forgot-pass a {
    font-size: 14px;
    padding: 8px 12px;
    display: inline-block;
  }

  .sign-link {
    margin: 15px 0 0;
    text-align: center;
    font-size: 14px;
  }

  .sign-link a {
    padding: 8px 12px;
    display: inline-block;
  }

  /* Face recognition specific */
  .video-container {
    width: 100%;
    margin: 15px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  video {
    width: 100%;
    max-width: 280px;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
  }

  #faceStatus {
    text-align: center;
    margin: 10px 0;
    padding: 0 15px;
    font-size: 14px;
    line-height: 1.4;
  }

  /* Modal improvements for mobile */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    z-index: 1000;
  }

  .modal-container {
    width: 100%;
    max-width: 320px;
    margin: 0;
    padding: 0;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-content {
    padding: 20px 15px;
  }

  .modal-icon {
    font-size: 36px;
    margin-bottom: 15px;
  }

  .modal-content h3 {
    font-size: 18px;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  .modal-content p {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 20px;
  }

  .modal-buttons {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .modal-button {
    width: 100%;
    height: 44px;
    padding: 0 20px;
    font-size: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Checkbox improvements */
  .consent-row {
    margin: 15px 0;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 2px 0 0;
    flex-shrink: 0;
  }

  /* Form animations */
  .login-form,
  .register-form,
  .face-login {
    position: relative;
    left: 0;
    transform: none;
    opacity: 1;
    transition: opacity 0.3s ease;
    width: 100%;
    padding: 0;
  }

  .login-form[style*="opacity: 0"],
  .register-form[style*="opacity: 0"],
  .face-login[style*="opacity: 0"] {
    display: none;
  }

  /* Scrollable register form */
  .scrollable-register {
    max-height: none;
    overflow-y: visible;
    padding: 0;
  }

  /* Fix for iOS input zoom */
  @supports (-webkit-touch-callout: none) {
    .input-field {
      font-size: 16px;
    }
  }

  /* Fix for Android Chrome */
  @supports (-webkit-appearance:none) {
    .input-field {
      font-size: 16px;
    }
  }
}

/* Additional mobile optimizations for very small screens */
@media screen and (max-width: 360px) {
  .form-container {
    padding: 10px;
  }

  .col-1, .col-2 {
    padding: 10px;
  }

  .form-image-1 {
    width: 100px;
  }

  .featured-words {
    font-size: 11px;
    max-width: 240px;
  }

  .btn {
    height: 40px;
    font-size: 14px;
  }

  .input-field {
    height: 40px;
    font-size: 15px;
  }

  .input-submit {
    height: 40px;
    font-size: 14px;
  }

  .form-title {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .modal-container {
    max-width: 280px;
  }

  .modal-content {
    padding: 15px 12px;
  }

  .modal-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .modal-content h3 {
    font-size: 16px;
  }

  .modal-content p {
    font-size: 13px;
  }

  .modal-button {
    height: 40px;
    font-size: 14px;
  }
}

/* Fix for devices with notches */
@supports (padding: max(0px)) {
  .form-container {
    padding-left: max(15px, env(safe-area-inset-left));
    padding-right: max(15px, env(safe-area-inset-right));
    padding-bottom: max(15px, env(safe-area-inset-bottom));
  }

  .modal-container {
    margin-left: max(15px, env(safe-area-inset-left));
    margin-right: max(15px, env(safe-area-inset-right));
    margin-bottom: max(15px, env(safe-area-inset-bottom));
  }
}

/* Enhanced Mobile Styles */
@media screen and (max-width: 768px) {
  /* Improved viewport handling */
  :root {
    --vh: 1vh;
    --safe-area-inset-top: env(safe-area-inset-top, 0px);
    --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  }

  html {
    height: -webkit-fill-available;
    touch-action: manipulation;
  }

  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
    overscroll-behavior: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Enhanced container styles */
  .form-container {
    min-height: 100vh;
    min-height: -webkit-fill-available;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transform: translateZ(0);
    will-change: transform;
  }

  /* Improved column layouts */
  .col-1 {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
    padding: max(15px, var(--safe-area-inset-top)) 15px max(15px, var(--safe-area-inset-bottom));
  }

  .col-2 {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
    padding: 20px 15px max(20px, var(--safe-area-inset-bottom));
  }

  /* Enhanced button styles */
  .btn-box {
    position: relative;
    margin: 0 0 25px;
    padding: 0 5px;
  }

  .btn {
    position: relative;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .btn:active::after {
    transform: translate(-50%, -50%) scale(2);
    opacity: 1;
  }

  .btn.active {
    background: linear-gradient(45deg, #ff6a00, #ff8533);
    border: none;
    box-shadow: 0 4px 15px rgba(255, 106, 0, 0.3);
  }

  /* Enhanced input styles */
  .input-box {
    position: relative;
    margin-bottom: 20px;
  }

  .input-field {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .input-field:focus {
    background: rgba(255, 255, 255, 0.12);
    border-color: #ff6a00;
    box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.2);
  }

  .input-box .icon {
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.2s ease;
  }

  .input-field:focus + .icon {
    color: #ff6a00;
  }

  /* Enhanced submit button */
  .input-submit {
    background: linear-gradient(45deg, #ff6a00, #ff8533);
    border: none;
    box-shadow: 0 4px 15px rgba(255, 106, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .input-submit::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  .input-submit:active::before {
    left: 100%;
  }

  .input-submit:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(255, 106, 0, 0.2);
  }

  /* Enhanced modal styles */
  .modal-overlay {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(0, 0, 0, 0.85);
    animation: modalFadeIn 0.3s ease;
  }

  .modal-container {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: modalSlideUp 0.3s ease;
  }

  @keyframes modalSlideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Enhanced checkbox styles */
  .checkbox-label {
    position: relative;
    padding: 12px 0;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-label input[type="checkbox"] {
    position: relative;
    width: 20px;
    height: 20px;
    margin: 2px 0 0;
    appearance: none;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .checkbox-label input[type="checkbox"]:checked {
    background: #ff6a00;
    border-color: #ff6a00;
  }

  .checkbox-label input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 14px;
  }

  /* Enhanced face recognition */
  .video-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  video {
    transform: scaleX(-1);
    filter: brightness(1.1) contrast(1.1);
  }

  #faceStatus {
    background: rgba(0, 0, 0, 0.7);
    padding: 8px 12px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    margin: 10px auto;
    max-width: 280px;
  }

  /* Loading states */
  .input-submit:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.7;
  }

  .input-submit.loading {
    position: relative;
    color: transparent;
  }

  .input-submit.loading::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Enhanced form transitions */
  .login-form,
  .register-form,
  .face-login {
    animation: formFadeIn 0.3s ease;
  }

  @keyframes formFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Enhanced scrollbar */
  .scrollable-register {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 106, 0, 0.5) transparent;
  }

  .scrollable-register::-webkit-scrollbar {
    width: 4px;
  }

  .scrollable-register::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable-register::-webkit-scrollbar-thumb {
    background: rgba(255, 106, 0, 0.5);
    border-radius: 2px;
  }

  .scrollable-register::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 106, 0, 0.7);
  }

  /* Enhanced error states */
  .input-box.has-error .input-field {
    border-color: #ff4444;
    background: rgba(255, 68, 68, 0.1);
  }

  .error-message {
    color: #ff4444;
    font-size: 12px;
    margin-top: 4px;
    padding-left: 4px;
    animation: errorShake 0.3s ease;
  }

  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  /* Enhanced focus states */
  .input-field:focus,
  .btn:focus,
  .input-submit:focus,
  .modal-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.3);
  }

  /* Enhanced active states */
  .btn:active,
  .input-submit:active,
  .modal-button:active {
    transform: translateY(1px);
    transition: transform 0.1s ease;
  }

  /* Enhanced hover states for devices that support hover */
  @media (hover: hover) {
    .btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .input-submit:hover {
      background: linear-gradient(45deg, #ff8533, #ff6a00);
      transform: translateY(-1px);
    }

    .modal-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

/* Enhanced Mobile-First Responsive Styles */
@media screen and (max-width: 768px) {
  /* Reset viewport handling */
  :root {
    --vh: 1vh;
    --safe-area-inset-top: env(safe-area-inset-top, 0px);
    --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    position: fixed;
    touch-action: manipulation;
  }

  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
    overscroll-behavior: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-attachment: fixed;
    background-size: cover;
    background-position: center;
  }

  /* Enhanced container styles */
  .form-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: -webkit-fill-available;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    flex-direction: column;
    transform: translateZ(0);
    will-change: transform;
  }

  /* Hide col-1 in mobile mode */
  .col-1 {
    display: none;
  }

  /* Adjust col-2 to take full width */
  .col-2 {
    width: 100%;
    padding: 20px 15px max(20px, var(--safe-area-inset-bottom));
    min-height: auto;
    background: transparent;
    flex: 1;
    display: flex;
    flex-direction: column;
    order: 1;
  }

  /* Enhanced form elements */
  .form-image-1 {
    width: 120px;
    height: auto;
    margin: 0 auto 10px;
    object-fit: contain;
  }

  .featured-words {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
    padding: 0 10px;
  }

  /* Improved button navigation */
  .btn-box {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    width: 100%;
    margin: 0 0 20px;
    padding: 0;
  }

  .btn {
    width: 100%;
    height: 44px;
    padding: 0 15px;
    margin: 0;
    font-size: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Enhanced form inputs */
  .form-title {
    font-size: 20px;
    margin: 0 0 20px;
    padding: 0 10px;
    color: #fff;
  }

  .form-inputs {
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .input-box {
    margin-bottom: 15px;
    width: 100%;
  }

  .input-field {
    width: 100%;
    height: 44px;
    padding: 0 15px 0 40px;
    font-size: 16px; /* Prevent zoom on iOS */
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    -webkit-appearance: none;
    appearance: none;
  }

  .input-box .icon {
    left: 12px;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Enhanced input rows */
  .input-row {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: 0 0 15px;
  }

  .input-row .input-box {
    margin: 0;
    width: 100%;
  }

  /* Enhanced submit button */
  .input-submit {
    width: 100%;
    height: 44px;
    margin: 10px 0 0;
    padding: 0 20px;
    font-size: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(45deg, #ff6a00, #ff8533);
    border: none;
    box-shadow: 0 4px 15px rgba(255, 106, 0, 0.3);
  }

  /* Enhanced links */
  .forgot-pass {
    margin: 10px 0;
    text-align: center;
  }

  .forgot-pass a {
    font-size: 14px;
    padding: 8px 12px;
    display: inline-block;
    color: #fff;
    text-decoration: none;
  }

  .sign-link {
    margin: 15px 0 0;
    text-align: center;
    font-size: 14px;
    color: #fff;
  }

  .sign-link a {
    padding: 8px 12px;
    display: inline-block;
    color: #ff6a00;
    text-decoration: none;
  }

  /* Enhanced face recognition */
  .video-container {
    width: 100%;
    margin: 15px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  video {
    width: 100%;
    max-width: 280px;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
    transform: scaleX(-1);
    filter: brightness(1.1) contrast(1.1);
  }

  #faceStatus {
    text-align: center;
    margin: 10px 0;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.4;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 20px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    margin: 10px auto;
    max-width: 280px;
  }

  /* Enhanced modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    z-index: 1000;
  }

  .modal-container {
    width: 100%;
    max-width: 320px;
    margin: 0;
    padding: 0;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .modal-content {
    padding: 20px 15px;
  }

  .modal-buttons {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .modal-button {
    width: 100%;
    height: 44px;
    padding: 0 20px;
    font-size: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Enhanced checkbox styles */
  .consent-row {
    margin: 15px 0;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    font-size: 14px;
    line-height: 1.4;
    color: #fff;
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 2px 0 0;
    flex-shrink: 0;
    accent-color: #ff6a00;
  }

  /* Fix for iOS input zoom */
  @supports (-webkit-touch-callout: none) {
    .input-field {
      font-size: 16px;
    }
  }

  /* Fix for Android Chrome */
  @supports (-webkit-appearance:none) {
    .input-field {
      font-size: 16px;
    }
  }

  /* Fix for devices with notches */
  @supports (padding: max(0px)) {
    .form-container {
      padding-left: max(15px, env(safe-area-inset-left));
      padding-right: max(15px, env(safe-area-inset-right));
      padding-bottom: max(15px, env(safe-area-inset-bottom));
    }

    .modal-container {
      margin-left: max(15px, env(safe-area-inset-left));
      margin-right: max(15px, env(safe-area-inset-right));
      margin-bottom: max(15px, env(safe-area-inset-bottom));
    }
  }
}

/* Additional optimizations for very small screens */
@media screen and (max-width: 360px) {
  .form-container {
    padding: 10px;
  }

  .col-1, .col-2 {
    padding: 10px;
  }

  .form-image-1 {
    width: 100px;
  }

  .featured-words {
    font-size: 11px;
    max-width: 240px;
  }

  .btn {
    height: 40px;
    font-size: 14px;
  }

  .input-field {
    height: 40px;
    font-size: 15px;
  }

  .input-submit {
    height: 40px;
    font-size: 14px;
  }

  .form-title {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .modal-container {
    max-width: 280px;
  }

  .modal-content {
    padding: 15px 12px;
  }

  .modal-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .modal-content h3 {
    font-size: 16px;
  }

  .modal-content p {
    font-size: 13px;
  }

  .modal-button {
    height: 40px;
    font-size: 14px;
  }
}

/* Enhanced touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn,
  .input-submit,
  .modal-button {
    min-height: 44px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .input-field {
    font-size: 16px;
    padding: 0 15px 0 40px;
  }

  .forgot-pass a,
  .sign-link a,
  .checkbox-label,
  .checkbox-label input[type="checkbox"] {
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
}

@media screen and (max-width: 768px) {
  .login-form {
    position: relative !important;
    left: 0 !important;
    transform: none !important;
    width: 100%;
    opacity: 1 !important;
    padding: 0;
  }

  .login-form[style*="opacity: 0"] {
    display: none;
  }

  .login-form[style*="left: 150%"] {
    display: none;
  }

  .face-login {
    position: relative !important;
    left: 0 !important;
    transform: none !important;
    width: 100%;
    opacity: 1 !important;
    padding: 0;
  }

  .face-login[style*="opacity: 0"] {
    display: none;
  }

  .face-login[style*="left: 150%"] {
    display: none;
  }

  .register-form {
    position: relative !important;
    left: 0 !important;
    transform: none !important;
    width: 100%;
    opacity: 1 !important;
    padding: 0;
    max-height: 100vh;
    overflow-y: auto;
  }

  .register-form[style*="opacity: 0"] {
    display: none;
  }

  .register-form[style*="left: 150%"] {
    display: none;
  }

  .scrollable-register {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    padding-right: 10px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 106, 0, 0.5) transparent;
  }

  .scrollable-register::-webkit-scrollbar {
    width: 4px;
  }

  .scrollable-register::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable-register::-webkit-scrollbar-thumb {
    background: rgba(255, 106, 0, 0.5);
    border-radius: 2px;
  }

  .scrollable-register::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 106, 0, 0.7);
  }
}
</style>