import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi, unwrapData } from '../utils/campusApi';

const OTP_VALIDITY_SECONDS = 120;
const OTP_LENGTH = 6;

const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const searchParams = new URLSearchParams(location.search);
  const initialIdentifier = location.state?.identifier || location.state?.email || searchParams.get('email') || searchParams.get('identifier') || '';
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otpDigits, setOtpDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [secondsLeft, setSecondsLeft] = useState(OTP_VALIDITY_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const otpRefs = useRef([]);

  const otpValue = otpDigits.join('');
  const isComplete = otpValue.length === OTP_LENGTH && otpDigits.every(Boolean);

  useEffect(() => {
    if (!identifier) {
      navigate('/auth/phone');
    }
  }, [identifier, navigate]);

  useEffect(() => {
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const updateDigit = (index, value) => {
    const nextValue = value.replace(/\D/g, '').slice(0, 1);
    setOtpDigits((previous) => {
      const next = [...previous];
      next[index] = nextValue;
      return next;
    });

    if (nextValue && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otpDigits[index] && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedValue) return;

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedValue[index] || '');
    setOtpDigits(nextDigits);

    const focusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isComplete) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.verifyOtp(identifier, otpValue);
      const data = unwrapData(response);

      if (data?.user && data?.accessToken) {
        setAuth(data.user, data.accessToken);
      }

      setSuccessMessage('OTP verified successfully. Redirecting to marketplace...');

      window.setTimeout(() => {
        navigate('/marketplace', { replace: true });
      }, 700);
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'OTP verification failed.';
      if (/expired/i.test(message)) {
        setError('Expired OTP error: Please resend and try again.');
      } else if (/invalid/i.test(message)) {
        setError('Invalid OTP error: Please check the code and try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    try {
      setResending(true);
      await authApi.sendOtp(identifier);
      setSecondsLeft(OTP_VALIDITY_SECONDS);
      setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
      otpRefs.current[0]?.focus();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f6ff 45%, #fdf7fb 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2rem',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(139, 92, 246, 0.12)',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)',
          color: 'var(--text-main)',
        }}
      >
        <div
          style={{
            height: '4px',
            width: '72px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, var(--color-violet), var(--color-pink))',
            marginBottom: '1.25rem',
          }}
        />

        <h1 style={{ fontSize: '2rem', lineHeight: 1.1, marginBottom: '0.5rem', fontWeight: 800 }}>
          Verify your OTP
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
          Enter the code sent to your email.
        </p>

        {successMessage && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '14px',
              background: 'rgba(34, 197, 94, 0.10)',
              color: '#15803d',
              border: '1px solid rgba(34, 197, 94, 0.20)',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#b91c1c',
              border: '1px solid rgba(239, 68, 68, 0.18)',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <label htmlFor="otp-email" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Email
            </label>
            <input
              id="otp-email"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value.trimStart())}
              className="form-input"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: 'var(--text-main)',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              OTP
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.5rem' }} onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className="form-input"
                  aria-label={`OTP digit ${index + 1}`}
                  disabled={loading}
                  style={{
                    textAlign: 'center',
                    padding: '0.95rem 0.5rem',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    background: '#ffffff',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: 'var(--text-main)',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                    event.currentTarget.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.10)';
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
                    event.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Resend in: {formattedTimer}</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={secondsLeft > 0 || resending || loading}
              style={{
                border: 'none',
                background: 'transparent',
                color: secondsLeft > 0 ? 'var(--text-muted)' : 'var(--color-violet)',
                cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                transition: 'color 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(event) => {
                if (secondsLeft > 0 || resending || loading) return;
                event.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !isComplete}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: '0 18px 30px rgba(139, 92, 246, 0.20)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
              opacity: loading || !isComplete ? 0.7 : 1,
              cursor: loading || !isComplete ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(event) => {
              if (loading || !isComplete) return;
              event.currentTarget.style.transform = 'translateY(-1px)';
              event.currentTarget.style.boxShadow = '0 22px 34px rgba(236, 72, 153, 0.20)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translateY(0)';
              event.currentTarget.style.boxShadow = '0 18px 30px rgba(139, 92, 246, 0.20)';
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
          Didn’t receive the code? Make sure the email is correct and tap resend after the timer ends.
        </p>
      </motion.div>
    </div>
  );
};

export default OtpVerificationPage;
