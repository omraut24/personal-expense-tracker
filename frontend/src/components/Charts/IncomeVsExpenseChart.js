import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js';
import styles from './Chart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function IncomeVsExpenseChart({ data }) {
  if (!data?.length) return <p className={styles.empty}>No data available.</p>;

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Income',
        data: data.map((d) => d.income),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: data.map((d) => d.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } },
    },
  };

  return (
    <div className={styles.chartWrap}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
