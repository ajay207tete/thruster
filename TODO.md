# NowPayments Integration TODO

## Current Status
- [x] Analyzed existing NowPayments integration
- [x] Identified need to create order before payment

## Tasks to Complete
- [x] Modify checkout.tsx to create order before payment
- [ ] Update payment.ts to handle order creation and invoice
- [ ] Test payment flow end-to-end
- [ ] Verify order creation and status updates

## Implementation Steps
1. Update checkout.tsx to create order with shipping details
2. Modify payment.ts create-invoice to use order ID
3. Ensure proper error handling and flow
4. Test complete payment process
