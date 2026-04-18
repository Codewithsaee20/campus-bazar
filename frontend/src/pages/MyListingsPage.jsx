import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { listingApi, unwrapData } from '../utils/campusApi';

const MyListingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await listingApi.getAll();
      setAllListings(unwrapData(response) || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const myListings = useMemo(() => {
    const myId = user?._id || user?.id;
    if (!myId) return [];

    return allListings.filter((listing) => {
      const seller = listing?.sellerId;
      const sellerId = typeof seller === 'string' ? seller : seller?._id;
      return sellerId === myId;
    });
  }, [allListings, user]);

  const handleDelete = async (listingId) => {
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

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {myListings.map((listing) => (
            <div key={listing._id} className="glass" style={{ borderRadius: '14px', padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{listing.title}</h3>
              <p style={{ color: 'var(--text-dim)' }}>Status: {listing.status}</p>
              <p style={{ color: 'var(--text-dim)' }}>Price: ₹{listing.price}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <Link to={`/listings/${listing._id}/edit`} className="btn-primary" style={{ textDecoration: 'none' }}>
                  Edit
                </Link>
                <button type="button" onClick={() => handleDelete(listing._id)} style={{ border: '1px solid rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '12px', padding: '0.55rem 0.8rem', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && myListings.length === 0 && <p>No listings found for your account.</p>}
      </div>
    </div>
  );
};

export default MyListingsPage;
