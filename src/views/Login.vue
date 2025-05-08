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
        <button 
          class="btn" 
          :class="{ active: activeForm === 'register' }" 
          @click="setActiveForm('register')"
        >
          Sign up
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
            <p>Don't have an account yet? <a href="#" @click.prevent="setActiveForm('register')">Sign Up Here</a></p>
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
        </div>
        <div class="input-box">
          <button class="input-submit" @click="startFacialRecognition">
            <span>Start Face Recognition</span>
            <i class="bx bx-camera"></i>
          </button>
        </div>
        <p id="faceStatus">{{ faceStatus }}</p>
      </div>

      <!-- Sign Up Form -->
      <div 
        class="register-form" 
        :style="{
          opacity: activeForm === 'register' ? 1 : 0,
          left: activeForm === 'register' ? '50%' : '150%',
          pointerEvents: activeForm === 'register' ? 'auto' : 'none'
        }"
      >
        <div class="form-title">
          <span>Create an Account</span>
        </div>
        <div class="form-inputs">
          <!-- Step 1: Basic Information -->
          <template v-if="verificationStep === 'email'">
            <div class="input-box">
              <input 
                type="text" 
                class="input-field" 
                placeholder="Full Name" 
                v-model="registerForm.fullName" 
                required
              >
              <i class="bx bx-user icon"></i>
            </div>
            <div class="input-box" :class="{ 'has-error': formErrors.email }">
              <input 
                type="email" 
                class="input-field" 
                placeholder="Gordon College Email" 
                v-model="registerForm.email" 
                required
              >
              <i class='bx bx-id-card icon'></i>
              <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
            </div>
            <div class="input-box" :class="{ 'has-error': formErrors.password }">
              <input 
                type="password" 
                class="input-field" 
                placeholder="Password" 
                v-model="registerForm.password" 
                required
              >
              <i class="bx bx-lock-alt icon"></i>
              <span v-if="formErrors.password" class="error-message">{{ formErrors.password }}</span>
            </div>
            <div class="input-box" :class="{ 'has-error': formErrors.confirmPassword }">
              <input 
                type="password" 
                class="input-field" 
                placeholder="Confirm Password" 
                v-model="registerForm.confirmPassword" 
                required
              >
              <i class="bx bx-lock-alt icon"></i>
              <span v-if="formErrors.confirmPassword" class="error-message">{{ formErrors.confirmPassword }}</span>
            </div>
          </template>

          <!-- Step 2: Verification Code -->
          <template v-if="verificationStep === 'verification'">
            <div class="verification-step">
              <p class="verification-info">
                A verification code has been sent to your email.<br>
                Please enter the code below:
              </p>
              <div class="input-box" :class="{ 'has-error': formErrors.verificationCode }">
                <input 
                  type="text" 
                  class="input-field" 
                  placeholder="Enter 6-digit code" 
                  v-model="verificationCode" 
                  maxlength="6"
                  required
                >
                <i class="bx bx-key icon"></i>
                <span v-if="formErrors.verificationCode" class="error-message">{{ formErrors.verificationCode }}</span>
              </div>
              <div class="countdown" v-if="countdown > 0">
                Code expires in: {{ formatCountdown() }}
              </div>
              <button class="resend-code" @click="sendVerificationEmail(registerForm.email)" :disabled="countdown > 0">
                Resend Code
              </button>
            </div>
          </template>

          <div class="input-box">
            <button class="input-submit" @click="handleRegistration">
              <span>{{ verificationStep === 'email' ? 'Continue' : 'Complete Registration' }}</span>
              <i class="bx bx-right-arrow-alt"></i>
            </button>
          </div>
        </div>
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
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';
import * as faceapi from 'face-api.js';

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
        fullName: '',
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
    }
  },
  created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.router = useRouter();

    // Check if user is already logged in
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in, redirect to dashboard
        this.router.push('/dashboard');
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
        let matchedUserId = null;

        usersSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.faceDescriptor) {
            const distance = faceapi.euclideanDistance(
              detection.descriptor,
              new Float32Array(data.faceDescriptor)
            );
            if (distance < 0.5) { // 0.5 is a common threshold
              matchFound = true;
              matchedUserId = docSnap.id;
            }
          }
        });

        if (matchFound) {
          this.faceStatus = "Face recognized! Logging in...";
          // Optionally, you can sign in the user by their UID
          // For security, you may want to require a second factor (like email) in production
          setTimeout(() => {
            this.router.push('/dashboard');
          }, 1000);
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
        
        // Successful login
        console.log("Logged in successfully:", userCredential.user);
        this.router.push('/dashboard');
      } catch (error) {
        console.error("Login error:", error);
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
      if (!this.registerForm.fullName || !this.registerForm.email || 
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

      try {
        // First, check if the email is already registered
        const methods = await fetchSignInMethodsForEmail(this.auth, this.registerForm.email);
        
        if (methods && methods.length > 0) {
          // Email is already registered
          this.existingEmail = this.registerForm.email;
          this.showEmailExistsModal = true;
          return;
        }

        // If email is not registered, proceed with registration
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          this.registerForm.email,
          this.registerForm.password
        );

        // Store additional user data in Firestore
        await setDoc(doc(this.db, "users", userCredential.user.uid), {
          fullName: this.registerForm.fullName,
          email: this.registerForm.email,
          yearEnrolled: emailValidation.yearEnrolled,
          studentId: emailValidation.studentId,
          createdAt: new Date().toISOString(),
          walletBalance: 0,
          gameBalance: 0,
          isVerified: true
        });

        // Send email verification
        await sendEmailVerification(userCredential.user);

        alert("Account created successfully! Please check your email to verify your account.");
        this.setActiveForm('login');
        
        // Reset the form
        this.resetRegistrationForm();
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
        fullName: '',
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
}

.input-box {
  position: relative;
  margin-bottom: 15px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .form-container {
    flex-direction: column;
    width: 90%;
    height: auto;
  }

  .col-1 {
    width: 100%;
    border-radius: 0;
    padding: 30px 20px;
    border-radius: 20px 20px 0 0;
  }

  .col-2 {
    width: 100%;
    padding: 30px 20px;
  }

  .form-image-1 {
    width: 150px;
  }

  .featured-words {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .btn-box {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
  }

  .form-title {
    font-size: 20px;
  }
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
</style>