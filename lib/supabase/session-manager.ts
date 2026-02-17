/**
 * Session Manager - Handles secure persistent login with timeout
 * Features:
 * - Saves session with expiry timestamp
 * - Validates session before use
 * - Tracks user activity for inactivity timeout
 * - Supports both long-term (30 days) and inactivity timeout (15 mins)
 */

const SESSION_KEY = 'faderco_session';
const ACTIVITY_KEY = 'faderco_last_activity';
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

interface SessionData {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Save session with expiry timestamp
 */
export function saveSessionWithExpiry(sessionData: Omit<SessionData, 'expiresAt' | 'createdAt'>) {
  try {
    const now = Date.now();
    const session: SessionData = {
      ...sessionData,
      expiresAt: now + SESSION_EXPIRY_MS,
      createdAt: now,
    };
    
    // Store in localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Update last activity
    localStorage.setItem(ACTIVITY_KEY, now.toString());
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get valid session (checks expiry and inactivity)
 */
export function getValidSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    const session = JSON.parse(sessionStr) as SessionData;
    const now = Date.now();

    // Check if session has expired (30 days)
    if (session.expiresAt && now > session.expiresAt) {
      clearSession();
      return null;
    }

    // Check for inactivity timeout (15 minutes)
    const lastActivityStr = localStorage.getItem(ACTIVITY_KEY);
    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
        clearSession();
        return null;
      }
    }

    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Clear session data (logout)
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Reset activity timer (user is active)
 */
export function resetActivityTimer() {
  try {
    const now = Date.now().toString();
    localStorage.setItem(ACTIVITY_KEY, now);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get remaining session time in milliseconds
 */
export function getSessionTimeRemaining(): number | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    const session = JSON.parse(sessionStr) as SessionData;
    const remaining = session.expiresAt - Date.now();
    return Math.max(0, remaining);
  } catch (error) {
    return null;
  }
}

/**
 * Check if session is about to expire (within 1 minute)
 */
export function isSessionExpiringSoon(): boolean {
  const remaining = getSessionTimeRemaining();
  return remaining !== null && remaining < 60 * 1000;
}
