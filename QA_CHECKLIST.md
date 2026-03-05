# CrackersHub - E-Commerce QA Checklist
## Razorpay Payment Flow Verification

**Project:** CrackersHub  
**Frontend:** React (Vite) → http://localhost:5173  
**Backend:** Node.js + Express → http://localhost:5000  
**Payment Gateway:** Razorpay (Test Mode)  
**Date:** February 27, 2026  

---

## STEP 1: Pre-Flight Checklist ✅

### Environment Setup
- [ ] Backend `.env` file created with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Frontend `.env.local` file created with `VITE_RAZORPAY_KEY_ID`
- [ ] Node.js version checked (v18+)
- [ ] All dependencies installed (`npm install` in both root and backend)

### Backend Verification
- [ ] Backend running at `http://localhost:5000`
- [ ] GET `/` returns health check message
- [ ] GET `/health` responds with status "healthy"
- [ ] POST `/api/payment/create-order` endpoint accessible
- [ ] POST `/api/payment/verify` endpoint accessible

### Frontend Verification
- [ ] Frontend running at `http://localhost:5173`
- [ ] No Vite build errors
- [ ] React components load without console errors
- [ ] Razorpay script loads successfully

---

## STEP 2: Homepage Verification

### URL: http://localhost:5173

**Expected Behavior:**
- [ ] Page loads without blank screen
- [ ] Navigation bar visible with logo and menu
- [ ] Footer renders at bottom
- [ ] Hero section with featured products displays
- [ ] Product cards show with:
  - [ ] Product image (or placeholder)
  - [ ] Product name
  - [ ] Original price (struck out)
  - [ ] Discount price (highlighted)
  - [ ] "Add to Cart" button
  - [ ] Rating/review count

**Browser Console Checks:**
- [ ] No red errors (❌)
- [ ] No CORS warnings
- [ ] No undefined variable errors
- [ ] No failed resource loads

**Network Tab Checks (F12 → Network):**
- [ ] `checkout.razorpay.com` script loads successfully (or is blocked by adblocker - OK)
- [ ] No 404 errors for assets
- [ ] No failed API calls

**Console Command to Verify:**
```javascript
console.log(window.Razorpay) // Should eventually exist after script loads
```

---

## STEP 3: Products & Cart Flow

### Navigate to: http://localhost:5173/products

**Verify Product List:**
- [ ] At least 5+ products visible in grid
- [ ] Each product card displays:
  - [ ] Product name
  - [ ] Category badge
  - [ ] Original and discounted prices (prices are numbers, not "undefined")
  - [ ] Star rating
  - [ ] "Add to Cart" button
  - [ ] Stock indicator (if applicable)

**Add Products to Cart:**
1. Click "Add to Cart" on first product
   - [ ] Navbar cart count changes (e.g., "Cart (1)")
   - [ ] Toast notification appears: "Added to cart!"
   - [ ] No console errors

2. Click "Add to Cart" on second product
   - [ ] Navbar cart count updates to "Cart (2)"
   - [ ] Toast notification appears again
   - [ ] No console errors

3. Click product name to view details
   - [ ] ProductDetailPage loads
   - [ ] Product info displays correctly
   - [ ] "Add to Cart" button works on detail page
   - [ ] Quantity selector works (+ and - buttons)
   - [ ] Price calculation updates when quantity changes

### Navigate to: http://localhost:5173/cart

**Verify Cart Page:**
- [ ] Both added products display
- [ ] Each item shows:
  - [ ] Product name
  - [ ] Product image
  - [ ] Unit price (NOT undefined)
  - [ ] Quantity selector with +/- buttons
  - [ ] Item total (unit price × quantity)
  - [ ] Remove button (trash icon)
- [ ] Cart summary shows:
  - [ ] Subtotal (correct calculation)
  - [ ] Total savings (if applicable)
  - [ ] Delivery fee (₹99 if subtotal < ₹999, else ₹0)
  - [ ] Grand Total (correct)

**Test Cart Operations:**
1. Increase quantity of one product
   - [ ] Item total updates immediately
   - [ ] Grand total recalculates
   - [ ] Cart subtotal matches manual calculation

2. Decrease quantity back to 1
   - [ ] Item total updates correctly
   - [ ] Grand total recalculates

3. Remove one product
   - [ ] Product removed from cart
   - [ ] Cart count in navbar updates
   - [ ] Grand total recalculates
   - [ ] Toast shows: "Removed from cart"

**localStorage Verification (Console):**
```javascript
const cart = JSON.parse(localStorage.getItem('cart'));
console.log(cart); // Should show array of cart items with valid prices
```

---

## STEP 4: Checkout Page

### Click "Proceed to Checkout" Button

