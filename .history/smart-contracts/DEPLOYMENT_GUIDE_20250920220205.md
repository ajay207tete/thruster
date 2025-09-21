# TON Smart Contract Deployment Guide

## 📋 Contract Overview

Your ShoppingContract is fully prepared for deployment to TON blockchain. The contract includes:

- **Order Management**: Create and track orders with product details
- **Payment Processing**: Handle TON payments automatically
- **Owner Functions**: Secure withdrawal functionality
- **Data Storage**: Product details, images, and payment status tracking

## 🚀 Deployment Options

### Option 1: Using TON CLI (Recommended)

1. **Install TON CLI:**
   ```bash
   npm install -g @ton-org/ton-cli
   ```

2. **Deploy Contract:**
   ```bash
   cd smart-contracts
   toncli deploy contracts/ShoppingContract.fc
   ```

### Option 2: Using Python Scripts

The following scripts are available in the `smart-contracts` directory:

- `simple_deploy.py` - Basic deployment script
- `deploy_fixed.py` - Enhanced deployment with error handling
- `deploy_contract.py` - Full-featured deployment script

**To deploy:**
```bash
cd smart-contracts
python simple_deploy.py
```

### Option 3: Manual Deployment

1. **Compile Contract:**
   ```bash
   func -o contracts/ShoppingContract.fif contracts/ShoppingContract.fc
   ```

2. **Generate Keys:**
   ```bash
   toncli genkey --output mykey
   ```

3. **Deploy:**
   ```bash
   toncli deploy --contract contracts/ShoppingContract.fif --key mykey.json
   ```

## 🔧 Contract Features

### Functions Available:
- `constructor()` - Initialize contract
- `createOrder(productDetails, productImage)` - Create new order
- `withdraw()` - Owner withdrawal (owner only)
- `recv_internal()` - Handle TON payments
- `recv_external()` - Handle external messages

### Global Variables:
- `lastOrderId` - Order counter
- `productDetails` - Product information storage
- `productImages` - Product image storage
- `paidStatus` - Payment status tracking
- `ownerAddress` - Contract owner address

## 📊 Deployment Results

When deployment is successful, you will receive:

```json
{
  "address": "0:abc123...",
  "transaction_id": "def456...",
  "block_id": "ghi789...",
  "public_key": "public_key_here",
  "secret_key": "secret_key_here"
}
```

## 🧪 Testing

Run the test suite to verify contract functionality:

```bash
cd smart-contracts
python tests/test_shopping_contract.py
```

## 🔗 Network Information

- **Testnet Endpoint**: https://net.ton.dev
- **Explorer**: https://testnet.tonscan.org/
- **Network**: TON Testnet (no real TON required)

## 📚 Resources

- [TON Documentation](https://docs.ton.org/)
- [FunC Language Guide](https://docs.ton.org/develop/func/overview)
- [TON CLI Documentation](https://github.com/ton-org/ton-cli)

## 🛠️ Troubleshooting

### Common Issues:

1. **ABI Error**: Update tonclient library
   ```bash
   pip install --upgrade tonclient
   ```

2. **Compilation Error**: Install FunC compiler
   ```bash
   npm install -g func
   ```

3. **Network Error**: Check internet connection and TON testnet status

### Alternative Libraries:
- `pytonlib` - Alternative Python library
- `ton-http-api` - HTTP API client
- `toncli` - Command line tools

## ✅ Contract Status

Your ShoppingContract is **READY FOR DEPLOYMENT** with all features implemented and tested. The deployment infrastructure is complete and multiple deployment methods are available.

**Next Steps:**
1. Choose your preferred deployment method
2. Run the deployment command
3. Save the contract address and keys
4. Test contract functionality
5. Integrate with your frontend application
