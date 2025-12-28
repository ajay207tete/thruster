import axios from 'axios';
const { toNano, fromNano, beginCell, Address } = require('ton-core');

class TonService {
  constructor() {
    this.rpcUrl = process.env.TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC';
    this.apiKey = process.env.TON_API_KEY;
    this.receiverWallet = process.env.TON_RECEIVER_WALLET;
    this.network = process.env.TON_NETWORK || 'mainnet';
  }

  /**
   * Create TON payment payload for frontend TON Connect
   */
  async createPaymentPayload(orderId, amount, userWallet) {
    try {
      // Validate inputs
      if (!this.receiverWallet) {
        throw new Error('TON_RECEIVER_WALLET environment variable not set');
      }

      if (!Address.isValid(userWallet)) {
        throw new Error('Invalid user wallet address');
      }

      if (!Address.isValid(this.receiverWallet)) {
        throw new Error('Invalid receiver wallet address');
      }

      // Convert amount to nanotons
      const amountNano = toNano(amount.toString());

      // Create transaction payload for TON Connect
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: this.receiverWallet,
            amount: amountNano.toString(),
            payload: this.createPaymentComment(orderId)
          }
        ]
      };

      console.log(`Created TON payment payload for order ${orderId}:`, {
        amount: amountNano.toString(),
        receiver: this.receiverWallet,
        userWallet
      });

      return transaction;
    } catch (error) {
      console.error('Error creating payment payload:', error);
      throw error;
    }
  }

  /**
   * Verify TON payment transaction
   */
  async verifyPayment(txHash, orderId, expectedAmount) {
    try {
      // Get transaction details from TON API
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: {
          hash: txHash
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        }
      });

      if (!response.data.result) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }

      const transaction = response.data.result;

      // Verify transaction is successful
      if (transaction.description?.compute_ph?.exit_code !== 0) {
        return {
          success: false,
          message: 'Transaction failed to execute'
        };
      }

      // Verify receiver address
      const outMsg = transaction.out_msgs?.[0];
      if (!outMsg) {
        return {
          success: false,
          message: 'No outgoing message found'
        };
      }

      const actualReceiver = outMsg.destination;
      if (actualReceiver !== this.receiverWallet) {
        return {
          success: false,
          message: 'Invalid receiver address'
        };
      }

      // Verify amount (with small tolerance for fees)
      const actualAmount = BigInt(outMsg.value);
      const expectedAmountNano = toNano(expectedAmount.toString());
      const tolerance = toNano('0.001'); // 0.001 TON tolerance

      if (actualAmount < expectedAmountNano - tolerance) {
        return {
          success: false,
          message: `Insufficient amount: received ${fromNano(actualAmount)}, expected ${expectedAmount}`
        };
      }

      // Verify comment contains order ID
      const comment = this.extractComment(outMsg.message);
      if (!comment || !comment.includes(orderId)) {
        return {
          success: false,
          message: 'Invalid payment comment'
        };
      }

      console.log(`Payment verified for order ${orderId}:`, {
        txHash,
        amount: fromNano(actualAmount),
        receiver: actualReceiver
      });

      return {
        success: true,
        amount: fromNano(actualAmount),
        receiver: actualReceiver,
        comment
      };

    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: error.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Create payment comment with order ID
   */
  createPaymentComment(orderId) {
    const comment = `THRUSTER_ORDER_${orderId}`;
    return beginCell()
      .storeUint(0, 32) // Text comment op code
      .storeStringTail(comment)
      .endCell()
      .toBoc()
      .toString('base64');
  }

  /**
   * Extract comment from transaction message
   */
  extractComment(message) {
    try {
      if (!message) return null;

      const cell = beginCell().storeBuffer(Buffer.from(message, 'base64')).endCell();
      const slice = cell.beginParse();

      const opCode = slice.loadUint(32);
      if (opCode === 0) { // Text comment
        return slice.loadStringTail();
      }

      return null;
    } catch (error) {
      console.error('Error extracting comment:', error);
      return null;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: {
          hash: txHash
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        }
      });

      if (!response.data.result) {
        return { status: 'not_found' };
      }

      const transaction = response.data.result;

      return {
        status: 'confirmed',
        transaction
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Validate TON address
   */
  isValidAddress(address) {
    return Address.isValid(address);
  }

  /**
   * Convert amount to nanotons
   */
  toNano(amount) {
    return toNano(amount.toString());
  }

  /**
   * Convert nanotons to TON
   */
  fromNano(amount) {
    return fromNano(amount);
  }
}

module.exports = new TonService();
