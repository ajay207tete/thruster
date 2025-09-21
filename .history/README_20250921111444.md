# Cyberpunk App

A cyberpunk-themed e-commerce and travel booking application with TON blockchain integration.

## Features

- 🛒 E-commerce functionality with product catalog
- ✈️ Travel booking integration with Amadeus API
- 💰 TON blockchain payment integration
- 🎨 Cyberpunk-themed UI
- 📱 React Native mobile app
- 🖥️ Web support
- 📊 Admin dashboard with Sanity CMS

## Tech Stack

### Frontend
- React Native 0.79.6
- Expo SDK 53
- TypeScript
- Tailwind CSS
- TON Connect SDK

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Amadeus API for travel bookings
- GridFS for file storage

### Blockchain
- TON (The Open Network)
- Tact smart contracts

## Setup Instructions

### 1. Environment Setup

1. **Copy environment files:**
   ```bash
   cp .env.example .env
   cp .env.example .env.local
   ```

2. **Configure environment variables:**
   - Edit `.env` with your production values
   - Edit `.env.local` with your local development values

### 2. Required Environment Variables

#### Database
- `MONGODB_URI`: MongoDB connection string

#### Amadeus API (for travel bookings)
- `AMADEUS_CLIENT_ID`: Your Amadeus API client ID
- `AMADEUS_CLIENT_SECRET`: Your Amadeus API client secret

#### Server Configuration
- `PORT`: Server port (default: 5002)
- `NODE_ENV`: Environment (development/production)

#### TON Connect
- `TON_MANIFEST_URL`: URL to your TON Connect manifest

#### Client Configuration
- `EXPO_PUBLIC_API_BASE_URL`: API base URL for the client
- `EXPO_PUBLIC_TON_MANIFEST_URL`: TON Connect manifest URL

### 3. Installation

#### Backend Setup
```bash
cd server
npm install
npm run dev  # For development with nodemon
# or
npm start    # For production
```

#### Frontend Setup
```bash
cd client
npm install
npm start
```

### 4. Database Setup

1. Create a MongoDB database
2. Update the `MONGODB_URI` in your `.env` file
3. The app will automatically create the required collections

### 5. TON Connect Setup

1. Deploy your TON Connect manifest to a public URL
2. Update `TON_MANIFEST_URL` and `EXPO_PUBLIC_TON_MANIFEST_URL` in your environment files
3. The manifest file is located at `public/tonconnect-manifest.json`

### 6. Amadeus API Setup (Optional)

1. Sign up for Amadeus API access
2. Get your client ID and secret
3. Update `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` in your environment files

## Project Structure

```
├── client/                 # React Native/Expo app
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   └── assets/            # Images and fonts
├── server/                # Express.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── smart-contracts/      # TON smart contracts
│   └── contracts/        # Contract source files
├── studio/               # Sanity CMS configuration
└── public/               # Static files
```

## Security Improvements Made

✅ **Removed hardcoded credentials** from server.js
✅ **Added environment variable validation**
✅ **Updated deprecated Mongoose options**
✅ **Made API URLs configurable**
✅ **Added TON Connect manifest configuration**
✅ **Created proper environment file structure**

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels/book` - Book hotel

## Development

### Running Tests
```bash
cd client
npm test
```

### Building for Production
```bash
cd client
npm run build
```

### Linting
```bash
cd client
npm run lint
```

## Deployment

### Frontend (Expo)
```bash
cd client
expo build:web  # For web
expo build:ios  # For iOS
expo build:android  # For Android
```

### Backend
```bash
cd server
npm run build  # If using TypeScript
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

## Support

For support, please contact the development team or create an issue in the repository.
