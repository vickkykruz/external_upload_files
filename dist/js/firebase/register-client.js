import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { showErrorMessage, showSuccessMessage } from '../components/alertFunctions.js';

const auth = getAuth(app)
const db = getFirestore(app)

async function sendVerificationEmail(email, verificationLink, csrfToken) {
  const response = await fetch('http://localhost:4000/send-verification-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken,
    },
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify({ email, verificationLink }),
  });

  return response
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.register-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = e.target.querySelector('#name').value.trim();
      const email = e.target.querySelector('#email').value.trim();
      const password = e.target.querySelector('#password').value.trim();
      const accountType = e.target.querySelector('#accountType').value.trim();
      const submitButton = e.target.querySelector('#submit');
      const uniqueId = generateUniqueId();

      submitButton.disabled = true;
      submitButton.textContent = 'Registering...';

      if (!name || !email || !password || !accountType) {
        showErrorMessage('Please fill in all the fields..');
        return;
      }

      if (password.length < 6) {
        showErrorMessage('Password should be at least 6 characters long.');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        // Upadate the user's display name to the #name gotten from the form
        await updateProfile(user, {
          displayName: name,
        });

        // Store the users in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          memberId: uniqueId,
          email: user.email,
          role: 'user',
          accountType: accountType,
          createdAt: new Date(),
        });

        // Generate a unique verification token
        const token = generateUniqueToken();

        // Store the token in Firestore
        await setDoc(doc(db, 'emailVerificationTokens', user.uid), {
          token: token,
          email: email,
          expiresAt: Date.now() + 3600 * 2000, // Token expires in 1 hour
        });

        const customVerificationLink = `http://localhost:3000/clients/verify/index.html?uid=${user.uid}&token=${token}`;

        // Fetch the CSRF token
        const csrfResponse = await fetch('http://localhost:4000/csrf-token', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        if (!csrfResponse.ok) {
          throw new Error('Failed to fetch CSRF token');
        }

        const { csrfToken } = await csrfResponse.json();
        // Send custom verification email
        const response = await sendVerificationEmail(email, customVerificationLink, csrfToken);

        if (response.ok) {
          showSuccessMessage('Registration successful! Please check your email for the verification link.');
        } else {
          throw new Error('Failed to send verification email.');
        }

      } catch (error) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            showErrorMessage('This email is already registered. Please try logging in instead.');
            break;
          case 'auth/network-request-failed':
            showErrorMessage('No network connected. Check your Internet connection and try again.');
            break;
          default:
            showErrorMessage(error.message || 'Failed to register. Please try again.');
        }
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Register';
      }
    });
  }
});

// Function to generateUniqueToken
function generateUniqueToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Function to generate a 6-character alphanumerical ID
function generateUniqueId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}
