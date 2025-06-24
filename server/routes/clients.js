import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all clients for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let clients = req.db.clients.findBy({ user_id: req.user.id });

    // Apply search filter
    if (search) {
      clients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by name
    clients.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedClients = clients.slice(startIndex, endIndex);

    // Add invoice count for each client
    const clientsWithStats = paginatedClients.map(client => {
      const invoices = req.db.invoices.findBy({ 
        user_id: req.user.id, 
        client_id: client.id 
      });
      
      return {
        ...client,
        invoice_count: invoices.length,
        total_billed: invoices.reduce((sum, inv) => sum + inv.total, 0),
        total_paid: invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0)
      };
    });

    res.json({
      clients: clientsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: clients.length,
        pages: Math.ceil(clients.length / limit)
      }
    });

  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single client
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const client = req.db.clients.findById(req.params.id);

    if (!client || client.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Add invoice statistics
    const invoices = req.db.invoices.findBy({ 
      user_id: req.user.id, 
      client_id: client.id 
    });

    const clientWithStats = {
      ...client,
      invoice_count: invoices.length,
      total_billed: invoices.reduce((sum, inv) => sum + inv.total, 0),
      total_paid: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0),
      pending_amount: invoices
        .filter(inv => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.total, 0),
      recent_invoices: invoices
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    };

    res.json(clientWithStats);

  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new client
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      zip,
      country,
      notes
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    // Check if client with this email already exists for this user
    if (email) {
      const existingClient = req.db.clients.findOne({ 
        user_id: req.user.id, 
        email 
      });
      
      if (existingClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }

    const newClient = {
      id: uuidv4(),
      user_id: req.user.id,
      name,
      email: email || '',
      phone: phone || '',
      company: company || '',
      address: address || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
      country: country || '',
      notes: notes || ''
    };

    const createdClient = req.db.clients.create(newClient);

    if (!createdClient) {
      return res.status(500).json({ error: 'Failed to create client' });
    }

    res.status(201).json({
      message: 'Client created successfully',
      client: createdClient
    });

  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const client = req.db.clients.findById(req.params.id);

    if (!client || client.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      zip,
      country,
      notes
    } = req.body;

    // Check if email is being changed and if it conflicts with another client
    if (email && email !== client.email) {
      const existingClient = req.db.clients.findOne({ 
        user_id: req.user.id, 
        email 
      });
      
      if (existingClient && existingClient.id !== client.id) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (country !== undefined) updateData.country = country;
    if (notes !== undefined) updateData.notes = notes;

    const updatedClient = req.db.clients.update(req.params.id, updateData);

    if (!updatedClient) {
      return res.status(500).json({ error: 'Failed to update client' });
    }

    // Update client info in associated invoices
    if (name || email) {
      const clientInvoices = req.db.invoices.findBy({ 
        user_id: req.user.id, 
        client_id: client.id 
      });

      clientInvoices.forEach(invoice => {
        const invoiceUpdateData = {};
        if (name) invoiceUpdateData.client_name = name;
        if (email) invoiceUpdateData.client_email = email;
        
        if (Object.keys(invoiceUpdateData).length > 0) {
          req.db.invoices.update(invoice.id, invoiceUpdateData);
        }
      });
    }

    res.json({
      message: 'Client updated successfully',
      client: updatedClient
    });

  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const client = req.db.clients.findById(req.params.id);

    if (!client || client.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if client has associated invoices
    const clientInvoices = req.db.invoices.findBy({ 
      user_id: req.user.id, 
      client_id: client.id 
    });

    if (clientInvoices.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with existing invoices. Please delete associated invoices first.',
        invoice_count: clientInvoices.length
      });
    }

    const deleted = req.db.clients.delete(req.params.id);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete client' });
    }

    res.json({ message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client statistics
router.get('/stats/summary', authenticateToken, (req, res) => {
  try {
    const clients = req.db.clients.findBy({ user_id: req.user.id });
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });

    const stats = {
      total_clients: clients.length,
      clients_with_invoices: new Set(invoices.map(inv => inv.client_id)).size,
      average_invoices_per_client: clients.length > 0 ? 
        invoices.length / clients.length : 0,
      top_clients: clients
        .map(client => {
          const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
          return {
            id: client.id,
            name: client.name,
            company: client.company,
            total_billed: clientInvoices.reduce((sum, inv) => sum + inv.total, 0),
            invoice_count: clientInvoices.length
          };
        })
        .sort((a, b) => b.total_billed - a.total_billed)
        .slice(0, 5)
    };

    res.json(stats);

  } catch (error) {
    console.error('Client stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
