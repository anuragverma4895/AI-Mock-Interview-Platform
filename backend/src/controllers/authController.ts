import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import config from '../config';
import { encryptToken } from '../services/googleDriveService';

// ── Google OAuth2 client ──
const oauth2Client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

// ── In-memory store for one-time auth codes ──
// Maps code → { jwt, userId, expiresAt }
// In production at scale you'd use Redis; for this app in-memory is fine.
interface PendingCode {
  jwt: string;
  userId: string;
  expiresAt: number;
}
const pendingCodes = new Map<string, PendingCode>();

// Clean up expired codes every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of pendingCodes) {
    if (now > entry.expiresAt) {
      pendingCodes.delete(code);
    }
  }
}, 60_000);

// ── Helpers ──
const serializeUser = (user: { _id: any; email: string; name: string; role: string; profileImage?: string; googleDriveConnected?: boolean; googleDriveConnectedAt?: Date }) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  profileImage: user.profileImage,
  googleDriveConnected: user.googleDriveConnected || false,
  googleDriveConnectedAt: user.googleDriveConnectedAt || null,
});

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow by redirecting the user to Google's consent screen.
 * Generates a cryptographic `state` parameter for CSRF protection.
 */
export const googleAuth = (req: Request, res: Response): void => {
  // Check that Google OAuth is configured
  if (!config.googleClientId || !config.googleClientSecret) {
    res.status(500).json({
      message: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.',
    });
    return;
  }

  // Generate CSRF state token
  const state = crypto.randomBytes(32).toString('hex');

  // Store state in a short-lived HTTP-only cookie (5 minutes)
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000, // 5 minutes
    path: '/',
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file',
    ],
    include_granted_scopes: true,
    state,
    // Request account selection; Google will show the Drive consent when the new scope
    // has not yet been granted, then reuse the grant on later logins.
    prompt: 'select_account',
  });

  res.redirect(authUrl);
};

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google.
 * Verifies the authorization code, validates the Google identity,
 * finds or creates the MongoDB user, generates a one-time code,
 * and redirects the frontend to exchange it for the real JWT.
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error: oauthError } = req.query;

    // Handle user cancellation or Google errors
    if (oauthError) {
      console.error('Google OAuth error:', oauthError);
      res.redirect(`${config.frontendUrl}/login?error=google_denied`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${config.frontendUrl}/login?error=missing_code`);
      return;
    }

    // ── CSRF validation ──
    const savedState = req.cookies?.oauth_state;
    if (!state || !savedState || state !== savedState) {
      console.error('OAuth state mismatch — possible CSRF attack');
      res.redirect(`${config.frontendUrl}/login?error=invalid_state`);
      return;
    }

    // Clear the state cookie
    res.clearCookie('oauth_state', { path: '/' });

    // ── Exchange authorization code for tokens ──
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
      console.error('No id_token received from Google');
      res.redirect(`${config.frontendUrl}/login?error=no_token`);
      return;
    }

    // ── Verify the ID token ──
    // This validates: signature, issuer (accounts.google.com), audience (our client ID),
    // expiration, and returns the verified payload.
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.error('Empty payload from Google ID token');
      res.redirect(`${config.frontendUrl}/login?error=invalid_token`);
      return;
    }

    // ── Validate critical claims ──
    const { sub: googleId, email, email_verified, name, picture, iss, aud } = payload;

    // Issuer must be Google
    if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') {
      console.error('Invalid issuer:', iss);
      res.redirect(`${config.frontendUrl}/login?error=invalid_issuer`);
      return;
    }

    // Audience must match our client ID
    if (aud !== config.googleClientId) {
      console.error('Invalid audience:', aud);
      res.redirect(`${config.frontendUrl}/login?error=invalid_audience`);
      return;
    }

    // Email must be verified by Google
    if (!email_verified) {
      console.error('Google email not verified for:', email);
      res.redirect(`${config.frontendUrl}/login?error=email_not_verified`);
      return;
    }

    if (!googleId || !email) {
      console.error('Missing Google sub or email');
      res.redirect(`${config.frontendUrl}/login?error=missing_identity`);
      return;
    }

    // ── Find or create user by Google's stable `sub` identifier ──
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if there's an existing user with the same email (legacy migration).
      // Only link if the email matches — Google has verified this email belongs
      // to the person authenticating, so this is safe for migration.
      const existingByEmail = await User.findOne({ email: email.toLowerCase() });

      if (existingByEmail) {
        // Legacy user migration: attach the googleId to the existing account
        existingByEmail.googleId = googleId;
        existingByEmail.name = existingByEmail.name || name || 'User';
        if (picture) existingByEmail.profileImage = picture;
        await existingByEmail.save();
        user = existingByEmail;
        console.log(`Migrated legacy user ${email} → googleId ${googleId}`);
      } else {
        // Brand new user
        user = new User({
          googleId,
          email: email.toLowerCase(),
          name: name || 'User',
          profileImage: picture || undefined,
        });
        await user.save();
        console.log(`Created new user: ${email} (googleId: ${googleId})`);
      }
    } else {
      // Update profile info from Google on each login
      let updated = false;
      if (name && user.name !== name) { user.name = name; updated = true; }
      if (picture && user.profileImage !== picture) { user.profileImage = picture; updated = true; }
      if (email && user.email !== email.toLowerCase()) { user.email = email.toLowerCase(); updated = true; }
      if (updated) await user.save();
    }

    // ── Persist Google Drive authorization from the SAME login flow ──
    // The refresh token is kept server-side and encrypted. The frontend only receives
    // the boolean connection state through the normal application user payload.
    const driveScope = 'https://www.googleapis.com/auth/drive.file';
    const grantedScopes = typeof tokens.scope === 'string' ? tokens.scope.split(' ') : [];
    const driveAuthorized = grantedScopes.includes(driveScope);

    if (tokens.refresh_token && driveAuthorized) {
      user.googleDriveConnected = true;
      user.googleDriveRefreshToken = encryptToken(tokens.refresh_token);
      user.googleDriveConnectedAt = new Date();
      await user.save();
    } else if (!user.googleDriveRefreshToken || !user.googleDriveConnected) {
      // Login still succeeds if the user declined Drive access. They can log in normally,
      // but the recording upload feature will report that Drive authorization is required.
      user.googleDriveConnected = false;
      await user.save();
    }

    // ── Generate the application JWT ──
    const appToken = generateToken(user._id.toString());

    // ── Create a one-time authorization code ──
    // The frontend will exchange this code for the real JWT via POST /api/auth/exchange.
    // This avoids putting a long-lived JWT in the URL.
    const oneTimeCode = uuidv4();
    pendingCodes.set(oneTimeCode, {
      jwt: appToken,
      userId: user._id.toString(),
      expiresAt: Date.now() + 60_000, // 60-second TTL
    });

    // Redirect to frontend callback page with the one-time code
    res.redirect(`${config.frontendUrl}/auth/callback?code=${oneTimeCode}`);
  } catch (error: any) {
    console.error('Google callback error:', error.message || error);
    res.redirect(`${config.frontendUrl}/login?error=callback_failed`);
  }
};

/**
 * POST /api/auth/exchange
 * Exchanges a one-time authorization code for the real application JWT.
 * The code is single-use and expires after 60 seconds.
 */
export const exchangeCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ message: 'Authorization code is required' });
      return;
    }

    const entry = pendingCodes.get(code);

    if (!entry) {
      res.status(400).json({ message: 'Invalid or expired authorization code' });
      return;
    }

    // Immediately delete to prevent replay
    pendingCodes.delete(code);

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      res.status(400).json({ message: 'Authorization code has expired' });
      return;
    }

    // Look up the user to return their profile
    const user = await User.findById(entry.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      token: entry.jwt,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Exchange code error:', error);
    res.status(500).json({ message: 'Failed to exchange authorization code' });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.json(req.user);
  } catch (error) {
    console.error('GetMe Error:', error);
    next(error);
  }
};

/**
 * PATCH /api/auth/profile
 * Updates the authenticated user's profile (name, role).
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const updates: { name?: string; role?: string } = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
    if (typeof req.body.role === 'string') updates.role = req.body.role.trim();

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    next(error);
  }
};

/**
 * PATCH /api/auth/settings
 * Updates the authenticated user's settings (role).
 */
export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const role = typeof req.body.role === 'string' ? req.body.role.trim() : undefined;
    if (!role) {
      res.status(400).json({ message: 'Role is required' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.user.id, { role }, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('UpdateSettings Error:', error);
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Server-side logout — currently a no-op since JWTs are stateless,
 * but provides a clean API endpoint. The frontend clears its own state.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
};
