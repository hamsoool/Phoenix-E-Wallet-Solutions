<template>
  <div>
    <div class="dash-header">
      <h1>Help & Support</h1>
      <div class="date">
        <input type="date" :value="currentDate" @input="$emit('update:currentDate', $event.target.value)">
      </div>
    </div>

    <div class="support-container">
      <!-- FAQ Section -->
      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div class="accordion">
          <div class="accordion-item" v-for="(faq, index) in faqs" :key="index">
            <button 
              class="accordion-toggle" 
              @click="toggleFaq(index)" 
              :class="{ active: faq.isOpen }"
              :aria-expanded="faq.isOpen"
              :aria-controls="`faq-panel-${index}`"
            >
              {{ faq.question }}
              <span class="icon">{{ faq.isOpen ? '−' : '+' }}</span>
            </button>
            <div 
              class="accordion-content" 
              :id="`faq-panel-${index}`" 
              :class="{ open: faq.isOpen }"
            >
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form Section -->
      <div class="contact-section">
        <h2>Contact Support</h2>
        
        <form class="contact-form" @submit.prevent="submitSupportRequest">
          <div class="form-group">
            <label for="issue-type">Issue Type</label>
            <select id="issue-type" v-model="supportForm.issueType" required>
              <option value="">Select an issue type</option>
              <option value="account">Account Issues</option>
              <option value="payment">Payment Problems</option>
              <option value="technical">Technical Support</option>
              <option value="feedback">Feedback & Suggestions</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="subject">Subject</label>
            <input type="text" id="subject" placeholder="Brief description of your issue" v-model="supportForm.subject" required>
          </div>

          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" placeholder="Please provide details about your issue" v-model="supportForm.message" required></textarea>
          </div>

          <button type="submit" class="btn-submit">Submit Request</button>
        </form>

        <div class="support-channels">
          <h3>Other Ways to Reach Us</h3>
          <div class="channels-grid">
            <a href="mailto:support@phoenix.com" class="channel-item">
              <span class="material-icons">email</span>
              <div>
                <h4>Email Support</h4>
                <p>support@phoenix.com</p>
              </div>
            </a>
            <a href="tel:1-800-PHOENIX" class="channel-item">
              <span class="material-icons">phone</span>
              <div>
                <h4>Phone Support</h4>
                <p>1-800-PHOENIX</p>
              </div>
            </a>
            <a href="#" @click.prevent="startLiveChat" class="channel-item">
              <span class="material-icons">chat</span>
              <div>
                <h4>Live Chat</h4>
                <p>Available 24/7</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpSupport',
  props: {
    currentDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  data() {
    return {
      faqs: [
        {
          question: 'How do I add money to my account?',
          answer: 'You can add money to your account by clicking the "Add Money" button in your wallet section. We support multiple payment methods including credit/debit cards, bank transfers, and digital wallets.',
          isOpen: false
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Navigate to the Profile section from the sidebar menu. There you can edit your personal information, update security settings, and manage notification preferences.',
          isOpen: false
        },
        {
          question: 'What should I do if a transaction fails?',
          answer: 'If a transaction fails, first check your account balance and payment method details. Most failures are due to insufficient funds or incorrect payment information. If the issue persists, please contact our support team.',
          isOpen: false
        },
        {
          question: 'How secure is my data on Phoenix?',
          answer: 'Your security is our priority. We use industry-standard encryption protocols to protect your personal and financial information. All transactions are secured with SSL technology, and we never store your complete payment details.',
          isOpen: false
        },
        {
          question: 'How do I upgrade to a Premium account?',
          answer: 'To upgrade to Premium, go to your Profile page and select the "Upgrade Account" option. You\'ll see available plans with their features and pricing. Choose the plan that suits your needs and follow the payment instructions.',
          isOpen: false
        }
      ],
      supportForm: {
        issueType: '',
        subject: '',
        message: ''
      }
    };
  },
  methods: {
    toggleFaq(index) {
      // Close all other FAQs
      this.faqs.forEach((faq, i) => {
        if (i !== index && faq.isOpen) {
          faq.isOpen = false;
        }
      });
      
      // Toggle the clicked FAQ
      this.faqs[index].isOpen = !this.faqs[index].isOpen;
    },
    submitSupportRequest() {
      // Here you would normally send the form data to your backend
      // For demo purposes, we'll just show an alert
      alert('Your support request has been submitted. We\'ll get back to you soon!');
      
      // Reset form
      this.supportForm = {
        issueType: '',
        subject: '',
        message: ''
      };
    },
    startLiveChat() {
      // Placeholder for live chat functionality
      alert('Live chat feature would launch here');
    }
  }
};
</script>

