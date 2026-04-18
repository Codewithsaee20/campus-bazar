import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interestApi, listingApi, orderApi, reportApi, unwrapData } from '../utils/campusApi';

const imageFrom = (item) => {
  if (typeof item === 'string') return { url: item, public_id: item };
  return item;
};

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await listingApi.getById(id);
        setListing(unwrapData(response));
      } catch (apiError) {
        setError(apiError?.response?.data?.message || 'Could not fetch listing details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const images = useMemo(() => {
    const raw = listing?.images || [];
    return raw.map(imageFrom);
  }, [listing]);

  const currentImage = images[activeImageIndex]?.url || 'https://via.placeholder.com/700x450?text=No+Image';

  const triggerExpressInterest = async () => {
    try {
      await interestApi.create({ listingId: id });
      setActionMessage('Interest submitted successfully.');
    } catch (apiError) {
      setActionMessage(apiError?.response?.data?.message || 'Failed to submit interest.');
    }
  };

  const triggerPlaceOrder = async () => {
    try {
      await orderApi.create({ listingId: id });
      setActionMessage('Order request submitted successfully.');
    } catch (apiError) {
      setActionMessage(apiError?.response?.data?.message || 'Failed to place order.');
    }
  };

  const triggerReport = async () => {
    try {
      await reportApi.create({ listingId: id, reason: 'User reported this listing from detail page.' });
      setActionMessage('Listing reported successfully.');
    } catch (apiError) {
      setActionMessage(apiError?.response?.data?.message || 'Failed to report listing.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        <Link to="/feed" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back to Feed</Link>

        {loading && <p>Loading listing detail...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {listing && (
          <div className="glass" style={{ borderRadius: '18px', padding: '1rem' }}>
            {listing.flaggedForReview && (
              <div style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.16)', color: '#b45309' }}>
                Warning: This listing is flagged for review.
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div>
                <img src={currentImage} alt={listing.title} style={{ width: '100%', borderRadius: '12px', height: '340px', objectFit: 'cover' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {images.map((image, index) => (
                    <button key={image.public_id || index} type="button" onClick={() => setActiveImageIndex(index)} style={{ border: index === activeImageIndex ? '2px solid var(--color-cyan)' : '1px solid var(--glass-border)', padding: 0, borderRadius: '8px', overflow: 'hidden', width: '56px', height: '56px' }}>
                      <img src={image.url} alt={`thumb-${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h1 style={{ marginBottom: '0.5rem' }}>{listing.title}</h1>
                <p style={{ color: 'var(--color-cyan)', fontWeight: 800, marginBottom: '0.5rem' }}>₹{listing.price}</p>
                {listing.mrpLocked && <p style={{ marginBottom: '0.75rem', color: 'var(--color-pink)' }}>MRP Locked</p>}

                <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '1rem' }}>
                  <p>Department: {listing.department || 'N/A'}</p>
                  <p>Semester: {listing.semester || 'N/A'}</p>
                  <p>Subject: {listing.subject || 'N/A'}</p>
                  <p>ISBN: {listing.isbn || listing?.bookId?.isbn || 'N/A'}</p>
                  <p>
                    Status:{' '}
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(2,132,199,0.14)' }}>
                      {listing.status}
                    </span>
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '1rem' }}>
                  <p><strong>Seller:</strong> {listing?.sellerId?.name || listing?.sellerId?.email || 'N/A'}</p>
                  <p><strong>Book:</strong> {listing?.bookId?.title || listing.title}</p>
                  <p><strong>Original MRP:</strong> {listing?.bookId?.originalMrp ?? listing.mrp ?? 'N/A'}</p>
                  <p><strong>Total Resales:</strong> {listing?.bookId?.totalResales ?? 'N/A'}</p>
                  {listing?.sourceOrderId && <p><strong>Source Order:</strong> {listing.sourceOrderId}</p>}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button type="button" className="btn-primary" onClick={triggerExpressInterest}>Express Interest</button>
                  <button type="button" className="btn-primary" onClick={triggerPlaceOrder}>Place Order</button>
                  <button type="button" onClick={triggerReport} style={{ border: 'none', background: 'transparent', color: 'var(--color-pink)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Report this listing
                  </button>
                </div>

                {actionMessage && <p style={{ marginTop: '0.85rem', color: 'var(--text-dim)' }}>{actionMessage}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetailPage;
