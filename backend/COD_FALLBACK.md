# Cash on Delivery (COD) Fallback Option

## Temporary Solution While Getting PhonePe Credentials

If you need to accept orders immediately while waiting for valid PhonePe credentials, you can enable COD as a fallback payment method.

## Quick Implementation

### Option 1: COD Only (Simplest)

Keep the existing order creation endpoint and simply change the button text to "Place Order (COD)".

**In Checkout.vue**, change line 122-124 from:
```vue
<button type="submit" class="submit-button" :disabled="isProcessingPayment">
  Proceed to Payment - ₹{{ cartTotal }}
</button>
```

To:
```vue
<button type="submit" class="submit-button">
  Place Order (Cash on Delivery) - ₹{{ cartTotal }}
</button>
```

And revert the `handleSubmit` function to use the original `/api/orders` endpoint instead of `/api/payment/initiate`.

### Option 2: Dual Payment Mode

Add a payment method selector before checkout:
- PhonePe (when credentials are ready)
- Cash on Delivery (available now)

## Steps to Enable COD Fallback

1. Update Checkout.vue to allow payment method selection
2. If COD selected: Use original order creation
3. If PhonePe selected: Use payment initiation

This way you can accept orders immediately while sorting out PhonePe credentials.

## When PhonePe is Ready

Simply update the environment variables with valid credentials and the online payment will work automatically.

