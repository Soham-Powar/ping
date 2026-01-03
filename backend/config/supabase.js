const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = supabase;

// supabase url is the api endpoint of your supabase project
// this url can be safe to expose publicly

// second argument is the supabase key
// it tells who you are and what permissions you have
// supabase has different types of keys with different permissions
// such as anon key, service role key etc.

// service role key has the most permissions
// it is also jwt
// it identifies the user as a service role - has admin power
// can bypass rls (row level security) policies
// read and write to any table and storage bucket
// delete any data
// it should never be used in frontend or exposed publicly
// it should only be used in secure backend environment

// anon key has limited permissions
// it is safe to use in frontend and expose publicly
// it is a jwt
// it identifies the user as an anonymous user - no admin power
// access tables and storage based on rls policies for anon users
// rls = row level security

// this key is sent on every request to supabase from this backend
// like Bearer token in Authorization header

// now renamed
// - SUPABASE_ANON_KEY to SUPABASE_PUBLISHABLE_KEY
// - SUPABASE_SERVICE_ROLE_KEY to SUPABASE_SECRET_KEY
