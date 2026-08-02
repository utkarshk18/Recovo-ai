const app = require('../backend/server');

module.exports = (req, res) => {
  // Extract original requested path on Vercel rewrites
  const targetPath = req.headers['x-matched-path'] || req.headers['x-rewrite-url'] || req.url;
  if (targetPath) {
    const queryIndex = req.url ? req.url.indexOf('?') : -1;
    const queryStr = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    const cleanPath = targetPath.split('?')[0];
    
    req.url = (cleanPath.startsWith('/api') ? cleanPath : '/api' + cleanPath) + queryStr;
  }
  return app(req, res);
};
