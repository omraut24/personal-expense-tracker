import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './Chart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function ExpenseByCategoryChart({ data }) {
  if (!data?.length) {
    return <p className={styles.empty}>No expense data for this period.</p>;
  }

  const expenses = data.filter((d) => d.category_type === 'expense');

  const chartData = {
    labels: expenses.map((d) => d.category_name),
    datasets: [{
      data: expenses.map((d) => d.total),
      backgroundColor: COLORS.slice(0, expenses.length),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toFixed(2)} (${expenses[ctx.dataIndex]?.percentage}%)`,
        },
      },
    },
  };

  return (
    <div className={styles.chartWrap}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
