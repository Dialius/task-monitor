/**
 * Authentication Controller
 */

import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

/**
 * Generate JWT token
 */
const generateToken = (userId: string, username: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
  const jwtExpiry = process.env.JWT_EXPIRY || '24h';
  
  return jwt.sign(
    { id: userId, username, role },
    jwtSecret,
    { expiresIn: jwtExpiry } as jwt.SignOptions
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
  const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  
  return jwt.sign(
    { id: userId, type: 'refresh' },
    jwtSecret,
    { expiresIn: refreshExpiry } as jwt.SignOptions
  );
};

/**
 * Login
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      logger.warn('Login attempt with missing credentials');
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    logger.info(`Login attempt for user: ${username}`);

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login failed: User not found - ${username}`);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    logger.info(`User found: ${username}, checking password...`);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for user - ${username}`);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const token = generateToken(user._id.toString(), user.username, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    logger.info(`User logged in successfully: ${username}`);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    logger.info(`User logged out: ${req.user?.username}`);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    logger.error('Logout error', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Refresh token
 */
export const refresh = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(refreshToken, jwtSecret) as any;

    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Generate new token
    const token = generateToken(user._id.toString(), user.username, user.role);

    res.json({ token });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }
    
    logger.error('Refresh token error', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Old and new password required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    // Find user
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid old password' });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.username}`);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    logger.error('Change password error', error);
    res.status(500).json({ error: 'Password change failed' });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Get current user error', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
