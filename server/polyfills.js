/**
 * Polyfills for URL and URLSearchParams in Node.js server environment
 */
if (typeof URL === 'undefined' || typeof URLSearchParams === 'undefined') {
  const { URL, URLSearchParams } = require('url');
  global.URL = URL;
  global.URLSearchParams = URLSearchParams;
}
