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

      <!-- Elites Positions Section -->
      <div class="elites-positions">
        <h2 class="section-title">ELITES OFFICERS</h2>
        <div class="positions-grid">
          <div class="officers-section">
            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('FA')">
                  <span v-if="!hasProfileImage('FA')">FA</span>
                  <img v-else :src="getProfileImage('FA')" alt="Franchesca Arcega" @error="handleImageError('FA')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Franchesca Arcega</p>
                <h3 class="position-title">President</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('AB')">
                  <span v-if="!hasProfileImage('AB')">AB</span>
                  <img v-else :src="getProfileImage('AB')" alt="Angelo Bonifacio" @error="handleImageError('AB')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Angelo Bonifacio</p>
                <h3 class="position-title">VP Internal</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('MC')">
                  <span v-if="!hasProfileImage('MC')">MC</span>
                  <img v-else :src="getProfileImage('MC')" alt="Marina Camaso" @error="handleImageError('MC')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Marina Camaso</p>
                <h3 class="position-title">VP External</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('SS')">
                  <span v-if="!hasProfileImage('SS')">SS</span>
                  <img v-else :src="getProfileImage('SS')" alt="Shaina Simon" @error="handleImageError('SS')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Shaina Simon</p>
                <h3 class="position-title">Secretary</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('KE')">
                  <span v-if="!hasProfileImage('KE')">KE</span>
                  <img v-else :src="getProfileImage('KE')" alt="Kent Ecal" @error="handleImageError('KE')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Kent Ecal</p>
                <h3 class="position-title">Asst. Secretary</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('IS')">
                  <span v-if="!hasProfileImage('IS')">IS</span>
                  <img v-else :src="getProfileImage('IS')" alt="Iniackie Sumandal" @error="handleImageError('IS')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Iniackie Sumandal</p>
                <h3 class="position-title">Treasurer</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('PC')">
                  <span v-if="!hasProfileImage('PC')">PC</span>
                  <img v-else :src="getProfileImage('PC')" alt="Paulo Cordova" @error="handleImageError('PC')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Paulo Cordova</p>
                <h3 class="position-title">Auditor</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('JD')">
                  <span v-if="!hasProfileImage('JD')">JD</span>
                  <img v-else :src="getProfileImage('JD')" alt="Joanna Darapiza" @error="handleImageError('JD')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Joanna Darapiza</p>
                <h3 class="position-title">P.I.O.</h3>
              </div>
            </div>

            <div class="position-card">
              <div class="profile-container">
                <div class="profile-circle" :style="getProfileStyle('NN')">
                  <span v-if="!hasProfileImage('NN')">NN</span>
                  <img v-else :src="getProfileImage('NN')" alt="Nikolai Nepomuceno" @error="handleImageError('NN')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Nikolai Nepomuceno</p>
                <h3 class="position-title">Business Manager</h3>
              </div>
            </div>
          </div>

          <div class="advisers-section">
            <div class="position-card adviser">
              <div class="profile-container">
                <div class="profile-circle adviser-circle" :style="getProfileStyle('RB')">
                  <span v-if="!hasProfileImage('RB')">RB</span>
                  <img v-else :src="getProfileImage('RB')" alt="Reynaldo G. Bautista Jr." @error="handleImageError('RB')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Reynaldo G. Bautista Jr.</p>
                <h3 class="position-title">ELITES Adviser</h3>
              </div>
            </div>

            <div class="position-card adviser">
              <div class="profile-container">
                <div class="profile-circle adviser-circle" :style="getProfileStyle('DB')">
                  <span v-if="!hasProfileImage('DB')">DB</span>
                  <img v-else :src="getProfileImage('DB')" alt="Dominick Betita" @error="handleImageError('DB')">
                </div>
              </div>
              <div class="officer-info">
                <p class="officer-name">Dominick Betita</p>
                <h3 class="position-title">Alumni Adviser</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase';
import { useRouter } from 'vue-router';

