ALTER TABLE public.notification ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organization (id) ON DELETE CASCADE;          
  COMMENT ON COLUMN public.notification.organization_id IS 'The organization id this notification belongs to (optional, for organization-scoped 
  notifications)';  