import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPhonePage from './pages/AuthPhonePage';
import SignUpPage from './pages/SignUpPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import FeedPage from './pages/FeedPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ListingFormPage from './pages/ListingFormPage';
import MyListingsPage from './pages/MyListingsPage';
import CategoriesPage from './pages/CategoriesPage';
import BookDetailPage from './pages/BookDetailPage';
import MyOrdersPage from './pages/MyOrdersPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import OtpHandoffPage from './pages/OtpHandoffPage';
import InterestsPage from './pages/InterestsPage';
import { authApi, unwrapData } from './utils/campusApi';
import { useAuthStore } from './store/useAuthStore';
import { GuestOnlyRoute, ProtectedRoute } from './components/RouteGuards';

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);
  const hasToken = useAuthStore((state) => Boolean(state.token));

  const withTimeout = (promise, ms = 5000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error('Request timed out')), ms);
      }),
    ]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (isMounted) setAuthReady(true);

      if (!hasToken) {
        if (isMounted) {
          logout();
          setAuthReady(true);
        }
        return;
      }

      try {
        const refreshResponse = await withTimeout(authApi.refresh(), 5000);
        const refreshData = unwrapData(refreshResponse) || {};
        const accessToken = refreshData?.accessToken || refreshData?.token;
        let user = refreshData?.user || null;

        if (accessToken && !user) {
          try {
            const profileResponse = await withTimeout(authApi.getProfile(), 5000);
            const profileData = unwrapData(profileResponse) || {};
            user = profileData?.user || profileData;
          } catch {
            user = null;
          }
        }

        if (isMounted && accessToken) {
          setAuth(user, accessToken);
        } else if (isMounted) {
          if (!hasToken) logout();
        }
      } catch {
        if (isMounted && !hasToken) logout();
      } finally {
        if (isMounted) setAuthReady(true);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [hasToken, logout, setAuth, setAuthReady]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/auth/phone"
        element={(
          <GuestOnlyRoute>
            <AuthPhonePage />
          </GuestOnlyRoute>
        )}
      />
      <Route path="/auth/verify-otp" element={<OtpVerificationPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />

      <Route path="/feed" element={<FeedPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="/listings/new" element={<ListingFormPage mode="create" />} />
      <Route path="/listings/:id/edit" element={<ListingFormPage mode="edit" />} />
      <Route path="/my-listings" element={<MyListingsPage />} />

      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />

      <Route path="/orders/my" element={<MyOrdersPage />} />
      <Route path="/orders/selling" element={<SellerOrdersPage />} />
      <Route path="/orders/:id/handoff" element={<OtpHandoffPage />} />

      <Route path="/interests" element={<InterestsPage />} />

      <Route
        path="/login"
        element={(
          <GuestOnlyRoute>
            <AuthPhonePage />
          </GuestOnlyRoute>
        )}
      />
      <Route
        path="/signup"
        element={(
          <GuestOnlyRoute>
            <SignUpPage />
          </GuestOnlyRoute>
        )}
      />
      <Route
        path="/marketplace"
        element={(
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        )}
      />
      <Route path="/browse" element={<FeedPage />} />
      <Route
        path="/sell"
        element={(
          <ProtectedRoute>
            <ListingFormPage mode="create" />
          </ProtectedRoute>
        )}
      />
      <Route path="/cart" element={<MyOrdersPage />} />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}

export default App;
