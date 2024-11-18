

import axios from 'axios';

// Set default base URL for development
const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;