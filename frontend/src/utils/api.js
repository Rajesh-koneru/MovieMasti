export const apiFetch = async (url, options = {}) => {
  const saved = localStorage.getItem('moviemasti_user');
  const user = saved ? JSON.parse(saved) : null;
  
  const headers = options.headers || {};
  
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  
  const finalOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  // Only set Content-Type header if request has a body
  if (!options.body) {
    delete finalOptions.headers['Content-Type'];
  }

  const response = await fetch(url, finalOptions);
  
  if (response.status === 401 || response.status === 403) {
    // If unauthorized/forbidden, auto log out user
    localStorage.removeItem('moviemasti_user');
    window.location.reload();
  }
  
  return response;
};
