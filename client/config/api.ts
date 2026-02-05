export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://thrusterapp.netlify.app/.netlify/functions';

export const MANIFEST_URL = process.env.EXPO_PUBLIC_TON_MANIFEST_URL || 'https://thruster-three.vercel.app/tonconnect-manifest.json';

console.log('API_BASE:', API_BASE);
console.log('MANIFEST_URL:', MANIFEST_URL);
