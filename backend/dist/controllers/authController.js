"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const user = new User_1.default({ email, password, name, role });
        await user.save();
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map