**Expected Behavior:**
- [ ] Browser navigates to `http://localhost:5173/checkout`
- [ ] Page loads without blank screen or errors
- [ ] No console errors about missing props or components

**Verify Address Form Renders:**
- [ ] Form section visible with title "Contact Information"
- [ ] Address form section titled "Delivery Address"
- [ ] All input fields display:
  - [ ] Full Name (required)
  - [ ] Email Address (required)
  - [ ] Mobile Number (required) with +91 prefix
  - [ ] Street Address (required)
  - [ ] City (required)
  - [ ] State (required)
  - [ ] PIN Code (required)

**Form Input Testing:**
1. Leave all fields empty and click "Pay Securely"
   - [ ] Validation errors appear under each field
   - [ ] Error messages are clear:
     - "Full name is required."
     - "Enter a valid email."
     - "Enter a valid 10-digit mobile number."
     - "Enter a valid 6-digit PIN code."
   - [ ] Page doesn't crash or hang

2. Enter invalid data:
   - [ ] Invalid email: "test" → shows "Enter a valid email."
   - [ ] Invalid phone: "123" → shows error
   - [ ] Invalid PIN: "12345" → shows "Enter a valid 6-digit PIN code."

3. Enter valid data:
   ```
   Full Name: Ravi Kumar
   Email: ravi@example.com
   Mobile: 9876543210
   Address: 123 Main Street
   City: Mumbai
   State: Maharashtra
   PIN: 400001
   ```
   - [ ] No validation errors
   - [ ] Form is ready to submit

**Verify Order Summary (Right Panel):**
- [ ] Order items list shows added products
- [ ] Each item displays: product name + quantity + price
- [ ] Subtotal displays correctly
- [ ] Delivery fee shows (₹0 or ₹99)
- [ ] **Grand Total matches cart page**
- [ ] All prices are numbers (not "undefined")

---

## STEP 5: Razorpay Order Creation

### Click "Pay Securely" Button (with valid form data)

**Expected Backend Flow:**

**Check Backend Terminal Logs:**
```
[2026-02-27T...] POST /api/payment/create-order
```
- [ ] Request logged in backend terminal
- [ ] No errors in backend terminal

**Check Network Tab (F12 → Network → XHR):**
1. Find request: `POST http://localhost:5000/api/payment/create-order`
   - [ ] Status: **200** (success)
   - [ ] Request Headers include:
     - [ ] `Content-Type: application/json`
   - [ ] Request Body shows:
     ```json
     {
       "amount": [grandTotal * 100],  // e.g., 51799 paise for ₹517.99
       "currency": "INR",
       "receipt": "rcpt_XXXXXXXXXXXX",
       "notes": { "address": "..." }
     }
     ```

**Check Network Response:**
- [ ] Status: 200
- [ ] Response Preview shows:
   ```json
   {
     "success": true,
     "order": {
       "id": "order_XXXXXXXXXXXXXXXX",
       "amount": 51799,
       "currency": "INR",
       "receipt": "rcpt_XXXXXXXXXXXX",
       "status": "created"
     }
   }
   ```

**Verify Backend Response Structure:**
- [ ] `success` is `true`
- [ ] `order.id` exists (starts with "order_")
- [ ] `order.amount` equals frontend calculation (in paise)
- [ ] `order.currency` is "INR"
- [ ] `order.status` is "created"

**If Order Creation Fails:**
- [ ] Check backend console for error
- [ ] Verify `.env` has valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Check if Razorpay API credentials are test/live keys

---

## STEP 6: Razorpay Modal Opens

**Expected Behavior:**
- [ ] Razorpay modal/overlay appears (dark background)
- [ ] Modal shows:
  - [ ] "CrackersHub" merchant name
  - [ ] Product description: "Premium Crackers for Your Celebration 🧨"
  - [ ] Amount: Grand total in INR (e.g., "₹517.99")
  - [ ] Razorpay logo
  - [ ] Payment method options (Credit Card, Debit Card, UPI, etc.)

**Verify Form Pre-Fill:**
- [ ] Name field shows: "Ravi Kumar" (from checkout form)
- [ ] Email shows: "ravi@example.com"
- [ ] Phone shows: "9876543210" or with country code

**Razorpay Script Check (Console):**
```javascript
console.log(window.Razorpay) // Should show [Function: Razorpay]
console.log(Razorpay.isSupported()) // Should return true
```

**If Modal Doesn't Open:**
1. Check browser console for errors:
   - [ ] "Failed to load Razorpay SDK" → Check script URL or adblocker
   - [ ] "Razorpay is not defined" → SDK not loaded

