const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable static file serving for the public folder
config.resolver.assetExts.push('json');

// Configure Metro to serve static files from public folder
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Serve static files from public folder
      if (req.url.startsWith('/tonconnect-manifest.json')) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'public', 'tonconnect-manifest.json');

        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          const fileContent = fs.readFileSync(filePath, 'utf8');
          res.end(fileContent);
          return;
        }
      }

      return middleware(req, res, next);
    };
  },
};

module.exports = config;
