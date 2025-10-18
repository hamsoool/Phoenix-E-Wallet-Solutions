<template>
  <div style="text-align:center; margin-top: 60px;">
    <h2>Deposit Failed</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

export default {
  data() {
    return {
      message: 'Processing failed deposit...'
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');
    const userIdFromUrl = urlParams.get('userId');

    if (!transactionId || !userIdFromUrl) {
      this.message = 'Invalid deposit information provided.';
      console.error('Missing transactionId or userId in URL for failed deposit');
      setTimeout(() => {
        this.$router.push('/dashboard');
      }, 3000);
      return;
    }

    const db = getFirestore(app);
    const transactionRef = doc(db, "transactions", transactionId);

    try {
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        this.message = 'Failed deposit transaction not found.';
        console.error('Failed deposit transaction not found for ID:', transactionId);
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 3000);
        return;
      }

      const transactionData = transactionSnap.data();

      // Verify that the transaction belongs to the user from the URL
      if (transactionData.userId !== userIdFromUrl) {
        this.message = 'Failed deposit verification failed.';
        console.error('Failed transaction userId mismatch. Expected:', userIdFromUrl, 'Got:', transactionData.userId);
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 3000);
        return;
      }

      // Only update if the transaction is pending
      if (transactionData.status === 'Pending') {
        // Update transaction status to Failed
        await updateDoc(transactionRef, {
          status: 'Failed',
          description: 'Deposit failed during payment process.'
        });
        console.log('Transaction status updated to Failed!');
        this.message = 'Your deposit could not be completed.';
      } else {
        this.message = `Deposit transaction already processed (Status: ${transactionData.status}).`;
        console.warn(`Transaction ${transactionId} already processed with status: ${transactionData.status}`);
      }

    } catch (error) {
      this.message = 'An error occurred while processing the failed deposit.';
      console.error('Error processing failed deposit:', error);
      // Attempt to mark the transaction as failed on error if it exists
      if(transactionSnap && transactionSnap.exists() && transactionSnap.data().status === 'Pending') {
         try {
           await updateDoc(transactionRef, { status: 'Failed', description: 'Error during failed deposit processing.' });
         } catch(e) {
           console.error('Failed to update transaction status to Failed after error:', e);
         }
      }
    } finally {
      // Redirect to dashboard after a delay regardless of success/failure within this component
      setTimeout(() => {
        this.$router.push('/dashboard');
      }, 3000);
    }
  }
}
</script> 