<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedRole = role ? role.trim() : 'candidate';

    const existingUser = await User.findOne({ email: sanitizedEmail });
=======
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

<<<<<<< HEAD
    const user = new User({ email: sanitizedEmail, password, name: sanitizedName, role: sanitizedRole });
=======
    const user = new User({ email, password, name, role });
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
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
<<<<<<< HEAD
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
=======
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    if (!user) {
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
<<<<<<< HEAD
    console.error('Login Error:', error);
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
=======
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
      return;
    }

    res.json({
<<<<<<< HEAD
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    next(error);
=======
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
  }
};