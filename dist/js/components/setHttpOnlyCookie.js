// Function to set an HTTP-only cookie with the ID token and CSRF token
export async function setHttpOnlyCookie(idToken, csrfToken) {
  try {
    const response = await fetch('http://localhost:4000/setAuthToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    });

    // Check for token expiry and handle re-authentication
    if (response.status === 401) {
      const newIdToken = await auth.currentUser.getIdToken(true); // Force token refresh

      // Retry setting the cookie with the new token
      return await setHttpOnlyCookie(newIdToken, csrfToken);
    }

    return response;
  } catch (error) {
    throw new Error('Failed to set HTTP-only cookie');
  }
}
