# Orders Module - Implementation Guide

## ✅ Implementation Complete

Your Orders module is fully functional with Firebase Firestore integration.

---

## 🚀 Quick Start

### 1. **Service Layer** (`/src/services/orderService.js`)

Two main functions:

#### `getOrders()`
- Fetches all orders from Firestore `orders` collection
- Orders sorted by `createdAt` (newest first)
- Returns array of order objects with ID

#### `updateOrderStatusWithHistory(orderId, newStatus, currentHistory)`
- Updates order status
- Maintains status history with timestamps
- Updates `updatedAt` timestamp
- Valid statuses: `pending` → `confirmed` → `shipped` → `delivered`

---

## 📊 Orders UI Features

### Dashboard Metrics
- **Total Orders** - All orders count
- **Pending** - Orders awaiting confirmation
- **Delivered** - Completed orders
- **Total Revenue** - Sum of all order amounts

### Order Table
Display per order:
- Order ID + Customer Name
- Item count
- Total amount
- Current status with next-status button
- Created date
- Expand button for details

### Order Details (Expandable)
- **Items** - Product name, quantity, price at order
- **Pricing** - Subtotal, delivery, tax, total
- **Shipping Address** - Full address
- **Payment** - Method & status
- **Status History** - Timeline of all status changes

### Status Updates
- Click **→** button to advance status
- Status flows: `pending` → `confirmed` → `shipped` → `delivered`
- Real-time UI update (no page reload)
- Status history automatically maintained

---

## 🧪 Testing - Create Sample Orders

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **outfy-44079**
3. Navigate to **Firestore Database**

### Step 2: Create Collection
1. Click **Create collection** → `orders`
2. This will create the collection

### Step 3: Add Sample Orders

Create 2-3 test orders with this EXACT structure:

```json
{
  "userId": "user123",
  "userSnapshot": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "items": [
    {
      "productId": "prod_001",
      "name": "Essential Oversized Hoodie",
      "priceAtOrder": 1299,
      "quantity": 2,
      "image": "https://example.com/hoodie.jpg",
      "variant": "Black, M"
    },
    {
      "productId": "prod_002",
      "name": "Classic T-Shirt",
      "priceAtOrder": 499,
      "quantity": 1,
      "image": "https://example.com/tshirt.jpg",
      "variant": "White, L"
    }
  ],
  "pricing": {
    "subtotal": 3097,
    "deliveryCharge": 100,
    "tax": 500,
    "totalAmount": 3697
  },
  "payment": {
    "method": "ONLINE",
    "status": "paid"
  },
  "shippingAddress": {
    "line1": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "status": "pending",
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": <server timestamp>
    }
  ],
  "createdAt": <server timestamp>,
  "updatedAt": <server timestamp>
}
```

### Step 4: Test in Admin Panel

1. Open your admin panel
2. Navigate to **Orders** page
3. Verify:
   - ✅ Orders load from Firestore
   - ✅ Customer names display
   - ✅ Amounts show correctly
   - ✅ Status badge shows "pending"

### Step 5: Test Status Update

1. Click **→** button on a pending order
2. Status should change to "confirmed"
3. Expand order to see:
   - ✅ Status changed
   - ✅ Status history updated with timestamp

4. Continue updating through all statuses:
   - pending → confirmed → shipped → delivered
5. Verify UI updates without page reload

---

## 🔧 Firebase Rules

Ensure your Firestore Security Rules allow reads/writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📝 Data Format Notes

✅ **Timestamps**: Use Firestore's `serverTimestamp()`
✅ **Status History**: Array of `{status, timestamp}` objects
✅ **User Snapshot**: Store user data WITH order (don't fetch separately)
✅ **Order ID**: Use Firestore doc.id automatically

---

## 🛠️ API Reference

### orderService.js

#### `getOrders()`
```javascript
const orders = await getOrders();
// Returns: [{id, userId, userSnapshot, items, pricing, ... }, ...]
```

#### `updateOrderStatusWithHistory(orderId, newStatus, currentHistory)`
```javascript
await updateOrderStatusWithHistory(
  "orderId123",
  "confirmed",
  currentHistory
);
```

---

## 🎨 UI Behavior

- **Metrics update in real-time** after status changes
- **Status history displays in timeline** format with timestamps
- **Expandable rows** show full order details
- **Error handling** displays in-order error messages
- **Loading states** for async operations

---

## ⚠️ Important

- **Do NOT** manually add status history - it's managed by the service
- **Do NOT** use custom order IDs - Firestore generates them
- **Do NOT** fetch user data separately - include with order
- **Status flow is sequential** - can only advance one step at a time

---

## 🐛 Troubleshooting

### Orders not loading?
- Check Firestore Security Rules allow reads
- Verify collection is named exactly `orders`
- Check browser console for errors

### Status update fails?
- Verify order status is one of: `pending|confirmed|shipped|delivered`
- Check Firestore Rules allow writes
- Check currentHistory is passed correctly

### Timestamps show strange values?
- Ensure serverTimestamp() is used in Firestore
- Check Firestore console for actual timestamp values

---

## 📚 Next Steps (Not in v1)

- Add order filters by status
- Search orders by customer name
- Export orders as CSV
- Order detail modal
- Cancel order functionality
- Refund processing

