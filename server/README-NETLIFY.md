# Backend Deployment on Netlify

This backend is configured for deployment on Netlify as serverless functions.

## Prerequisites

1. Netlify CLI installed: `npm install -g netlify-cli`
2. Netlify account and site created

## Environment Variables

Set these environment variables in your Netlify dashboard:

### Database
- `MONGODB_URI` - MongoDB connection string

### NowPayments
- `NOWPAYMENTS_API_KEY` - Your NowPayments API key
- `NOWPAYMENTS_API_URL` - NowPayments API URL (default: https://api.nowpayments.io/v1)
- `NOWPAYMENTS_IPN_URL` - IPN callback URL for your deployment

### TON Blockchain
- `TON_CONTRACT_ADDRESS` - Your ShoppingContract address
- `TON_WALLET_MNEMONIC` - Wallet mnemonic for contract interactions
- `TON_NETWORK` - Network (testnet/mainnet)
- `TON_API_KEY` - TON API key (optional)

### URLs
- `FRONTEND_URL` - Your frontend URL
- `BASE_URL` - Your backend URL (Netlify site URL)

## Deployment Steps

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Build functions:**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify:**
   ```bash
   netlify deploy --prod --dir=dist --functions=netlify/functions
   ```

   Or connect to Git and use continuous deployment.

## API Endpoints

After deployment, your API endpoints will be:

- `/.netlify/functions/auth` - Authentication endpoints
- `/.netlify/functions/user` - User management
- `/.netlify/functions/cart` - Shopping cart
- `/.netlify/functions/order` - Order management
- `/.netlify/functions/payment` - Payment processing
- `/.netlify/functions/nft` - NFT management

## Testing Locally

1. **Install Netlify CLI globally:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Serve functions locally:**
   ```bash
   cd server
   npm run serve
   ```

3. **Test endpoints:**
   ```bash
   curl http://localhost:9999/.netlify/functions/health
   ```

## Client Configuration

Update your client API base URL to point to your Netlify deployment:

```typescript
// In client/services/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-netlify-site.netlify.app';
```

## File Structure

```
server/
├── netlify/
│   ├── functions/
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── user.ts       # User management
│   │   ├── cart.ts       # Shopping cart
│   │   ├── order.ts      # Order management
│   │   ├── payment.ts    # Payment processing
│   │   ├── nft.ts        # NFT management
│   │   ├── health.ts     # Health check
│   │   ├── ton.ts        # TON blockchain
│   │   └── Nowpayments.ts # NowPayments integration
│   └── toml              # Netlify configuration
├── services/             # Business logic services
├── models/               # MongoDB models
└── package.json          # Dependencies and scripts
```

## Troubleshooting

1. **Function timeouts:** Netlify functions have a 10-second timeout for free plans
2. **Cold starts:** First request after inactivity may be slower
3. **Environment variables:** Ensure all required env vars are set in Netlify dashboard
4. **CORS issues:** Check CORS headers in function responses

## Monitoring

- Check Netlify function logs in the dashboard
- Monitor MongoDB Atlas for database performance
- Set up alerts for payment failures
