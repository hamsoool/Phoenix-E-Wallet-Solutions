<template>
  <div>
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <span class="material-icons" v-if="!avatarSrc">account_circle</span>
          <img v-if="avatarSrc" :src="avatarSrc" class="user-avatar" alt="User Profile Photo">
        </div>
        <h2 class="profile-name">{{ personalInfo.firstName }} {{ personalInfo.lastName }}</h2>
        <p class="profile-status"
           :class="{
             'status-regular': membershipStatus === 'Regular Member',
             'status-half': membershipStatus === 'Half-Winged Phoenix',
             'status-phoenix': membershipStatus === 'Phoenix'
           }"
        >
          {{ membershipStatus }}
        </p>
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
            <div class="face-guide-oval"></div>
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
            <p style="margin-bottom:0.5rem;font-size:0.95rem;font-weight:500;color:#333;text-align:center;">
              Please center your face in the camera and ensure good lighting.
            </p>
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
            <div class="form-group" :class="{'has-error': formErrors.collegeYear}" style="flex:1;">
              <label for="college-year">College Year</label>
              <select id="college-year" v-model="personalInfo.collegeYear" class="profile-input" required>
                <option value="" disabled>Select College Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              <span v-if="formErrors.collegeYear" class="error-message">{{ formErrors.collegeYear }}</span>
            </div>
            <div class="form-group" :class="{'has-error': formErrors.block}" style="flex:1;">
              <label for="block">Block</label>
              <input
                id="block"
                type="text"
                class="profile-input"
                placeholder="A-F"
                v-model="personalInfo.block"
                maxlength="1"
                pattern="[A-F]"
                @input="onBlockInput"
                required
              >
              <span v-if="formErrors.block" class="error-message">{{ formErrors.block }}</span>
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
              <div class="date-picker-container">
                <input
                  type="date"
                  id="dob"
                  v-model="personalInfo.dob"
                  class="date-input"
                  :class="{'input-error': formErrors.dob}"
                  :max="new Date().toISOString().split('T')[0]"
                  :min="'1900-01-01'"
                  @change="validateDob"
                />
                <span v-if="formErrors.dob" class="error-message">{{ formErrors.dob }}</span>
              </div>
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
          <div class="form-group">
            <label for="password">Password</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input
                type="password"
                id="password"
                value="********"
                class="profile-input"
                disabled
                style="flex: 1;"
              />
              <button type="button" class="btn-secondary" @click="showPasswordEdit = !showPasswordEdit">
                <span class="material-icons">{{ showPasswordEdit ? 'close' : 'edit' }}</span>
                {{ showPasswordEdit ? 'Cancel' : 'Change' }}
              </button>
            </div>
          </div>
          
          <!-- Password change form -->
          <div v-if="showPasswordEdit" class="password-change-form">
            <div class="form-row">
              <div class="form-group">
                <label for="old-password">Current Password</label>
                <input 
                  type="password" 
                  id="old-password" 
                  v-model="passwordForm.oldPassword"
                  placeholder="Enter your current password"
                  :class="{'input-error': passwordError}"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="new-password">New Password</label>
                <input 
                  type="password" 
                  id="new-password" 
                  v-model="passwordForm.newPassword"
                  placeholder="Enter your new password"
                  :class="{'input-error': passwordError}"
                >
              </div>
              <div class="form-group">
                <label for="confirm-password">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  v-model="passwordForm.confirmPassword"
                  placeholder="Confirm your new password"
                  :class="{'input-error': passwordError}"
                >
              </div>
            </div>
            <div v-if="passwordError" class="error-message" style="margin-top: 10px;">
              {{ passwordError }}
            </div>
            <div v-if="passwordSuccess" class="success-message" style="margin-top: 10px;">
              {{ passwordSuccess }}
            </div>
            <div class="form-actions">
              <button 
                type="button" 
                class="btn-save" 
                @click="handleChangePassword"
                :disabled="isChangingPassword"
              >
                <span v-if="isChangingPassword" class="loading-spinner"></span>
                <span v-else class="material-icons">lock</span>
                {{ isChangingPassword ? 'Updating...' : 'Update Password' }}
              </button>
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

    <!-- Add this at the end of your template, with other modals -->
    <div class="modal-overlay" v-if="showFaceSuccessModal">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-icon">
            <i class='bx bx-check-circle'></i>
          </div>
          <h3>Face Registered!</h3>
          <p>Your face has been registered successfully for login.</p>
          <div class="modal-buttons">
            <button class="modal-button confirm" @click="showFaceSuccessModal = false">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, updateProfile, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import * as faceapi from 'face-api.js';
