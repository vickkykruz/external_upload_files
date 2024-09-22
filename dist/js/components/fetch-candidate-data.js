import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(app);

// Function to fetch user data from Firestore
export async function fetchCandidateData(uid) {
  try {
    // Reference to the user's document in the "users" collection
    const candidateDocRef = doc(db, 'candidates', uid);
    const currentYear = new Date().getFullYear()
    
    // Fetch the document
    const candidateDoc = await getDoc(candidateDocRef);
    
    // Check if the document exists
    if (candidateDoc.exists()) {
      // Return the data stored in the document
      const candidateData = candidateDoc.data();

      if (candidateData.year == currentYear) {
        return candidateData;
      }
    }

    return null;
  } catch (error) {
    showErrorMessage('Error fetching payment data:', error);
    console.error('Error fetching payment data:', error);
  }
}