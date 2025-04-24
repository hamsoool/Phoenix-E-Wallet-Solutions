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
            <a href="#">Forgot password</a>
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
          <video ref="videoElement" autoplay playsinline></video>
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
          <div class="input-box">
            <input 
              type="email" 
              class="input-field" 
              placeholder="Email" 
              v-model="registerForm.email" 
              required
            >
            <i class='bx bx-id-card icon'></i>
          </div>
          <div class="input-box">
            <input 
              type="password" 
              class="input-field" 
              placeholder="Password" 
              v-model="registerForm.password" 
              required
            >
            <i class="bx bx-lock-alt icon"></i>
          </div>
          <div class="input-box">
            <input 
              type="password" 
              class="input-field" 
              placeholder="Confirm Password" 
              v-model="registerForm.confirmPassword" 
              required
            >
            <i class="bx bx-lock-alt icon"></i>
          </div>
          <div class="input-box">
            <button class="input-submit" @click="handleRegistration">
              <span>Create Account</span>
              <i class="bx bx-right-arrow-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      }
    }
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
        // Request camera access
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 300 },
            height: { ideal: 300 },
            facingMode: "user" 
          } 
        });
        
        this.$refs.videoElement.srcObject = this.stream;
        this.faceStatus = "Scanning face...";
        
        // Simulate face recognition process (would be replaced with actual face recognition API)
        setTimeout(() => {
          this.faceStatus = "Face recognized! Logging in...";
          document.getElementById("faceStatus").style.color = "#4CAF50";
          
          // Redirect after successful recognition
          setTimeout(() => {
            window.location.href = "Dashboard.html";
          }, 1500);
        }, 3000);
      } catch (err) {
        this.faceStatus = "Camera access denied or not available.";
        document.getElementById("faceStatus").style.color = "#F44336";
        console.error("Error accessing camera:", err);
      }
    },
    handleLogin() {
      // Simple validation
      if (this.loginForm.email && this.loginForm.password) {
        // In a real app, you would authenticate against a server
        // For demo purposes, we're just redirecting
        window.location.href = "Dashboard.html";
      } else {
        alert("Please enter both email and password");
      }
    },
    handleRegistration() {
      // Simple validation
      if (!this.registerForm.fullName || !this.registerForm.email || 
          !this.registerForm.password || !this.registerForm.confirmPassword) {
        alert("Please fill in all fields");
        return;
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      
      // In a real app, you would send this data to a server
      // For demo purposes, just show success and redirect to login
      alert("Account created successfully!");
      this.setActiveForm('login');
    }
  },
  beforeUnmount() {
    // Ensure camera is stopped when component is unmounted
    this.stopCameraStream();
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
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(5px);
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
</style>