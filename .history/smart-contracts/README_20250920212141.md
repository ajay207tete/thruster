# TON Smart Contract Deployment

This directory contains a complete TON smart contract deployment solution for the ShoppingContract.

## 📁 Files Overview

- `contracts/ShoppingContract.fc` - The FunC smart contract source code
- `deploy_contract.py` - Complete deployment script with compilation and deployment
- `deploy.py` - Original deployment script (kept for reference)
- `tests/test_shopping_contract.py` - Comprehensive test suite
- `stdlib.fc` - TON standard library for FunC

## 🚀 Quick Start

### 1. Deploy Contract

```bash
cd smart-contracts
python deploy_contract.py
```

### 2. Run Tests

```bash
cd smart-contracts
python tests/test_shopping_contract.py
```

## 📋 Contract Features

The ShoppingContract provides:

- **Order Management**: Create and track orders
- **Payment Processing**: Handle TON payments for orders
- **Owner Functions**: Withdraw funds (owner only)
- **Product Details**: Store product information and images
- **Payment Status**: Track payment status for orders

## 🔧 Deployment Process

### 1. Contract Compilation
- Attempts to use FunC compiler if available
- Falls back to mock compilation for testing
- Creates ABI and TVC (compiled contract code)

### 2. Key Generation
- Generates random keypair for contract deployment
- Uses TON testnet for deployment

### 3. Contract Deployment
- Encodes deployment message
- Sends transaction to TON testnet
- Waits for confirmation
- Returns contract address and transaction details

## 🧪 Testing

The test suite includes:

- ✅ **Client Connection Test** - Verifies TON client connectivity
- ✅ **Key Generation Test** - Tests cryptographic key generation
- ✅ **Message Encoding Test** - Tests deployment message encoding
- ✅ **Full Deployment Mock Test** - Tests complete deployment process
- ⏭️ **Compilation Test** - Skipped (requires external tools)
- ⏭️ **Live Deployment Test** - Skipped (requires real compilation)

## 🔗 TON Network

- **Network**: TON Testnet
- **Endpoint**: https://net.ton.dev
- **Client**: tonclient Python library

## 📊 Deployment Results

When deployment is successful, you get:

```json
{
  "address": "0:abc123...",
  "transaction_id": "def456...",
  "block_id": "ghi789...",
  "public_key": "public_key_here",
  "secret_key": "secret_key_here"
}
```

## 🛠️ Troubleshooting

### Compilation Issues
- Install FunC compiler: `npm install -g func`
- Or use TON CLI: `npm install -g @ton-org/ton-cli`
- For testing, the script uses mock compilation

### Network Issues
- Check internet connection
- Verify TON testnet is accessible
- Consider using mainnet for production

### Library Issues
- Ensure `tonclient` is installed: `pip install tonclient`
- Check Python version compatibility

## 📈 Next Steps

1. **Real Compilation**: Install FunC compiler for actual contract compilation
2. **Mainnet Deployment**: Switch from testnet to mainnet
3. **Contract Interaction**: Add functions to interact with deployed contract
4. **Frontend Integration**: Connect to web/mobile frontend
5. **Production Testing**: Test with real TON transactions

## 🔒 Security Notes

- **Testnet Only**: Currently configured for testnet only
- **Mock Compilation**: Uses mock data for testing
- **Key Management**: Keys are generated for each deployment
- **No Real Funds**: Testnet doesn't use real TON coins

## 📚 Resources

- [TON Documentation](https://docs.ton.org/)
- [FunC Language Guide](https://docs.ton.org/develop/func/overview)
- [TON Client Python](https://github.com/toncenter/ton-client-py)
- [TON Testnet Explorer](https://testnet.tonscan.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
