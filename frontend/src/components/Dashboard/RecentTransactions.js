import styles from './RecentTransactions.module.css';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function RecentTransactions({ transactions }) {
  if (!transactions?.length) {
    return <p className={styles.empty}>No transactions yet. Add your first one!</p>;
  }

  return (
    <div className={styles.list}>
      {transactions.map((tx) => (
        <div key={tx.id} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.category}>{tx.category?.name || 'Uncategorized'}</span>
            <span className={styles.desc}>{tx.description || '—'}</span>
          </div>
          <div className={styles.right}>
            <span className={`${styles.amount} ${styles[tx.type]}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
            <span className={styles.date}>{formatDate(tx.date)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
