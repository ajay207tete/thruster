export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const MANIFEST_URL = process.env.EXPO_PUBLIC_TON_MANIFEST_URL || 'https://thruster-three.vercel.app/tonconnect-manifest.json';

console.log('API_BASE:', API_BASE);
console.log('MANIFEST_URL:', MANIFEST_URL);
