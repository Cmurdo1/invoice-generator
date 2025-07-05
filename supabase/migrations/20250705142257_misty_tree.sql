-- Add webhook support and subscription management functions

-- Create function to handle Stripe webhook events
CREATE OR REPLACE FUNCTION handle_stripe_webhook(
  event_type TEXT,
  customer_id TEXT,
  subscription_id TEXT DEFAULT NULL,
  subscription_status TEXT DEFAULT NULL,
  current_period_end TIMESTAMPTZ DEFAULT NULL,
  price_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  plan_name TEXT;
BEGIN
  -- Map Stripe price IDs to plan names
  CASE price_id
    WHEN 'price_pro_monthly' THEN plan_name := 'pro';
    WHEN 'price_business_monthly' THEN plan_name := 'business';
    ELSE plan_name := 'free';
  END CASE;

  -- Find user by Stripe customer ID
  SELECT * INTO user_record 
  FROM profiles 
  WHERE stripe_customer_id = customer_id;

  IF user_record.id IS NOT NULL THEN
    -- Update user subscription
    UPDATE profiles 
    SET 
      subscription_plan = COALESCE(plan_name, subscription_plan),
      subscription_status = COALESCE(subscription_status, subscription_status),
      updated_at = NOW()
    WHERE id = user_record.id;

    -- Update or insert stripe_customers record
    INSERT INTO stripe_customers (
      user_id,
      stripe_customer_id,
      subscription_id,
      subscription_status,
      subscription_plan,
      current_period_end,
      updated_at
    ) VALUES (
      user_record.id,
      customer_id,
      subscription_id,
      subscription_status,
      plan_name,
      current_period_end,
      NOW()
    )
    ON CONFLICT (stripe_customer_id) 
    DO UPDATE SET
      subscription_id = EXCLUDED.subscription_id,
      subscription_status = EXCLUDED.subscription_status,
      subscription_plan = EXCLUDED.subscription_plan,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits(
  user_uuid UUID,
  feature_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  invoice_count INTEGER;
  client_count INTEGER;
  start_of_month TIMESTAMPTZ;
BEGIN
  -- Get user's current plan
  SELECT subscription_plan INTO user_plan
  FROM profiles
  WHERE id = user_uuid;

  -- If no plan found, default to free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;

  -- For pro and business plans, allow unlimited access
  IF user_plan IN ('pro', 'business') THEN
    RETURN TRUE;
  END IF;

  -- For free plan, check limits
  IF feature_type = 'invoice' THEN
    -- Get start of current month
    start_of_month := date_trunc('month', NOW());
    
    -- Count invoices created this month
    SELECT COUNT(*) INTO invoice_count
    FROM invoices
    WHERE user_id = user_uuid
    AND created_at >= start_of_month;
    
    -- Free plan allows 5 invoices per month
    RETURN invoice_count < 5;
    
  ELSIF feature_type = 'client' THEN
    -- Count total clients
    SELECT COUNT(*) INTO client_count
    FROM clients
    WHERE user_id = user_uuid;
    
    -- Free plan allows 10 clients total
    RETURN client_count < 10;
  END IF;

  -- Default to false for unknown feature types
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy that uses subscription limits
CREATE POLICY "Users can insert invoices within limits" ON invoices
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    check_subscription_limits(auth.uid(), 'invoice')
  );

CREATE POLICY "Users can insert clients within limits" ON clients
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    check_subscription_limits(auth.uid(), 'client')
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at_month ON invoices(user_id, date_trunc('month', created_at));

-- Create function to get subscription usage
CREATE OR REPLACE FUNCTION get_subscription_usage(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  user_plan TEXT;
  invoice_count INTEGER;
  client_count INTEGER;
  start_of_month TIMESTAMPTZ;
  result JSON;
BEGIN
  -- Get user's current plan
  SELECT subscription_plan INTO user_plan
  FROM profiles
  WHERE id = user_uuid;

  -- If no plan found, default to free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;

  -- Get start of current month
  start_of_month := date_trunc('month', NOW());
  
  -- Count invoices created this month
  SELECT COUNT(*) INTO invoice_count
  FROM invoices
  WHERE user_id = user_uuid
  AND created_at >= start_of_month;
  
  -- Count total clients
  SELECT COUNT(*) INTO client_count
  FROM clients
  WHERE user_id = user_uuid;

  -- Build result JSON
  result := json_build_object(
    'plan', user_plan,
    'invoicesThisMonth', invoice_count,
    'totalClients', client_count,
    'canCreateInvoice', CASE 
      WHEN user_plan IN ('pro', 'business') THEN true
      ELSE invoice_count < 5
    END,
    'canCreateClient', CASE 
      WHEN user_plan IN ('pro', 'business') THEN true
      ELSE client_count < 10
    END,
    'remainingInvoices', CASE 
      WHEN user_plan IN ('pro', 'business') THEN -1
      ELSE GREATEST(0, 5 - invoice_count)
    END,
    'remainingClients', CASE 
      WHEN user_plan IN ('pro', 'business') THEN -1
      ELSE GREATEST(0, 10 - client_count)
    END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;