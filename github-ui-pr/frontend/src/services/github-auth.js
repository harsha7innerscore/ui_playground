/**
 * GitHub Device Flow Authentication Service
 * Replaces OAuth callback flow with device flow for frontend-only apps
 */

const GITHUB_API_BASE = '/github-api';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

/**
 * Start GitHub Device Flow
 * Returns device code and user code for authorization
 */
export const startDeviceFlow = async () => {
  const response = await fetch(`${GITHUB_API_BASE}/login/device/code`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'read:user user:email repo'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Device flow start failed: ${response.status}`);
  }

  return await response.json();
};

/**
 * Poll for device flow completion
 * Returns access token when user completes authorization
 */
export const pollDeviceFlow = async (deviceCode, interval = 5) => {
  const startTime = Date.now();
  const maxWaitTime = 15 * 60 * 1000; // 15 minutes

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/login/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });

      const data = await response.json();

      if (data.access_token) {
        // Success! Get user info
        const userInfo = await getUserInfo(data.access_token);
        return {
          access_token: data.access_token,
          user: userInfo
        };
      }

      if (data.error === 'authorization_pending') {
        // Still waiting, continue polling
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        continue;
      }

      if (data.error === 'slow_down') {
        // GitHub wants us to slow down
        interval += 5;
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        continue;
      }

      if (data.error === 'expired_token') {
        throw new Error('Device code expired. Please try again.');
      }

      if (data.error === 'access_denied') {
        throw new Error('Authorization denied by user.');
      }

      throw new Error(data.error_description || data.error || 'Unknown error');

    } catch (error) {
      if (error.message.includes('expired') || error.message.includes('denied')) {
        throw error;
      }
      // Network error, continue polling
      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    }
  }

  throw new Error('Device flow timeout. Please try again.');
};

/**
 * Get user information from GitHub API
 */
export const getUserInfo = async (accessToken) => {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  return await response.json();
};

/**
 * Complete device flow authentication
 * Returns { user, token } or throws error
 */
export const authenticateWithDeviceFlow = async () => {
  // Start device flow
  const deviceData = await startDeviceFlow();

  return {
    ...deviceData,
    pollForToken: () => pollDeviceFlow(deviceData.device_code, deviceData.interval)
  };
};