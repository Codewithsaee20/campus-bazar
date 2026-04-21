import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  branch: '',
};

const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^\+?[0-9]{10,15}$/.test(value),
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const trimmedValues = useMemo(
    () => ({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      branch: form.branch.trim(),
    }),
    [form]
  );

  const validate = (values) => {
    const nextErrors = {};

    if (!values.name) nextErrors.name = 'Full name is required.';
    if (!values.email) nextErrors.email = 'College email is required.';
    else if (!validators.email(values.email)) nextErrors.email = 'Enter a valid email address.';

    if (!values.phone) nextErrors.phone = 'WhatsApp number is required.';
    else if (!validators.phone(values.phone)) nextErrors.phone = 'Use 10 to 15 digits with optional + prefix.';

    if (!values.department) nextErrors.department = 'Department is required.';
    if (!values.branch) nextErrors.branch = 'Branch is required.';

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));

    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));

    const nextErrors = validate(trimmedValues);
    setErrors((previous) => ({ ...previous, [name]: nextErrors[name] }));
  };

  const showFieldError = (field) => touched[field] && errors[field];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBackendError('');
    setSuccessMessage('');

    const nextErrors = validate(trimmedValues);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, department: true, branch: true });

    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        name: trimmedValues.name,
        email: trimmedValues.email,
        phone: trimmedValues.phone,
        department: trimmedValues.department,
        branch: trimmedValues.branch,
      });

      const responseEmail = response?.data?.data?.email || trimmedValues.email;
      setSuccessMessage('OTP sent to your email');

      window.setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(responseEmail)}`, {
          state: { identifier: responseEmail, email: responseEmail },
        });
      }, 700);
    } catch (error) {
      setBackendError(error?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: 'Full Name',
      name: 'name',
      type: 'text',
      placeholder: 'Enter your full name',
      autoComplete: 'name',
    },
    {
      label: 'College Email',
      name: 'email',
      type: 'email',
      placeholder: 'name@college.edu',
      autoComplete: 'email',
    },
    {
      label: 'WhatsApp Number',
      name: 'phone',
      type: 'tel',
      placeholder: '+919876543210',
      autoComplete: 'tel',
    },
    {
      label: 'Department',
      name: 'department',
      type: 'text',
      placeholder: 'Computer Science',
      autoComplete: 'organization-title',
    },
    {
      label: 'Branch',
      name: 'branch',
      type: 'text',
      placeholder: 'AI & ML',
      autoComplete: 'off',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f6ff 50%, #fdf7fb 100%)',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
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
          Create your account
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
          Join your campus marketplace with a verified college profile.
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

        {backendError && (
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
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {fields.slice(0, 2).map((field) => (
              <div key={field.name} style={{ display: 'grid', gap: '0.45rem' }}>
                <label htmlFor={field.name} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className="form-input signup-input"
                  disabled={loading}
                  style={{
                    background: '#ffffff',
                    border: showFieldError(field.name)
                      ? '1px solid rgba(239, 68, 68, 0.55)'
                      : '1px solid rgba(148, 163, 184, 0.25)',
                    color: 'var(--text-main)',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  }}
                />
                {showFieldError(field.name) && (
                  <span style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 500 }}>{errors[field.name]}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {fields.slice(2, 4).map((field) => (
              <div key={field.name} style={{ display: 'grid', gap: '0.45rem' }}>
                <label htmlFor={field.name} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className="form-input signup-input"
                  disabled={loading}
                  style={{
                    background: '#ffffff',
                    border: showFieldError(field.name)
                      ? '1px solid rgba(239, 68, 68, 0.55)'
                      : '1px solid rgba(148, 163, 184, 0.25)',
                    color: 'var(--text-main)',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  }}
                />
                {showFieldError(field.name) && (
                  <span style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 500 }}>{errors[field.name]}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <label htmlFor="branch" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Branch
            </label>
            <input
              id="branch"
              name="branch"
              type="text"
              value={form.branch}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="AI & ML"
              autoComplete="off"
              className="form-input signup-input"
              disabled={loading}
              style={{
                background: '#ffffff',
                border: showFieldError('branch')
                  ? '1px solid rgba(239, 68, 68, 0.55)'
                  : '1px solid rgba(148, 163, 184, 0.25)',
                color: 'var(--text-main)',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
            />
            {showFieldError('branch') && (
              <span style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 500 }}>{errors.branch}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: '0 18px 30px rgba(139, 92, 246, 0.20)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(event) => {
              if (loading) return;
              event.currentTarget.style.transform = 'translateY(-1px)';
              event.currentTarget.style.boxShadow = '0 22px 34px rgba(236, 72, 153, 0.20)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translateY(0)';
              event.currentTarget.style.boxShadow = '0 18px 30px rgba(139, 92, 246, 0.20)';
            }}
          >
            {loading ? 'Creating account...' : 'Send OTP'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
          Already registered?{' '}
          <a href="/login" style={{ color: 'var(--color-violet)', fontWeight: 700, textDecoration: 'none' }}>
            Login with OTP
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
