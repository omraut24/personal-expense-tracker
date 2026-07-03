import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>&#128184;</span>
        <span className={styles.brandName}>ExpenseTracker</span>
      </div>
      <div className={styles.links}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Transactions
        </NavLink>
        <NavLink to="/summary" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Summary
        </NavLink>
      </div>
      <div className={styles.user}>
        <span className={styles.userName}>{user?.full_name}</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
