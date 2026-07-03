import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader/Loader';
import Modal from '../../components/common/Modal/Modal';
import FilterBar from '../../components/Transactions/FilterBar';
import TransactionForm from '../../components/Transactions/TransactionForm';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExport';
import styles from './Transactions.module.css';

const EMPTY_FILTERS = { search: '', type: '', category_id: '', date_from: '', date_to: '' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 20, total_pages: 0 });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: pagination.per_page, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/transactions', { params });
      setTransactions(data.items);
      setPagination({ total: data.total, page: data.page, per_page: data.per_page, total_pages: data.total_pages });
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const extractError = (err, fallback) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ');
    if (detail) return detail;
    if (!err.response) return 'Cannot reach the server. Make sure the backend is running on port 8000.';
    return fallback;
  };

  const handleAdd = async (payload) => {
    setFormLoading(true);
    try {
      await api.post('/transactions', payload);
      setModal(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      setError(extractError(err, 'Failed to create transaction.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (payload) => {
    setFormLoading(true);
    try {
      await api.put(`/transactions/${selected.id}`, payload);
      setModal(null);
      setSelected(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      setError(extractError(err, 'Failed to update transaction.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/transactions/${selected.id}`);
      setModal(null);
      setSelected(null);
      fetchTransactions(pagination.page);
    } catch {
      setError('Failed to delete transaction.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Transactions</h1>
        <div className={styles.headerActions}>
          <button className={styles.csvBtn} onClick={downloadCSV}>Export CSV</button>
          <button className={styles.addBtn} onClick={() => setModal('add')}>+ Add Transaction</button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <FilterBar filters={filters} categories={categories} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />

      {loading ? (
        <div className={styles.loaderWrap}><Loader /></div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className={styles.right}>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>No transactions found.</td></tr>
                ) : transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className={styles.dateCell}>{formatDate(tx.date)}</td>
                    <td>{tx.category?.name || '—'}</td>
                    <td className={styles.descCell}>{tx.description || '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[tx.type]}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`${styles.right} ${styles[tx.type]}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => { setSelected(tx); setModal('edit'); }}
                        >Edit</button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => { setSelected(tx); setModal('delete'); }}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={pagination.page <= 1}
                onClick={() => fetchTransactions(pagination.page - 1)}
              >&#8592; Prev</button>
              <span className={styles.pageInfo}>
                Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
              </span>
              <button
                className={styles.pageBtn}
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => fetchTransactions(pagination.page + 1)}
              >Next &#8594;</button>
            </div>
          )}
        </>
      )}

      {modal === 'add' && (
        <Modal title="Add Transaction" onClose={() => setModal(null)}>
          <TransactionForm
            categories={categories}
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Transaction" onClose={() => { setModal(null); setSelected(null); }}>
          <TransactionForm
            initial={{
              type: selected.type,
              category_id: selected.category_id,
              amount: selected.amount,
              description: selected.description || '',
              date: selected.date,
            }}
            categories={categories}
            onSubmit={handleEdit}
            onCancel={() => { setModal(null); setSelected(null); }}
            loading={formLoading}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete Transaction" onClose={() => { setModal(null); setSelected(null); }}>
          <div className={styles.deleteConfirm}>
            <p>Are you sure you want to delete this transaction?</p>
            <p className={styles.deleteDetail}>
              <strong>{selected.category?.name}</strong> — {formatCurrency(selected.amount)} on {formatDate(selected.date)}
            </p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => { setModal(null); setSelected(null); }} disabled={formLoading}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={formLoading}>
                {formLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
