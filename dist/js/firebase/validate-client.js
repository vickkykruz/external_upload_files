import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "/src/firebase/firebase-config.js";
import { v4 as uuidv4 } from 'uuid';
import { showErrorMessage, showSuccessMessage } from '../components/alertFunctions.js';
import { setHttpOnlyCookie } from '../components/setHttpOnlyCookie.js';
import { fetchCsrfToken } from '../components/csrfTokenFetcher.js';
import { validateMarticNo } from '../components/validateMarticNo.js';

const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

let idToken;

// Function to extract URL parameters (uid and token)
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    uid: params.get('uid'),
    token: params.get('token')
  };
}

// When the page loads, check if the user is authenticated and set the input field
onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      const nameInput = document.querySelector('#name');
      if (nameInput) {
        nameInput.value = user.displayName;
        nameInput.disabled = true;
      }
      idToken = await user.getIdToken();
    } else {
      window.location.href = "http://localhost:3000/clients/register.html";
    }
  } catch (error) {
    showErrorMessage(error.message);
  }
});

// Function to validate the token
async function validateToken(uid, token) {
  try {
    const tokenDocRef = doc(db, 'emailVerificationTokens', uid);
    const tokenDoc = await getDoc(tokenDocRef);

    if (!tokenDoc.exists()) {
      throw new Error("Invalid verification link.");
    }

    const { token: storedToken, expiresAt } = tokenDoc.data();

    if (storedToken !== token) {
      throw new Error("Invalid or expired token.");
    }

    if (Date.now() > expiresAt) {
      throw new Error("Token has expired.");
    }

    return true;
  } catch (error) {
    throw new Error('Token validation failed: ' + error.message);
  }
}

// Function to handle image upload
async function uploadProfileImage(file, uid) {
  try {
    const randomUniqueNumber = uuidv4();
    const storageRef = ref(storage, `students/${randomUniqueNumber}/profile.jpg`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await updateProfile(auth.currentUser, { photoURL: downloadURL });

    return downloadURL;
  } catch (error) {
    throw new Error('Failed to upload profile image: ' + error.message);
  }
}

// Form submission event listener
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.register-form');
  const departments = {
    Degree: [
      { code: '02', name: 'Computer Science' },
      { code: '05', name: 'Mathematics' },
      { code: '08', name: 'Biology' },
      { code: '09', name: 'Chemistry' },
      { code: '12', name: 'Health Education' },
      { code: '15', name: 'Physics' }
    ],
    NCE: []
  }

  document.getElementById("program").addEventListener("change", function() {
    const selectedProgram = this.value;
    const departmentSelect = document.getElementById("department");

    // Clear previous options
    departmentSelect.innerHTML = '<option selected>Select your department</option>';

    // Populate departments based on the selected program
    if (departments[selectedProgram]) {
      departments[selectedProgram].forEach(dept => {
        const option = document.createElement("option");
        option.value = dept.name;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
      });
    }
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const gender = e.target.querySelector('#gender').value.trim();
      const program = e.target.querySelector('#program').value.trim();
      const matricNo = e.target.querySelector('#matricNo').value.trim();
      const department = e.target.querySelector('#department').value.trim();
      const level = e.target.querySelector('#level').value.trim();
      const fileInput = e.target.querySelector('#profile-image');
      const file = fileInput.files[0];
      const phoneNo = e.target.querySelector('#phoneNo').value.trim();
      const dob = e.target.querySelector('#dob').value.trim();
      const state = e.target.querySelector('#state').value.trim();
      const address = e.target.querySelector('#address').value.trim();
      const submitButton = e.target.querySelector('#submit');
      const { uid, token } = getQueryParams();

      submitButton.disabled = true;
      submitButton.textContent = 'Uploading...';

      if (!gender || !program || !matricNo || !department || !level || !file || !phoneNo || !dob || !state || !address) {
        showErrorMessage('Please fill in all the fields..');
        return;
      }

      try {
        await validateToken(uid, token);

        // Fetch the CSRF token
        const csrfToken = await fetchCsrfToken();

        // Prepare data to send to the server
        const data = { program, department, matricNo };

        // Vaildate Martic Number
        const matricResponse= await validateMarticNo(data, csrfToken);
        if (matricResponse && matricResponse.ok) {

          // Upload the profile image
          const downloadURL = await uploadProfileImage(file, auth.currentUser.uid);

          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
            gender,
            program,
            matricNo,
            department,
            level,
            profileImageUrl: downloadURL,
            phoneNo,
            dob,
            state,
            address,
            emailVerified: true, // Update emailVerified field directly here
          });

          await deleteDoc(doc(db, 'emailVerificationTokens', uid));

          const response = await setHttpOnlyCookie(idToken, csrfToken);

          if (response && response.ok) {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().emailVerified) {
              showSuccessMessage("Profile updated successfully!");
              setTimeout(() => {
                window.location.href = "http://localhost:3001/clients/index.html";
              }, 2000);
            } else {
              throw new Error("Email verification failed.");
            }
          } else {
            throw new Error('Failed to set HTTP-only cookie');
          }

        } else {
          throw new Error('Invalid Martic Number');
        }
      } catch (error) {
        showErrorMessage(error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Upload';
      }
    });
  }
});
