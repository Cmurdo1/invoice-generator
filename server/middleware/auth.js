import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Token validation error:', error.message);
      return res.status(403).json({
        error: 'Invalid or expired token',
        details: error.message
      });
    }
    
    if (!user) {
      console.error('Token validation failed: No user found');
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Token is invalid but we continue without user
      req.user = null;
    }
  }
  
  next();
};

export default {
  authenticateToken,
  optionalAuth
};
