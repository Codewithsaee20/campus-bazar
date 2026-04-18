import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interestApi, unwrapData } from '../utils/campusApi';

const InterestsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await interestApi.getMine();
        setItems(unwrapData(response) || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || 'Unable to load interests.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Interests</h1>

        {loading && <p>Loading interests...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div style={{ display: 'grid', gap: '0.7rem' }}>
          {items.map((entry) => (
            <Link key={entry._id || entry.id} to={`/listings/${entry?.listingId?._id || entry?.listingId || ''}`} className="glass" style={{ padding: '0.9rem', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
              {entry?.listingId?.title || 'Listing Interest'}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterestsPage;
