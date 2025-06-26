import React from 'react';
import { Link } from 'react-router-dom';
import supabase from "../config/SupabaseClient.js";
import {
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CreditCardIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const features = [
    {
      name: 'Professional Invoices',
      description: 'Create beautiful, professional invoices with customizable templates',
      icon: DocumentTextIcon,
    },
    {
      name: 'Client Management',
      description: 'Organize and manage all your clients in one centralized location',
      icon: UserGroupIcon,
    },
    {
      name: 'Analytics & Reports',
      description: 'Track your revenue, monitor payments, and get insights into your business',
      icon: ChartBarIcon,
    },
    {
      name: 'Payment Tracking',
      description: 'Monitor payment status and send automated payment reminders',
      icon: CreditCardIcon,
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 invoices per month',
        'Basic invoice templates',
        'Client management',
        'PDF downloads'
      ],
      buttonText: 'Get Started Free',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white mt-2',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      description: 'Best for growing businesses',
      features: [
        'Unlimited invoices',
        'Premium templates',
        'Email automation',
        'Payment tracking',
        'Advanced reporting',
        'Priority support'
      ],
      buttonText: 'Start Pro Trial',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
      popular: true,
      paymentLink: import.meta.env.VITE_STRIPE_PRO_LINK
    },
    {
      name: 'Business',
      price: '$19',
      description: 'For established businesses',
      features: [
        'Everything in Pro',
        'Multi-user access',
        'API access',
        'Custom branding',
        'Advanced integrations',
        'Dedicated support'
      ],
      buttonText: 'Upgrade Now!',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
      popular: false,
      paymentLink: import.meta.env.VITE_STRIPE_BUSINESS_LINK
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Design Studio',
      content: 'HonestInvoice has streamlined our billing process completely. The professional templates make our invoices look amazing.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      company: 'Consulting Firm',
      content: 'The payment tracking feature has helped us reduce late payments by 60%. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      company: 'Marketing Agency',
      content: 'Simple, elegant, and powerful. Everything we needed for invoice management in one place.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">HonestInvoice</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium">Reviews</a>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Invoice
            <span className="text-green-600 block">Generator</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, send, and track professional invoices with ease. 
            Streamline your billing process and get paid faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-lg transition-colors"
            >
              Join Now
            </Link>
          </div>
          
          {/* Hero Image: Animated Invoice Preview */}
          <div className="relative mx-auto max-w-4xl group">
            {/* Stylish background behind the invoice, animates on hover */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-64 bg-gradient-to-tr from-green-200 via-blue-100 to-purple-200 opacity-70 blur-2xl rounded-3xl transition-all duration-700 group-hover:animate-gradient-x" style={{filter: 'blur(40px)'}}></div>
              <div className="absolute w-40 h-40 bg-green-300 opacity-30 rounded-full top-8 left-12 transition-all duration-700 group-hover:animate-bounce-slow"></div>
              <div className="absolute w-32 h-32 bg-purple-300 opacity-20 rounded-full bottom-8 right-16 transition-all duration-700 group-hover:animate-pulse"></div>
            </div>
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto">
                  <div className="rounded-xl shadow-lg bg-white p-6 border border-gray-200 relative overflow-hidden">
                    {/* Animated gradient bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-700 group-hover:animate-gradient-x" style={{backgroundSize: '200% 100%'}}></div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">INVOICE</h3>
                        <p className="text-xs text-gray-400">#INV-2025</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center transition-all duration-700 group-hover:animate-bounce">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-400">Billed To</p>
                      <p className="font-semibold text-gray-700">Jane Doe</p>
                      <p className="text-xs text-gray-400">jane@email.com</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-semibold text-gray-700">June 20, 2025</p>
                    </div>
                    <div className="my-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400">
                            <th className="text-left">Item</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-gray-700">Design Work</td>
                            <td className="text-right">2</td>
                            <td className="text-right">$300</td>
                          </tr>
                          <tr>
                            <td className="text-gray-700">Development</td>
                            <td className="text-right">5</td>
                            <td className="text-right">$750</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <span className="font-bold text-gray-700">Total</span>
                      <span className="font-bold text-green-600 text-lg">$1050</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage invoices
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your billing process and help you get paid faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all">
                <feature.icon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for your business. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 border-2 transition-all ${
                  plan.popular ? 'border-green-600 shadow-xl scale-105' : 'border-gray-200 hover:border-green-200'
                }`}
              >
                {plan.popular && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className={`space-y-3 ${plan.name === 'Free' ? 'mb-6' : 'mb-8'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.paymentLink || '#'}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.name === 'Free' ? 'mt-10 ' : ''}${plan.buttonClass} block text-center`}
                >
                  {plan.buttonText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by thousands of businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about HonestInvoice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of businesses that trust HonestInvoice for their billing needs.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-green-600 font-semibold rounded-lg text-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HI</span>
                </div>
                <span className="text-xl font-bold text-white">HonestInvoice</span>
              </div>
              <p className="text-gray-400">
                Professional invoice generator for modern businesses.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Templates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 HonestInvoice. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
