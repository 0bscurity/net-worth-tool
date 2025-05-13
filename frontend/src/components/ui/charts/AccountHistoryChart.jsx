import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Helper function to format numbers as $1K, $11K, $100K, etc.
const formatNumber = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Helper function to format dates as MM/DD
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
};

export default function AccountHistoryChart({ dates, balances }) {
  const formattedDates = dates.map(formatDate);

  const data = {
    labels: formattedDates,
    datasets: [
      {
        label: "Balance",
        data: balances,
        fill: false,
        tension: 0.4,
        borderColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatNumber(context.raw)}`,
          title: (context) => {
            // Show full date in tooltip title
            const originalIndex = context[0].dataIndex;
            return dates[originalIndex];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatNumber(value),
        },
      },
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div style={{ height: 200 }}>
      <Line data={data} options={options} redraw={true} />
    </div>
  );
}
