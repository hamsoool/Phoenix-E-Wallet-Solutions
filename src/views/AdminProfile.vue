<!-- Template section -->
<template>
  <div class="container">
    <!-- Fixed Sidebar Navigation -->
    <aside id="sidebar" :class="{ 'show': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <img src="../assets/images/newlogo.png" alt="Phoenix Logo">
        </div>
        <button class="close-btn" @click="closeSidebar">
          <span class="material-icons">close</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="sidebar-link" active-class="active">
          <span class="material-icons">dashboard</span>
          <h3>Dashboard</h3>
        </router-link>
        <router-link to="/admin/profile" class="sidebar-link" active-class="active">
          <span class="material-icons">account_circle</span>
          <h3>Admin Profile</h3>
        </router-link>
        <router-link to="/admin/elites" class="sidebar-link" active-class="active">
          <span class="material-icons">stars</span>
          <h3>Elites</h3>
        </router-link>
        <router-link to="/admin/history" class="sidebar-link" active-class="active">
          <span class="material-icons">history</span>
          <h3>History</h3>
        </router-link>
        <router-link to="/admin/members" class="sidebar-link" active-class="active">
          <span class="material-icons">group</span>
          <h3>Members</h3>
        </router-link>
        <router-link to="/admin/support" class="sidebar-link" active-class="active">
          <span class="material-icons">help</span>
          <h3>Help & Support</h3>
        </router-link>
        <a href="#" @click.prevent="logout" class="sidebar-link">
          <span class="material-icons">logout</span>
          <h3>Logout</h3>
        </a>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main>
      <!-- Dashboard Header with Menu Button -->
      <div class="main-header">
        <button id="menu-btn" class="menu-toggle" @click="openSidebar">
          <span class="material-icons">menu</span>
        </button>
        <h1>{{ pageTitles[currentPage] }}</h1>
        <div class="current-datetime">
          {{ formattedDateTime }}
        </div>
      </div>

      <div class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar">
            <span class="material-icons" v-if="!avatarSrc">account_circle</span>
            <img v-if="avatarSrc" :src="avatarSrc" class="user-avatar" alt="User Profile Photo">
          </div>
          <h2 class="profile-name">{{ personalInfo.firstName }} {{ personalInfo.lastName }}</h2>
          <p class="profile-status status-admin">
            Administrator
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

        <!-- Admin Personal Information -->
        <div class="profile-section centered-section">
          <h2>
            <span class="material-icons">admin_panel_settings</span>
            Administrator Information
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
              <div class="form-group">
                <label for="admin-id">Admin ID</label>
                <input 
                  type="text" 
                  id="admin-id" 
                  v-model="personalInfo.adminId" 
                  disabled
                  class="profile-input"
                  placeholder="Admin ID"
                >
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
    </main>
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
</template>

<script>
import { getAuth, updateProfile, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential, updatePassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { Calendar } from 'v-calendar';
import 'v-calendar/style.css';
import * as faceapi from 'face-api.js';

export default {
  name: 'AdminProfile',
  components: {
    Calendar
  },
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'profile',
      auth: null,
      db: null,
      storage: null,
      personalInfo: {
        firstName: '',
        lastName: '',
        dob: '',
        email: '',
        phone: '',
        avatarUrl: '',
        adminId: ''
      },
      formErrors: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: ''
      },
      showSuccessMessage: false,
      isSubmitting: false,
      hasChanges: false,
      avatarSrc: null,
      emailVerified: false,
      isUploadingAvatar: false,
      showSizeLimit: false,
      showPasswordEdit: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordSuccess: '',
      isChangingPassword: false,
      showCalendar: false,
      dobDate: null,
      pageTitles: {
        dashboard: 'Admin Dashboard',
        profile: 'Admin Profile',
        elites: 'Elite Members',
        history: 'Membership History',
        members: 'Official Members',
        help: 'Help & Support'
      },
      now: new Date(),
      verificationEmailSent: false,
      originalPersonalInfo: null,
      isCameraActive: false,
      faceRegistered: false,
      registrationProgress: 0,
      capturedPositions: [],
      stream: null,
      showFaceSuccessModal: false
    }
  },
  computed: {
    formattedDateTime() {
      return this.now.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  },
  watch: {
    personalInfo: {
      handler(newVal) {
        if (this.originalPersonalInfo) {
          this.hasChanges = JSON.stringify(newVal) !== JSON.stringify(this.originalPersonalInfo);
        }
      },
      deep: true
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
      await user.reload();
      this.emailVerified = user.emailVerified;
    }

    // Update time every second
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);

    // Load user avatar
    await this.loadUserAvatar();

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
            dob: userData.dob || '',
            email: user.email || '',
            phone: userData.phone || '',
            avatarUrl: userData.avatarUrl || '',
            adminId: userData.adminId || user.uid.slice(0, 8).toUpperCase()
          };

          // Store original data for change detection
          this.originalPersonalInfo = JSON.parse(JSON.stringify(this.personalInfo));

          if (userData.dob) {
            const d = new Date(userData.dob);
            this.dobDate = isNaN(d.getTime()) ? null : d;
          }
          
          // Load avatar if exists
          if (userData.photoURL) {
            this.avatarSrc = userData.photoURL;
          } else if (user.photoURL) {
            this.avatarSrc = user.photoURL;
          }

          // Check if face descriptor exists
          if (userData.faceDescriptor) {
            this.faceRegistered = true;
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },
    async loadUserAvatar() {
      try {
        const user = this.auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(this.db, 'users', user.uid));
        
        if (userDoc.exists() && userDoc.data().photoURL) {
          this.avatarSrc = userDoc.data().photoURL;
        } else if (user.photoURL) {
          this.avatarSrc = user.photoURL;
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    },
    openSidebar() {
      this.isSidebarOpen = true;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    async logout() {
      try {
        await signOut(this.auth);
        this.$router.push('/login');
      } catch (error) {
        console.error("Logout error:", error);
        alert("Error signing out. Please try again.");
      }
    },
    async sendVerificationEmail() {
      try {
        const user = this.auth.currentUser;
        if (!user) {
          console.error('No user logged in');
          return;
        }

        await sendEmailVerification(user);
        this.verificationEmailSent = true;
      } catch (error) {
        console.error('Error sending verification email:', error);
        alert('Error sending verification email. Please try again.');
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
    async handleChangePassword() {
      try {
        this.isChangingPassword = true;
        this.passwordError = '';
        this.passwordSuccess = '';

        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Validate passwords
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          this.passwordError = 'New passwords do not match';
          return;
        }

        if (this.passwordForm.newPassword.length < 6) {
          this.passwordError = 'Password must be at least 6 characters long';
          return;
        }

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
          user.email,
          this.passwordForm.oldPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, this.passwordForm.newPassword);

        // Clear form
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.showPasswordEdit = false;
        this.passwordSuccess = 'Password updated successfully';

      } catch (error) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/wrong-password') {
          this.passwordError = 'Current password is incorrect';
        } else {
          this.passwordError = 'Error changing password. Please try again.';
        }
      } finally {
        this.isChangingPassword = false;
      }
    },
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
    }
  },
  beforeUnmount() {
    clearInterval(this.timer);
  }
}
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  overflow: hidden;
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
}

#sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  z-index: 20;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--color-light);
}

.logo {
  display: flex;
  justify-content: center;
}

.logo img {
  width: 100%;
  height: auto;
  margin-left: 0px;
  object-fit: contain;
}

.sidebar-nav {
  padding: 8px 0;
  flex-grow: 1;
}

.sidebar-nav a,
.sidebar-nav .sidebar-link {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  color: var(--color-dark-variant);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 4px;
  margin: 2px 6px;
}

.sidebar-nav a.active,
.sidebar-nav .sidebar-link.active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.sidebar-nav a:hover:not(.active),
.sidebar-nav .sidebar-link:hover:not(.active) {
  background-color: var(--color-light);
}

.sidebar-nav .material-icons {
  margin-right: 8px;
  font-size: 18px;
}

.sidebar-nav h3 {
  font-size: 0.9rem;
  font-weight: 500;
}

main {
  position: fixed;
  left: 240px;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: var(--card-padding);
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-light);
  position: relative;
}

.menu-toggle {
  display: none; /* Hide by default in desktop mode */
  align-items: center;
  justify-content: center;
  position: relative;
  top: -2px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark);
  transition: all 0.3s ease;
}

@media screen and (max-width: 1200px) {
  .container {
    grid-template-columns: 60px 1fr;
  }
  
  #sidebar {
    width: 60px;
    transform: translateX(0);
  }
  
  main {
    left: 60px;
    width: calc(100vw - 60px);
    margin-left: 0;
  }

  .sidebar-nav h3 {
    display: none;
  }

  .logo img {
    width: 40px;
    height: 40px;
    margin: 0;
  }
}

