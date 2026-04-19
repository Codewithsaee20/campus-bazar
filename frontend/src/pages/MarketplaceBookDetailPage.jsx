import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { mockBooks } from '../data/mockBooks';
import { listingApi, unwrapData } from '../utils/campusApi';
import { isInWishlist, toggleWishlist } from '../utils/wishlist';

const LOCAL_LISTINGS_KEY = 'campus-bazzar-local-listings';

const buildFallbackEmail = (sellerName) => {
  const slug = (sellerName || 'seller').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
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
  const rawImages = Array.isArray(listing?.images) ? listing.images : [];
  const images = rawImages
    .map((item) => (typeof item === 'string' ? item : item?.url))
    .filter(Boolean);
  const primaryImage = getPrimaryImage(listing);

  return {
    id: listing?._id || listing?.id,
    title: listing?.title || listing?.bookId?.title || 'Untitled book',
    description: listing?.description || listing?.bookId?.description || 'No description available yet.',
    image: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    genre: getGenreLabel(listing),
    price: Number(listing?.buyerPrice ?? listing?.price ?? listing?.mrp ?? 0),
    originalPrice: Number(listing?.mrp ?? listing?.originalPrice ?? listing?.buyerPrice ?? listing?.price ?? 0),
    condition: listing?.condition || 'Like New',
    sellerName: seller.name,
    sellerEmail: seller.email,
    sellerPhone: seller.phone,
    college: listing?.college || listing?.sellerId?.college || 'Campus Seller',
  };
};

const normalizeMockBook = (book) => ({
  id: `mock-${book.id}`,
  title: book.title,
  description: book.description,
  image: book.image,
  images: [book.image],
  genre: book.category,
  price: Number(book.price),
  originalPrice: Number(book.originalPrice ?? book.price),
  condition: book.condition,
  sellerName: book.seller,
  sellerEmail: buildFallbackEmail(book.seller),
  sellerPhone: 'Contact through campus chat',
  college: book.college,
});

const normalizeLocalListing = (listing) => ({
  id: listing?.id || `local-${Date.now()}`,
  title: listing?.title || 'Untitled book',
  description: listing?.description || 'No description available.',
  image: listing?.image || 'https://via.placeholder.com/640x820?text=Campus+Bazzar',
  images: [listing?.image || 'https://via.placeholder.com/640x820?text=Campus+Bazzar'],
  genre: listing?.genre || 'Uncategorized',
  price: Number(listing?.price || 0),
  originalPrice: Number(listing?.price || 0),
  condition: listing?.condition || 'New',
  sellerName: listing?.sellerName || 'You',
  sellerEmail: listing?.sellerEmail || listing?.contactDetails || 'Available on request',
  sellerPhone: listing?.sellerPhone || listing?.contactDetails || 'Available on request',
  college: listing?.college || 'Campus Bazaar',
});

const readLocalListings = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

const MarketplaceBookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(location.state?.book || null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(!location.state?.book);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const resolveBook = async (bookId) => {
    const safeId = bookId || '';

    if (safeId.startsWith('mock-')) {
      const mockId = safeId.replace('mock-', '');
      const mockBook = mockBooks.find((item) => String(item.id) === mockId);
      if (mockBook) return normalizeMockBook(mockBook);
      return null;
    }

    if (safeId.startsWith('local-')) {
      const localBook = readLocalListings()
        .map(normalizeLocalListing)
        .find((item) => String(item.id) === safeId);
      return localBook || null;
    }

    const response = await listingApi.getById(safeId);
    return normalizeListing(unwrapData(response));
  };

  const loadCatalog = async () => {
    const localBooks = readLocalListings().map(normalizeLocalListing);
    const fallbackBooks = mockBooks.map(normalizeMockBook);

    try {
      const response = await listingApi.getAll();
      const apiBooks = (unwrapData(response) || []).map(normalizeListing);
      return [...localBooks, ...(apiBooks.length > 0 ? apiBooks : fallbackBooks)];
    } catch {
      return [...localBooks, ...fallbackBooks];
    }
  };

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      setError('');

      try {
        const [resolvedBook, allBooks] = await Promise.all([
          location.state?.book ? Promise.resolve(location.state.book) : resolveBook(id),
          loadCatalog(),
        ]);

        setBook(resolvedBook);
        setCatalog(allBooks);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || 'Could not load book details.');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id, location.state?.book]);

  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (!book?.id) return;
    setWishlisted(isInWishlist(book.id));
  }, [book]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setIsImagePreviewOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, []);

  const imageList = useMemo(() => {
    if (!book) return [];
    const list = Array.isArray(book.images) && book.images.length > 0 ? book.images : [book.image];
    return Array.from(new Set(list.filter(Boolean)));
  }, [book]);

  const activeImage = imageList[activeImageIndex] || book?.image;

  const discountPercent = useMemo(() => {
    if (!book) return 0;
    const original = Number(book.originalPrice || 0);
    const current = Number(book.price || 0);
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  }, [book]);

  const qualityPoints = useMemo(() => {
    const condition = (book?.condition || '').toLowerCase();

    if (condition === 'new') {
      return [
        'Unused copy with clean pages.',
        'No markings, highlighting, or folds.',
        'Spine and cover are in fresh condition.',
      ];
    }

    if (condition === 'like new') {
      return [
        'Very light signs of handling.',
        'Pages and binding are intact.',
        'No major tears or water damage.',
      ];
    }

    if (condition === 'good') {
      return [
        'Readable copy with moderate usage.',
        'Minor notes or highlights may be present.',
        'Covers and edges can show wear.',
      ];
    }

    return [
      'Budget copy with visible wear.',
      'Text remains readable for study use.',
      'Best suited for low-cost exam preparation.',
    ];
  }, [book]);

  const similarBooks = useMemo(() => {
    if (!book) return [];

    const currentPrice = Number(book.price || 0);
    const scored = catalog
      .filter((item) => String(item.id) !== String(book.id))
      .map((item) => {
        let score = 0;
        if ((item.genre || '').toLowerCase() === (book.genre || '').toLowerCase()) score += 4;
        if ((item.condition || '').toLowerCase() === (book.condition || '').toLowerCase()) score += 2;

        const priceGap = Math.abs(Number(item.price || 0) - currentPrice);
        if (priceGap <= 100) score += 2;
        else if (priceGap <= 250) score += 1;

        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 8);
  }, [book, catalog]);

  return (
    <div className="marketplace-page">
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>

      <Navbar />

      <main className="container marketplace-shell book-detail-shell" style={{ paddingTop: '7.5rem' }}>
        <div className="book-detail-back-row">
          <button
            type="button"
            className="marketplace-text-button"
            onClick={() => navigate(-1)}
            style={{ fontWeight: 700 }}
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <div className="marketplace-empty glass">
            <h2>Loading book details...</h2>
          </div>
        ) : null}

        {error ? (
          <div className="marketplace-banner">{error}</div>
        ) : null}

        {!loading && !error && book ? (
          <>
            <section className="glass book-detail-panel">
              <div className="book-detail-grid">
                <div className={`book-gallery-shell ${imageList.length > 1 ? '' : 'single-image'}`}>
                  {imageList.length > 1 ? (
                    <div className="book-gallery-strip">
                      {imageList.map((image, index) => (
                        <button
                          type="button"
                          key={`${image}-${index}`}
                          className={`book-gallery-thumb ${index === activeImageIndex ? 'active' : ''}`}
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <img src={image} alt={`${book.title} ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="book-gallery-main"
                    onClick={() => setIsImagePreviewOpen(true)}
                    aria-label="Open full image"
                  >
                    <img src={activeImage} alt={book.title} />
                    <span className="marketplace-card-chip">{book.genre}</span>
                  </button>
                </div>

                <div className="book-detail-copy">
                  <div className="book-detail-head">
                    <div>
                      <p className="marketplace-drawer-kicker">Book Details</p>
                      <h1 className="book-detail-title">{book.title}</h1>
                      <p className="book-detail-sub">Condition: {book.condition} | Seller: {book.sellerName}</p>
                    </div>
                    <button
                      type="button"
                      className={`book-detail-wishlist ${wishlisted ? 'active' : ''}`}
                      onClick={() => {
                        const result = toggleWishlist(book);
                        setWishlisted(result.saved);
                      }}
                      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="book-detail-price-row">
                    <strong className="book-detail-price">₹{book.price}</strong>
                    {Number(book.originalPrice) > Number(book.price) ? (
                      <>
                        <span className="book-detail-original">₹{book.originalPrice}</span>
                        <span className="book-detail-discount">{discountPercent}% OFF</span>
                      </>
                    ) : null}
                  </div>

                  <div className="book-offer-card">
                    <p className="book-offer-title">Special Offer</p>
                    <ul>
                      <li>Buy 2 or more books and get extra savings.</li>
                      <li>Student-friendly pricing with campus handoff.</li>
                      <li>Fast response from verified campus sellers.</li>
                    </ul>
                  </div>

                  <div className="book-condition-row">
                    {['New', 'Like New', 'Good', 'Fair', 'Worn'].map((item) => (
                      <span key={item} className={`book-condition-pill ${item.toLowerCase() === (book.condition || '').toLowerCase() ? 'active' : ''}`}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="book-quality-card">
                    <h3>Quality Notes</h3>
                    <ul>
                      {qualityPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="book-description-card">
                    <h3>Description</h3>
                    <p>{book.description}</p>
                  </div>

                  <div className="marketplace-info-card">
                    <span className="marketplace-meta-label">Seller</span>
                    <strong>{book.sellerName}</strong>
                    <p>{book.sellerEmail}</p>
                    <p>{book.sellerPhone}</p>
                    <p>{book.college}</p>
                  </div>

                  <div className="book-detail-actions">
                    <button type="button" className="book-detail-btn book-detail-btn--ghost">Add to Cart</button>
                    <button type="button" className="book-detail-btn book-detail-btn--solid">Buy Now</button>
                  </div>
                </div>
              </div>
            </section>

            {isImagePreviewOpen ? (
              <div className="book-image-preview-overlay" onClick={() => setIsImagePreviewOpen(false)}>
                <button
                  type="button"
                  className="book-image-preview-close"
                  onClick={() => setIsImagePreviewOpen(false)}
                  aria-label="Close image preview"
                >
                  ×
                </button>
                <img
                  className="book-image-preview-image"
                  src={activeImage}
                  alt={book.title}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            ) : null}

            <section className="book-similar-section">
              <div className="book-similar-head">
                <div>
                  <p className="marketplace-drawer-kicker">More For You</p>
                  <h2>Similar Books</h2>
                </div>
                <Link to="/marketplace" className="marketplace-text-button">View all</Link>
              </div>

              {similarBooks.length > 0 ? (
                <div className="marketplace-grid book-similar-grid">
                  {similarBooks.map((item) => (
                    <article
                      key={item.id}
                      className="marketplace-card glass"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/marketplace/books/${encodeURIComponent(item.id)}`, { state: { book: item } })}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/marketplace/books/${encodeURIComponent(item.id)}`, { state: { book: item } });
                        }
                      }}
                    >
                      <div className="marketplace-card-image-wrap">
                        <img className="marketplace-card-image" src={item.image} alt={item.title} />
                        <span className="marketplace-card-chip">{item.genre}</span>
                      </div>

                      <div className="marketplace-card-body">
                        <div className="marketplace-card-topline">
                          <h3>{item.title}</h3>
                          <span className="marketplace-condition">{item.condition}</span>
                        </div>
                        <div className="marketplace-card-footer">
                          <span className="marketplace-price">₹{item.price}</span>
                          <span className="marketplace-card-action">View details</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="marketplace-empty glass">
                  <h2>No similar books yet</h2>
                  <p>Explore the marketplace for more options in this category.</p>
                  <Link to="/marketplace" className="btn-primary">Back to marketplace</Link>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default MarketplaceBookDetailPage;
