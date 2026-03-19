import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://omawvuexggdpplapesga.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYXd2dWV4Z2dkcHBsYXBlc2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTgyNDMsImV4cCI6MjA4OTQzNDI0M30.qsZBUh2fof5cG8H7AcKwvuCqXIhxphtc3dREZJPBojA"

export const supabase = createClient(supabaseUrl, supabaseKey)