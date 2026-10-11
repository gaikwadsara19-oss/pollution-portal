import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rlvskhjadwftxathqjyh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdnNraGphZHdmdHhhdGhxanloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MjI0ODEsImV4cCI6MjEwNzI5ODQ4MX0.a4WdE8cRkl9t_P8lQBoSK4lhGV9KRN-_U54Gqv3s9T8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
