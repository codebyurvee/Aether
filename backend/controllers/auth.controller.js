import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { verifyFirebaseToken } from '../config/firebase.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user with email/password
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      authProvider: 'email'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currentPhase: user.currentPhase
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currentPhase: user.currentPhase
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign-In
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const { email, name, uid, picture } = req.body;

    // For development: Accept the user data directly from frontend
    // In production, you should verify the Firebase token
    if (!email || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Email and UID are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        firebaseUid: uid,
        avatar: picture || '',
        authProvider: 'google'
      });
    } else if (!user.firebaseUid) {
      // Update existing user with Firebase UID
      user.firebaseUid = uid;
      user.authProvider = 'google';
      if (picture) user.avatar = picture;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currentPhase: user.currentPhase
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
