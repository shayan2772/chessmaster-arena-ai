# Deployment Guide

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**
   ```bash
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Render
1. Connect repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 Environment Variables Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random secret for JWT
- [ ] `DAILY_API_KEY` - Daily.co API key for video
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `STRIPE_SECRET_KEY` - Stripe secret (optional)
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe public key (optional)

## 🔧 Post-Deployment

1. Test authentication flow
2. Create test game rooms
3. Verify video chat functionality
4. Monitor error logs
5. Set up monitoring/analytics