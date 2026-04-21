import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { categoryApi, unwrapData } from '../utils/campusApi';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await categoryApi.getAll();
        setCategories(unwrapData(response) || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || 'Could not fetch categories.');
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
        <h1 style={{ marginBottom: '1rem' }}>Categories</h1>

        {loading && <p>Loading categories...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {categories.map((category) => (
            <Link key={category._id || category.slug || category.name} to={`/feed?category=${encodeURIComponent(category.name || '')}`} className="glass" style={{ borderRadius: '12px', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
