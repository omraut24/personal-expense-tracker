import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader/Loader';
import StatCard from '../../components/Dashboard/StatCard';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import ExpenseByCategoryChart from '../../components/Charts/ExpenseByCategoryChart';
import MonthlyTrendChart from '../../components/Charts/MonthlyTrendChart';
import IncomeVsExpenseChart from '../../components/Charts/IncomeVsExpenseChart';
import { formatCurrency } from '../../utils/formatters';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    Promise.all([
      api.get('/summary/monthly', { params: { year: now.getFullYear(), month: now.getMonth() + 1 } }),
      api.get('/summary/by-category', { params: { year: now.getFullYear(), month: now.getMonth() + 1 } }),
      api.get('/summary/trend', { params: { months: 6 } }),
      api.get('/transactions', { params: { per_page: 10, page: 1 } }),
    ])
      .then(([s, bc, t, tx]) => {
        setSummary(s.data);
        setByCategory(bc.data);
        setTrend(t.data);
        setRecent(tx.data.items);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.statsGrid}>
        <StatCard title="Total Income" amount={summary?.total_income || 0} icon="&#128200;" variant="income" />
        <StatCard title="Total Expenses" amount={summary?.total_expenses || 0} icon="&#128201;" variant="expense" />
        <StatCard title="Balance" amount={summary?.balance || 0} icon="&#128181;" variant="balance" />
        <StatCard title="Savings" amount={(summary?.balance || 0) > 0 ? summary.balance : 0} icon="&#127381;" variant="savings" />
      </div>

      {summary && (
        <div className={styles.savingsRate}>
          <span>Savings Rate this month:</span>
          <strong className={summary.savings_rate >= 0 ? styles.positive : styles.negative}>
            {summary.savings_rate}%
          </strong>
        </div>
      )}

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Expense by Category</h2>
          <ExpenseByCategoryChart data={byCategory} />
        </div>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Monthly Trend (6 months)</h2>
          <MonthlyTrendChart data={trend} />
        </div>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Income vs Expenses</h2>
          <IncomeVsExpenseChart data={trend} />
        </div>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Recent Transactions</h2>
          <RecentTransactions transactions={recent} />
        </div>
      </div>
    </div>
  );
}
