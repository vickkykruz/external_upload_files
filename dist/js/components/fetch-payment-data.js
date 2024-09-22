import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(app);

// Function to fetch user data from Firestore
export async function fetchPaymentData(ref) {
  try {
    // Reference to the user's document in the "users" collection
    const paymentDocRef = doc(db, 'payments', ref);
    
    // Fetch the document
    const paymentDoc = await getDoc(paymentDocRef);
    
    // Check if the document exists
    if (paymentDoc.exists()) {
      // Return the data stored in the document
      const paymentData = paymentDoc.data();
      return paymentData;
    }

    return null;
  } catch (error) {
    showErrorMessage('Error fetching payment data:', error);
    console.error('Error fetching payment data:', error);
  }
}