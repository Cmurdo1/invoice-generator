import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user products/services catalog
router.get('/products', authenticateToken, (req, res) => {
  try {
    const products = req.db.products.findAll();
    
    // Filter by category if requested
    const { category } = req.query;
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Get unique categories
    const categories = [...new Set(products.map(product => product.category))];

    res.json({
      products: filteredProducts,
      categories
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add custom product/service
router.post('/products', authenticateToken, (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const newProduct = {
      name,
      description: description || '',
      price: parseFloat(price),
      category: category || 'Custom',
      user_id: req.user.id, // Custom products are user-specific
      is_custom: true
    };

    const createdProduct = req.db.products.create(newProduct);

    if (!createdProduct) {
      return res.status(500).json({ error: 'Failed to create product' });
    }

    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice templates
router.get('/templates', authenticateToken, (req, res) => {
  try {
    const templates = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and professional modern design',
        preview_image: '/templates/modern-preview.png',
        is_premium: false
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional business invoice layout',
        preview_image: '/templates/classic-preview.png',
        is_premium: false
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and elegant minimal design',
        preview_image: '/templates/minimal-preview.png',
        is_premium: true
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Colorful and creative design',
        preview_image: '/templates/creative-preview.png',
        is_premium: true
      }
    ];

    // Check user's subscription plan
    const user = req.db.users.findById(req.user.id);
    const isPremiumUser = user.subscription.plan !== 'free';

    const availableTemplates = templates.map(template => ({
      ...template,
      available: !template.is_premium || isPremiumUser
    }));

    res.json({ templates: availableTemplates });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user settings
router.get('/settings', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = {
      profile: user.profile,
      subscription: user.subscription,
      preferences: {
        default_template: user.preferences?.default_template || 'modern',
        email_notifications: user.preferences?.email_notifications !== false,
        auto_save: user.preferences?.auto_save !== false,
        currency: user.profile.invoice_settings.default_currency,
        date_format: user.preferences?.date_format || 'MM/DD/YYYY',
        timezone: user.preferences?.timezone || 'UTC'
      }
    };

    res.json(settings);

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { preferences, invoice_settings } = req.body;

    const updateData = {};

    if (preferences) {
      updateData.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (invoice_settings) {
      updateData.profile = {
        ...user.profile,
        invoice_settings: {
          ...user.profile.invoice_settings,
          ...invoice_settings
        }
      };
    }

    const updatedUser = req.db.users.update(req.user.id, updateData);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    res.json({
      message: 'Settings updated successfully',
      settings: {
        preferences: updatedUser.preferences,
        invoice_settings: updatedUser.profile.invoice_settings
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export user data
router.get('/export', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const clients = req.db.clients.findBy({ user_id: req.user.id });
    const subscriptions = req.db.subscriptions.findBy({ user_id: req.user.id });

    // Remove sensitive data
    const { password, ...safeUser } = user;

    const exportData = {
      user: safeUser,
      invoices,
      clients,
      billing_history: subscriptions,
      export_date: new Date().toISOString(),
      export_version: '1.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="invoice-data-export.json"');
    res.json(exportData);

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get usage statistics
router.get('/usage', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const clients = req.db.clients.findBy({ user_id: req.user.id });

    // Calculate usage for current billing period
    const currentPeriodStart = new Date(user.subscription.current_period_start);
    const currentPeriodInvoices = invoices.filter(inv => 
      new Date(inv.created_at) >= currentPeriodStart
    );

    const usage = {
      current_period: {
        start: user.subscription.current_period_start,
        end: user.subscription.current_period_end,
        invoices_created: currentPeriodInvoices.length,
        invoices_sent: currentPeriodInvoices.filter(inv => inv.status !== 'draft').length,
        total_revenue: currentPeriodInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0)
      },
      all_time: {
        total_invoices: invoices.length,
        total_clients: clients.length,
        total_revenue: invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0),
        member_since: user.created_at
      },
      plan_limits: {
        plan: user.subscription.plan,
        monthly_invoice_limit: user.subscription.plan === 'free' ? 5 : -1,
        client_limit: user.subscription.plan === 'free' ? 10 : -1
      }
    };

    res.json(usage);

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
