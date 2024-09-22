import { fetchCsrfToken } from './csrfTokenFetcher.js'

// Function to fetch authToken from the server
async function fetchAuthTokenFromServer() {
  try {
    const csrfToken = await fetchCsrfToken();
    const response = await fetch('http://localhost:4000/getAuthToken', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      credentials: 'include', // Include cookies in the request
    });

    if (response.ok) {
      const data = await response.json();
      return data.authToken || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Function to check if the user is logged in by fetching the authToken from the server
export async function checkLoginStatus() {
  const authToken = await fetchAuthTokenFromServer();
  if (!authToken) {
    window.location.href = "http://localhost:3000/clients/login.html";
  }
  return authToken;
}

// Handle 401 Unauthorized responses and redirect to login
export function handleUnauthorizedResponse(response) {
  if (response.status === 401) {
    window.location.href = "http://localhost:3000/clients/login.html"; // Ensure this URL is correct
  }
  return response;
}

// Example usage for fetching protected resources (including UID)
export async function fetchProtectedResource() {
  try {
    const authToken = await checkLoginStatus(); // Fetch and check authToken
    if (!authToken) {
      return null; // Exit if no token
    }

    const csrfToken = await fetchCsrfToken();
    const response = await fetch('http://localhost:4000/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`, // Include token in request header
        'CSRF-Token': csrfToken,
      },
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      handleUnauthorizedResponse(response);
      return null;
    }

    // Return the JSON data directly from the response
    return await response.json();
  } catch (error) {
    console.error('Error fetching protected resource:', error);
    window.location.href = "http://localhost:3000/clients/login.html";
    return null;
  }
}

// Function to run token validation on every page load
export async function validateUserSession() {
  const data = await fetchProtectedResource(); // Validate session by fetching protected resource
  if (data && data.user) {
    return data.user; // Return the UID
  }
  return null; // Return null if no user data is available
}
