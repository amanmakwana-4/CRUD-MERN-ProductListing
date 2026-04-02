import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { uploadFile } from '../utils/imagekitService.js';

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const parseLanguages = (languages) => {
  if (Array.isArray(languages)) {
    return languages;
  }

  if (typeof languages === 'string') {
    try {
      const parsed = JSON.parse(languages);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [languages];
    }
  }

  return [];
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, address, gender, languages, profileDescription, password } = req.body;
    const parsedLanguages = parseLanguages(languages);

    if (!name || !email || !phone || !address || !gender || !parsedLanguages.length || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    let profilePhoto = null;
    if (req.file) {
      profilePhoto = await uploadFile(req.file.buffer, `profile-${Date.now()}-${req.file.originalname}`);
    }

    const user = new User({
      name,
      email,
      phone,
      address,
      gender,
      languages: Array.isArray(parsedLanguages) ? parsedLanguages : [parsedLanguages],
      profileDescription: profileDescription || '',
      profilePhoto,
      password,
    });

    await user.save();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. OTP sent to email',
      data: { email },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({
        success: false,
        message: 'OTP expired',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: { token, user: user.toJSON() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, languages, profileDescription } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (gender) updateData.gender = gender;
    if (languages !== undefined) updateData.languages = parseLanguages(languages);
    if (profileDescription !== undefined) updateData.profileDescription = profileDescription;

    if (req.file) {
      updateData.profilePhoto = await uploadFile(req.file.buffer, `profile-${Date.now()}-${req.file.originalname}`);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