@media screen and (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
  
  #sidebar {
    transform: translateX(-100%);
    width: 280px;
    z-index: 1000;
  }
  
  #sidebar.show {
    transform: translateX(0);
  }
  
  main {
    left: 0;
    width: 100%;
    margin-left: 0;
    padding: 0 16px 16px 16px;
    margin-top: 0;
  }

  .sidebar-nav h3 {
    display: inline;
  }

  .logo img {
    width: 80%;
    height: auto;
  }

  .close-btn {
    display: block;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 8px;
    margin: 0;
    z-index: 100;
  }

  .main-header {
    padding: 48px 0 4px 0;  /* Top padding to account for menu button */
    margin: 0 0 16px 0;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .main-header h1 {
    text-align: left;
    margin: 0;
    font-size: 1.5rem;
    width: 100%;
  }

  .current-datetime {
    display: none;
  }

  .profile-container {
    padding: 0;
  }

  .profile-header {
    margin: 0 0 1rem 0;
    padding: 1.5rem 1rem;
    border-radius: 0.5rem;
  }

  .profile-section {
    padding: 1.25rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-save, .btn-secondary {
    width: 100%;
  }

  .face-recognition-container {
    padding: 0;
  }

  .video-container {
    height: 280px;
  }

  .face-recognition-controls {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary, .btn-success, .btn-secondary, .btn-danger {
    width: 100%;
    justify-content: center;
  }

  .modal-container {
    width: 90%;
    margin: 1rem;
    padding: 1.5rem;
  }
}

@media screen and (max-width: 480px) {
  main {
    padding: 0 12px 12px 12px;
  }

  .menu-toggle {
    top: 6px;
    left: 6px;
    padding: 6px;
  }

  .main-header {
    padding: 44px 0 4px 0;  /* Slightly reduced top padding for smaller screens */
    gap: 8px;
  }

  .main-header h1 {
    font-size: 1.25rem;
    margin-left: 0;
  }

  .profile-header {
    padding: 1rem;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .profile-section {
    padding: 1rem;
  }

  .profile-section h2 {
    font-size: 1.2rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 0.9rem;
    padding: 0.7rem;
  }

  .btn-save, .btn-secondary {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }

  .verification-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .btn-verify-phone {
    font-size: 0.75rem;
    padding: 0.35rem 0.7rem;
  }

  .face-status {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }

  .video-container {
    height: 240px;
  }

  .progress-container {
    margin-top: 0.75rem;
  }

  .progress-bar {
    height: 0.6rem;
  }

  .progress-text {
    font-size: 0.8rem;
  }

  .face-instructions {
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  .modal-container {
    padding: 1rem;
    margin: 0.75rem;
  }
}

/* Add smooth transitions for all responsive changes */
#sidebar,
main,
.main-header,
.profile-container,
.profile-header,
.profile-section,
.form-row,
.face-recognition-container,
.modal-container {
  transition: all 0.3s ease-in-out;
}

/* Ensure modals are always responsive */
.modal {
  padding: 16px;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Improve form element touch targets */
input,
select,
textarea {
  min-height: 44px;
  font-size: 16px; /* Prevents iOS zoom on focus */
}

/* Ensure buttons remain clickable on mobile */
button,
.btn-save,
.btn-secondary,
.btn-primary,
.btn-success,
.btn-danger,
.btn-verify-phone {
  min-height: 44px;
  min-width: 44px;
}

/* Profile avatar specific styles */
.profile-avatar {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-primary);
  background: var(--color-light);
  transition: all 0.3s ease;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.profile-avatar:hover .avatar-upload {
  opacity: 1;
}

.avatar-upload .material-icons {
  font-size: 18px;
}

.status-admin {
  color: #1a237e !important; /* Deep blue color for administrators */
  font-weight: 600;
  font-size: 1.1rem;
  background: rgba(26, 35, 126, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-admin::before {
  content: "admin_panel_settings";
  font-family: 'Material Icons';
  font-size: 1.2rem;
}

/* Profile Specific Styles */
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.profile-header {
  margin-top: 0;
  padding-top: 1rem;
  background: var(--color-white);
  border-radius: 0;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
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
  font-size: 1.5rem;
  font-weight: 600;
}

.profile-status {
  color: var(--color-success);
  font-weight: 500;
  margin-bottom: 1rem;
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
  font-size: 1.5rem;
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
  width: 100%;
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

.form-group input,
.form-group select,
.form-group textarea,
.input-field,
.date-input {
  box-sizing: border-box;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  outline: none;
}

.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover,
.input-field:hover,
.date-input:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus,
.input-field:focus,
.date-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input.input-error,
.form-group select.input-error,
.form-group textarea.input-error,
.input-field.input-error,
.date-input.input-error {
  border-color: #ff3b30 !important;
  background-color: rgba(255, 59, 48, 0.05);
}

.form-group input[type="password"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="password"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="password"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input[type="date"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="date"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="date"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input[type="email"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="email"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="email"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input[type="tel"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="tel"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="tel"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input[type="text"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="text"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="text"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled,
.input-field:disabled,
.date-input:disabled {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
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

.error-message {
  color: #ff3b30;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  font-weight: 500;
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

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: var(--color-light);
  color: var(--color-dark);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms ease;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: var(--color-dark-variant);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
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
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
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

.avatar-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

@media screen and (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .password-change-form .form-row:nth-child(2) {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .profile-container {
    padding: 0.5rem;
  }
  
  .profile-header {
    padding: 1rem;
  }
  
  .profile-section {
    padding: 1rem;
  }
  
  .profile-name {
    font-size: 1.3rem;
  }
  
  .status-admin {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  }
  
  .profile-section h2 {
    font-size: 1.3rem;
  }
  
  .btn-save {
    min-width: 140px;
    padding: 0.7rem 1.2rem;
  }

  .custom-calendar {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    width: 90%;
    max-width: 320px;
  }
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: var(--color-white);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  color: var(--color-success);
  margin-bottom: 1rem;
}

.modal-content {
  text-align: center;
}

.modal-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.modal-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-button:hover {
  background: rgb(233, 30, 7);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.modal-button.confirm {
  background: var(--color-success);
}

.modal-button.confirm:hover {
  background: rgb(0, 150, 0);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style> 