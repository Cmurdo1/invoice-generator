// Simple script to create a test user in Supabase
// Run this with: node create-test-user.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdwawncmybyjthqovftk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd2F3bmNteWJ5anRocW92ZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODgyNjksImV4cCI6MjA2NTk2NDI2OX0.FjZT2268HR5O4q5wfefTBvcHsU7k8-76n1xAcRnjrWk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'test@invoicegen.com',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User',
          company: 'Test Company'
        }
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('User created successfully:', data.user?.email);
    
    // If user is created, also create profile manually
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          name: 'Test User',
          company: 'Test Company',
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
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        console.log('Profile created successfully');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser();
