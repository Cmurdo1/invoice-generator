import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticateToken, (req, res) => {
  try {
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const clients = req.db.clients.findBy({ user_id: req.user.id });

    // Basic statistics
    const totalInvoices = invoices.length;
    const totalClients = clients.length;
    
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const sentInvoices = invoices.filter(inv => inv.status === 'sent');
    const draftInvoices = invoices.filter(inv => inv.status === 'draft');
    
    // Calculate amounts
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = sentInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // Overdue invoices
    const overdueInvoices = sentInvoices.filter(inv => 
      new Date(inv.due_date) < new Date()
    );
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Recent invoices (last 5)
    const recentInvoices = invoices
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // This month statistics
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const thisMonthInvoices = invoices.filter(inv => 
      new Date(inv.created_at) >= monthStart
    );
    
    const thisMonthRevenue = thisMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Last month for comparison
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    const lastMonthInvoices = invoices.filter(inv => {
      const invoiceDate = new Date(inv.created_at);
      return invoiceDate >= lastMonth && invoiceDate <= lastMonthEnd;
    });
    
    const lastMonthRevenue = lastMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue > 0 ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    const invoiceChange = lastMonthInvoices.length > 0 ? 
      ((thisMonthInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100 : 0;

    res.json({
      summary: {
        total_invoices: totalInvoices,
        total_clients: totalClients,
        total_revenue: totalRevenue,
        pending_amount: pendingAmount,
        overdue_amount: overdueAmount,
        overdue_count: overdueInvoices.length
      },
      status_breakdown: {
        draft: draftInvoices.length,
        sent: sentInvoices.length,
        paid: paidInvoices.length,
        overdue: overdueInvoices.length
      },
      this_month: {
        invoices: thisMonthInvoices.length,
        revenue: thisMonthRevenue,
        revenue_change: revenueChange,
        invoice_change: invoiceChange
      },
      recent_invoices: recentInvoices.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_name: inv.client_name,
        total: inv.total,
        status: inv.status,
        created_at: inv.created_at,
        due_date: inv.due_date
      }))
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', authenticateToken, (req, res) => {
  try {
    const { period = '12months' } = req.query;
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');

    let data = [];
    const now = new Date();

    if (period === '12months') {
      // Last 12 months revenue
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthlyRevenue = paidInvoices
          .filter(inv => {
            const paidDate = new Date(inv.paid_date || inv.created_at);
            return paidDate >= month && paidDate < nextMonth;
          })
          .reduce((sum, inv) => sum + inv.total, 0);

        data.push({
          period: month.toISOString().substring(0, 7), // YYYY-MM format
          revenue: monthlyRevenue,
          invoice_count: paidInvoices.filter(inv => {
            const paidDate = new Date(inv.paid_date || inv.created_at);
            return paidDate >= month && paidDate < nextMonth;
          }).length
        });
      }
    } else if (period === '30days') {
      // Last 30 days revenue
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
        
        const dailyRevenue = paidInvoices
          .filter(inv => {
            const paidDate = new Date(inv.paid_date || inv.created_at);
            return paidDate >= day && paidDate < nextDay;
          })
          .reduce((sum, inv) => sum + inv.total, 0);

        data.push({
          period: day.toISOString().substring(0, 10), // YYYY-MM-DD format
          revenue: dailyRevenue,
          invoice_count: paidInvoices.filter(inv => {
            const paidDate = new Date(inv.paid_date || inv.created_at);
            return paidDate >= day && paidDate < nextDay;
          }).length
        });
      }
    }

    res.json({ analytics: data });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client analytics
router.get('/analytics/clients', authenticateToken, (req, res) => {
  try {
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const clients = req.db.clients.findBy({ user_id: req.user.id });

    // Top clients by revenue
    const clientRevenue = {};
    const clientInvoiceCount = {};

    invoices.forEach(invoice => {
      const clientId = invoice.client_id || 'unknown';
      const clientName = invoice.client_name || 'Unknown Client';
      
      if (!clientRevenue[clientId]) {
        clientRevenue[clientId] = {
          id: clientId,
          name: clientName,
          total_revenue: 0,
          paid_revenue: 0,
          invoice_count: 0,
          paid_count: 0
        };
      }

      clientRevenue[clientId].total_revenue += invoice.total;
      clientRevenue[clientId].invoice_count += 1;

      if (invoice.status === 'paid') {
        clientRevenue[clientId].paid_revenue += invoice.total;
        clientRevenue[clientId].paid_count += 1;
      }
    });

    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.paid_revenue - a.paid_revenue)
      .slice(0, 10);

    // Client status distribution
    const clientsWithInvoices = new Set(invoices.map(inv => inv.client_id)).size;
    const clientsWithoutInvoices = clients.length - clientsWithInvoices;

    res.json({
      top_clients: topClients,
      summary: {
        total_clients: clients.length,
        clients_with_invoices: clientsWithInvoices,
        clients_without_invoices: clientsWithoutInvoices,
        average_revenue_per_client: topClients.length > 0 ? 
          topClients.reduce((sum, client) => sum + client.paid_revenue, 0) / topClients.length : 0
      }
    });

  } catch (error) {
    console.error('Client analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const invoices = req.db.invoices.findBy({ user_id: req.user.id });
    const clients = req.db.clients.findBy({ user_id: req.user.id });

    const activities = [];

    // Add invoice activities
    invoices.forEach(invoice => {
      activities.push({
        id: `invoice-created-${invoice.id}`,
        type: 'invoice_created',
        title: `Invoice ${invoice.invoice_number} created`,
        description: `For ${invoice.client_name}`,
        amount: invoice.total,
        timestamp: invoice.created_at,
        entity_id: invoice.id,
        entity_type: 'invoice'
      });

      if (invoice.sent_date) {
        activities.push({
          id: `invoice-sent-${invoice.id}`,
          type: 'invoice_sent',
          title: `Invoice ${invoice.invoice_number} sent`,
          description: `To ${invoice.client_name}`,
          amount: invoice.total,
          timestamp: invoice.sent_date,
          entity_id: invoice.id,
          entity_type: 'invoice'
        });
      }

      if (invoice.paid_date) {
        activities.push({
          id: `invoice-paid-${invoice.id}`,
          type: 'invoice_paid',
          title: `Invoice ${invoice.invoice_number} paid`,
          description: `Payment received from ${invoice.client_name}`,
          amount: invoice.total,
          timestamp: invoice.paid_date,
          entity_id: invoice.id,
          entity_type: 'invoice'
        });
      }
    });

    // Add client activities
    clients.forEach(client => {
      activities.push({
        id: `client-created-${client.id}`,
        type: 'client_created',
        title: `New client added`,
        description: `${client.name}${client.company ? ` (${client.company})` : ''}`,
        timestamp: client.created_at,
        entity_id: client.id,
        entity_type: 'client'
      });
    });

    // Sort by timestamp descending and limit
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({ activities: recentActivities });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
