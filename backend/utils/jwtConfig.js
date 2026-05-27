// Central JWT secret configuration
// This ensures both signing and verification use the exact same secret
// Priority: process.env.JWT_SECRET > hardcoded fallback
// The fallback is intentionally set to match what was historically used

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('[AUTH CONFIG] WARNING: JWT_SECRET environment variable not set! Using fallback secret. Set JWT_SECRET in your environment.');
    return 'Vishwa@8105'; // Explicit fallback - matches historical .env value
  }
  return secret;
};

export const JWT_SECRET = getJWTSecret();
export default JWT_SECRET;
