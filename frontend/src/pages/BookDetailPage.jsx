import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { bookApi, listingApi, unwrapData } from '../utils/campusApi';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [bookRes, listingRes] = await Promise.all([
          bookApi.getById(id),
          listingApi.getAll(),
        ]);

        const bookData = unwrapData(bookRes);
        const listingData = unwrapData(listingRes) || [];

        setBook(bookData);
        setListings(
          listingData.filter((listing) => {
            const bookId = typeof listing.bookId === 'string' ? listing.bookId : listing?.bookId?._id;
            return bookId === id && (listing.status || '').toLowerCase() === 'active';
          })
        );
      } catch (apiError) {
        setError(apiError?.response?.data?.message || 'Failed to load book detail.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        {loading && <p>Loading book details...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {book && (
          <div className="glass" style={{ borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{book.title}</h1>
            <p>ISBN: {book.isbn || 'N/A'}</p>
            <p>Original MRP: ₹{book.originalMrp ?? 'N/A'}</p>
            {book.mrpLocked ? <p style={{ color: 'var(--color-pink)' }}>MRP Locked</p> : null}
            <p>Total Resales: {book.totalResales ?? 0}</p>
          </div>
        )}

        <h2 style={{ marginBottom: '0.75rem' }}>Active Listings for this Book</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {listings.map((listing) => (
            <Link key={listing._id} to={`/listings/${listing._id}`} className="glass" style={{ borderRadius: '12px', padding: '0.9rem', textDecoration: 'none', color: 'inherit' }}>
              {listing.title} - ₹{listing.price}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
