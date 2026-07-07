import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [shaking, setShaking] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())         e.full_name = 'Full name is required';
    if (!form.email.trim())             e.email = 'Email is required';
    if (form.password.length < 6)       e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      const shakeState = Object.fromEntries(Object.keys(errs).map((k) => [k, true]));
      setShaking(shakeState);
      setTimeout(() => setShaking({}), 500);
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.full_name, form.password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail))  setApiError(detail.map((d) => d.msg).join(', '));
      else if (detail)            setApiError(detail);
      else if (!err.response)     setApiError('Cannot reach the server. Please try again in a moment.');
      else                        setApiError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    [styles.input, fieldErrors[name] ? styles.inputError : '', shaking[name] ? styles.inputShake : ''].join(' ');

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
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Start tracking your expenses</p>
        </div>

        {apiError && <div className={styles.errorBanner}>{apiError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className={inputClass('full_name')}
              placeholder="John Doe"
              autoFocus
            />
            {fieldErrors.full_name && <span className={styles.fieldError}>{fieldErrors.full_name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`${inputClass('password')} ${styles.inputPassword}`}
                placeholder="Min. 6 characters"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className={`${inputClass('confirm')} ${styles.inputPassword}`}
                placeholder="Repeat your password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
            {fieldErrors.confirm && <span className={styles.fieldError}>{fieldErrors.confirm}</span>}
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
