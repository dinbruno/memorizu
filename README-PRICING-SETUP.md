# 🔒 Publication Pricing Setup (SECURITY CRITICAL)

## ⚠️ IMPORTANT SECURITY NOTICE

The publication pricing is now stored securely in Firebase to prevent client-side manipulation. This prevents users from modifying prices in the browser.

## Setup Instructions

### 1. Start your development server

```bash
npm run dev
```

### 2. Initialize pricing in Firebase

Call the admin API to set up default pricing:

```bash
curl -X POST http://localhost:3000/api/admin/init-pricing
```

Or visit: `http://localhost:3000/api/admin/init-pricing` in your browser with a POST request.

### 3. Verify pricing is set

Check that pricing is working:

```bash
curl http://localhost:3000/api/publication/pricing
```

Expected response:

```json
{
  "price": 4.99,
  "currency": "usd",
  "description": "Page Publication Fee"
}
```

## How It Works

### 🔒 Security Flow

1. **Frontend** requests pricing from `/api/publication/pricing`
2. **API** fetches pricing from Firebase (server-side only)
3. **Payment** uses server-side pricing (never client-side)
4. **Stripe** receives the secure pricing from Firebase

### 📁 Firebase Structure

```
config/
  └── publication/
      ├── price: 4.99
      ├── currency: "usd"
      ├── description: "Page Publication Fee"
      ├── createdAt: [timestamp]
      └── updatedAt: [timestamp]
```

## Changing Prices

### Option 1: Direct Firebase Console

1. Go to Firebase Console → Firestore
2. Navigate to `config/publication`
3. Update the `price` field
4. Changes are immediate

### Option 2: API (Recommended for production)

Create an admin interface that calls:

```javascript
await updatePublicationPricing({
  price: 9.99,
  currency: "usd",
  description: "Premium Page Publication",
});
```

## Security Benefits ✅

- ❌ **Before**: Price was in client-side code (hackable)
- ✅ **After**: Price comes from Firebase (secure)
- ✅ Payment intent created with server-side pricing
- ✅ No way for users to manipulate pricing
- ✅ Centralized pricing management
- ✅ Audit trail via Firebase timestamps

## Files Modified

- `lib/firebase/firestore-service.ts` - Added pricing functions
- `lib/stripe/publication-service.ts` - Fetch pricing from Firebase
- `components/payment/publication-payment-dialog.tsx` - Dynamic pricing
- `app/api/publication/pricing/route.ts` - Pricing API
- `app/api/admin/init-pricing/route.ts` - Admin setup API
