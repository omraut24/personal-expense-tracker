import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader/Loader';
import ExpenseByCategoryChart from '../../components/Charts/ExpenseByCategoryChart';
import IncomeVsExpenseChart from '../../components/Charts/IncomeVsExpenseChart';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import styles from './Summary.module.css';

export default function Summary() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/summary/monthly', { params: { year, month } }),
      api.get('/summary/by-category', { params: { year, month } }),
      api.get('/summary/trend', { params: { months: 12 } }),
    ])
      .then(([s, bc, t]) => {
        setSummary(s.data);
        setByCategory(bc.data);
        setTrend(t.data);
      })
      .catch(() => setError('Failed to load summary.'))
      .finally(() => setLoading(false));
  }, [year, month]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Monthly Summary</h1>
        <div className={styles.controls}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={styles.select}>
            {months.map((m) => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={styles.select}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? <Loader fullPage /> : (
        <>
          <h2 className={styles.periodLabel}>{formatMonthYear(year, month)}</h2>

          <div className={styles.statsRow}>
            <div className={`${styles.statBox} ${styles.income}`}>
              <p className={styles.statLabel}>Income</p>
              <p className={styles.statValue}>{formatCurrency(summary?.total_income || 0)}</p>
            </div>
            <div className={`${styles.statBox} ${styles.expense}`}>
              <p className={styles.statLabel}>Expenses</p>
              <p className={styles.statValue}>{formatCurrency(summary?.total_expenses || 0)}</p>
            </div>
            <div className={`${styles.statBox} ${styles.balance}`}>
              <p className={styles.statLabel}>Balance</p>
              <p className={styles.statValue}>{formatCurrency(summary?.balance || 0)}</p>
            </div>
            <div className={`${styles.statBox} ${styles.savings}`}>
              <p className={styles.statLabel}>Savings Rate</p>
              <p className={styles.statValue}>{summary?.savings_rate || 0}%</p>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.cardTitle}>Expense Breakdown</h3>
              <ExpenseByCategoryChart data={byCategory} />
            </div>
            <div className={styles.chartCard}>
              <h3 className={styles.cardTitle}>12-Month Income vs Expenses</h3>
              <IncomeVsExpenseChart data={trend} />
            </div>
          </div>

          {byCategory.length > 0 && (
            <div className={styles.categoryTable}>
              <h3 className={styles.cardTitle}>Category Breakdown</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th className={styles.right}>Amount</th>
                    <th className={styles.right}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map((row) => (
                    <tr key={row.category_name}>
                      <td>{row.category_name}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[row.category_type]}`}>
                          {row.category_type}
                        </span>
                      </td>
                      <td className={`${styles.right} ${styles[row.category_type]}`}>
                        {formatCurrency(row.total)}
                      </td>
                      <td className={styles.right}>{row.percentage > 0 ? `${row.percentage}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
