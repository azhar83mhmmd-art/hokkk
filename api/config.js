module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({ supabaseUrl: process.env.SUPABASE_URL || '', anonKey: process.env.SUPABASE_ANON_KEY || '' });
};
