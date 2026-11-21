const crypto = require('crypto');
const cfg = require('../public/apk-config.json');

module.exports = async (req, res) => {
  const key = String(req.query.v || '');
  const apk = cfg.apks.find(a => a.key === key);
  if (!apk || !apk.url) { res.statusCode = 404; return res.end('Variant not available'); }

  const ua = req.headers['user-agent'] || '';
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
  const bot = req.method !== 'GET' || /bot|crawl|spider|curl|wget|python|headless|preview/i.test(ua);
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: k, HASH_SALT: salt = '' } = process.env;

  if (!bot && url && k) {
    const hash = crypto.createHash('sha256').update(`${ip}|${ua}|${salt}`).digest('hex');
    try {
      await fetch(`${url}/rest/v1/rpc/record_download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: k, Authorization: `Bearer ${k}` },
        body: JSON.stringify({ p_variant: key, p_client_hash: hash }),
        signal: AbortSignal.timeout(2500)
      });
    } catch (e) { /* a stats failure must never block the download */ }
  }
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 302;
  res.setHeader('Location', apk.url);
  res.end();
};
