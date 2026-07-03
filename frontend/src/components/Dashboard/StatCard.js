import styles from './StatCard.module.css';
import { formatCurrency } from '../../utils/formatters';

export default function StatCard({ title, amount, icon, variant = 'default' }) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.amount}>{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}
