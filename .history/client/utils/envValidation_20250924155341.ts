/**
 * Environment validation utility
 * Ensures all required environment variables are properly configured
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const requiredEnvVars = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_TON_MANIFEST_URL',
  'EXPO_PUBLIC_SANITY_PROJECT_ID',
  'EXPO_PUBLIC_SANITY_DATASET',
];

const optionalEnvVars = [
  'EXPO_PUBLIC_AMADEUS_CLIENT_ID',
  'EXPO_PUBLIC_AMADEUS_CLIENT_SECRET',
];

export const validateEnvironment = (): EnvValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  requiredEnvVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${envVar}`);
    } else if (value.includes('your_') || value.includes('YOUR_')) {
      errors.push(`Environment variable ${envVar} contains placeholder value`);
    }
  });

  // Check optional environment variables
  optionalEnvVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (value && (value.includes('your_') || value.includes('YOUR_'))) {
      warnings.push(`Environment variable ${envVar} contains placeholder value`);
    }
  });

  // Validate URL formats
  const urlVars = ['EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_TON_MANIFEST_URL'];
  urlVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (value && !isValidUrl(value)) {
      errors.push(`Environment variable ${envVar} is not a valid URL: ${value}`);
    }
  });

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
