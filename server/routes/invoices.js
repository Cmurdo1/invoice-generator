import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all invoices for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, client_id, page = 1, limit = 10, search } = req.query;
    let invoices = req.db.invoices.findBy({ user_id: req.user.id });

    // Apply filters
    if (status) {
      invoices = invoices.filter(invoice => invoice.status === status);
    }

    if (client_id) {
      invoices = invoices.filter(invoice => invoice.client_id === client_id);
    }

    if (search) {
      invoices = invoices.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        invoice.client_name.toLowerCase().includes(search.toLowerCase()) ||
        invoice.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by created_at descending
    invoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedInvoices = invoices.slice(startIndex, endIndex);

    res.json({
      invoices: paginatedInvoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: invoices.length,
        pages: Math.ceil(invoices.length / limit)
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single invoice
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const invoice = req.db.invoices.findById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new invoice
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      client_id,
      client_name,
      client_email,
      client_address,
      invoice_number,
      issue_date,
      due_date,
      description,
      line_items,
      subtotal,
      tax_rate,
      tax_amount,
      total,
      currency,
      notes,
      status = 'draft'
    } = req.body;

    // Validation
    if (!client_name || !line_items || line_items.length === 0) {
      return res.status(400).json({ error: 'Client name and line items are required' });
    }

    // Get user for invoice number generation
    const user = req.db.users.findById(req.user.id);
    const invoicePrefix = user?.profile?.invoice_settings?.invoice_prefix || 'INV';
    const nextNumber = user?.profile?.invoice_settings?.next_invoice_number || 1;

    const newInvoice = {
      id: uuidv4(),
      user_id: req.user.id,
      client_id: client_id || null,
      client_name,
      client_email: client_email || '',
      client_address: client_address || '',
      invoice_number: invoice_number || `${invoicePrefix}-${String(nextNumber).padStart(4, '0')}`,
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: description || '',
      line_items: line_items.map(item => ({
        id: item.id || uuidv4(),
        description: item.description,
        quantity: parseFloat(item.quantity || 1),
        rate: parseFloat(item.rate || 0),
        amount: parseFloat(item.amount || item.quantity * item.rate)
      })),
      subtotal: parseFloat(subtotal || 0),
      tax_rate: parseFloat(tax_rate || 0),
      tax_amount: parseFloat(tax_amount || 0),
      total: parseFloat(total || 0),
      currency: currency || 'USD',
      notes: notes || '',
      status,
      sent_date: null,
      paid_date: null,
      payment_method: null
    };

    const createdInvoice = req.db.invoices.create(newInvoice);

    if (!createdInvoice) {
      return res.status(500).json({ error: 'Failed to create invoice' });
    }

    // Update user's next invoice number
    if (!invoice_number) {
      req.db.users.update(req.user.id, {
        profile: {
          ...user.profile,
          invoice_settings: {
            ...user.profile.invoice_settings,
            next_invoice_number: nextNumber + 1
          }
        }
      });
    }

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: createdInvoice
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const invoice = req.db.invoices.findById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const {
      client_name,
      client_email,
      client_address,
      issue_date,
      due_date,
      description,
      line_items,
      subtotal,
      tax_rate,
      tax_amount,
      total,
      currency,
      notes,
      status
    } = req.body;

    const updateData = {};

    if (client_name !== undefined) updateData.client_name = client_name;
    if (client_email !== undefined) updateData.client_email = client_email;
    if (client_address !== undefined) updateData.client_address = client_address;
    if (issue_date !== undefined) updateData.issue_date = issue_date;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (description !== undefined) updateData.description = description;
    if (subtotal !== undefined) updateData.subtotal = parseFloat(subtotal);
    if (tax_rate !== undefined) updateData.tax_rate = parseFloat(tax_rate);
    if (tax_amount !== undefined) updateData.tax_amount = parseFloat(tax_amount);
    if (total !== undefined) updateData.total = parseFloat(total);
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;

    if (line_items !== undefined) {
      updateData.line_items = line_items.map(item => ({
        id: item.id || uuidv4(),
        description: item.description,
        quantity: parseFloat(item.quantity || 1),
        rate: parseFloat(item.rate || 0),
        amount: parseFloat(item.amount || item.quantity * item.rate)
      }));
    }

    // Handle status changes
    if (status !== undefined && status !== invoice.status) {
      updateData.status = status;
      
      if (status === 'sent' && !invoice.sent_date) {
        updateData.sent_date = new Date().toISOString();
      }
      
      if (status === 'paid' && !invoice.paid_date) {
        updateData.paid_date = new Date().toISOString();
      }
    }

    const updatedInvoice = req.db.invoices.update(req.params.id, updateData);

    if (!updatedInvoice) {
      return res.status(500).json({ error: 'Failed to update invoice' });
    }

    res.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const invoice = req.db.invoices.findById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const deleted = req.db.invoices.delete(req.params.id);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete invoice' });
    }

    res.json({ message: 'Invoice deleted successfully' });

  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send invoice (simulate email)
router.post('/:id/send', authenticateToken, (req, res) => {
  try {
    const invoice = req.db.invoices.findById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = req.db.invoices.update(req.params.id, {
      status: 'sent',
      sent_date: new Date().toISOString()
    });

    if (!updatedInvoice) {
      return res.status(500).json({ error: 'Failed to send invoice' });
    }

    // Simulate email sending
    console.log(`📧 Simulated email sent to ${invoice.client_email || invoice.client_name}`);
    
    res.json({
      message: 'Invoice sent successfully',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark invoice as paid
router.post('/:id/pay', authenticateToken, (req, res) => {
  try {
    const { payment_method } = req.body;
    const invoice = req.db.invoices.findById(req.params.id);

    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = req.db.invoices.update(req.params.id, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method: payment_method || 'manual'
    });

    if (!updatedInvoice) {
      return res.status(500).json({ error: 'Failed to mark invoice as paid' });
    }

    res.json({
      message: 'Invoice marked as paid',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Pay invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice statistics
router.get('/stats/summary', authenticateToken, (req, res) => {
  try {
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });

    const stats = {
      total_invoices: invoices.length,
      draft_invoices: invoices.filter(inv => inv.status === 'draft').length,
      sent_invoices: invoices.filter(inv => inv.status === 'sent').length,
      paid_invoices: invoices.filter(inv => inv.status === 'paid').length,
      overdue_invoices: invoices.filter(inv => {
        return inv.status === 'sent' && new Date(inv.due_date) < new Date();
      }).length,
      total_revenue: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0),
      pending_amount: invoices
        .filter(inv => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.total, 0),
      overdue_amount: invoices
        .filter(inv => inv.status === 'sent' && new Date(inv.due_date) < new Date())
        .reduce((sum, inv) => sum + inv.total, 0)
    };

    res.json(stats);

  } catch (error) {
    console.error('Invoice stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
