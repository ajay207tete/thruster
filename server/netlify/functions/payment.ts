import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import nowPaymentsService from '../../services/Nowpayment.service';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  await connectDB();

  try {
    const path = event.path.replace('/.netlify/functions/payment', '');
    const method = event.httpMethod;

    // POST /api/payment/create-invoice
    if (method === 'POST' && path === '/create-invoice') {
      const { amount, currency, orderId, customerEmail } = JSON.parse(event.body || '{}');

      if (!amount || !orderId) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Amount and order ID are required' }),
        };
      }

      const result = await nowPaymentsService.createInvoice({
        amount,
        currency,
        orderId,
        customerEmail
      });

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/status/:paymentId
    if (method === 'GET' && path.startsWith('/status/')) {
      const paymentId = path.replace('/status/', '');
      const result = await nowPaymentsService.getPaymentStatus(paymentId);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/invoice/:invoiceId
    if (method === 'GET' && path.startsWith('/invoice/')) {
      const invoiceId = path.replace('/invoice/', '');
      const result = await nowPaymentsService.getInvoiceStatus(invoiceId);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/currencies
    if (method === 'GET' && path === '/currencies') {
      const result = await nowPaymentsService.getCurrencies();

      return {
        statusCode: result.success ? 200 : 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/min-amount
    if (method === 'GET' && path === '/min-amount') {
      const queryParams = event.queryStringParameters || {};
      const currencyFrom = queryParams.currency_from;
      const currencyTo = queryParams.currency_to || 'usd';

      if (!currencyFrom) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'currency_from parameter is required' }),
        };
      }

      const result = await nowPaymentsService.getMinAmount(currencyFrom, currencyTo);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/estimate
    if (method === 'GET' && path === '/estimate') {
      const queryParams = event.queryStringParameters || {};
      const amount = queryParams.amount;
      const currencyFrom = queryParams.currency_from;
      const currencyTo = queryParams.currency_to;

      if (!amount || !currencyFrom || !currencyTo) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'amount, currency_from, and currency_to parameters are required' }),
        };
      }

      const result = await nowPaymentsService.getEstimatedPrice(amount, currencyFrom, currencyTo);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // POST /api/payment/callback
    if (method === 'POST' && path === '/callback') {
      const ipnData = JSON.parse(event.body || '{}');
      const result = await nowPaymentsService.processIPNCallback(ipnData);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // POST /api/payment/refund
    if (method === 'POST' && path === '/refund') {
      const { paymentId, refundAmount } = JSON.parse(event.body || '{}');

      if (!paymentId) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Payment ID is required' }),
        };
      }

      const result = await nowPaymentsService.refundPayment(paymentId, refundAmount);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/history
    if (method === 'GET' && path === '/history') {
      const queryParams = event.queryStringParameters || {};
      const limit = parseInt(queryParams.limit || '100');
      const offset = parseInt(queryParams.offset || '0');

      const result = await nowPaymentsService.getPaymentHistory(limit, offset);

      return {
        statusCode: result.success ? 200 : 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/payment/balance
    if (method === 'GET' && path === '/balance') {
      const result = await nowPaymentsService.getMerchantBalance();

      return {
        statusCode: result.success ? 200 : 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
    };

  } catch (error: any) {
    console.error('Payment function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
