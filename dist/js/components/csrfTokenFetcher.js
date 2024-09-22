// csrfTokenFetcher.js

export async function fetchCsrfToken() {
  try {
    const csrfResponse = await fetch('http://localhost:4000/csrf-token', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!csrfResponse.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const { csrfToken } = await csrfResponse.json();
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
