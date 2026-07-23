# 📚 Simple Book Shop Website

A clean, responsive, and beginner-friendly online Book Shop website built with **HTML, CSS, JavaScript, Node.js, Express.js, React, Tailwind CSS**, and local **JSON file database storage**.

Designed for ease of learning, local execution, and seamless 1-click deployment on **Vercel** with GitHub.

---

## 🌟 Key Features

- **Responsive & Clean UI**: Looks great on desktop, tablet, and mobile browsers.
- **Dynamic Book Catalog**: Displays books with title, author, cover image, rating, stock status, and price.
- **Search & Filter**: Search books by title, author, or filter by category/genre.
- **Shopping Cart**:
  - Add items to cart with quantity adjustment (+ / -)
  - Promo code support (e.g. `BOOKSHOP10` for 10% discount)
  - Automatic subtotal, tax (8%), shipping calculation
  - Clear cart or remove individual items
- **Order Checkout**:
  - Form validation for customer shipping & payment details
  - Submits order to Node.js backend API (`POST /api/checkout`)
  - Generates receipt ID, receipt breakdown, and printable order summary
- **Local JSON Database**:
  - `data/books.json`: Book catalog database
  - `data/orders.json`: Persisted order receipts history
- **Deployment Ready**: Fully configured for **Vercel** with `vercel.json` and continuous deployment via GitHub.
- **Dual Frontend Included**:
  - Rich React Single Page Application (`/src/App.tsx`)
  - Standalone Vanilla HTML/JS Demo (`/public/vanilla-demo.html`)

---

## 📁 Project Folder Structure

```text
simple-book-shop/
├── data/
│   ├── books.json          # Book catalog database
│   └── orders.json         # Order receipts storage
├── routes/
│   └── books.ts            # Express Router API endpoints (/api/books, /api/checkout)
├── public/
│   ├── vanilla-demo.html   # Standalone Vanilla HTML/JS page for beginners
│   └── vanilla-app.js     # Pure JavaScript logic for vanilla demo
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Top navbar & search input
│   │   ├── HeroBanner.tsx           # Promotional hero banner
│   │   ├── BookCard.tsx             # Individual book card component
│   │   ├── BookDetailModal.tsx      # Quick view book details modal
│   │   ├── CartDrawer.tsx           # Slide-over shopping cart drawer
│   │   ├── CheckoutModal.tsx        # Multi-step checkout form & receipt
│   │   ├── DeploymentGuideModal.tsx # Interactive Vercel & GitHub instructions
│   │   └── Footer.tsx               # Site footer
│   ├── types/
│   │   └── book.ts                  # TypeScript interfaces (Book, CartItem, Order)
│   ├── App.tsx                      # Main React application component
│   ├── index.css                    # Tailwind CSS imports
│   └── main.tsx                     # React DOM rendering entrypoint
├── api/
│   └── index.ts            # Vercel Serverless Function entry point
├── server.ts               # Main Express.js backend server
├── vercel.json             # Vercel deployment configuration
├── package.json            # Project dependencies & npm scripts
├── metadata.json           # Application metadata
└── README.md               # Documentation & deployment guide
```

---

## 🚀 Running Locally

### 1. Install Dependencies
Open your terminal inside the project root directory and run:
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to view the application!

### 3. Production Build & Start
```bash
npm run build
npm start
```

---

## 🔌 Express REST API Endpoints

- `GET /api/books`: Fetch all books (Supports query params: `?search=query`, `?category=Fiction`, `?sort=price-low`)
- `GET /api/books/:id`: Fetch single book details
- `GET /api/categories`: Fetch unique book categories list
- `POST /api/checkout`: Process cart checkout, calculate totals, and save order to `data/orders.json`
- `GET /api/orders/:id`: Fetch receipt details by order ID
- `GET /api/health`: Express server healthcheck

---

## 📦 How to Upload to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `simple-book-shop`.
2. Run the following commands in your project terminal:
```bash
git init
git add .
git commit -m "Initial commit of Simple Book Shop"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/simple-book-shop.git
git push -u origin main
```

---

## 🌐 How to Deploy on Vercel Step-by-Step

1. Log in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **"Add New..." → "Project"**.
3. Select your `simple-book-shop` GitHub repository.
4. Vercel will automatically detect `package.json` and settings:
   - **Framework Preset**: Vite / Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.
6. Within 1 minute, Vercel will build and generate your live website URL!

### 🔄 Automatic Deployment
Whenever you push code changes to GitHub:
```bash
git add .
git commit -m "Updated book catalog"
git push
```
Vercel will automatically re-deploy your site with the new changes!

---

## 📄 License
Apache 2.0 / MIT.
