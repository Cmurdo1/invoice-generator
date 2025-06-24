import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Subscription plans
const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Up to 5 invoices per month',
      'Basic invoice templates',
      'Client management',
      'PDF downloads'
    ],
    limits: {
      monthly_invoices: 5,
      clients: 10,
      templates: 1
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    interval: 'month',
    features: [
      'Unlimited invoices',
      'Premium templates',
      'Email automation',
      'Payment tracking',
      'Advanced reporting',
      'Priority support'
    ],
    limits: {
      monthly_invoices: -1, // unlimited
      clients: -1,
      templates: -1
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 49,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Multi-user access',
      'API access',
      'Custom branding',
      'Advanced integrations',
      'Dedicated support'
    ],
    limits: {
      monthly_invoices: -1,
      clients: -1,
      templates: -1,
      users: 10
    }
  }
};

// Get all available plans
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) });
});

// Get current user subscription
router.get('/current', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = user.subscription;
    const plan = PLANS[subscription.plan];

    // Check usage for current period
    const currentPeriodStart = new Date(subscription.current_period_start);
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const currentMonthInvoices = invoices.filter(invoice => 
      new Date(invoice.created_at) >= currentPeriodStart
    );

    const usage = {
      invoices_this_month: currentMonthInvoices.length,
      total_invoices: invoices.length,
      total_clients: req.db.clients.count({ user_id: req.user.id })
    };

    res.json({
      subscription: {
        ...subscription,
        plan_details: plan
      },
      usage,
      limits: plan.limits
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change subscription plan
router.post('/change-plan', authenticateToken, (req, res) => {
  try {
    const { plan_id } = req.body;

    if (!PLANS[plan_id]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPlan = user.subscription.plan;
    
    if (currentPlan === plan_id) {
      return res.status(400).json({ error: 'Already subscribed to this plan' });
    }

    // Calculate proration (simplified)
    const now = new Date();
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const newSubscription = {
      ...user.subscription,
      plan: plan_id,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: newPeriodEnd.toISOString(),
      updated_at: now.toISOString()
    };

    // Create billing record
    const billingRecord = {
      id: uuidv4(),
      user_id: req.user.id,
      plan_id,
      amount: PLANS[plan_id].price,
      status: 'paid', // Simulated payment success
      billing_date: now.toISOString(),
      period_start: now.toISOString(),
      period_end: newPeriodEnd.toISOString(),
      payment_method: 'card_ending_4242' // Simulated
    };

    // Update user subscription
    const updatedUser = req.db.users.update(req.user.id, {
      subscription: newSubscription
    });

    // Store billing record
    req.db.subscriptions.create(billingRecord);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    res.json({
      message: 'Subscription updated successfully',
      subscription: newSubscription,
      plan_details: PLANS[plan_id],
      billing_record: billingRecord
    });

  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscription.plan === 'free') {
      return res.status(400).json({ error: 'Free plan cannot be cancelled' });
    }

    // Set subscription to cancel at period end
    const cancelledSubscription = {
      ...user.subscription,
      status: 'cancelled',
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString()
    };

    const updatedUser = req.db.users.update(req.user.id, {
      subscription: cancelledSubscription
    });

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }

    res.json({
      message: 'Subscription cancelled successfully. You will retain access until the end of your current billing period.',
      subscription: cancelledSubscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get billing history
router.get('/billing-history', authenticateToken, (req, res) => {
  try {
    const billingRecords = req.db.subscriptions.findBy({ user_id: req.user.id });
    
    // Sort by billing date descending
    billingRecords.sort((a, b) => new Date(b.billing_date) - new Date(a.billing_date));

    const historyWithPlans = billingRecords.map(record => ({
      ...record,
      plan_details: PLANS[record.plan_id]
    }));

    res.json({ billing_history: historyWithPlans });

  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simulate payment method management
router.get('/payment-methods', authenticateToken, (req, res) => {
  try {
    // Simulated payment methods
    const paymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        },
        is_default: true
      }
    ];

    res.json({ payment_methods });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check plan limits
router.get('/check-limits', authenticateToken, (req, res) => {
  try {
    const user = req.db.users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plan = PLANS[user.subscription.plan];
    const currentPeriodStart = new Date(user.subscription.current_period_start);
    
    // Calculate current usage
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const currentMonthInvoices = invoices.filter(invoice => 
      new Date(invoice.created_at) >= currentPeriodStart
    );
    
    const clients = req.db.clients.findBy({ user_id: req.user.id });

    const usage = {
      invoices_this_month: currentMonthInvoices.length,
      total_clients: clients.length
    };

    const limits = plan.limits;
    
    const canCreateInvoice = limits.monthly_invoices === -1 || 
      usage.invoices_this_month < limits.monthly_invoices;
    
    const canCreateClient = limits.clients === -1 || 
      usage.total_clients < limits.clients;

    res.json({
      usage,
      limits,
      can_create_invoice: canCreateInvoice,
      can_create_client: canCreateClient,
      plan: user.subscription.plan
    });

  } catch (error) {
    console.error('Check limits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
