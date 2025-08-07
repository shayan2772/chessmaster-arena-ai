#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Chess WebRTC...\n')

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...')
  
  const envContent = `# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/chess_webrtc"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# JWT
JWT_SECRET="your-jwt-secret-change-this-in-production"

# Optional: Stripe (for subscriptions)
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_PUBLISHABLE_KEY="pk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
`
  
  fs.writeFileSync('.env', envContent)
  console.log('✅ .env file created')
} else {
  console.log('✅ .env file already exists')
}

console.log('\n📋 Next steps:')
console.log('1. Update DATABASE_URL in .env with your PostgreSQL connection')
console.log('2. Run: npm install')
console.log('3. Run: npx prisma db push')
console.log('4. Run: npm run dev')
console.log('\n🎮 Then visit http://localhost:3000 to test!')