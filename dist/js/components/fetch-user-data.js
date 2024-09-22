import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(app);

// Function to fetch user data from Firestore
export async function fetchUserData(uid) {
  try {
    // Reference to the user's document in the "users" collection
    const userDocRef = doc(db, 'users', uid);
    
    // Fetch the document
    const userDoc = await getDoc(userDocRef);
    
    // Check if the document exists
    if (userDoc.exists()) {
      // Return the data stored in the document
      const userData = userDoc.data();
      return userData;
    }

    return null;
  } catch (error) {
    showErrorMessage('Error fetching user data:', error);
    console.error('Error fetching user data:', error);
  }
}