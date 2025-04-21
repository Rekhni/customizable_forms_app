import axios from 'axios';

export const checkIfBlocked = async (navigate) => {
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;
  if (!token) return;

  try {
    await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.msg === 'User is blocked') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }
};