2. Verify HTML has Razorpay script:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```
   - [ ] Script is present in `index.html` or dynamically loaded

3. Check Network tab:
   - [ ] `checkout.razorpay.com` shows status 200 (or 304 cached)
   - [ ] If blocked: Adblocker may be preventing it (disable for testing)

---

## STEP 7: Test Payment with Razorpay Test Card

### Inside Razorpay Modal:

1. Select Payment Method: **Credit Card**

2. Enter Test Card Details:
   ```
   Card Number:  4111 1111 1111 1111
   Expiry Date:  12/25 (any future date)
   CVV:          123
   ```

3. Click "Pay" button
   - [ ] Modal shows loading/processing state
   - [ ] OTP verification screen appears (or auto-submits)

4. Enter OTP (if asked):
   ```
   OTP: 123456
   ```

5. Click "Submit" or "Verify OTP"
   - [ ] Loading state continues
   - [ ] Modal shows "Processing payment..."

**Expected Success Flow:**
- [ ] Modal closes automatically
- [ ] Browser stays on checkout page (doesn't error out)
- [ ] Success message appears: "🎉 Payment successful! Your order is confirmed."
- [ ] Success page displays with:
  - [ ] Checkmark animation (✓)
  - [ ] Order ID: "order_XXXXXXXXXXXX"
  - [ ] Payment ID: "pay_XXXXXXXXXXXX"
  - [ ] Amount Paid: Grand total
  - [ ] "Back to Home" and "Continue Shopping" buttons

**If Payment Fails in Modal:**
- [ ] Modal shows error message
- [ ] Check if test card is correctly entered
- [ ] Try again with card: `4111 1111 1111 1111`
- [ ] If still fails, check Razorpay test credentials

---

## STEP 8: Payment Verification (Backend)

### Check Backend Terminal Logs:

**Expected flow after payment success:**
```
[2026-02-27T...] POST /api/payment/verify
```
- [ ] Request logged in backend
- [ ] No errors in backend console

### Check Network Tab (F12 → Network → XHR):

**Find request: `POST http://localhost:5000/api/payment/verify`**
- [ ] Status: **200** (success)
- [ ] Request Body contains:
   ```json
   {
     "razorpay_order_id": "order_XXXXXXXXXXXX",
     "razorpay_payment_id": "pay_XXXXXXXXXXXX",
     "razorpay_signature": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   }
   ```

### Verify Response:
- [ ] Status: 200
- [ ] Response shows:
   ```json
   {
     "success": true,
     "message": "Payment verified successfully.",
     "payment": {
       "orderId": "order_XXXXXXXXXXXX",
       "paymentId": "pay_XXXXXXXXXXXX"
     }
   }
   ```

### Backend Signature Verification (Console Logs):
```
[verify] Payment verified successfully: pay_XXXXXXXXXXXX
```
- [ ] This log appears (confirms signature was valid)

**If Verification Fails:**
- [ ] Backend logs show: `[verify] Signature mismatch for order: order_XXXXXXXXXXXX`
- [ ] Check if `RAZORPAY_KEY_SECRET` in `.env` is correct
- [ ] Verify signature calculation in backend:
   ```javascript
   const body = razorpay_order_id + "|" + razorpay_payment_id;
   const expectedSignature = crypto
     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
     .update(body)
     .digest("hex");
   ```

---

## STEP 9: Post-Payment Verification

### Check Success Page:
- [ ] Success message displays prominently
- [ ] Order ID and Payment ID shown
- [ ] Amount matches checkout total
- [ ] Animation runs smoothly (no lag)

### Check localStorage (Console):
```javascript
const cart = JSON.parse(localStorage.getItem('cart'));
console.log(cart); // Should be empty [] after successful payment
```
- [ ] Cart is cleared (empty array or null)

### Check Navbar:
- [ ] Cart count in navbar reset to 0 or hidden
- [ ] Navigation links still work

