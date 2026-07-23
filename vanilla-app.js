/**
 * Simple Book Shop - Vanilla JavaScript Frontend
 * Demonstrates basic fetch API, cart state management, and modal popups.
 */

// State variables
let books = [];
let cart = [];
let currentCategory = 'All';

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const categoryContainer = document.getElementById('categoryContainer');
const bookCount = document.getElementById('bookCount');
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const orderForm = document.getElementById('orderForm');
const checkoutSummaryItems = document.getElementById('checkoutSummaryItems');
const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
const checkoutFormStep = document.getElementById('checkoutFormStep');
const checkoutSuccessStep = document.getElementById('checkoutSuccessStep');
const finishOrderBtn = document.getElementById('finishOrderBtn');

// Fetch books from Express Backend API (/api/books)
async function fetchBooks(searchQuery = '', category = 'All') {
  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (category && category !== 'All') params.append('category', category);

    const res = await fetch(`/api/books?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      books = data.data;
      renderBooks(books);
    }
  } catch (err) {
    console.error('Error fetching books:', err);
    booksGrid.innerHTML = `<div class="col-span-full text-center text-red-500 py-8">Failed to load books from server. Please refresh.</div>`;
  }
}

// Fetch categories from Backend API (/api/categories)
async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      renderCategories(data.data);
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// Render category filter buttons
function renderCategories(categories) {
  categoryContainer.innerHTML = categories.map(cat => `
    <button 
      class="cat-btn ${cat === currentCategory ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} px-4 py-1.5 rounded-full text-sm font-medium transition shadow-sm whitespace-nowrap"
      data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  // Add click listeners
  categoryContainer.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-cat');
      fetchBooks(searchInput.value, currentCategory);
      renderCategories(categories);
    });
  });
}

// Render books into the grid
function renderBooks(booksList) {
  bookCount.innerText = `Showing ${booksList.length} books`;

  if (booksList.length === 0) {
    booksGrid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border shadow-sm p-8">
        <span class="text-4xl">🔍</span>
        <h3 class="text-lg font-bold text-slate-800 mt-2">No books found</h3>
        <p class="text-sm text-slate-500 mt-1">Try adjusting your search terms or filter settings.</p>
      </div>
    `;
    return;
  }

  booksGrid.innerHTML = booksList.map(book => `
    <div class="bg-white rounded-2xl border shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
      <div class="relative aspect-[3/4] bg-slate-100 overflow-hidden group">
        <img src="${book.coverImage}" alt="${book.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
        ${book.badge ? `<span class="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">${book.badge}</span>` : ''}
      </div>
      <div class="p-4 flex flex-col flex-1">
        <span class="text-xs text-indigo-600 font-semibold uppercase tracking-wider">${book.category}</span>
        <h3 class="font-bold text-slate-900 mt-1 text-base line-clamp-1">${book.title}</h3>
        <p class="text-xs text-slate-500 mb-2">by ${book.author}</p>
        
        <div class="mt-auto pt-3 border-t flex items-center justify-between">
          <div>
            <span class="text-lg font-extrabold text-slate-900">$${book.price.toFixed(2)}</span>
            ${book.originalPrice ? `<span class="text-xs text-slate-400 line-through ml-1">$${book.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <button 
            onclick="addToCart('${book.id}')"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow flex items-center gap-1">
            + Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Add book to cart
window.addToCart = function(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  const existingItem = cart.find(item => item.id === bookId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...book, quantity: 1 });
  }

  updateCartUI();
};

// Update Cart Badge and Drawer Content
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.innerText = totalItems;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <span class="text-4xl block mb-2">🛒</span>
        <p class="text-sm font-medium">Your cart is empty.</p>
      </div>
    `;
    cartSubtotal.innerText = '$0.00';
    cartTotal.innerText = '$0.00';
    checkoutBtn.disabled = true;
    checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');

  let subtotal = 0;
  cartItemsList.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="flex gap-3 bg-slate-50 p-3 rounded-xl border">
        <img src="${item.coverImage}" class="w-14 h-20 object-cover rounded-md" referrerPolicy="no-referrer" />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-slate-900 text-sm line-clamp-1">${item.title}</h4>
            <p class="text-xs text-slate-500">$${item.price.toFixed(2)} each</p>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2 border bg-white rounded-lg px-2 py-0.5 text-xs font-bold">
              <button onclick="changeQty('${item.id}', -1)" class="text-slate-500 hover:text-slate-900 px-1">-</button>
              <span>${item.quantity}</span>
              <button onclick="changeQty('${item.id}', 1)" class="text-slate-500 hover:text-slate-900 px-1">+</button>
            </div>
            <span class="font-bold text-xs text-indigo-600">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
  cartTotal.innerText = `$${subtotal.toFixed(2)}`;
}

// Change quantity or remove item
window.changeQty = function(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCartUI();
};

// Search Listener
searchInput.addEventListener('input', (e) => {
  fetchBooks(e.target.value, currentCategory);
});

// Cart Drawer Toggles
cartBtn.addEventListener('click', () => cartModal.classList.remove('hidden'));
closeCartBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

// Checkout Flow
checkoutBtn.addEventListener('click', () => {
  cartModal.classList.add('hidden');
  checkoutModal.classList.remove('hidden');
  checkoutFormStep.classList.remove('hidden');
  checkoutSuccessStep.classList.add('hidden');

  // Render checkout summary
  let total = 0;
  checkoutSummaryItems.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `<div class="flex justify-between"><span>${item.title} (x${item.quantity})</span><span>$${itemTotal.toFixed(2)}</span></div>`;
  }).join('');

  checkoutTotalAmount.innerText = `$${total.toFixed(2)}`;
});

closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.add('hidden'));

// Form Submit -> API Call POST /api/checkout
orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const customer = {
    name: document.getElementById('custName').value,
    email: document.getElementById('custEmail').value,
    address: document.getElementById('custAddress').value
  };

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, items: cart })
    });

    const result = await res.json();
    if (result.success) {
      document.getElementById('receiptId').innerText = `#${result.order.orderId}`;
      document.getElementById('receiptName').innerText = result.order.customer.name;
      document.getElementById('receiptTotal').innerText = `$${result.order.total.toFixed(2)}`;

      checkoutFormStep.classList.add('hidden');
      checkoutSuccessStep.classList.remove('hidden');

      // Clear Cart
      cart = [];
      updateCartUI();
    } else {
      alert(result.message || 'Checkout failed');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('An error occurred during checkout.');
  }
});

finishOrderBtn.addEventListener('click', () => {
  checkoutModal.classList.add('hidden');
});

// Initial Load
fetchBooks();
fetchCategories();
