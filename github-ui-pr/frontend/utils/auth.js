export const isAuthenticated = () => {
  return !!localStorage.getItem('github_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('github_token');
};

export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const logout = () => {
  localStorage.removeItem('github_token');
  localStorage.removeItem('user_info');
  window.location.href = '/login';
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};