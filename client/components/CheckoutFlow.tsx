import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { OrderService, Order, OrderItem } from '../services/orderService';
import { PaymentService, defaultPaymentConfig } from '../services/paymentService';
import { tonService } from '../services/tonService-updated';
import { WalletService } from '../services/walletService';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { OrderSummary } from './OrderSummary';

interface CheckoutFlowProps {
  cartItems: OrderItem[];
  onOrderComplete: (order: Order) => void;
  onCancel: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  cartItems,
  onOrderComplete,
  onCancel
}) => {
  const [step, setStep] = useState<'wallet' | 'payment-method' | 'processing' | 'complete'>('wallet');
  const [paymentMethod, setPaymentMethod] = useState<'NOWPAYMENTS' | 'TON_NATIVE'>('TON_NATIVE');
  const [order, setOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [tonConnectUI] = useTonConnectUI();
  const orderService = new OrderService();
  const paymentService = new PaymentService(defaultPaymentConfig);
  const walletService = new WalletService(tonConnectUI);

  useEffect(() => {
    if (isConnected && step === 'wallet') {
      setStep('payment-method');
    }
  }, [isConnected, step]);

  const handleWalletConnect = async () => {
    try {
      const user = await walletService.connectWallet();
      setWalletAddress(user.walletAddress);
      setIsConnected(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    }
  };

  const handleCreateOrder = async () => {
    if (!walletAddress) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      const newOrder = await orderService.createOrder({
        userWallet: walletAddress,
        items: cartItems,
        paymentMethod
      });

      setOrder(newOrder);

      if (paymentMethod === 'NOWPAYMENTS') {
        // Create NOWPayments invoice
        const invoice = await paymentService.createNOWPaymentsInvoice(newOrder.id);
        // Open invoice URL in browser
        // This would typically open the invoice URL
        Alert.alert('Payment Required', `Please complete payment at: ${invoice.invoiceUrl}`);
      } else {
        // TON Native payment
        const totalAmount = newOrder.totalAmount.toString();
        const result = await tonService.sendPayment(totalAmount, newOrder.id);

        if (result.success) {
          // Update order with transaction hash
          await orderService.updateOrderPayment(newOrder.id, result.transactionHash!);

          // Verify payment on server
          const verification = await paymentService.verifyTONPayment(newOrder.id, result.transactionHash!);
          if (verification.success) {
            setStep('complete');
            onOrderComplete(newOrder);
          } else {
            Alert.alert('Error', 'Payment verification failed');
            setStep('payment-method');
          }
        } else {
          Alert.alert('Error', result.error || 'Payment failed');
          setStep('payment-method');
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      Alert.alert('Error', 'Failed to create order');
      setStep('payment-method');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderWalletStep = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Connect Your Wallet
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Connect your TON wallet to proceed with the checkout.
      </Text>

      {!isConnected ? (
        <TouchableOpacity
          onPress={handleWalletConnect}
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Connect Wallet</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Wallet Connected</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onCancel}
        style={{
          marginTop: 20,
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: '#f0f0f0'
        }}
      >
        <Text style={{ color: '#333' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentMethodStep = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Choose Payment Method
      </Text>

      <TouchableOpacity
        onPress={() => setPaymentMethod('TON_NATIVE')}
        style={{
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
          backgroundColor: paymentMethod === 'TON_NATIVE' ? '#007AFF' : '#f0f0f0',
          borderWidth: paymentMethod === 'TON_NATIVE' ? 2 : 0,
          borderColor: '#007AFF'
        }}
      >
        <Text style={{
          color: paymentMethod === 'TON_NATIVE' ? 'white' : '#333',
          fontSize: 16
        }}>
          Pay with TON (Native)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setPaymentMethod('NOWPAYMENTS')}
        style={{
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
          backgroundColor: paymentMethod === 'NOWPAYMENTS' ? '#007AFF' : '#f0f0f0',
          borderWidth: paymentMethod === 'NOWPAYMENTS' ? 2 : 0,
          borderColor: '#007AFF'
        }}
      >
        <Text style={{
          color: paymentMethod === 'NOWPAYMENTS' ? 'white' : '#333',
          fontSize: 16
        }}>
          Pay with Crypto (NOWPayments)
        </Text>
      </TouchableOpacity>

      <OrderSummary cartItems={cartItems} totalAmount={cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)} />

      <TouchableOpacity
        onPress={handleCreateOrder}
        style={{
          backgroundColor: '#28a745',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Create Order & Pay</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setStep('wallet')}
        style={{
          marginTop: 10,
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: '#f0f0f0'
        }}
      >
        <Text style={{ color: '#333' }}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ fontSize: 16, marginTop: 20 }}>
        Processing your order...
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' }}>
        Please wait while we process your payment and create your order.
      </Text>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#28a745' }}>
        ✓ Order Complete!
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
        Your order has been successfully created and paid.
      </Text>
      {order && (
        <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>
            Order ID: {order.id}
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            Total: {order.totalAmount} TON
          </Text>
        </View>
      )}

      {/* Order Summary with Product Images */}
      <OrderSummary cartItems={cartItems} totalAmount={cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)} />

      <TouchableOpacity
        onPress={() => onOrderComplete(order!)}
        style={{
          marginTop: 30,
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  switch (step) {
    case 'wallet':
      return renderWalletStep();
    case 'payment-method':
      return renderPaymentMethodStep();
    case 'processing':
      return renderProcessingStep();
    case 'complete':
      return renderCompleteStep();
    default:
      return renderWalletStep();
  }
};
