# 🎯 Outfy Admin Panel

A modern, feature-rich e-commerce admin panel built with **React**, **Vite**, and **Firebase**. Manage your products, users, orders, and store metrics from a beautiful, responsive dashboard.

![Admin Panel](https://img.shields.io/badge/Status-Production%20Ready-green) ![React](https://img.shields.io/badge/React-19.2-blue) ![Firebase](https://img.shields.io/badge/Firebase-12.11-yellow) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📊 Dashboard
- Real-time metrics (Total Users, Products, Orders, Revenue)
- Low stock alerts for inventory management
- Recent orders with status tracking
- New user signups notification
- Responsive metrics cards with dynamic data

### 📦 Products Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 📸 Multiple image uploads to Firebase Storage
- 🔗 URL-based image input
- 🏷️ 25 predefined product categories
- 📌 Size & stock management per size
- 💰 Price and original price tracking
- 🎯 Target audience selection (Unisex, Men, Women, Kids)
- 🔍 Real-time search and category filtering
- 📝 Product descriptions with textarea
- ✔️ Active/Inactive product toggle

### 👥 Users Management
- View all registered users
- Block/Unblock users
- Delete user accounts
- User status indicators
- User details modal with all information
- Real-time user count

### 📋 Orders Management
- View all orders with full details
- Order status workflow (Pending → Confirmed → Shipped → Delivered)
- Status history with timestamps
- Customer information snapshot
- Item-by-item order details
- Shipping address and payment info
- Real-time revenue calculation
- Expandable order details

### 🔐 Authentication
- Google Sign-in integration
- Multi-admin email support (easily add more admins)
- Role-based access control
- Automatic redirect for authenticated users
- Secure logout functionality

### 🎨 UI/UX
- Dark theme design with gradient accents
- Fully responsive (Mobile, Tablet, Desktop)
- Smooth animations and transitions
- Loading & error states
- Modal forms with validation
- Accessible design patterns

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19.2 |
| **Build Tool** | Vite 8.0 |
| **Database** | Firebase Firestore |
| **Storage** | Firebase Storage |
| **Authentication** | Firebase Auth (Google) |
| **Routing** | React Router DOM 7.13 |
| **Icons** | React Icons 5.6 |
| **Styling** | CSS3 with CSS Grid & Flexbox |
| **Package Manager** | npm |

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v16+ installed
- **npm** package manager
- **Firebase project** created (with Firestore, Storage, and Auth enabled)
- **Google OAuth credentials** (for Sign-in)
- **2 Admin email addresses** (for access control)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/outfy-admin-panel.git
cd outfy-admin-panel/admin-penal-outfy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
Update `src/firebase/firebase_config.js` with your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 4. Add Admin Emails
Edit `src/pages/Login.jsx` and `src/components/ProtectedRoute.jsx`:
```javascript
const ADMIN_EMAILS = [
  "admin1@example.com",
  "admin2@example.com"
];
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
outify-admin-panel/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout wrapper with sidebar
│   │   ├── Sidebar.jsx         # Sidebar navigation
│   │   ├── ProtectedRoute.jsx  # Route protection logic
│   │   ├── Layout.css          # Layout styles
│   │   └── Sidebar.css         # Sidebar styles
│   │
│   ├── pages/
│   │   ├── Login.jsx           # Google Sign-in page
│   │   ├── Dashboard.jsx       # Main dashboard with metrics
│   │   ├── Products.jsx        # Product management
│   │   ├── Users.jsx           # User management
│   │   ├── Orders.jsx          # Order management
│   │   └── [pages].css         # Page-specific styles
│   │
│   ├── services/
│   │   ├── productService.js   # Product CRUD & Firebase ops
│   │   ├── userService.js      # User CRUD & Firebase ops
│   │   ├── orderService.js     # Order CRUD & Firebase ops
│   │   └── dashboardService.js # Dashboard data fetching
│   │
│   ├── firebase/
│   │   └── firebase_config.js  # Firebase initialization
│   │
│   ├── assets/                 # Images, fonts, etc.
│   ├── App.jsx                 # Main app router
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint rules
└── README.md                   # This file
```

---

## 🔐 Authentication & Access Control

### Admin Emails Setup
Only specified email addresses can access the admin panel. Add your admin emails here:

**File:** `src/pages/Login.jsx` (Line 6)
```javascript
const ADMIN_EMAILS = [
  "csakre634@gmail.com",
  "admin@example.com",  // Add your second admin
  // Add more as needed
];
```

**Also update:** `src/components/ProtectedRoute.jsx` (Line 6) with the same array.

### Login Flow
1. User clicks "Sign in with Google"
2. Firebase authenticates via Google OAuth
3. System checks if email is in `ADMIN_EMAILS` array
4. ✅ If yes → Redirect to Dashboard
5. ❌ If no → Sign out and show error

---

## 📊 Module Details

### Dashboard Module
- **Location:** `src/pages/Dashboard.jsx`
- **Service:** `src/services/dashboardService.js`
- **Features:**
  - Real-time data from Firebase
  - 4 metric cards (Users, Products, Orders, Revenue)
  - Low stock alerts (items with stock < 10)
  - Recent 5 orders with status
  - Recent 5 user signups
  - Loading and error states

### Products Module
- **Location:** `src/pages/Products.jsx`
- **Service:** `src/services/productService.js`
- **Features:**
  - Add/Edit/Delete products
  - Upload multiple images (Firebase Storage)
  - Paste image URLs
  - 25 predefined categories
  - Size & stock management
  - Real-time search
  - Category filtering
  - Price tracking

**Product Schema:**
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  originalPrice: number,
  category: string,
  target: "unisex" | "men" | "women" | "kids",
  sizes: [{ label: string, stock: number }],
  imageURLs: [string],
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Users Module
- **Location:** `src/pages/Users.jsx`
- **Service:** `src/services/userService.js`
- **Features:**
  - View all registered users
  - Block/Unblock accounts
  - Delete users
  - User status indicators
  - User details modal

**User Schema:**
```javascript
{
  id: string,
  email: string,
  name: string,
  phone: string,
  isBlocked: boolean,
  createdAt: timestamp
}
```

### Orders Module
- **Location:** `src/pages/Orders.jsx`
- **Service:** `src/services/orderService.js`
- **Features:**
  - View all orders
  - Update order status
  - Status history with timestamps
  - Expandable order details
  - Real-time metrics

**Order Schema:**
```javascript
{
  id: string,
  userId: string,
  customerName: string,
  items: [{productId, name, quantity, priceAtOrder, ...}],
  pricing: {subtotal, deliveryCharge, tax, totalAmount},
  payment: {method, status},
  shippingAddress: {line1, city, state, pincode},
  status: "pending" | "confirmed" | "shipped" | "delivered",
  statusHistory: [{status, timestamp}],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 📦 Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot module reloading.

### Build
```bash
npm run build
```
Creates an optimized production build in the `dist` folder.

### Preview
```bash
npm run preview
```
Preview the production build locally.

### Lint
```bash
npm run lint
```
Run ESLint to check code quality.

---

## 🔥 Firebase Setup Guide

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Follow the setup wizard

### 2. Enable Firestore
1. Navigate to **Firestore Database**
2. Click **Create Database**
3. Choose "Start in test mode" (or configure rules)
4. Create collections: `users`, `products`, `orders`

### 3. Enable Firebase Storage
1. Navigate to **Storage**
2. Click **Get Started**
3. Accept the default settings

### 4. Enable Google Authentication
1. Navigate to **Authentication**
2. Go to **Sign-in method**
3. Enable **Google**
4. Add your OAuth credentials

### 5. Set Security Rules
Update Firestore rules to allow admin access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Deployment

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build the project
npm run build

# Deploy
firebase deploy
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to GitHub Pages
See `.gitignore` for configured exclusions. Push to your repository:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

## 🎯 Usage Examples

### Add a Product
1. Navigate to **Products**
2. Click **+ Add Product**
3. Fill in product details
4. Upload images or paste URLs
5. Add sizes and stock
6. Click **Add Product**

### Update Order Status
1. Navigate to **Orders**
2. Click **→** button on any order
3. Status updates: pending → confirmed → shipped → delivered
4. Click expand icon to see full order details

### Block a User
1. Navigate to **Users**
2. Find user in table
3. Click **Block** button
4. User access is revoked

---

## 🐛 Troubleshooting

### Issue: Firebase credentials not working
**Solution:** Ensure credentials in `firebase_config.js` are correct. Regenerate them from Firebase Console.

### Issue: Images not uploading
**Solution:** 
- Check Firebase Storage rules allow writes
- Verify bucket name in config
- Check file size (max 5MB)

### Issue: Login not working
**Solution:**
- Enable Google Auth in Firebase Console
- Check OAuth consent screen is configured
- Verify Gmail can access the app

### Issue: Data not loading
**Solution:**
- Check Firestore read permissions
- Verify collection names match exactly
- Check browser console for errors
- Ensure `createdAt` timestamps are valid

---

## 📞 Support & Contact

- **Email:** csakre634@gmail.com
- **Issues:** Create an issue on GitHub
- **Documentation:** See inline code comments

---

## 📄 License

This project is licensed under the MIT License - See LICENSE file for details.

---

## 🚀 Future Enhancements

- [ ] Order filters and advanced search
- [ ] Customer management panel
- [ ] Sales analytics & charts
- [ ] Discount/Coupon management
- [ ] Email notifications
- [ ] Inventory forecasting
- [ ] Multi-language support
- [ ] Audit logs
- [ ] Two-factor authentication
- [ ] Dark/Light theme toggle

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Firebase](https://firebase.google.com)
- [React Router](https://reactrouter.com)
- [React Icons](https://react-icons.github.io/react-icons)

---

**Last Updated:** March 2026  
**Version:** 1.0.0

