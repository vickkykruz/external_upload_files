import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage } from '../../../components/alertFunctions.js';
import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { selectedCandidate } from '../../../components/selected-candidate.js';
import { fetchCsrfToken } from '../../../components/csrfTokenFetcher.js';
import { logoutUser } from '../../../components/logout-client.js';


document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);
    const currentYear = new Date().getFullYear();
    const db = getFirestore(app);

    if (userData) {
      document.querySelectorAll(".sideName").forEach((element) => {
        element.textContent = userData.name;
      });
      document.querySelectorAll(".profileImage").forEach((element) => {
        element.src = userData.profileImageUrl;
      });

      // Fetch the candidates based on the field status=success, poisitions, year=currentYear from firebase databases doc candidates
      const candidatePositions = {
      	President: 'President',
      	'Vice President': 'Vice President',
      	'General Secretary': 'General Secretary',
      	'Assistant General Secretary': 'Assistant General Secretary',
      	Treasurer: 'Treasurer',
      	'Director Of Finance': 'Director Of Finance',
      	'Welfare Director': 'Welfare Director',
      	'Social Director': 'Social Director',
      	'Assistant Social Director': 'Assistant Social Director',
      	'Librarian/Resource Officer': 'Librarian/Resource Officer',
      	Auditor: 'Auditor',
      	'Public Relation Officer 1': 'Public Relation Officer 1',
      	'Public Relation Officer 2': 'Public Relation Officer 2',
      	'Sport Director': 'Sport Director',
      	'Assistant Sport Director': 'Assistant Sport Director'
      };

      const parentContainer = document.querySelector('#positionsContainer');
      // Object to store the previously selected button for each position
      let selectedButtons = {};

      for (const [positionKey, positionValue] of Object.entries(candidatePositions)) {
      	// Create a div for each candidate position
      	const positionDiv = document.createElement('div');
      	positionDiv.id = `position-${positionKey.replace(/\s+/g, '-')}`;
      	positionDiv.className = 'row position-container';
        positionDiv.innerHTML = `<h5 class="mt-3 mb-2">${positionValue}</h5><hr />`;
      	parentContainer.appendChild(positionDiv);

      	// Now, query the candidates based on the current position
      	const candidatesQuery = query(
        	collection(db, 'candidates'),
        	where('status', '==', 'success'),
        	where('role', '==', positionValue),
        	where('year', '==', currentYear)
      	);

      	const candidatesSnapshot = await getDocs(candidatesQuery);

      	candidatesSnapshot.forEach(async (doc) => {
          const candidateData = doc.data();
          let candidateUid = candidateData.uid;

          // Fetch user data based on candidate UID
          const candidateUserData = await fetchUserData(candidateUid);

          console.log('candidateUid: ', candidateUid);
         console.log('candidateUserData: ', candidateUserData);
          // Create candidate card HTML block dynamically
          const candidateHtml = `
            <div class="col-lg-6 col-md-6 col-sm-12">
              <div class="card card-success card-outline mb-4"> 
                <div class="card-header">
                  <div class="card-title">Vote For ${positionValue}</div>
                </div>
                <div class="card-body">
                  <div class="candidate-container text-center">
                    <img src="${candidateUserData.profileImageUrl || 'default-image-url.jpg'}" width="200" class="img-fluid mt-2 mb-2" style="border-radius: 10px;" alt="candidate-img" />
                    <h4>${candidateUserData.name}</h4>
                    <small><b>P.K.A:</b> ${candidateUserData.pka || 'N/A'}</small>
                  </div>
                  <div class="select-candidate-container text-center mt-3">
                    <button type="button" class="btn btn-success mb-2 select-candidate-btn" data-uid="${candidateUid}" data-position="${positionKey}"  data-bs-toggle="toast" data-bs-target="toastSuccess">Select Candidate</button>
                  </div>
                </div>
                <div class="card-footer text-center">
                  <h5 class="mt-1 mb-1">Choose Your Candidate!</h5>
                </div>
              </div>
            </div>
          `;

          // Append the candidate HTML to the appropriate position div
          document.querySelector(`#position-${positionKey.replace(/\s+/g, '-')}`).insertAdjacentHTML('beforeend', candidateHtml);
        });
      }
         // Add event listener for all buttons (you can also do this after DOMContentLoaded for better separation)
         document.querySelectorAll('.select-candidate-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
            const candidateUid = event.target.getAttribute('data-uid');
            const position = event.target.getAttribute('data-position');
            const data = { candidateUid, position };

            try {
               // Fetch the CSRF token
               const csrfToken = await fetchCsrfToken();

               // Call ExpressJS API to store the selection
               const response = await selectedCandidate(data, csrfToken);

               if (response.ok) {
                 // Check if a button was previously selected for this position
                 if (selectedButtons[position]) {
                    // Reset the previous button (enable it and change text back to "Select Candidate")
                    selectedButtons[position].disabled = false;
                    selectedButtons[position].textContent = 'Select Candidate';
                 }

                 // Store the current button as the selected button for this position
                 selectedButtons[position] = event.target;

                 // Disable the current button and change text to "Selected"
                 event.target.disabled = true;
                 event.target.textContent = 'Selected';

              } else {
                 showErrorMessage('An error occurred while selecting the candidate.');
                 console.error('Failed to select candidate');
            }
         } catch (error) {
            showErrorMessage('An error occurred while selecting the candidate.');
            console.error('Error selecting candidate:', error);
         }
       });
      });
      }
    

    // Attach logout function to a button click event
    document.getElementById('logoutButton').addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      logoutUser();
    });
  } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('Error: ' + error);
  }
});