import { Calendar } from 'v-calendar';
import 'v-calendar/style.css';

export default {
  name: 'Profile',
  components: {
    Calendar
  },
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
        avatarUrl: '',
        collegeYear: '',
        block: '',
        createdAt: ''
      },
      formErrors: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        studentId: '',
        dob: ''
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
      verificationEmailSent: false,
      isUploadingAvatar: false,
      showSizeLimit: false,
      isAdmin: false,
      showPasswordEdit: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordSuccess: '',
      isChangingPassword: false,
      calendarAttributes: [
        {
          key: 'today',
          highlight: {
            color: 'red',
            fillMode: 'light',
          },
          dates: new Date(),
        },
      ],
      showCalendar: false,
      dobDate: null,
      showFaceSuccessModal: false,
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

    // Load user avatar
    await this.loadUserAvatar();
  },
  methods: {
    async loadUserData() {
      try {
        const user = this.auth.currentUser;
        if (!user) {
          console.error('No user logged in');
          return;
        }
        await user.reload();

        // Get user data from Firestore
        const userDoc = await getDoc(doc(this.db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Update personalInfo with data from Firestore
          this.personalInfo = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            studentId: userData.studentId || '',
            dob: userData.dob || '',
            email: user.email || '',
            phone: userData.phone || '',
            avatarUrl: userData.avatarUrl || '',
            collegeYear: userData.collegeYear || '',
            block: userData.block || '',
            createdAt: userData.createdAt || ''
          };

          // Set original data for change tracking
          this.originalPersonalInfo = JSON.parse(JSON.stringify(this.personalInfo));
          
          // Defensive fix for dobDate
          if (userData.dob) {
            const d = new Date(userData.dob);
            this.personalInfo.dob = userData.dob;
            this.dobDate = isNaN(d.getTime()) ? null : d;
          } else {
            this.dobDate = null;
          }
          
          // Check if face descriptor exists
          if (userData.faceDescriptor) {
            this.faceRegistered = true;
          }
          
          // Load avatar if exists
          if (userData.avatarUrl) {
            this.avatarSrc = userData.avatarUrl;
          } else {
            this.avatarSrc = null;
          }

          // Set isAdmin state
          this.isAdmin = userData.isAdmin === true;

          // Set membership status
          if (userData.isPaid === true && userData.paymentType === 'fullYear') {
            this.membershipStatus = 'Phoenix';
          } else if (userData.isPaid === true && userData.paymentType === 'semestral') {
            this.membershipStatus = 'Half-Winged Phoenix';
          } else {
            this.membershipStatus = 'Regular Member';
          }

          // Log the loaded data for debugging
          console.log('Loaded user data:', this.personalInfo);
        } else {
          console.error('No user document found in Firestore');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },

    async savePersonalInfo() {
      try {
        // Validate all fields including DOB
        if (!this.validateDob()) {
          return;
        }
        
        this.isSubmitting = true;
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Update Firestore
        await updateDoc(doc(this.db, 'users', user.uid), {
          firstName: this.personalInfo.firstName,
          lastName: this.personalInfo.lastName,
          studentId: this.personalInfo.studentId,
          dob: this.personalInfo.dob,
          phone: this.personalInfo.phone
        });

        // Update original data
        this.originalPersonalInfo = JSON.parse(JSON.stringify(this.personalInfo));
        this.hasChanges = false;

        // Show success message
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);

      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    },

    validateDob() {
      if (!this.personalInfo.dob) {
        this.formErrors.dob = 'Date of birth is required';
        return false;
      }
      
      const dob = new Date(this.personalInfo.dob);
      const today = new Date();
      const minDate = new Date(1900, 0, 1);
      
      if (isNaN(dob.getTime())) {
        this.formErrors.dob = 'Invalid date format';
        return false;
      }
      
      if (dob > today) {
        this.formErrors.dob = 'Date of birth cannot be in the future';
        return false;
      }
      
      if (dob < minDate) {
        this.formErrors.dob = 'Date of birth cannot be before 1900';
        return false;
      }
      
      this.formErrors.dob = '';
      return true;
    },

    async loadUserAvatar() {
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists() && userDoc.data().avatarUrl) {
          this.avatarSrc = userDoc.data().avatarUrl;
        } else {
          this.avatarSrc = null;
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
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
          this.showFaceSuccessModal = true;
        }
      } else {
        alert('No face detected. Please try again.');
      }
    },

    async deleteFaceRegistration() {
      try {
        const user = this.auth.currentUser;
        if (user) {
          await updateDoc(doc(this.db, "users", user.uid), {
            faceDescriptor: null
          });
        }
        this.faceRegistered = false;
        this.registrationProgress = 0;
        this.capturedPositions = [];
      } catch (error) {
        console.error('Error deleting face registration:', error);
        alert('Error deleting face registration. Please try again.');
      }
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
    },

    async handleChangePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';
      this.isChangingPassword = true;
      const { oldPassword, newPassword, confirmPassword } = this.passwordForm;

      try {
        // Validate inputs
        if (!oldPassword || !newPassword || !confirmPassword) {
          this.passwordError = 'Please fill in all password fields';
          return;
        }
        
        if (newPassword !== confirmPassword) {
          this.passwordError = 'New passwords do not match';
          return;
        }
        
        if (newPassword.length < 6) {
          this.passwordError = 'Password must be at least 6 characters';
          return;
        }

        const user = this.auth.currentUser;
        if (!user || !user.email) {
          console.error('User or user email not found', user);
          this.passwordError = 'User not authenticated. Please log in again.';
          return;
        }

        // Log for debugging
        console.log('Attempting to reauthenticate user:', user.email);
        
        // Reauthenticate user before changing password
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        // Success
        this.passwordSuccess = 'Password updated successfully!';
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // Close the password edit form after a delay
        setTimeout(() => {
          this.showPasswordEdit = false;
          this.passwordSuccess = '';
        }, 3000);
      } catch (error) {
        console.error('Password update error:', error);
        if (error.code === 'auth/wrong-password') {
          this.passwordError = 'Current password is incorrect';
        } else {
          this.passwordError = `Failed to update password: ${error.message}`;
        }
      } finally {
        this.isChangingPassword = false;
      }
    },

    onDayClick(day) {
      this.dobDate = day.date;
      this.personalInfo.dob = day.date.toISOString().split('T')[0];
      this.showCalendar = false;
    },
    
    // Add click outside handler to close calendar
    handleClickOutside(event) {
      const calendar = this.$el.querySelector('.custom-calendar');
      const input = this.$el.querySelector('.date-input');
      if (calendar && !calendar.contains(event.target) && !input.contains(event.target)) {
        this.showCalendar = false;
      }
    },

    onBlockInput(e) {
      // Only allow uppercase A-F
      let val = e.target.value.toUpperCase();
      if (!/^[A-F]?$/.test(val)) {
        val = val.replace(/[^A-F]/g, '');
      }
      this.personalInfo.block = val;
      if (val && !/^[A-F]$/.test(val)) {
        this.formErrors.block = 'Block must be a letter from A to F';
      } else {
        this.formErrors.block = '';
      }
    },

    computedCollegeYear() {
      // Compute the current college year based on registration year and current date
      if (!this.personalInfo.collegeYear || !this.personalInfo.createdAt) return '';
      const yearMap = ['1st', '2nd', '3rd', '4th'];
      const regDate = new Date(this.personalInfo.createdAt);
      const now = new Date();
      let regYear = regDate.getFullYear();
      let nowYear = now.getFullYear();
      let diff = nowYear - regYear;
      let idx = yearMap.indexOf(this.personalInfo.collegeYear) + diff;
      if (idx >= 4) return 'Graduated';
      if (idx < 0) idx = 0;
      return yearMap[idx];
    },
  },
  watch: {
    personalInfo: {
      handler() {
        this.hasChanges = true;
      },
      deep: true
    },
    'personalInfo.dob'(val) {
      if (val) {
        const d = new Date(val);
        this.dobDate = isNaN(d.getTime()) ? null : d;
      } else {
        this.dobDate = null;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
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
.input-field {
  background: var(--color-white);
  color: var(--color-dark);
  border: 2px solid var(--color-primary-light, #f0f0f0);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.input-field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group select option[disabled] {
  color: #ccc;
  background: #f0f0f0;
}

/* Error message styles */
.error-message {
  color: #ff3b30;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  font-weight: 500;
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
  position: relative;
}

.face-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-canvas {
  display: none;
}

.face-guide-oval {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 80%;
  border: 2px dashed #ff6a00;
  border-radius: 50%;
  z-index: 10;
  box-sizing: border-box;
  pointer-events: none;
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

.avatar-loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
}

.size-limit-message {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

/* Membership status colors */
.profile-status.status-regular {
  color: #16a34a; /* Green */
}
.profile-status.status-half {
  color: orange;
}
.profile-status.status-phoenix {
  color: #e60000; /* Blazing Red */
}

/* Password change form styles */
.password-change-form {
  border-top: 1px solid var(--color-light);
  margin-top: 1rem;
  padding-top: 1rem;
  width: 100%;
}

.password-change-form .form-row {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media screen and (min-width: 768px) {
  .password-change-form .form-row:nth-child(2) {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Add these styles in the <style> section */
.form-group input[type="date"] {
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-group input[type="date"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.2);
  outline: none;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  padding: 0.3rem;
  filter: invert(0.5);
  transition: all 0.3s ease;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator:hover {
  filter: invert(0.3);
}

.form-group input[type="date"]::-webkit-datetime-edit {
  padding: 0;
}

.form-group input[type="date"]::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

.form-group input[type="date"]::-webkit-datetime-edit-text {
  padding: 0 0.2rem;
  color: var(--color-dark-variant);
}

.form-group input[type="date"]::-webkit-datetime-edit-year-field,
.form-group input[type="date"]::-webkit-datetime-edit-month-field,
.form-group input[type="date"]::-webkit-datetime-edit-day-field {
  padding: 0 0.2rem;
  color: var(--color-dark);
}

.date-picker-container {
  position: relative;
  width: 100%;
}

.date-input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.date-input:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.date-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.2);
  outline: none;
}

.date-input.input-error {
  border-color: #ff3b30;
  background-color: rgba(255, 59, 48, 0.05);
}

/* Remove all calendar-related styles */
.custom-calendar,
.date-icon,
.calendar-attributes {
  display: none;
}

.profile-input,
.profile-input[type="text"],
.profile-input[type="email"],
.profile-input[type="date"],
.profile-input[type="password"],
.profile-input select {
  background: #fff;
  border: 2px solid orange;
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 1rem;
  color: #222;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  min-height: 48px;
  appearance: none;
}

.profile-input:focus {
  border-color: #ff6a00;
  outline: none;
}
</style>  