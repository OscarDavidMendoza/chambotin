-- Insert sample data for demonstration purposes
-- This will create a comprehensive demo user experience

-- First, let's create a function to populate demo data for any user
CREATE OR REPLACE FUNCTION public.populate_demo_data(demo_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, display_name, business_name, business_type, phone_number)
  VALUES (
    demo_user_id,
    'María Rodríguez',
    'Café Central',
    'Restaurante',
    '+52 555 123 4567'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    phone_number = EXCLUDED.phone_number;

  -- Insert user progress for multiple modules (showing various completion states)
  INSERT INTO public.user_progress (user_id, module_id, status, completion_date, time_spent_minutes, pre_quiz_score, post_quiz_score)
  SELECT 
    demo_user_id,
    id,
    CASE 
      WHEN order_index <= 2 THEN 'completed'
      WHEN order_index = 3 THEN 'in_progress'
      ELSE 'not_started'
    END,
    CASE 
      WHEN order_index <= 2 THEN NOW() - (order_index || ' days')::INTERVAL
      ELSE NULL
    END,
    CASE 
      WHEN order_index <= 2 THEN duration_minutes + (order_index * 5)
      WHEN order_index = 3 THEN duration_minutes / 2
      ELSE 0
    END,
    CASE 
      WHEN order_index <= 3 THEN 60 + (order_index * 10)
      ELSE NULL
    END,
    CASE 
      WHEN order_index <= 2 THEN 85 + (order_index * 5)
      ELSE NULL
    END
  FROM public.learning_modules
  ON CONFLICT (user_id, module_id) DO UPDATE SET
    status = EXCLUDED.status,
    completion_date = EXCLUDED.completion_date,
    time_spent_minutes = EXCLUDED.time_spent_minutes,
    pre_quiz_score = EXCLUDED.pre_quiz_score,
    post_quiz_score = EXCLUDED.post_quiz_score;

  -- Insert business metrics for the last 6 months showing growth
  INSERT INTO public.business_metrics (user_id, period_date, revenue, customers_count, social_networks_active, notes)
  VALUES 
    (demo_user_id, CURRENT_DATE - INTERVAL '5 months', 45000.00, 120, 2, 'Inicio del programa de capacitación'),
    (demo_user_id, CURRENT_DATE - INTERVAL '4 months', 48500.00, 135, 3, 'Implementamos estrategias de redes sociales'),
    (demo_user_id, CURRENT_DATE - INTERVAL '3 months', 52000.00, 150, 3, 'Mejoramos el servicio al cliente'),
    (demo_user_id, CURRENT_DATE - INTERVAL '2 months', 56500.00, 165, 4, 'Lanzamos programa de fidelización'),
    (demo_user_id, CURRENT_DATE - INTERVAL '1 month', 61000.00, 180, 4, 'Optimizamos procesos operativos'),
    (demo_user_id, CURRENT_DATE, 65500.00, 195, 5, 'Excelente crecimiento sostenido')
  ON CONFLICT (user_id, period_date) DO UPDATE SET
    revenue = EXCLUDED.revenue,
    customers_count = EXCLUDED.customers_count,
    social_networks_active = EXCLUDED.social_networks_active,
    notes = EXCLUDED.notes;

  -- Award achievements based on progress
  INSERT INTO public.user_achievements (user_id, achievement_id)
  SELECT demo_user_id, id
  FROM public.achievements
  WHERE requirement_type IN ('modules_completed', 'quiz_score') 
    AND (
      (requirement_type = 'modules_completed' AND requirement_value <= 2) OR
      (requirement_type = 'quiz_score' AND requirement_value <= 85)
    )
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

END;
$$;

-- Create a demo account function that can be called from the app
CREATE OR REPLACE FUNCTION public.setup_demo_account()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Only run if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    PERFORM public.populate_demo_data(auth.uid());
  END IF;
END;
$$;