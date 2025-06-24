import bcrypt from 'bcryptjs';
import { createDatabase } from './database/database.js';
import { v4 as uuidv4 } from 'uuid';

const seedDemoData = async () => {
  const db = createDatabase();
  
  console.log('🌱 Seeding demo data...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = {
    id: 'demo-user-id',
    email: 'demo@invoicegen.com',
    password: hashedPassword,
    name: 'Demo User',
    company: 'Demo Company Inc.',
    role: 'user',
    subscription: {
      plan: 'pro',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    profile: {
      phone: '+1 (555) 123-4567',
      address: '123 Demo Street',
      city: 'Demo City',
      state: 'Demo State',
      zip: '12345',
      country: 'United States',
      logo: null,
      invoice_settings: {
        default_currency: 'USD',
        tax_rate: 8.5,
        invoice_prefix: 'INV',
        next_invoice_number: 1001
      }
    }
  };

  // Check if demo user already exists
  const existingUser = db.users.findOne({ email: 'demo@invoicegen.com' });
  if (!existingUser) {
    db.users.create(demoUser);
    console.log('✅ Demo user created');
  } else {
    console.log('ℹ️ Demo user already exists');
  }

  // Create demo clients
  const demoClients = [
    {
      id: 'client-1',
      user_id: 'demo-user-id',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 (555) 234-5678',
      company: 'Tech Solutions Inc.',
      address: '456 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
      notes: 'Regular client for web development projects'
    },
    {
      id: 'client-2', 
      user_id: 'demo-user-id',
      name: 'Sarah Johnson',
      email: 'sarah@designstudio.com',
      phone: '+1 (555) 345-6789',
      company: 'Creative Design Studio',
      address: '789 Creative Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      country: 'United States',
      notes: 'Design and branding projects'
    },
    {
      id: 'client-3',
      user_id: 'demo-user-id',
      name: 'Mike Chen',
      email: 'mike@consulting.com',
      phone: '+1 (555) 456-7890',
      company: 'Business Consulting Group',
      address: '321 Executive Way',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      notes: 'Consulting and strategy work'
    }
  ];

  demoClients.forEach(client => {
    const existing = db.clients.findById(client.id);
    if (!existing) {
      db.clients.create(client);
    }
  });
  console.log('✅ Demo clients created');

  // Create demo invoices
  const demoInvoices = [
    {
      id: 'invoice-1',
      user_id: 'demo-user-id',
      client_id: 'client-1',
      client_name: 'John Smith',
      client_email: 'john@example.com',
      client_address: '456 Business Ave, San Francisco, CA 94105, United States',
      invoice_number: 'INV-1001',
      issue_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      description: 'Website Development Project',
      line_items: [
        {
          id: '1',
          description: 'Frontend Development',
          quantity: 40,
          rate: 100,
          amount: 4000
        },
        {
          id: '2',
          description: 'Backend API Development',
          quantity: 30,
          rate: 120,
          amount: 3600
        }
      ],
      subtotal: 7600,
      tax_rate: 8.5,
      tax_amount: 646,
      total: 8246,
      currency: 'USD',
      notes: 'Payment due within 30 days',
      status: 'paid',
      sent_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      payment_method: 'bank_transfer'
    },
    {
      id: 'invoice-2',
      user_id: 'demo-user-id',
      client_id: 'client-2',
      client_name: 'Sarah Johnson',
      client_email: 'sarah@designstudio.com',
      client_address: '789 Creative Blvd, Los Angeles, CA 90210, United States',
      invoice_number: 'INV-1002',
      issue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Brand Identity Design',
      line_items: [
        {
          id: '1',
          description: 'Logo Design',
          quantity: 1,
          rate: 2500,
          amount: 2500
        },
        {
          id: '2',
          description: 'Brand Guidelines',
          quantity: 1,
          rate: 1500,
          amount: 1500
        },
        {
          id: '3',
          description: 'Business Card Design',
          quantity: 1,
          rate: 500,
          amount: 500
        }
      ],
      subtotal: 4500,
      tax_rate: 8.5,
      tax_amount: 382.5,
      total: 4882.5,
      currency: 'USD',
      notes: 'Final files will be delivered upon payment',
      status: 'sent',
      sent_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: null,
      payment_method: null
    },
    {
      id: 'invoice-3',
      user_id: 'demo-user-id',
      client_id: 'client-3',
      client_name: 'Mike Chen',
      client_email: 'mike@consulting.com',
      client_address: '321 Executive Way, New York, NY 10001, United States',
      invoice_number: 'INV-1003',
      issue_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Business Strategy Consultation',
      line_items: [
        {
          id: '1',
          description: 'Strategic Planning Session',
          quantity: 8,
          rate: 200,
          amount: 1600
        },
        {
          id: '2',
          description: 'Market Analysis Report',
          quantity: 1,
          rate: 3000,
          amount: 3000
        }
      ],
      subtotal: 4600,
      tax_rate: 8.5,
      tax_amount: 391,
      total: 4991,
      currency: 'USD',
      notes: 'Consultation includes follow-up sessions',
      status: 'draft',
      sent_date: null,
      paid_date: null,
      payment_method: null
    }
  ];

  demoInvoices.forEach(invoice => {
    const existing = db.invoices.findById(invoice.id);
    if (!existing) {
      db.invoices.create(invoice);
    }
  });
  console.log('✅ Demo invoices created');

  console.log('🎉 Demo data seeding completed!');
  console.log('\n📧 Demo Login Credentials:');
  console.log('Email: demo@invoicegen.com');
  console.log('Password: demo123');
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData().catch(console.error);
}

export default seedDemoData;
