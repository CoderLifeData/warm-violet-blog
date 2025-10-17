// Authentication and session management

interface SessionData {
  isAuthenticated: boolean;
  loginTime: string;
  expiresAt: string;
  userId: string;
}

const SESSION_KEY = 'blog_admin_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let inactivityTimer: NodeJS.Timeout | null = null;

// Create a new session
export const createSession = (userId: string = 'admin'): void => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);
  
  const sessionData: SessionData = {
    isAuthenticated: true,
    loginTime: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    userId
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem('isLoggedIn', 'true'); // For backward compatibility
  
  // Start inactivity timer
  resetInactivityTimer();
};

// Check if session is valid
export const isSessionValid = (): boolean => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;
    
    const session: SessionData = JSON.parse(sessionStr);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    // Check if session has expired
    if (now > expiresAt) {
      clearSession();
      return false;
    }
    
    return session.isAuthenticated;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

// Get session data
export const getSession = (): SessionData | null => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    return JSON.parse(sessionStr);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Clear session
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('isLoggedIn');
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

// Reset inactivity timer
export const resetInactivityTimer = (): void => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  inactivityTimer = setTimeout(() => {
    if (isSessionValid()) {
      clearSession();
      window.location.href = '/login?reason=inactivity';
    }
  }, INACTIVITY_TIMEOUT);
};

// Initialize session monitoring
export const initSessionMonitoring = (): void => {
  // Reset timer on user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
  });
  
  // Start initial timer
  if (isSessionValid()) {
    resetInactivityTimer();
  }
};

// Cleanup session monitoring
export const cleanupSessionMonitoring = (): void => {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.removeEventListener(event, resetInactivityTimer);
  });
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

// Login with credentials
export const login = (username: string, password: string): boolean => {
  // Demo credentials (in production, this would be an API call)
  if (username === 'admin' && password === 'password') {
    createSession('admin');
    return true;
  }
  
  return false;
};

// Logout
export const logout = (): void => {
  clearSession();
};
