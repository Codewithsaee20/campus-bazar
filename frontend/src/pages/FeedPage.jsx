import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Filter, Heart, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { mockBooks } from '../data/mockBooks';
import { categoryApi, listingApi, unwrapData } from '../utils/campusApi';
import { readWishlist, toggleWishlist, WISHLIST_UPDATED_EVENT } from '../utils/wishlist';

const LOCAL_LISTINGS_KEY = 'campus-bazzar-local-listings';

const PRICE_RANGES = [
  { label: 'All prices', value: 'all' },
  { label: 'Under ₹250', value: '0-250' },
  { label: '₹250 - ₹500', value: '250-500' },
  { label: 'Above ₹500', value: '500+' },
];

const CONDITION_OPTIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Worn'];

const buildFallbackEmail = (sellerName) => {
  const slug = sellerName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  return slug ? `${slug}@campusbazaar.local` : 'contact@campusbazaar.local';
};

const getPrimaryImage = (listing) => {
  const firstImage = listing?.images?.[0] || listing?.image;
  if (typeof firstImage === 'string') return firstImage;
  return firstImage?.url || 'https://via.placeholder.com/640x820?text=Campus+Bazzar';
};

const getGenreLabel = (listing) => {
  const category = listing?.categoryId;
  if (category?.name) return category.name;
  if (typeof category === 'string') return category;
  return listing?.genre || 'Uncategorized';
};

const getSellerInfo = (listing) => {
  const seller = listing?.sellerId;
  if (seller && typeof seller === 'object') {
    return {
      name: seller.name || seller.fullName || 'Campus Seller',
      email: seller.email || buildFallbackEmail(seller.name || seller.fullName || 'seller'),
      phone: seller.phone || seller.mobile || 'Available on request',
    };
  }

  const sellerName = listing?.sellerName || listing?.seller || 'Campus Seller';

  return {
    name: sellerName,
    email: listing?.sellerEmail || buildFallbackEmail(sellerName),
    phone: listing?.sellerPhone || 'Available on request',
  };
};

const normalizeListing = (listing) => {
  const seller = getSellerInfo(listing);

  return {
    id: listing?._id || listing?.id,
    title: listing?.title || listing?.bookId?.title || 'Untitled book',
    description: listing?.description || listing?.bookId?.description || 'No description available yet.',
    image: getPrimaryImage(listing),
    genre: getGenreLabel(listing),
    price: Number(listing?.buyerPrice ?? listing?.price ?? listing?.mrp ?? 0),
    originalPrice: Number(listing?.mrp ?? listing?.originalPrice ?? 0),
    condition: listing?.condition || 'Like New',
    sellerName: seller.name,
    sellerEmail: seller.email,
    sellerPhone: seller.phone,
    college: listing?.college || listing?.sellerId?.college || 'Campus Seller',
    source: 'api',
  };
};

const normalizeMockBook = (book) => ({
  id: `mock-${book.id}`,
  title: book.title,
  description: book.description,
  image: book.image,
  genre: book.category,
  price: Number(book.price),
  originalPrice: Number(book.originalPrice ?? book.price),
  condition: book.condition,
  sellerName: book.seller,
  sellerEmail: buildFallbackEmail(book.seller),
  sellerPhone: 'Contact through campus chat',
  college: book.college,
  source: 'mock',
});

const normalizeLocalListing = (listing) => ({
  id: listing?.id || `local-${Date.now()}`,
  title: listing?.title || 'Untitled book',
  description: listing?.description || 'No description available.',
  image: listing?.image || 'https://via.placeholder.com/640x820?text=Campus+Bazzar',
  genre: listing?.genre || 'Uncategorized',
  price: Number(listing?.price || 0),
  originalPrice: Number(listing?.price || 0),
  condition: listing?.condition || 'New',
  sellerName: listing?.sellerName || 'You',
  sellerEmail: listing?.sellerEmail || listing?.contactDetails || 'Available on request',
  sellerPhone: listing?.sellerPhone || listing?.contactDetails || 'Available on request',
  college: listing?.college || 'Campus Bazaar',
  source: 'local',
});

const readLocalListings = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

const matchesPrice = (price, range) => {
  if (range === 'all') return true;
  if (range === '0-250') return price <= 250;
  if (range === '250-500') return price > 250 && price <= 500;
  if (range === '500+') return price > 500;
  return true;
};

const FeedPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(() => new Set(readWishlist().map((item) => String(item.id))));
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || 'All',
    priceRange: 'all',
    condition: 'All',
    search: '',
  });

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError('');
      setUsingFallback(false);

      const [listingResult, categoryResult] = await Promise.allSettled([
        listingApi.getAll(),
        categoryApi.getAll(),
      ]);

      const liveListings = listingResult.status === 'fulfilled' ? unwrapData(listingResult.value) || [] : [];
      const liveCategories = categoryResult.status === 'fulfilled' ? unwrapData(categoryResult.value) || [] : [];

      const normalizedLiveBooks = liveListings.map(normalizeListing);
      const fallbackBooks = mockBooks.map(normalizeMockBook);
      const localBooks = readLocalListings().map(normalizeLocalListing);
      const nextBooks = [...localBooks, ...(normalizedLiveBooks.length > 0 ? normalizedLiveBooks : fallbackBooks)];

      if (listingResult.status === 'rejected' || normalizedLiveBooks.length === 0) {
        setUsingFallback(true);
      }

      if (listingResult.status === 'rejected' && normalizedLiveBooks.length === 0) {
        setError('Live marketplace data is not ready yet. Showing placeholder books.');
      }

      const genrePool = [
        'All',
        ...new Set([
          ...liveCategories
            .map((category) => category?.name || category?.slug || category)
            .filter(Boolean),
          ...nextBooks.map((book) => book.genre).filter(Boolean),
        ]),
      ];

      setBooks(nextBooks);
      setGenres(genrePool);
      setLoading(false);
    };

    loadBooks();
  }, []);

  useEffect(() => {
    if (filters.genre && filters.genre !== 'All') {
      setSearchParams({ genre: filters.genre });
    } else {
      setSearchParams({});
    }
  }, [filters.genre, setSearchParams]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const shouldLockScroll = isFilterOpen;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const syncWishlist = () => {
      setWishlistIds(new Set(readWishlist().map((item) => String(item.id))));
    };

    window.addEventListener('storage', syncWishlist);
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist);
    return () => {
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist);
    };
  }, []);

  const visibleBooks = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesGenre = filters.genre === 'All' || book.genre.toLowerCase() === filters.genre.toLowerCase();
      const matchesCondition = filters.condition === 'All' || book.condition.toLowerCase() === filters.condition.toLowerCase();
      const matchesQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        book.sellerName.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query);

      return matchesGenre && matchesCondition && matchesPrice(book.price, filters.priceRange) && matchesQuery;
    });
  }, [books, filters]);

  const activeFilterCount = Number(filters.genre !== 'All') + Number(filters.priceRange !== 'all') + Number(filters.condition !== 'All') + Number(Boolean(filters.search.trim()));

  const openBook = (book) => {
    navigate(`/marketplace/books/${encodeURIComponent(book.id)}`, {
      state: { book },
    });
  };

  const handleToggleWishlist = (book, event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleWishlist(book);
    setWishlistIds(new Set(readWishlist().map((item) => String(item.id))));
  };

  const resetFilters = () => {
    setFilters({ genre: 'All', priceRange: 'all', condition: 'All', search: '' });
  };

  return (
    <div className="marketplace-page">
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>

      <Navbar />

      <main className="container marketplace-shell">
        <section className="marketplace-header">
          <div>
            <p className="marketplace-kicker">Campus marketplace</p>
            <h1 className="marketplace-title">Find the right book, at the right price.</h1>
            <p className="marketplace-copy">
              Browse clean student listings with real filters, smooth cards, and a quick detail popup for each book.
            </p>
          </div>

          <div className="marketplace-actions">
            <Link to="/listings/new" className="btn-primary">
              + List a Book
            </Link>
            <button type="button" className="marketplace-filter-button glass" onClick={() => setIsFilterOpen(true)}>
              <Filter size={16} />
              Filter
              {activeFilterCount > 0 ? <span className="marketplace-filter-count">{activeFilterCount}</span> : null}
            </button>
          </div>
        </section>

        <section className="marketplace-toolbar glass">
          <div className="marketplace-search">
            <Search size={18} />
            <input
              className="marketplace-search-input"
              type="text"
              placeholder="Search title, seller, genre, or description"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </div>

          <div className="marketplace-toolbar-meta">
            <div>
              <span className="marketplace-meta-label">Books shown</span>
              <strong>{visibleBooks.length}</strong>
            </div>
            <div>
              <span className="marketplace-meta-label">Catalog</span>
              <strong>{usingFallback ? 'Demo preview' : 'Live data'}</strong>
            </div>
          </div>
        </section>

        {error ? <div className="marketplace-banner">{error}</div> : null}

        {loading ? (
          <div className="marketplace-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="marketplace-card marketplace-skeleton-card glass">
                <div className="marketplace-skeleton marketplace-skeleton-image" />
                <div className="marketplace-card-body">
                  <div className="marketplace-skeleton marketplace-skeleton-line short" />
                  <div className="marketplace-skeleton marketplace-skeleton-line" />
                  <div className="marketplace-skeleton marketplace-skeleton-line tiny" />
                  <div className="marketplace-skeleton marketplace-skeleton-line tiny" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleBooks.length > 0 ? (
          <div className="marketplace-grid">
            {visibleBooks.map((book) => (
              <motion.article
                key={book.id}
                className="marketplace-card glass"
                role="button"
                tabIndex={0}
                onClick={() => openBook(book)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openBook(book);
                  }
                }}
                whileHover={{ y: -8, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div className="marketplace-card-image-wrap">
                  <img className="marketplace-card-image" src={book.image} alt={book.title} />
                  <span className="marketplace-card-chip">{book.genre}</span>
                  <button
                    type="button"
                    className={`marketplace-wishlist-btn ${wishlistIds.has(String(book.id)) ? 'active' : ''}`}
                    onClick={(event) => handleToggleWishlist(book, event)}
                    aria-label={wishlistIds.has(String(book.id)) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={15} fill={wishlistIds.has(String(book.id)) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="marketplace-card-body">
                  <div className="marketplace-card-topline">
                    <h3>{book.title}</h3>
                    <span className="marketplace-condition">{book.condition}</span>
                  </div>

                  <p className="marketplace-description">{book.description}</p>

                  <div className="marketplace-card-footer">
                    <div>
                      <span className="marketplace-price">₹{book.price}</span>
                      {book.originalPrice > book.price ? (
                        <span className="marketplace-original-price">₹{book.originalPrice}</span>
                      ) : null}
                    </div>
                    <span className="marketplace-card-action">
                      View details <BookOpen size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="marketplace-empty glass">
            <div className="marketplace-empty-icon">📚</div>
            <h2>No books found</h2>
            <p>Try adjusting your filters or clearing the search to see more campus listings.</p>
            <button type="button" className="btn-primary" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isFilterOpen ? (
          <>
            <motion.div
              className="marketplace-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.aside
              className="marketplace-drawer glass"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              <div className="marketplace-drawer-header">
                <div>
                  <p className="marketplace-drawer-kicker">Filters</p>
                  <h2>Refine your search</h2>
                </div>
                <button type="button" className="marketplace-icon-button" onClick={() => setIsFilterOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="marketplace-filter-group">
                <label>Genre</label>
                <div className="marketplace-pill-grid">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      className={`marketplace-pill ${filters.genre === genre ? 'active' : ''}`}
                      onClick={() => setFilters((current) => ({ ...current, genre }))}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="marketplace-filter-group">
                <label>Price range</label>
                <div className="marketplace-pill-grid">
                  {PRICE_RANGES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`marketplace-pill ${filters.priceRange === option.value ? 'active' : ''}`}
                      onClick={() => setFilters((current) => ({ ...current, priceRange: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="marketplace-filter-group">
                <label>Condition</label>
                <div className="marketplace-pill-grid">
                  {CONDITION_OPTIONS.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      className={`marketplace-pill ${filters.condition === condition ? 'active' : ''}`}
                      onClick={() => setFilters((current) => ({ ...current, condition }))}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div className="marketplace-drawer-actions">
                <button type="button" className="marketplace-text-button" onClick={resetFilters}>
                  Clear all
                </button>
                <button type="button" className="btn-primary" onClick={() => setIsFilterOpen(false)}>
                  Apply filters
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

    </div>
  );
};

export default FeedPage;
