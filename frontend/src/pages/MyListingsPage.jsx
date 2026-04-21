import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { listingApi, unwrapData } from '../utils/campusApi';

const LOCAL_LISTINGS_KEY = 'campus-bazzar-local-listings';

const readLocalListings = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocalListings = (nextListings) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextListings));
};

const getPrimaryImage = (listing) => {
  const firstImage = listing?.images?.[0] || listing?.image;
  if (typeof firstImage === 'string') return firstImage;
  return firstImage?.url || 'https://via.placeholder.com/640x820?text=Campus+Bazzar';
};

const normalizeMyListing = (listing) => ({
  ...listing,
  _id: listing?._id || listing?.id,
  id: listing?.id || listing?._id,
  title: listing?.title || listing?.bookId?.title || 'Untitled book',
  description: listing?.description || listing?.bookId?.description || 'No description available.',
  image: getPrimaryImage(listing),
  genre: listing?.categoryId?.name || listing?.genre || 'Uncategorized',
  price: Number(listing?.buyerPrice ?? listing?.price ?? listing?.mrp ?? 0),
  originalPrice: Number(listing?.mrp ?? listing?.originalPrice ?? listing?.price ?? 0),
  condition: listing?.condition || 'New',
  status: listing?.status || 'active',
});

const MyListingsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [allListings, setAllListings] = useState([]);
  const [localListings, setLocalListings] = useState(() => readLocalListings().map(normalizeMyListing));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await listingApi.getAll();
      setAllListings((unwrapData(response) || []).map(normalizeMyListing));
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const syncLocalListings = () => {
      setLocalListings(readLocalListings().map(normalizeMyListing));
    };

    window.addEventListener('storage', syncLocalListings);
    return () => window.removeEventListener('storage', syncLocalListings);
  }, []);

  const myListings = useMemo(() => {
    const myId = user?._id || user?.id;
    const myEmail = (user?.email || '').toLowerCase();
    const myPhone = String(user?.phone || '').trim();

    const apiOwnedListings = allListings.filter((listing) => {
      const seller = listing?.sellerId;
      const sellerId = typeof seller === 'string' ? seller : seller?._id || seller?.id;
      const sellerEmail = String(seller?.email || listing?.sellerEmail || '').toLowerCase();
      const sellerPhone = String(seller?.phone || listing?.sellerPhone || '').trim();

      if (myId && sellerId === myId) return true;
      if (myEmail && sellerEmail && sellerEmail === myEmail) return true;
      if (myPhone && sellerPhone && sellerPhone === myPhone) return true;
      return false;
    });

    const localOwnedListings = localListings.filter((listing) => {
      const sellerEmail = String(listing?.sellerEmail || listing?.contactDetails || '').toLowerCase();
      const sellerPhone = String(listing?.sellerPhone || listing?.contactDetails || '').trim();
      const sellerName = String(listing?.sellerName || '').toLowerCase();

      if (sellerName === 'you') return true;
      if (myEmail && sellerEmail && sellerEmail === myEmail) return true;
      if (myPhone && sellerPhone && sellerPhone === myPhone) return true;
      return !myId;
    });

    const merged = [...localOwnedListings, ...apiOwnedListings];
    const seen = new Set();
    return merged.filter((listing) => {
      const key = listing?._id || listing?.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allListings, localListings, user]);

  const handleDelete = async (listingId) => {
    const local = readLocalListings();
    const isLocalListing = local.some((item) => item.id === listingId || item._id === listingId);

    if (isLocalListing) {
      const nextLocalListings = local.filter((item) => item.id !== listingId && item._id !== listingId);
      writeLocalListings(nextLocalListings);
      setLocalListings(nextLocalListings);
      return;
    }

    try {
      await listingApi.remove(listingId);
      await load();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete listing.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1>My Listings</h1>
          <Link to="/listings/new" className="btn-primary">New Listing</Link>
        </div>

        {loading && <p>Loading your listings...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div className="marketplace-grid">
          {myListings.map((listing) => (
            <article
              key={listing._id || listing.id}
              className="marketplace-card glass"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/marketplace/books/${encodeURIComponent(listing._id || listing.id)}`, { state: { book: listing } })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/marketplace/books/${encodeURIComponent(listing._id || listing.id)}`, { state: { book: listing } });
                }
              }}
            >
              <div className="marketplace-card-image-wrap">
                <img className="marketplace-card-image" src={listing.image} alt={listing.title} />
                <span className="marketplace-card-chip">{listing.genre}</span>
              </div>

              <div className="marketplace-card-body">
                <div className="marketplace-card-topline">
                  <h3>{listing.title}</h3>
                  <span className="marketplace-condition">{listing.condition}</span>
                </div>
                <p className="marketplace-description">{listing.description}</p>

                <div className="marketplace-card-footer" style={{ marginTop: '0.25rem' }}>
                  <div>
                    <span className="marketplace-price">₹{listing.price}</span>
                    {listing.originalPrice > listing.price ? <span className="marketplace-original-price">₹{listing.originalPrice}</span> : null}
                  </div>
                  <span className="marketplace-card-action">{listing.status || 'active'}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <Link to={`/listings/${listing._id || listing.id}/edit`} className="btn-primary" style={{ textDecoration: 'none' }} onClick={(event) => event.stopPropagation()}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(listing._id || listing.id);
                    }}
                    style={{ border: '1px solid rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '12px', padding: '0.55rem 0.8rem', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && myListings.length === 0 && <p>No listings found for your account.</p>}
      </div>
    </div>
  );
};

export default MyListingsPage;
