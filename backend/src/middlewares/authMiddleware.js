import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  console.log('[AUTH_MIDDLEWARE] Checking auth for:', req.method, req.path);
  try {
    const authorization = req.headers.authorization || '';
    console.log('[AUTH_MIDDLEWARE] Authorization header:', authorization ? 'present' : 'missing');
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      console.error('[AUTH_MIDDLEWARE] Missing or invalid bearer token');
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    console.log('[AUTH_MIDDLEWARE] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      console.error('[AUTH_MIDDLEWARE] Invalid token payload');
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    req.user = decoded;
    console.log('[AUTH_MIDDLEWARE] Token verified for user:', decoded.userId);
    return next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};
