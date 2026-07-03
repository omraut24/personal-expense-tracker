import styles from './FilterBar.module.css';

export default function FilterBar({ filters, categories, onChange, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className={styles.bar}>
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleChange}
        placeholder="Search description..."
        className={styles.input}
      />
      <select name="type" value={filters.type} onChange={handleChange} className={styles.select}>
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select name="category_id" value={filters.category_id} onChange={handleChange} className={styles.select}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="date"
        name="date_from"
        value={filters.date_from}
        onChange={handleChange}
        className={styles.input}
      />
      <input
        type="date"
        name="date_to"
        value={filters.date_to}
        onChange={handleChange}
        className={styles.input}
      />
      <button onClick={onReset} className={styles.resetBtn}>Reset</button>
    </div>
  );
}
