import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });
  const [shaking, setShaking] = useState({ email: false, password: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setApiError('');

    const errors = { email: !form.email.trim(), password: !form.password };
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      setShaking(errors);
      setTimeout(() => setShaking({ email: false, password: false }), 500);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail))  setApiError(detail.map((d) => d.msg).join(', '));
      else if (detail)            setApiError(detail);
      else if (!err.response)     setApiError('Cannot reach the server. Please try again in a moment.');
      else                        setApiError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/BG-image.png)` }}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>📊</span>
            <span className={styles.logoText}>Expense Tracker</span>
          </div>
          <h2 className={styles.title}>Welcome back!</h2>
          <p className={styles.subtitle}>Please login to continue</p>
        </div>

        {apiError && <div className={styles.errorBanner}>{apiError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={[styles.input, fieldErrors.email ? styles.inputError : '', shaking.email ? styles.inputShake : ''].join(' ')}
              placeholder="Enter your email"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={[styles.input, styles.inputPassword, fieldErrors.password ? styles.inputError : '', shaking.password ? styles.inputShake : ''].join(' ')}
                placeholder="Enter your password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <div className={styles.rememberRow}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>
            <span className={styles.forgotLink}>Forgot password?</span>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
