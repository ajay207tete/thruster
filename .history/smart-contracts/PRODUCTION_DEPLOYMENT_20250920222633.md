# TON Smart Contract Production Deployment Guide

This guide covers deploying your ShoppingContract to TON mainnet for production use.

## ⚠️ Important Warnings

- **Real TON Required**: Mainnet deployment requires real TON tokens
- **No Test Funds**: Unlike testnet, you cannot get free TON on mainnet
- **Irreversible**: Deployed contracts cannot be modified
- **Backup Keys**: Store your keys securely and never lose them

## 📋 Prerequisites

### 1. TON Wallet Setup
- Install a TON wallet (Tonkeeper, TON Wallet, etc.)
- Purchase TON tokens from an exchange
- Have at least 1-2 TON for deployment fees

### 2. Contract Compilation
Install FunC compiler for actual compilation:
```bash
npm install -g func
```

### 3. TON CLI Installation
```bash
npm install -g @ton-org/ton-cli
```

## 🚀 Production Deployment Steps

### Step 1: Compile Contract
```bash
cd smart-contracts
func -o contracts/ShoppingContract.fif contracts/ShoppingContract.fc
```

### Step 2: Generate Keys
```bash
toncli generate-keypair
```
This creates:
- `deployer.keys.json` - Your keypair file
- Keep this file secure and backed up

### Step 3: Deploy to Mainnet
```bash
toncli deploy --contract contracts/ShoppingContract.fif --keys deployer.keys.json --network mainnet
```

### Step 4: Verify Deployment
Check your contract on TON mainnet explorer:
- **Mainnet Explorer**: https://tonscan.org/
- **Contract Address**: Will be provided after successful deployment

## 🔧 Configuration Changes for Production

### Update Contract Configuration
```typescript
// client/services/tonService.ts
export const productionTonConfig: TonContractConfig = {
  address: 'YOUR_MAINNET_CONTRACT_ADDRESS', // Replace with actual address
  network: 'mainnet',
  endpoint: 'https://toncenter.com/api/v2'
};
```

### Update Network Settings
```typescript
// For mainnet deployment
const mainnetConfig = {
  address: '0:your_mainnet_contract_address',
  network: 'mainnet',
  endpoint: 'https://toncenter.com/api/v2'
};
```

## 💰 Cost Estimation

### Deployment Costs
- **Contract Deployment**: ~0.1-0.5 TON
- **Storage Fee**: ~0.01 TON per year
- **Transaction Fees**: ~0.001-0.01 TON per transaction

### Total Initial Cost
- **Minimum**: 0.5-1 TON for deployment and initial operations
- **Recommended**: 2-5 TON for comfortable operation

## 🔒 Security Best Practices

### Key Management
1. **Never commit keys** to version control
2. **Use hardware wallets** for production
3. **Backup keys** in multiple secure locations
4. **Use multisig** for high-value contracts

### Contract Security
1. **Audit contract** before mainnet deployment
2. **Test thoroughly** on testnet first
3. **Limit owner functions** to trusted addresses
4. **Monitor contract** for unusual activity

## 🧪 Testing Before Production

### 1. Testnet Validation
- Deploy to testnet first
- Test all contract functions
- Verify integration with frontend
- Test edge cases and error scenarios

### 2. Mainnet Simulation
- Use TON's mainnet simulation tools
- Test with small amounts first
- Verify all payment flows

## 📊 Monitoring & Maintenance

### Contract Monitoring
- Monitor contract balance
- Track transaction volume
- Watch for failed transactions
- Monitor gas usage

### Regular Maintenance
- Update contract if critical bugs found
- Monitor for TON network updates
- Keep deployment scripts updated
- Regular security audits

## 🚨 Emergency Procedures

### If Contract is Compromised
1. **Stop using the contract** immediately
2. **Inform users** about the issue
3. **Deploy new contract** if necessary
4. **Transfer funds** to safe address
5. **Update all integrations**

### Lost Keys
1. **Use backup keys** if available
2. **Deploy recovery contract** if possible
3. **Contact TON support** for assistance
4. **Consider contract migration** if funds are at risk

## 📞 Support & Resources

### TON Resources
- **Documentation**: https://docs.ton.org/
- **Developer Chat**: https://t.me/tondev_eng
- **Mainnet Explorer**: https://tonscan.org/
- **Testnet Explorer**: https://testnet.tonscan.org/

### Tools
- **TON CLI**: https://github.com/ton-org/ton-cli
- **FunC Compiler**: https://github.com/ton-org/func
- **TON Center API**: https://toncenter.com/api/v2/

## ✅ Production Checklist

- [ ] Contract compiled successfully
- [ ] Keys generated and backed up
- [ ] Sufficient TON balance for deployment
- [ ] Testnet testing completed
- [ ] Frontend integration tested
- [ ] Security audit completed
- [ ] Backup procedures in place
- [ ] Monitoring setup configured
- [ ] Emergency procedures documented

## 🎯 Next Steps After Deployment

1. **Update Documentation** with mainnet addresses
2. **Deploy Frontend** with production configuration
3. **Monitor Contract** for initial transactions
4. **Set Up Alerts** for important events
5. **Plan Updates** for future improvements

---

**⚠️ Remember**: Production deployment is permanent. Double-check everything before proceeding. Consider starting with small test transactions to verify everything works correctly.

For questions or issues, consult the TON developer community or documentation.
