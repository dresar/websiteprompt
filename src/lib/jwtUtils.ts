// JWT utility functions for token management
export const jwtUtils = {
  // Get token from localStorage
  getToken: (): string | null => {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  },

  // Set token in localStorage
  setToken: (token: string): void => {
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  },

  // Remove token from localStorage
  removeToken: (): void => {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  },

  // Check if token exists
  hasToken: (): boolean => {
    return !!jwtUtils.getToken();
  },

  // Decode JWT token (basic implementation without verification)
  decodeToken: (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: (token?: string): boolean => {
    const tokenToCheck = token || jwtUtils.getToken();
    if (!tokenToCheck) return true;

    try {
      const decoded = jwtUtils.decodeToken(tokenToCheck);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  // Get user info from token
  getUserFromToken: (token?: string): any => {
    const tokenToCheck = token || jwtUtils.getToken();
    if (!tokenToCheck || jwtUtils.isTokenExpired(tokenToCheck)) {
      return null;
    }

    try {
      return jwtUtils.decodeToken(tokenToCheck);
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  },

  // Verify token (alias for getUserFromToken for compatibility)
  verifyToken: (token?: string): any => {
    return jwtUtils.getUserFromToken(token);
  }
};