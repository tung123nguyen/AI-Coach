from supabase import create_client, Client
from app.config import settings


def get_supabase() -> Client:
    """Returns Supabase client with service_role key (bypass RLS for backend)."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )
