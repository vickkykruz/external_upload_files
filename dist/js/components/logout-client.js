import { signOut } from 'firebase/auth'
import { showErrorMessage } from './alertFunctions.js';

export async function logoutUser() {
  try {
    // Fetch the CSRF token
    const csrfResponse = await fetch('http://localhost:4000/csrf-token', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!csrfResponse.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const { csrfToken } = await csrfResponse.json();

    // Send request to the server to clear session or authentication token
    const response = await fetch('http://localhost:4000/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      credentials: 'include' // Include cookies in the request
    });

    if (response.ok) {
      // Redirect to login page or home page
      window.location.href = 'http://localhost:3000/clients/login.html';
    }
  } catch (error) {
    showErrorMessage('Error logging out:', error);
  }
}
