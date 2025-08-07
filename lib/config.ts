// Configuration management for environment variables

export const config = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  
  // Authentication
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret',
  
  // Game Limits
  FREE_GAMES_PER_MONTH: parseInt(process.env.FREE_GAMES_PER_MONTH || '1', 10),
  
  // AI Features
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Stripe (optional)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Feature flags
  ENABLE_SUBSCRIPTIONS: process.env.STRIPE_SECRET_KEY ? true : false,
  ENABLE_AI_FEATURES: process.env.GEMINI_API_KEY ? true : false,
} as const

// Validation function
export function validateConfig() {
  const errors: string[] = []
  
  if (!config.JWT_SECRET || config.JWT_SECRET === 'fallback-jwt-secret') {
    errors.push('JWT_SECRET must be set in production')
  }
  
  if (!config.NEXTAUTH_SECRET || config.NEXTAUTH_SECRET === 'fallback-secret') {
    errors.push('NEXTAUTH_SECRET must be set in production')
  }
  
  if (config.FREE_GAMES_PER_MONTH < 0) {
    errors.push('FREE_GAMES_PER_MONTH must be a positive number')
  }
  
  if (config.NODE_ENV === 'production' && errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`)
  }
  
  return errors
}

// Helper functions
export function getFreeGamesLimit(): number {
  return config.FREE_GAMES_PER_MONTH
}

export function isSubscriptionEnabled(): boolean {
  return config.ENABLE_SUBSCRIPTIONS
}

export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return config.NODE_ENV === 'production'
}