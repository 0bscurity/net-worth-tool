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

// Helper to format numbers
const formatNumber = (v) =>
  v >= 1e6
    ? `$${(v / 1e6).toFixed(1)}M`
    : v >= 1e3
    ? `$${(v / 1e3).toFixed(0)}K`
    : `$${v}`;

// Helper to format dates as MM/DD
const formatDate = (d) => {
  const dt = new Date(d);
  return (
    `${(dt.getMonth() + 1).toString().padStart(2, "0")}/` +
    `${dt.getDate().toString().padStart(2, "0")}`
  );
};

export default function NetWorthLineChart({ dates, netWorths }) {
  const labels = dates.map(formatDate);

  const data = {
    labels,
    datasets: [
      {
        label: "Total Net Worth",
        data: netWorths,
        fill: false,
        tension: 0.3,
        borderColor: "#0081cc",
        pointBackgroundColor: "#0081cc",
        pointRadius: 3,
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
          title: ([ctx]) => dates[ctx.dataIndex],
          label: (ctx) => formatNumber(ctx.raw),
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 },
      },
      y: {position: 'right', beginAtZero: true, ticks: { callback: (v) => formatNumber(v) } },
    },
  };

  return (
    <div className="w-full" style={{ height: 240 }}>
      <Line data={data} options={options} redraw />
    </div>
  );
}
