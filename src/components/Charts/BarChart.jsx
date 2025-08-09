import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, title, height = 300 }) => {
  const { isDark } = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        color: isDark ? '#F3F4F6' : '#1F2937',
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
      },
      y: {
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          callback: (value) => `$${value}`,
        },
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;