### Check Page Navigation:
1. Click "Back to Home"
   - [ ] Redirects to homepage (http://localhost:5173/)
   - [ ] Home page loads normally
   - [ ] Cart count shows 0

2. Click "Continue Shopping"
   - [ ] Redirects to products page
   - [ ] Products display normally
   - [ ] Cart is empty

---

## STEP 10: Edge Cases & Error Handling

### Test Payment Cancellation:
1. Go back to checkout
2. Add items to cart again
3. Click "Pay Securely"
4. In Razorpay modal, close/cancel the payment
   - [ ] Modal closes
   - [ ] Error toast appears (or not shown if user cancelled)
   - [ ] Cart still contains items
   - [ ] Can try payment again

### Test Network Error:
1. Open DevTools (F12) → Network tab
2. Set throttling to "Offline"
3. Try to proceed to checkout
   - [ ] Error toast appears or error message shows
   - [ ] Page doesn't crash

### Test with Different Amounts:
1. Add one expensive product (₹2000+)
   - [ ] Delivery fee: ₹0 (free shipping for ₹999+)
   - [ ] Grand total correct
   - [ ] Payment processes successfully

2. Add cheap items (total < ₹999)
   - [ ] Delivery fee: ₹99
   - [ ] Grand total includes fee
   - [ ] Payment processes successfully

---

## DEBUGGING GUIDE

### Issue: "Razorpay is not defined" Error

**Cause:** Razorpay script not loaded  
**Fix:**
```javascript
// Check if script is loaded
console.log(!!window.Razorpay) // Should be true

// Check Network tab for https://checkout.razorpay.com/v1/checkout.js
// If blocked: Disable adblocker
// If 404: Check internet connection
```

---

### Issue: "Failed to create payment order" Error

**Cause:** Backend `/api/payment/create-order` error  
**Fix:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Check for errors:
# 1. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env
# 2. Invalid Razorpay credentials (not test keys)
# 3. Network request body missing 'amount' or 'receipt'
```

---

### Issue: "Payment verification failed. Invalid signature." Error

**Cause:** Razorpay signature mismatch  
**Root Cause:** Wrong `RAZORPAY_KEY_SECRET` in backend `.env`  
**Fix:**
```bash
# In backend/.env:
# Copy SECRET from: https://dashboard.razorpay.com/app/keys
# Must match EXACTLY (including hyphens, underscores, etc.)

RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

---

### Issue: Cart Not Clearing After Payment

**Cause:** `clearCart()` function not called  
**Fix:**
```javascript
// In CheckoutPage.jsx, verify clearCart() is called in onSuccess:
onSuccess: (details) => {
    setPaymentDetails(details);
    setPaymentStatus("success");
    clearCart(); // ← Make sure this line exists
}
```

---

### Issue: Amount Mismatch (Frontend vs Backend)

**Cause:** Incorrect paise conversion  
**Frontend:** `grandTotal * 100` (₹517.99 → 51799 paise) ✓  
**Backend:** Expects amount in paise (51799) ✓  

**Verify:**
```javascript
// Frontend Console:
console.log(grandTotal * 100) // e.g., 51799

// Network tab → Request body:
// "amount": 51799 ✓ (correct)
```

---

### Issue: Form Validation Not Working

**Cause:** Validation logic error  
**Fix:**
```javascript
// In CheckoutPage.jsx, validate() should check:
if (!form.name.trim()) errs.name = "Full name is required.";
if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = "Enter a valid 10-digit mobile number.";
if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "Enter a valid 6-digit PIN code.";
```

---

## Summary Checklist

- [ ] All pre-flight checks passed
- [ ] Homepage loads without errors
- [ ] Products display with correct prices (no "undefined")
- [ ] Cart adds/removes items correctly
- [ ] Checkout form validates properly
- [ ] Razorpay modal opens successfully
- [ ] Payment processing completes
- [ ] Payment verification succeeds with valid signature
- [ ] Success page displays correct order details
- [ ] Cart clears after successful payment
- [ ] No console errors or warnings
- [ ] No CORS issues
- [ ] All network requests return 200 status
- [ ] Navigation works smoothly throughout flow

---

## Test Card (Razorpay Test Mode)

| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry | Any future date (e.g., 12/25) |
| CVV | 123 |
| OTP | 123456 |
| Status | ✅ Always succeeds in test mode |

---

## Useful Console Commands

```javascript
// Check cart state
JSON.parse(localStorage.getItem('cart'))

// Check if Razorpay loaded
window.Razorpay

// Monitor network requests (in Network tab)
// Filter by: XHR
// Look for: /api/payment/create-order and /api/payment/verify

// Clear localStorage (to reset cart)
localStorage.clear()

// Check environment variables (frontend)
import.meta.env.VITE_RAZORPAY_KEY_ID
```

---

## Next Steps if All Passed

✅ **All tests passed?** Great! Your payment flow is production-ready.

🔹 **Production Checklist:**
- [ ] Switch to live Razorpay credentials
- [ ] Update `VITE_RAZORPAY_KEY_ID` in frontend `.env`
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend `.env`
- [ ] Enable SSL/HTTPS in production
- [ ] Implement database order storage (TODO in backend)
- [ ] Set up email notifications
- [ ] Test with real payment methods
- [ ] Enable rate limiting on payment endpoints
- [ ] Monitor Razorpay dashboard for suspicious activity

---

**Test Completed By:** [Your Name]  
**Date:** [Date]  
**Result:** ✅ PASSED / ❌ FAILED
