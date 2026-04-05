import { createClient } from '@supabase/supabase-js'

const fallbackUrl = "https://omawvuexggdpplapesga.supabase.co"
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYXd2dWV4Z2dkcHBsYXBlc2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMTk5NzksImV4cCI6MjA1Nzg5NTk3OX0.eyJYXd2dWV4Z2dkcHBsYXBlc2dhIn0"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase env vars missing. Using fallback public anon config.")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
