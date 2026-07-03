import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler,
} from 'chart.js';
import styles from './Chart.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function MonthlyTrendChart({ data }) {
  if (!data?.length) return <p className={styles.empty}>No trend data available.</p>;

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Income',
        data: data.map((d) => d.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Expenses',
        data: data.map((d) => d.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
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
      <Line data={chartData} options={options} />
    </div>
  );
}
