import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { Footer } from './components/Footer';
import { Book, CartItem } from './types/book';
import { SlidersHorizontal, CheckCircle2, SearchX, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bookshop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bookshop_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  // Modals & UI State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addedBookId, setAddedBookId] = useState<string | null>(null);

  // Persist Cart & Wishlist
  useEffect(() => {
    localStorage.setItem('bookshop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bookshop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch Categories from Express Backend (/api/categories)
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error('Error loading categories:', err));
  }, []);

  // Fetch Books from Express Backend (/api/books)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    if (sortBy) params.append('sort', sortBy);

    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooks(data.data);
          setError('');
        } else {
          setError('Failed to fetch books.');
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Unable to connect to Node.js backend server.');
      })
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCategory, sortBy]);

  // Toast Notification Trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Operations
  const handleAddToCart = (book: Book, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === book.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { ...book, quantity }];
      }
    });

    setAddedBookId(book.id);
    setTimeout(() => setAddedBookId(null), 1500);
    showToast(`Added "${book.title}" to cart!`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountApplied(false);
    setPromoCode('');
  };

  const handleApplyPromo = (code: string) => {
    if (code.trim().toUpperCase() === 'BOOKSHOP10') {
      setPromoCode('BOOKSHOP10');
      setDiscountApplied(true);
      showToast('10% discount promo code applied!');
    } else {
      alert('Invalid Promo Code. Try BOOKSHOP10 for 10% off!');
    }
  };

  const handleToggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      if (prev.includes(bookId)) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== bookId);
      } else {
        showToast('Saved to wishlist!');
        return [...prev, bookId];
      }
    });
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-300 selection:text-slate-900">
      
      {/* Toast Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        wishlistCount={wishlist.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        
        {/* Promotional Hero Banner */}
        <HeroBanner onExploreClick={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* Catalog Header & Controls Section */}
        <section id="catalog-section" className="space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Book Collection</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {books.length} Available
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Browse books powered by Express API endpoint <code>/api/books</code>
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <label htmlFor="sort-select" className="text-xs font-bold text-slate-600">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
              >
                <option value="popular">Popularity & Badges</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {cat} {cat === 'All' ? '📚' : ''}
              </button>
            ))}
          </div>

          {/* Books Grid View */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl border p-4 animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3 pt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-8">
              <p className="text-rose-700 font-bold text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow"
              >
                Retry Loading
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-8 shadow-sm">
              <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-800">No books found matching criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching with a different title, author, or clear your search filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow hover:bg-slate-800 transition"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  onQuickView={(b) => setSelectedBook(b)}
                  isWishlisted={wishlist.includes(book.id)}
                  onToggleWishlist={handleToggleWishlist}
                  isAdded={addedBookId === book.id}
                />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <Footer
        onOpenGuide={() => setIsGuideOpen(true)}
        categories={categories}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Modals */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        discountApplied={discountApplied}
        onApplyPromo={handleApplyPromo}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        promoCode={promoCode}
        onClearCart={handleClearCart}
      />

      <DeploymentGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}
