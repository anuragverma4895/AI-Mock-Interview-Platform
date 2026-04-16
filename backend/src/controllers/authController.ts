import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedRole = role ? role.trim() : 'candidate';

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({ email: sanitizedEmail, password, name: sanitizedName, role: sanitizedRole });
    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user || !user.password) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, role } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (role) user.role = role;
    await user.save();

    res.json({ message: 'Settings updated successfully', role: user.role });
  } catch (error) {
    console.error('Update Settings Error:', error);
    next(error);
  }
};