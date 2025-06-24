import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdwawncmybyjthqovftk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd2F3bmNteWJ5anRocW92ZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODgyNjksImV4cCI6MjA2NTk2NDI2OX0.FjZT2268HR5O4q5wfefTBvcHsU7k8-76n1xAcRnjrWk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUser() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'demo@HonestInvoice.com',
      password: 'Demo123!@#$',
      options: {
        data: {
          name: 'Demo User',
          company: 'Demo Company'
        }
      }
    });

    if (authError) throw authError;
    console.log('User created successfully:', authData);

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: 'demo@HonestInvoice.com',
          name: 'Demo User',
          company: 'Demo Company',
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError.message);
      } else {
        console.log('Profile created successfully');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createDemoUser();