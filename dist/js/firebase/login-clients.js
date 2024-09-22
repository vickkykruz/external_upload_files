import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '/src/firebase/firebase-config.js';
import { showErrorMessage, showSuccessMessage } from '../components/alertFunctions.js';
import { setHttpOnlyCookie } from '../components/setHttpOnlyCookie.js';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { fetchCsrfToken } from '../components/csrfTokenFetcher.js';

const auth = getAuth(app);
const db = getFirestore(app);

// Function to extract URL parameters (uid and token)
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    action: params.get('action')
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = e.target.querySelector('#email').value.trim();
      const password = e.target.querySelector('#password').value.trim();
      const submitButton = e.target.querySelector('#submit');
      const { action } = getQueryParams();

      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';

      if (!email || !password) {
        showErrorMessage('Please fill in all the fields..');
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        const userDocRef = doc(db, 'users', user.uid);

        // Get ID token and handle errors
        let idToken;
        try {
          idToken = await user.getIdToken();
        } catch (error) {
          throw new Error('Failed to get ID token');
        }

        // Fetch the CSRF token
        const csrfToken = await fetchCsrfToken(); // Fetch the CSRF token
        console.log('Fetched CSRF Token:', csrfToken);

        // Set HTTP-only cookie
        const response = await setHttpOnlyCookie(idToken, csrfToken);

        if (response && response.ok) {
          // validate the emailVerified field
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().emailVerified) {
            showSuccessMessage('Login successful! Redirecting to the dashboard...');
            if (action === 'candidateRegistration') {
              setTimeout(() => {
                window.location.href = '../clients/election/candidate-registration/index.html';
              }, 2000);
            }else {
              setTimeout(() => {
                window.location.href = '../clients/index.html';
              }, 2000);
            }
          }else {
            throw new Error("Email verification failed.");
          }
        } else {
          throw new Error('Failed to set HTTP-only cookie');
        }
      } catch (error) {
        switch (error.code) {
          case 'auth/invalid-credential':
            showErrorMessage('No user found with this email. Please register.');
            break;
          case 'auth/invalid-password':
            showErrorMessage('Incorrect password. Please try again.');
            break;
          case 'auth/network-request-failed':
            showErrorMessage('No network connected. Check your internet connection and try again.');
            break;
          default:
            showErrorMessage(error.message || 'Failed to sign in. Please try again.');
        }
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
      }
    });
  }
});
