/**
 * Environment validation utility
 * Ensures all required environment variables are properly configured
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateEnvironment = (): EnvValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const tonManifestUrl = process.env.EXPO_PUBLIC_TON_MANIFEST_URL;
  const sanityProjectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
  const sanityDataset = process.env.EXPO_PUBLIC_SANITY_DATASET;

  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    errors.push('Missing required environment variable: EXPO_PUBLIC_API_BASE_URL');
  } else if (apiBaseUrl.includes('your_') || apiBaseUrl.includes('YOUR_')) {
    errors.push('Environment variable EXPO_PUBLIC_API_BASE_URL contains placeholder value');
  }

  if (!tonManifestUrl || tonManifestUrl.trim() === '') {
    errors.push('Missing required environment variable: EXPO_PUBLIC_TON_MANIFEST_URL');
  } else if (tonManifestUrl.includes('your_') || tonManifestUrl.includes('YOUR_')) {
    errors.push('Environment variable EXPO_PUBLIC_TON_MANIFEST_URL contains placeholder value');
  }

  if (!sanityProjectId || sanityProjectId.trim() === '') {
    errors.push('Missing required environment variable: EXPO_PUBLIC_SANITY_PROJECT_ID');
  } else if (sanityProjectId.includes('your_') || sanityProjectId.includes('YOUR_')) {
    errors.push('Environment variable EXPO_PUBLIC_SANITY_PROJECT_ID contains placeholder value');
  }

  if (!sanityDataset || sanityDataset.trim() === '') {
    errors.push('Missing required environment variable: EXPO_PUBLIC_SANITY_DATASET');
  } else if (sanityDataset.includes('your_') || sanityDataset.includes('YOUR_')) {
    errors.push('Environment variable EXPO_PUBLIC_SANITY_DATASET contains placeholder value');
  }

  // Check optional environment variables
  const amadeusClientId = process.env.EXPO_PUBLIC_AMADEUS_CLIENT_ID;
  const amadeusClientSecret = process.env.EXPO_PUBLIC_AMADEUS_CLIENT_SECRET;

  if (amadeusClientId && (amadeusClientId.includes('your_') || amadeusClientId.includes('YOUR_'))) {
    warnings.push('Environment variable EXPO_PUBLIC_AMADEUS_CLIENT_ID contains placeholder value');
  }

  if (amadeusClientSecret && (amadeusClientSecret.includes('your_') || amadeusClientSecret.includes('YOUR_'))) {
    warnings.push('Environment variable EXPO_PUBLIC_AMADEUS_CLIENT_SECRET contains placeholder value');
  }

  // Validate URL formats
  if (apiBaseUrl && !isValidUrl(apiBaseUrl)) {
    errors.push(`Environment variable EXPO_PUBLIC_API_BASE_URL is not a valid URL: ${apiBaseUrl}`);
  }

  if (tonManifestUrl && !isValidUrl(tonManifestUrl)) {
    errors.push(`Environment variable EXPO_PUBLIC_TON_MANIFEST_URL is not a valid URL: ${tonManifestUrl}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const logEnvironmentStatus = (): void => {
  const validation = validateEnvironment();

  if (validation.isValid) {
    console.log('✅ Environment configuration is valid');
  } else {
    console.error('❌ Environment configuration errors:');
    validation.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment configuration warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
};

export const getEnvironmentInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    tonManifestUrl: process.env.EXPO_PUBLIC_TON_MANIFEST_URL,
    sanityProjectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID,
    sanityDataset: process.env.EXPO_PUBLIC_SANITY_DATASET,
  };
};

// Helper function to validate URLs
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Validate environment on module load in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus();
}
