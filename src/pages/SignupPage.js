import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very weak', color: '#f87171' },
    { label: 'Weak', color: '#fb923c' },
    { label: 'Fair', color: '#fbbf24' },
    { label: 'Good', color: '#34d399' },
    { label: 'Strong', color: '#6366f1' },
  ];
  return { score, ...levels[Math.min(score - 1, 4)] };
};

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm) return setError('All fields are required');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(100px)', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '10%', width: 350, height: 350, borderRadius: '50%', background: 'var(--x-glow)', filter: 'blur(100px)', opacity: 0.3, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="font-display"
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, var(--x-color), var(--accent), var(--o-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 8,
            }}
          >
            XTOE
          </motion.div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join the arena</p>
        </div>

        <div className="glass-card" style={{ padding: '36px 32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 8 }}>Create account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Start your journey to victory</p>

          <form onSubmit={handleSubmit}>
            {[
              { name: 'name', label: 'Display Name', type: 'text', placeholder: 'Your gaming name' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            ].map((field) => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  className="input-field"
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  autoComplete={field.name}
                />
              </div>
            ))}

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {/* Password strength bar */}
            {form.password && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: i <= strength.score ? strength.color : 'var(--border)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: strength.color }}>{strength.label}</p>
              </motion.div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                className="input-field"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {form.confirm && form.password !== form.confirm && (
                <p className="error-message">Passwords don't match</p>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
                style={{ marginBottom: 16, textAlign: 'center' }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', fontSize: 16, padding: '14px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
