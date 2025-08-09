import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data, title, height = 300 }) => {
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
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;