export default {
  name: 'Elites',
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'elites',
      totalElites: 0,
      newElitesThisMonth: 0,
      eliteRevenue: 0,
      eliteMembers: [],
      showAddEliteModal: false,
      newElite: {
        name: '',
        email: '',
        benefits: []
      },
      availableBenefits: [
        'Priority Support',
        'Exclusive Events',
        'Premium Features',
        'Early Access',
        'VIP Status'
      ],
      pageTitles: {
        dashboard: 'Admin Dashboard',
        elites: 'Elites',
        history: 'Admin History',
        members: 'Official Members',
        help: 'Help & Support'
      },
      now: new Date(),
      storage: null,
      profileImages: {}
    };
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
  async created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
    this.router = useRouter();

    // Check authentication state
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchEliteData();
        await this.loadProfileImages();
      } else {
        this.router.push('/login');
      }
    });

    // Update time every second
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  methods: {
    openSidebar() {
      this.isSidebarOpen = true;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    setActivePage(page) {
      this.currentPage = page;
      if (window.innerWidth <= 768) {
        this.closeSidebar();
      }
    },
    async logout() {
      try {
        await signOut(this.auth);
        this.router.push('/login');
      } catch (error) {
        console.error("Logout error:", error);
        alert("Error signing out. Please try again.");
      }
    },
    async fetchEliteData() {
      try {
        // Fetch elite members
        const eliteSnapshot = await getDocs(query(
          collection(this.db, 'users'),
          where('isElite', '==', true)
        ));
        
        this.eliteMembers = eliteSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        this.totalElites = this.eliteMembers.length;

        // Calculate new elites this month
        const currentMonth = new Date().getMonth();
        this.newElitesThisMonth = this.eliteMembers.filter(member => {
          const joinDate = member.joinDate.toDate();
          return joinDate.getMonth() === currentMonth;
        }).length;

        // Calculate elite revenue
        const transactionsSnapshot = await getDocs(query(
          collection(this.db, 'transactions'),
          where('type', '==', 'elite_membership')
        ));
        
        this.eliteRevenue = transactionsSnapshot.docs.reduce((total, doc) => {
          return total + (doc.data().amount || 0);
        }, 0);

      } catch (error) {
        console.error('Error fetching elite data:', error);
      }
    },
    formatDateTime(timestamp) {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    async addEliteMember() {
      try {
        // Add to users collection
        const userRef = await addDoc(collection(this.db, 'users'), {
          name: this.newElite.name,
          email: this.newElite.email,
          isElite: true,
          benefits: this.newElite.benefits,
          joinDate: new Date(),
          status: 'Active'
        });

        // Add to transactions collection
        await addDoc(collection(this.db, 'transactions'), {
          userId: userRef.id,
          type: 'elite_membership',
          amount: 1000, // Example amount
          dateTime: new Date(),
          status: 'Completed'
        });

        // Refresh data
        await this.fetchEliteData();
        this.closeAddEliteModal();
        
      } catch (error) {
        console.error('Error adding elite member:', error);
        alert('Error adding elite member. Please try again.');
      }
    },
    async removeElite(member) {
      if (confirm(`Are you sure you want to remove elite status from ${member.name}?`)) {
        try {
          await updateDoc(doc(this.db, 'users', member.id), {
            isElite: false,
            benefits: []
          });
          await this.fetchEliteData();
        } catch (error) {
          console.error('Error removing elite status:', error);
          alert('Error removing elite status. Please try again.');
        }
      }
    },
    editMember(member) {
      // Implement edit functionality
      console.log('Edit member:', member);
    },
    viewDetails(member) {
      // Implement view details functionality
      console.log('View details:', member);
    },
    closeAddEliteModal() {
      this.showAddEliteModal = false;
      this.newElite = {
        name: '',
        email: '',
        benefits: []
      };
    },
    async loadProfileImages() {
      try {
        const profilesRef = collection(this.db, 'officer_profiles');
        const snapshot = await getDocs(profilesRef);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.imageUrl) {
            this.profileImages[data.officerId] = data.imageUrl;
          }
        });
      } catch (error) {
        console.error('Error loading profile images:', error);
      }
    },
    hasProfileImage(officerId) {
      return !!this.profileImages[officerId];
    },
    getProfileImage(officerId) {
      return this.profileImages[officerId];
    },
    getProfileStyle(officerId) {
      if (this.hasProfileImage(officerId)) {
        return {
          background: 'none',
          padding: '0'
        };
      }
      return {};
    },
    handleImageError(officerId) {
      // Remove failed image and show initials
      delete this.profileImages[officerId];
      // Update Firestore to remove the image URL
      const profileRef = doc(this.db, 'officer_profiles', officerId);
      setDoc(profileRef, {
        imageUrl: null,
        updatedAt: new Date()
      }, { merge: true }).catch(error => {
        console.error('Error updating Firestore:', error);
      });
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false;
      }
    });
  },
  beforeUnmount() {
    clearInterval(this.timer);
  }
};
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
  margin: 0;
  padding: 0;
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
  padding: 0;
  margin: 0;
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 10px var(--card-padding);
  border-bottom: 1px solid var(--color-light);
  background: var(--color-white);
  position: sticky;
  top: 0;
  z-index: 10;
}

