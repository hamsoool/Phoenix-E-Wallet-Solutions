<template>
  <div>
    <div class="dash-header">
      <h1>{{ pageTitles[currentPage] }}</h1>
      <div class="date">
        <input type="date" :value="currentDate" @input="$emit('update:currentDate', $event.target.value)">
      </div>
    </div>

    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <span class="material-icons">account_circle</span>
          <div class="avatar-edit" @click="handleAvatarEdit">
            <span class="material-icons">edit</span>
          </div>
        </div>
        <h2 class="profile-name">{{ personalInfo.firstName }} {{ personalInfo.lastName }}</h2>
        <p class="profile-status">{{ membershipStatus }}</p>
        <div class="profile-stats">
          <div class="stat-item" v-for="(stat, index) in userStats" :key="index">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="profile-section">
        <h2>
          <span class="material-icons">person</span>
          Personal Information
        </h2>
        <form @submit.prevent="savePersonalInfo">
          <div class="form-row">
            <div class="form-group">
              <label for="first-name">First Name</label>
              <input type="text" id="first-name" v-model="personalInfo.firstName" required>
            </div>
            <div class="form-group">
              <label for="last-name">Last Name</label>
              <input type="text" id="last-name" v-model="personalInfo.lastName" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" v-model="personalInfo.email" required>
              <span class="verification-badge verified">
                <span class="material-icons">check_circle</span>
                Verified
              </span>
            </div>
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone" v-model="personalInfo.phone">
              <span class="verification-badge unverified">
                <span class="material-icons">info</span>
                Unverified
              </span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input type="date" id="dob" v-model="personalInfo.dob">
            </div>
            <div class="form-group">
              <label for="country">Country</label>
              <select id="country" v-model="personalInfo.country">
                <option v-for="(country, code) in countries" :key="code" :value="code">
                  {{ country }}
                </option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn-save">Save Changes</button>
        </form>
      </div>

      <!-- Security Settings -->
      <div class="profile-section">
        <h2>
          <span class="material-icons">security</span>
          Security Settings
        </h2>
        <div class="security-item" v-for="(item, index) in securitySettings" :key="index">
          <div class="security-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
          <button class="btn-save" @click="handleSecurityAction(item.action)">{{ item.buttonText }}</button>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="profile-section">
        <h2>
          <span class="material-icons">notifications</span>
          Notification Preferences
        </h2>
        <div class="preference-item" v-for="(pref, index) in notificationPreferences" :key="index">
          <div class="preference-info">
            <h3>{{ pref.title }}</h3>
            <p>{{ pref.description }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="pref.enabled" @change="toggleNotification(pref)">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      membershipStatus: 'Premium Member',
      personalInfo: {
        firstName: 'Phoenix',
        lastName: 'User',
        email: 'user@phoenix.com',
        phone: '+1 (555) 123-4567',
        dob: '1990-01-15',
        country: 'us'
      },
      countries: {
        us: 'United States',
        ca: 'Canada',
        uk: 'United Kingdom',
        au: 'Australia',
        other: 'Other'
      },
      userStats: [
        { value: '156', label: 'Transactions' },
        { value: '25', label: 'Days Active' },
        { value: 'Gold', label: 'Tier' }
      ],
      securitySettings: [
        { 
          title: 'Password', 
          description: 'Last changed 35 days ago', 
          buttonText: 'Change',
          action: 'changePassword'
        },
        { 
          title: 'Two-Factor Authentication', 
          description: 'Enhance your account security', 
          buttonText: 'Enable',
          action: 'enable2FA'
        },
        { 
          title: 'Login Sessions', 
          description: '3 active sessions', 
          buttonText: 'Manage',
          action: 'manageSessions'
        }
      ],
      notificationPreferences: [
        {
          title: 'Email Notifications',
          description: 'Receive important updates via email',
          enabled: true
        },
        {
          title: 'Transaction Alerts',
          description: 'Get notified about transactions',
          enabled: true
        },
        {
          title: 'Promotional Emails',
          description: 'Receive offers and promotions',
          enabled: false
        },
        {
          title: 'Account Notifications',
          description: 'Security and account-related alerts',
          enabled: true
        }
      ]
    }
  },
  created() {
    // Initialize the firstName and lastName from the userName prop
    const nameParts = this.userName.split(' ');
    if (nameParts.length >= 2) {
      this.personalInfo.firstName = nameParts[0];
      this.personalInfo.lastName = nameParts.slice(1).join(' ');
    } else {
      this.personalInfo.firstName = this.userName;
    }
  },
  methods: {
    savePersonalInfo() {
      // Here you would typically call an API to save this information
      console.log('Saving personal info:', this.personalInfo);
      alert('Personal information updated successfully!');
      
      // Update the user name in the parent component
      this.$emit('update-user-name', `${this.personalInfo.firstName} ${this.personalInfo.lastName}`);
    },
    handleAvatarEdit() {
      // This would open a file picker or modal to upload a new avatar
      alert('Avatar upload functionality would open here.');
    },
    handleSecurityAction(action) {
      const actionMessages = {
        changePassword: 'Password change dialog would open here.',
        enable2FA: 'Two-Factor Authentication setup would start here.',
        manageSessions: 'Session management view would open here.'
      };
      
      alert(actionMessages[action] || 'Security action triggered');
    },
    toggleNotification(preference) {
      // This would typically update the setting via an API
      console.log(`${preference.title} is now ${preference.enabled ? 'enabled' : 'disabled'}`);
      alert(`${preference.title} ${preference.enabled ? 'enabled' : 'disabled'}.`);
    }
  }
}
</script>

<style scoped>
/* Profile Specific Styles */
.profile-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
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
}

.profile-section h2 {
  margin-bottom: 1.5rem;
  color: var(--color-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  font-weight: 500;
  color: var(--color-dark);
}

.form-group input, 
.form-group select,
.form-group textarea {
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-light);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
}

.btn-save {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  transition: all 300ms ease;
  margin-top: 0.5rem;
}

.btn-save:hover {
  background-color: rgb(233, 30, 7);
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  background: var(--color-light);
  border-radius: 1rem;
  font-size: 0.75rem;
}

.verification-badge.verified {
  background: rgba(0, 180, 0, 0.1);
  color: var(--color-success);
}

.verification-badge.unverified {
  background: rgba(255, 165, 0, 0.1);
  color: orange;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-light);
}

.security-item:last-child {
  border-bottom: none;
}

.security-info h3 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.security-info p {
  color: var(--color-dark-variant);
  font-size: 0.9rem;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-light);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info h3 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.preference-info p {
  color: var(--color-dark-variant);
  font-size: 0.9rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-light);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

@media screen and (min-width: 768px) {
  .profile-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .profile-header {
    grid-column: 1 / -1;
  }
  
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>