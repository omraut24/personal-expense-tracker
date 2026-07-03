import { useState, useEffect } from 'react';
import styles from './TransactionForm.module.css';

export default function TransactionForm({ initial, categories, onSubmit, onCancel, loading }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    type: 'expense',
    category_id: '',
    amount: '',
    description: '',
    date: today,
    ...initial,
  });
  const [errors, setErrors] = useState({});

  const filtered = categories.filter((c) => c.type === form.type);

  useEffect(() => {
    if (initial) setForm({ ...initial });
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Amount must be positive';
    if (!form.category_id) e.category_id = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      category_id: parseInt(form.category_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.typeToggle}>
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.typeBtn} ${form.type === t ? styles[t] : ''}`}
            onClick={() => setForm((prev) => ({ ...prev, type: t, category_id: '' }))}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Amount *</label>
        <input
          type="number"
          name="amount"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
          placeholder="0.00"
        />
        {errors.amount && <span className={styles.error}>{errors.amount}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Category *</label>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className={`${styles.input} ${errors.category_id ? styles.inputError : ''}`}
        >
          <option value="">Select category</option>
          {filtered.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.category_id && <span className={styles.error}>{errors.category_id}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Date *</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
        />
        {errors.date && <span className={styles.error}>{errors.date}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className={styles.input}
          placeholder="Optional note"
          maxLength={200}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}>Cancel</button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