.current-datetime {
  position: relative;
  top: 0;
  right: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #ff6a00;
  font-weight: 500;
  letter-spacing: 0.5px;
  background: rgba(255,255,255,0.85);
  padding: 6px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.elites-positions {
  padding: 2rem;
  background: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin: 0;
  position: relative;
  overflow: hidden;
}

.elites-positions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}

.section-title {
  color: var(--color-dark);
  font-size: 2.2rem;
  margin-bottom: 2.5rem;
  text-align: center;
  position: relative;
  padding-bottom: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: 2px;
}

.positions-grid {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 1.5rem;
}

.officers-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.advisers-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
  padding-top: 1rem;
  border-top: 2px solid var(--color-light);
}

.position-card {
  background: var(--color-white);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid var(--color-light);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.profile-container {
  position: relative;
  width: fit-content;
  margin: 0 auto;
}

.profile-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.8rem;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.officer-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.officer-name {
  color: var(--color-dark);
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.position-title {
  color: var(--color-dark-variant);
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  padding: 0.5rem;
  background: var(--color-light);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.position-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.position-card:hover .profile-circle {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.position-card:hover .position-title {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

/* Special styling for adviser cards */
.position-card.adviser {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light) 100%);
  border: none;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
  max-width: 400px;
  margin: 0 auto;
}

.position-card.adviser .position-title {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-weight: 600;
}

.position-card.adviser:hover .position-title {
  background: var(--color-primary);
  color: white;
}

/* Responsive adjustments */
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

  .elite-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .positions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .profile-circle {
    width: 80px;
    height: 80px;
  }

  .profile-circle.adviser-circle {
    width: 90px;
    height: 90px;
  }

  .officer-name {
    font-size: 1.2rem;
  }

  .position-title {
    font-size: 1rem;
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
    padding: 0;
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
  }

  .main-header {
    padding: 8px 16px;
    margin: 0;
    position: sticky;
  }

  .main-header h1 {
    text-align: left;
    margin-left: 8px;
    font-size: 1.5rem;
  }

  .current-datetime {
    display: none;
  }

  .elite-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .positions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .profile-circle {
    width: 70px;
    height: 70px;
  }

  .profile-circle.adviser-circle {
    width: 80px;
    height: 80px;
  }

  .officer-name {
    font-size: 1.1rem;
  }

  .position-title {
    font-size: 0.95rem;
  }

  .table-wrapper {
    margin: 0 -16px;
    border-radius: 0;
    overflow-x: auto;
  }

  th, td {
    padding: 12px;
    white-space: nowrap;
  }

  .modal-content {
    width: 95%;
    max-width: none;
    margin: 16px;
    padding: 20px;
  }

  .advisers-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }
}

@media screen and (max-width: 480px) {
  main {
    padding: 0;
  }

  .main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    margin: 0;
  }

  .main-header h1 {
    font-size: 1.25rem;
    margin-left: 0;
  }

  .elite-stats {
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-content h1 {
    font-size: 1.5rem;
  }

  .stat-content h3 {
    font-size: 0.9rem;
  }

  .positions-grid {
    gap: 12px;
  }

  .profile-circle {
    width: 60px;
    height: 60px;
  }

  .profile-circle.adviser-circle {
    width: 70px;
    height: 70px;
  }

  .officer-name {
    font-size: 1rem;
  }

  .position-title {
    font-size: 0.9rem;
    padding: 0.4rem;
  }

  .table-wrapper {
    margin: 0 -12px;
  }

  th, td {
    padding: 8px;
    font-size: 0.9rem;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .modal-content {
    padding: 16px;
    margin: 12px;
  }

  .advisers-section {
    gap: 1rem;
    padding: 0.75rem;
  }
}

/* Add smooth transitions for all responsive changes */
#sidebar,
main,
.main-header,
.elite-stats,
.positions-grid,
.table-wrapper,
.modal-content {
  transition: all 0.3s ease-in-out;
}

/* Ensure modals are always responsive */
.modal {
  padding: 16px;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Improve table responsiveness */
.table-wrapper {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--color-light);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

/* Ensure buttons remain clickable on mobile */
button,
.action-btn,
.icon-btn,
.upload-button {
  min-height: 44px;
  min-width: 44px;
}

/* Improve form element touch targets */
input,
select,
textarea {
  min-height: 44px;
  font-size: 16px; /* Prevents iOS zoom on focus */
}

/* Profile image upload specific styles */
.profile-container {
  position: relative;
  width: fit-content;
  margin: 0 auto;
}

.profile-circle {
  position: relative;
  overflow: hidden;
  border: 3px solid var(--color-primary);
  transition: all 0.3s ease;
}

.upload-button {
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

.profile-container:hover .upload-button {
  opacity: 1;
}

.upload-button .material-icons {
  font-size: 18px;
}
</style>
