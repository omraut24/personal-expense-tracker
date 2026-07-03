import styles from './Loader.module.css';

export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className={styles.overlay}>
        <div className={styles.spinner} />
      </div>
    );
  }
  return <div className={styles.spinner} />;
}
