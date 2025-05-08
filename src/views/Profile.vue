<template>
  <div>
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <span class="material-icons" v-if="!avatarSrc">account_circle</span>
          <img v-if="avatarSrc" :src="avatarSrc" class="user-avatar" alt="User Profile Photo">
          <div class="avatar-edit" @click="handleAvatarEdit">
            <span class="material-icons">edit</span>
          </div>
        </div>
        <h2 class="profile-name">{{ personalInfo.firstName }} {{ personalInfo.lastName }}</h2>
        <p class="profile-status">{{ membershipStatus }}</p>
      </div>

      <!-- Face Recognition Registration -->
      <div class="profile-section centered-section">
        <h2>
          <span class="material-icons">face</span>
          Face Recognition Setup
        </h2>
        <div class="face-recognition-container">
          <div class="video-container" v-show="isCameraActive">
            <video ref="video" class="face-video" autoplay playsinline></video>
            <canvas ref="canvas" class="face-canvas" width="640" height="480"></canvas>
          </div>
          <div class="face-status" :class="{'face-registered': faceRegistered}">
            <span class="material-icons">{{ faceRegistered ? 'check_circle' : 'face' }}</span>
            <span>{{ faceRegistered ? 'Face ID Registered' : 'Face ID Not Set Up' }}</span>
          </div>
          <div class="face-recognition-controls">
            <button 
              v-if="!isCameraActive && !faceRegistered" 
              @click="startCamera" 
              class="btn-primary">
              <span class="material-icons">camera_alt</span>
              Start Face Registration
            </button>
            <button 
              v-if="isCameraActive" 
              @click="captureFace" 
              class="btn-success">
              <span class="material-icons">camera</span>
              Capture Face
            </button>
            <button 
              v-if="isCameraActive" 
              @click="stopCamera" 
              class="btn-secondary">
              <span class="material-icons">close</span>
              Cancel
            </button>
            <button 
              v-if="faceRegistered" 
              @click="deleteFaceRegistration" 
              class="btn-danger">
              <span class="material-icons">delete</span>
              Delete Face Registration
            </button>
          </div>
          <div v-if="registrationProgress > 0 && registrationProgress < 100" class="progress-container">
            <div class="progress-bar">
              <div class="progress" :style="{ width: registrationProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ registrationProgress }}% Complete</span>
          </div>
          <div class="face-instructions" v-if="isCameraActive">
            <p>Please center your face in the camera and ensure good lighting.</p>
            <p>We'll need to capture 5 different angles of your face. Follow the prompts below:</p>
            <ul>
              <li :class="{ 'completed': capturedPositions.includes('front') }">
                <span class="material-icons">{{ capturedPositions.includes('front') ? 'check_circle' : 'circle' }}</span>
                Look directly at the camera (front)
              </li>
              <li :class="{ 'completed': capturedPositions.includes('left') }">
                <span class="material-icons">{{ capturedPositions.includes('left') ? 'check_circle' : 'circle' }}</span>
                Turn slightly to your left
              </li>
              <li :class="{ 'completed': capturedPositions.includes('right') }">
                <span class="material-icons">{{ capturedPositions.includes('right') ? 'check_circle' : 'circle' }}</span>
                Turn slightly to your right
              </li>
              <li :class="{ 'completed': capturedPositions.includes('up') }">
                <span class="material-icons">{{ capturedPositions.includes('up') ? 'check_circle' : 'circle' }}</span>
                Tilt your head slightly up
              </li>
              <li :class="{ 'completed': capturedPositions.includes('down') }">
                <span class="material-icons">{{ capturedPositions.includes('down') ? 'check_circle' : 'circle' }}</span>
                Tilt your head slightly down
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Student Personal Information -->
      <div class="profile-section centered-section">
        <h2>
          <span class="material-icons">school</span>
          BSIT Student Information
        </h2>
        
        <!-- Success message -->
        <div v-if="showSuccessMessage" class="success-message">
          <span class="material-icons">check_circle</span>
          Profile updated successfully!
        </div>
        
        <form @submit.prevent="savePersonalInfo" class="centered-form">
          <div class="form-row">
            <div class="form-group" :class="{'has-error': formErrors.firstName}">
              <label for="first-name">First Name</label>
              <input 
                type="text" 
                id="first-name" 
                v-model="personalInfo.firstName" 
                :class="{'input-error': formErrors.firstName}"
                required
              >
              <span v-if="formErrors.firstName" class="error-message">{{ formErrors.firstName }}</span>
            </div>
            <div class="form-group" :class="{'has-error': formErrors.lastName}">
              <label for="last-name">Last Name</label>
              <input 
                type="text" 
                id="last-name" 
                v-model="personalInfo.lastName" 
                :class="{'input-error': formErrors.lastName}"
                required
              >
              <span v-if="formErrors.lastName" class="error-message">{{ formErrors.lastName }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" :class="{'has-error': formErrors.studentId}">
              <label for="student-id">Student ID</label>
              <input 
                type="text" 
                id="student-id" 
                v-model="personalInfo.studentId" 
                placeholder="e.g. 202300000"
                :class="{'input-error': formErrors.studentId}"
                required
              >
              <span v-if="formErrors.studentId" class="error-message">{{ formErrors.studentId }}</span>
            </div>
            <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input type="date" id="dob" v-model="personalInfo.dob">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" :class="{'has-error': formErrors.email}">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="personalInfo.email" 
                :class="{'input-error': formErrors.email}"
                required
                disabled
              >
              <span 
                class="verification-badge" 
                :class="emailVerified ? 'verified' : 'unverified'"
              >
                <span class="material-icons">
                  {{ emailVerified ? 'check_circle' : 'error_outline' }}
                </span>
                {{ emailVerified ? 'Verified' : 'Unverified' }}
              </span>
              <button 
                v-if="!emailVerified && !verificationEmailSent" 
                type="button" 
                class="btn-verify-phone" 
                @click="sendVerificationEmail"
                style="margin-left: 10px;"
              >
                <span class="material-icons">email</span>
                Resend Verification Email
              </button>
              <span v-if="verificationEmailSent" style="color: #4CAF50; margin-left: 10px;">
                Verification email sent!
              </span>
              <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
            </div>
            <div class="form-group" :class="{'has-error': formErrors.phone}">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="personalInfo.phone"
                placeholder="e.g. +63 912 345 6789"
                :class="{'input-error': formErrors.phone}"
              >
              <span v-if="formErrors.phone" class="error-message">{{ formErrors.phone }}</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-save" 
              :disabled="isSubmitting || !hasChanges"
              :class="{'btn-disabled': !hasChanges}"
            >
              <span v-if="isSubmitting" class="loading-spinner"></span>
              <span v-else class="material-icons">save</span>
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, updateProfile, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import * as faceapi from 'face-api.js';

export default {
  name: 'Profile',
  props: {
    currentDate: {
      type: String,
      required: true
    },
    pageTitles: {
      type: Object,
      required: true
    },
    currentPage: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      auth: null,
      db: null,
      storage: null,
      personalInfo: {
        firstName: '',
        lastName: '',
        studentId: '',
        dob: '',
        email: '',
        phone: '',
        avatarUrl: ''
      },
      formErrors: {
        firstName: '',
        lastName: '',
        studentId: '',
        email: '',
        phone: ''
      },
      showSuccessMessage: false,
      isSubmitting: false,
      hasChanges: false,
      avatarSrc: null,
      membershipStatus: 'Regular Member',
      // Face recognition related data
      isCameraActive: false,
      faceRegistered: false,
      registrationProgress: 0,
      capturedPositions: [],
      stream: null,
      emailVerified: false,
      verificationEmailSent: false
    }
  },
  async created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
    
    // Load user data when component is created
    await this.loadUserData();

    // Check email verification status
    const user = this.auth.currentUser;
    if (user) {
      await user.reload(); // Refresh user data
      this.emailVerified = user.emailVerified;
    }

    // Load face-api.js models
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  },
  methods: {
    async loadUserData() {
      try {
        const user = this.auth.currentUser;
        if (!user) {
          console.error('No user logged in');
          return;
        }

        // Get user data from Firestore
        const userDoc = await getDoc(doc(this.db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.personalInfo = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            studentId: userData.studentId || '',
            dob: userData.dob || '',
            email: user.email || '',
            phone: userData.phone || '',
            avatarUrl: userData.avatarUrl || ''
          };
          
          // Load avatar if exists
          if (userData.avatarUrl) {
            this.avatarSrc = userData.avatarUrl;
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },

    async savePersonalInfo() {
      this.isSubmitting = true;
      this.formErrors = {};

      try {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Validate form
        this.validateForm();
        if (Object.keys(this.formErrors).length > 0) {
          throw new Error('Please fix the form errors');
        }

        // Update user profile in Firebase Auth
        await updateProfile(user, {
          displayName: `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
        });

        // Update user data in Firestore
        await updateDoc(doc(this.db, "users", user.uid), {
          firstName: this.personalInfo.firstName,
          lastName: this.personalInfo.lastName,
          studentId: this.personalInfo.studentId,
          dob: this.personalInfo.dob,
          phone: this.personalInfo.phone,
          updatedAt: new Date().toISOString()
        });

        this.showSuccessMessage = true;
        this.hasChanges = false;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);

      } catch (error) {
        console.error('Error saving profile:', error);
        alert(error.message);
      } finally {
        this.isSubmitting = false;
      }
    },

    validateForm() {
      // First Name validation
      if (!this.personalInfo.firstName) {
        this.formErrors.firstName = 'First name is required';
      }

      // Last Name validation
      if (!this.personalInfo.lastName) {
        this.formErrors.lastName = 'Last name is required';
      }

      // Student ID validation
      if (!this.personalInfo.studentId) {
        this.formErrors.studentId = 'Student ID is required';
      } else if (!/^\d{9}$/.test(this.personalInfo.studentId)) {
        this.formErrors.studentId = 'Invalid format. Use Your Schoold ID (e.g. 202311165)';
      }

      // Email validation
      if (!this.personalInfo.email) {
        this.formErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.personalInfo.email)) {
        this.formErrors.email = 'Invalid email format';
      }

      // Phone validation (Philippine format)
      if (this.personalInfo.phone) {
        // Accepts +63 9XX XXX XXXX or 09XX XXX XXXX (with or without spaces/dashes)
        const phPhoneRegex = /^(?:\+63|0)9\d{2}[- ]?\d{3}[- ]?\d{4}$/;
        if (!phPhoneRegex.test(this.personalInfo.phone)) {
          this.formErrors.phone = 'Invalid phone number. Use +63 9XX XXX XXXX or 09XX XXX XXXX';
        }
      }
    },

    async handleAvatarEdit() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Upload image to Firebase Storage
            const storageRef = ref(this.storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, file);
            
            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);
            
            // Update user profile in Firebase Auth
            await updateProfile(user, {
              photoURL: downloadURL
            });

            // Update user data in Firestore
            await updateDoc(doc(this.db, "users", user.uid), {
              avatarUrl: downloadURL
            });

            this.avatarSrc = downloadURL;
            this.personalInfo.avatarUrl = downloadURL;

          } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar. Please try again.');
          }
        }
      };

      input.click();
    },

    // Face recognition methods
    async startCamera() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user" 
          } 
        });
        
        this.$refs.video.srcObject = this.stream;
        this.isCameraActive = true;
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Error accessing camera. Please ensure you have granted camera permissions.');
      }
    },

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      this.isCameraActive = false;
    },

    async captureFace() {
      const video = this.$refs.video;
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        this.faceRegistered = true;
        this.stopCamera();

        // Save the descriptor to Firestore (as an array)
        const user = this.auth.currentUser;
        if (user) {
          await updateDoc(doc(this.db, "users", user.uid), {
            faceDescriptor: Array.from(detection.descriptor)
          });
          alert('Face registered successfully!');
        }
      } else {
        alert('No face detected. Please try again.');
      }
    },

    deleteFaceRegistration() {
      this.faceRegistered = false;
      this.registrationProgress = 0;
      this.capturedPositions = [];
    },

    verifyPhone() {
      // In a real app, this would send a verification code via SMS
      // For demo purposes, we'll simulate the verification
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      
      // Show verification dialog
      const code = prompt(`A verification code has been sent to ${this.personalInfo.phone}\n\nPlease enter the 6-digit code: ${verificationCode}`);
      
      if (code && code.trim() === verificationCode.toString()) {
        // Mark phone as verified
        localStorage.setItem('phoneVerified', 'true');
        
        // Update UI
        const unverifiedBadge = document.querySelector('.verification-badge.unverified');
        if (unverifiedBadge) {
          unverifiedBadge.classList.remove('unverified');
          unverifiedBadge.classList.add('verified');
          unverifiedBadge.innerHTML = '<span class="material-icons">check_circle</span> Verified';
        }
        
        alert('Phone number verified successfully!');
      } else if (code) {
        alert('Invalid verification code. Please try again.');
      }
    },
    
    resetForm() {
      if (confirm('Are you sure you want to reset all changes?')) {
        // Reset form to original values
        this.personalInfo = JSON.parse(JSON.stringify(this.originalInfo));
        
        // Clear errors
        Object.keys(this.formErrors).forEach(key => {
          this.formErrors[key] = '';
        });
      }
    },

    async checkEmailVerification() {
      const user = this.auth.currentUser;
      if (user) {
        await user.reload();
        this.emailVerified = user.emailVerified;
      }
    },

    async sendVerificationEmail() {
      try {
        const user = this.auth.currentUser;
        if (user && !user.emailVerified) {
          await sendEmailVerification(user);
          this.verificationEmailSent = true;
          setTimeout(() => {
            this.verificationEmailSent = false;
          }, 5000);
        }
      } catch (error) {
        alert('Failed to send verification email. Please try again.');
      }
    }
  },
  watch: {
    personalInfo: {
      handler() {
        this.hasChanges = true;
      },
      deep: true
    }
  },
  beforeUnmount() {
    // Clean up camera stream when component is unmounted
    this.stopCamera();
  }
}
</script>

<style scoped>
/* Profile Specific Styles */
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.profile-avatar span {
  font-size: 120px;
  color: var(--color-primary);
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  background: var(--color-white);
  border-radius: 50%;
  padding: 0.3rem;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit span {
  font-size: 24px;
  color: var(--color-dark);
}

.profile-name {
  margin-bottom: 0.5rem;
  color: var(--color-dark);
}

.profile-status {
  color: var(--color-success);
  font-weight: 500;
  margin-bottom: 1rem;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-dark);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-dark-variant);
}

.profile-section {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  width: 100%;
}

.centered-section {
  max-width: 800px;
  margin: 0 auto;
}

.profile-section h2 {
  margin-bottom: 1.5rem;
  color: var(--color-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
}

.centered-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.profile-section h2 span {
  color: var(--color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-dark);
}

/* Enhanced input styles to make text boxes bolder */
.form-group input, 
.form-group select,
.form-group textarea {
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-group input:focus, 
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.2);
  outline: none;
}

.form-group input.input-error {
  border-color: #ff3b30;
  background-color: rgba(255, 59, 48, 0.05);
}

.form-group input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.2);
}

.form-group .error-message {
  color: #ff3b30;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.form-group input::placeholder {
  color: var(--color-dark-variant);
  opacity: 0.7;
  font-weight: 400;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(52, 199, 89, 0.1);
  color: var(--color-success);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.btn-verify-phone {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  background-color: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-verify-phone:hover {
  background-color: rgba(0, 122, 255, 0.2);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  transition: all 300ms ease;
  min-width: 160px;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-save:hover {
  background-color: rgb(233, 30, 7);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-save.btn-disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  background: var(--color-light);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.verification-badge.verified {
  background: rgba(0, 180, 0, 0.1);
  color: var(--color-success);
}

.verification-badge.unverified {
  background: rgba(255, 165, 0, 0.1);
  color: orange;
}

/* Face Recognition Styles */
.face-recognition-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 360px;
  overflow: hidden;
  border-radius: 1rem;
  background-color: #000;
  box-shadow: var(--box-shadow);
}

.face-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-canvas {
  display: none;
}

.face-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  background: rgba(255, 165, 0, 0.1);
  color: orange;
  font-weight: 600;
}

.face-status.face-registered {
  background: rgba(0, 180, 0, 0.1);
  color: var(--color-success);
}

.face-recognition-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary, .btn-success, .btn-secondary, .btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms ease;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background: rgb(233, 30, 7);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background: var(--color-success);
  color: var(--color-white);
}

.btn-success:hover {
  background: rgb(0, 150, 0);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: var(--color-light);
  color: var(--color-dark);
}

.btn-secondary:hover {
  background: var(--color-dark-variant);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-danger {
  background: rgba(255, 0, 0, 0.1);
  color: red;
}

.btn-danger:hover {
  background: rgba(255, 0, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.progress-container {
  width: 100%;
  max-width: 480px;
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 0.8rem;
  background: var(--color-light);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark-variant);
}

.face-instructions {
  width: 100%;
  max-width: 480px;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-light);
  border-radius: 0.5rem;
  border-left: 4px solid var(--color-primary);
}

.face-instructions p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.face-instructions ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.face-instructions li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  font-weight: 500;
}

.face-instructions li.completed {
  background: rgba(0, 180, 0, 0.1);
}

.face-instructions li span {
  font-size: 1rem;
}

.face-instructions li.completed span {
  color: var(--color-success);
}

@media screen and (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>  