<style scoped>
/* Base Styles & Variables */
:root {
  --color-primary: #ff5722;
  --color-primary-light: #ff9800;
  --color-white: #fff;
  --color-off-white: #fcfcfc; /* Slightly off-white for main content */
  --color-background: #f5f7fa; /* Light gray-blue for overall background */
  --color-dark: #333;
  --color-dark-variant: #555;
  --color-light: #eef1f6; /* Updated to match new color scheme */
  --color-light-variant: #f8f9fa;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --card-padding: 14px;
  --border-radius: 6px;
  --box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  --transition: all 0.2s ease;
  --sidebar-width: 200px;
  --sidebar-width-collapsed: 60px;
  --right-panel-width: 260px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  background-color: var(--color-background); /* Updated background color */
  color: var(--color-dark);
}

/* Container Layout - Modified to use 1fr for center content */
.container {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width);
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Sidebar Styles */
#sidebar {
  background-color: var(--color-off-white);
  box-shadow: var(--box-shadow);
  height: 100vh;
  position: fixed;
  width: var(--sidebar-width);
  z-index: 20;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Main Content Styles - Updated to maximize space */
main {
  position: fixed;
  left: var(--sidebar-width);
  right: var(--right-panel-width);
  top: 0;
  bottom: 0;
  background-color: var(--color-off-white); /* Updated to off-white for main content */
  box-shadow: var(--box-shadow);
  padding: var(--card-padding);
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
  margin-right: 10px;
}

/* Card Layout */
.card {
  background-color: var(--color-white); /* Pure white for cards for contrast */
  padding: var(--card-padding);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Slightly stronger shadow for cards */
  transition: var(--transition);
  border: 1px solid var(--color-light);
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-light);
  border-radius: var(--border-radius);
  background-color: var(--color-white); /* Pure white for tables */
}

thead tr {
  background-color: var(--color-light); /* Slightly darker for header */
}

/* Right Panel Styles */
#right-panel {
  background-color: var(--color-off-white);
  box-shadow: var(--box-shadow);
  height: 100vh;
  position: fixed;
  width: var(--right-panel-width);
  right: 0;
  top: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Wallet Card Styles - Keep the gradient to make it stand out */
.wallet-card {
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
  color: var(--color-white);
  padding: var(--card-padding);
  border-radius: var(--border-radius);
  margin-bottom: 14px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1); /* Enhanced shadow for wallet card */
}
/* Help & Support Specific Styles - Minimal Design */
.support-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.faq-section, .contact-section {
  background: var(--color-white);
  border-radius: 0.75rem;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--color-dark);
  font-weight: 600;
}

h3 {
  font-size: 1.1rem;
  margin: 1.75rem 0 1rem;
  color: var(--color-dark);
}

/* Improved Accordion/FAQ styling */
.accordion {
  border-radius: 0.5rem;
  overflow: hidden;
}

.accordion-item {
  margin-bottom: 0.75rem;
}

.accordion-toggle {
  width: 100%;
  text-align: left;
  padding: 1rem;
  background: var(--color-background, #f9fafb);
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  color: var(--color-dark);
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.accordion-toggle:hover {
  background: var(--color-light);
}

.accordion-toggle.active {
  background: var(--color-background, #f9fafb);
  border-radius: 0.5rem 0.5rem 0 0;
}

.accordion-toggle .icon {
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--color-primary);
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
  background: var(--color-white);
  border-radius: 0 0 0.5rem 0.5rem;
  border: 1px solid var(--color-background, #f9fafb);
  border-top: none;
}

.accordion-content.open {
  height: auto;
  padding: 1rem;
}

.accordion-content p {
  margin: 0;
  color: var(--color-dark-variant, #6b7280);
  line-height: 1.5;
}

/* Improved form styling */
.contact-form {
  display: grid;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-dark);
}

.form-group input, 
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-light);
  background: var(--color-white);
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus, 
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-submit {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  justify-self: start;
  min-width: 150px;
}

.btn-submit:hover {
  background: var(--color-primary-variant);
  transform: translateY(-1px);
}

/* Improved support channels */
.support-channels {
  margin-top: 1.5rem;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--color-background, #f9fafb);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.channel-item:hover {
  background: var(--color-light);
  transform: translateY(-2px);
}

.channel-item .material-icons {
  color: var(--color-primary);
  font-size: 1.5rem;
}

.channel-item h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-dark);
}

.channel-item p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-dark-variant, #6b7280);
}

@media screen and (min-width: 768px) {
  .support-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 767px) {
  .channels-grid {
    grid-template-columns: 1fr;
  }
}
</style>