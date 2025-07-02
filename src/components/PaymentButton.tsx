import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { useCreateCheckoutSession } from '@/hooks/useStripe';

interface PaymentButtonProps {
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
  className?: string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  invoiceId,
  amount,
  currency,
  description,
  className = ''
}) => {
  const createCheckoutSession = useCreateCheckoutSession();

  const handlePayment = async () => {
    try {
      // Create a one-time payment session for the invoice
      const response = await fetch('/api/stripe/create-invoice-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          description,
          successUrl: `${window.location.origin}/invoices/${invoiceId}/view?payment=success`,
          cancelUrl: `${window.location.origin}/invoices/${invoiceId}/view?payment=canceled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
      if (!stripe) throw new Error('Stripe not loaded');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={createCheckoutSession.isPending}
      className={`flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <CreditCardIcon className="w-5 h-5 mr-2" />
      {createCheckoutSession.isPending ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
    </button>
  );
};