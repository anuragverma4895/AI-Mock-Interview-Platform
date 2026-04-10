import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
<<<<<<< HEAD
import config from '../config';
=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

<<<<<<< HEAD
    const decoded = jwt.verify(token, config.jwtSecret) as {
=======
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
      id: string;
      email: string;
      name: string;
      role: string;
    };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
<<<<<<< HEAD
    config.jwtSecret,
=======
    process.env.JWT_SECRET || 'your-secret-key',
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    { expiresIn: '7d' }
  );
};