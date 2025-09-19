# NowPayments Integration Fixes - Testing Plan

## Issues Identified and Fixed
- [x] **price_amount type mismatch**: Fixed - getTotalPrice() returns number, used correctly.
- [x] **API_BASE_URL for mobile**: Fixed - Updated to IP address in api.ts.
- [x] **Missing IPN callback**: Added ipn_callback_url to payment payload.
- [x] **Placeholder URLs**: Kept as placeholders for now (success_url, cancel_url).
- [x] **Hardcoded userId**: Kept as 'user123' for testing.
- [x] **Error handling**: Improved with detailed console logs and user alerts.
- [x] **Added payment callback route**: Created server/routes/paymentCallback.js for IPN handling.

## Current Status
- Payment creation logic updated with better error handling.
- Order creation integrated after payment.
- Redirect to hosted checkout or show payment info.
- Added debug logging throughout the flow.

## Testing Steps
1. Start server: `cd server && npm start` (runs on port 5002)
2. Update client API_BASE_URL to your machine's IP (e.g., 192.168.1.100:5002)
3. Start client: `cd client && npm start`
4. Add items to cart
5. Go to checkout
6. Fill shipping info (name, email, address required)
7. Click "Pay with BTC" (or other currency)
8. Check console logs for payment creation
9. Check if alert appears with hosted checkout URL
10. Click OK to open payment page
11. If no hosted URL, check payment info display

## Debugging
- Check console logs in client for "Creating payment with payload" and "Payment response"
- Check server logs for order creation
- Verify API key is valid (may need to update in nowpaymentsapi.ts)
- Ensure server is accessible from mobile emulator (use IP not localhost)
- If payment fails, check network tab for API errors

## Next Steps
- Test the flow and report any errors
- Update API key if invalid
- Implement real user authentication
- Add payment status polling
- Handle payment success/failure callbacks
