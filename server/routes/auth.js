import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = req.db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      company: company || '',
      role: 'user',
      subscription: {
        plan: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      profile: {
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        logo: null,
        invoice_settings: {
          default_currency: 'USD',
          tax_rate: 0,
          invoice_prefix: 'INV',
          next_invoice_number: 1
        }
      }
    };

    const createdUser = req.db.users.create(newUser);
    
    if (!createdUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate token
    const token = generateToken({ 
      id: createdUser.id, 
      email: createdUser.email,
      role: createdUser.role 
    });

    // Remove password from response
    const { password: _, ...userResponse } = createdUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = req.db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json(userResponse);

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, company, phone, address, city, state, zip, country, invoice_settings } = req.body;

    const user = req.db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      name: name || user.name,
      company: company || user.company,
      profile: {
        ...user.profile,
        phone: phone || user.profile.phone,
        address: address || user.profile.address,
        city: city || user.profile.city,
        state: state || user.profile.state,
        zip: zip || user.profile.zip,
        country: country || user.profile.country,
        invoice_settings: invoice_settings ? {
          ...user.profile.invoice_settings,
          ...invoice_settings
        } : user.profile.invoice_settings
      }
    };

    const updatedUser = req.db.users.update(req.user.id, updateData);
    
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = req.db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = req.db.users.update(req.user.id, { 
      password: hashedNewPassword 
    });

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
