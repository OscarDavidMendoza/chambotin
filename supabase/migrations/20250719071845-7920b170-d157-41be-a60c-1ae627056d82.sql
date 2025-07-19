-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone_number TEXT,
  business_type TEXT,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create learning modules table
CREATE TABLE public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'sales', 'finance', 'marketing', 'whatsapp'
  duration_minutes INTEGER DEFAULT 3,
  video_url TEXT,
  content JSONB,
  quiz_questions JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on learning modules (public read access)
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view learning modules"
ON public.learning_modules
FOR SELECT
USING (true);

-- Create user progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  pre_quiz_score INTEGER,
  post_quiz_score INTEGER,
  completion_date TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on user progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create business metrics table
CREATE TABLE public.business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  social_networks_active INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_date)
);

-- Enable RLS on business metrics
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics"
ON public.business_metrics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
ON public.business_metrics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
ON public.business_metrics
FOR UPDATE
USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT NOT NULL, -- 'modules_completed', 'revenue_growth', 'streak_days'
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on achievements (public read access)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_metrics_updated_at
BEFORE UPDATE ON public.business_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample learning modules
INSERT INTO public.learning_modules (title, description, category, duration_minutes, order_index) VALUES
('WhatsApp Business Basics', 'Learn to set up and optimize your WhatsApp Business profile for maximum customer engagement', 'whatsapp', 3, 1),
('Creating Your Product Catalog', 'Build an attractive digital catalog that converts browsers into buyers', 'whatsapp', 4, 2),
('Customer Service Excellence', 'Master the art of customer communication through WhatsApp', 'whatsapp', 3, 3),
('Sales Psychology 101', 'Understand what motivates customers to buy and how to present your products effectively', 'sales', 5, 1),
('Pricing Strategies', 'Learn to price your products for maximum profit while staying competitive', 'sales', 4, 2),
('Closing Techniques', 'Master proven techniques to turn leads into paying customers', 'sales', 4, 3),
('Basic Bookkeeping', 'Track your income and expenses like a pro with simple tools', 'finance', 5, 1),
('Cash Flow Management', 'Never run out of money again with smart cash flow planning', 'finance', 4, 2),
('Investment Planning', 'Learn when and how to reinvest in your business for growth', 'finance', 5, 3),
('Social Media Presence', 'Build a following that converts to customers across all platforms', 'marketing', 4, 1),
('Content Creation Tips', 'Create engaging content that showcases your products and builds trust', 'marketing', 5, 2),
('Local Marketing', 'Dominate your local market with targeted marketing strategies', 'marketing', 4, 3);

-- Insert sample achievements
INSERT INTO public.achievements (title, description, icon, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first learning module', '🎯', 'modules_completed', 1),
('Learning Streak', 'Complete 5 modules in a row', '🔥', 'modules_completed', 5),
('Expert Level', 'Complete all modules in any category', '🏆', 'modules_completed', 10),
('Growth Master', 'Achieve 50% revenue growth', '📈', 'revenue_growth', 50),
('Consistency King', 'Log business metrics for 30 days straight', '👑', 'streak_days', 30);