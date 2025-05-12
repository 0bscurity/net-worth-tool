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

export default function AccountHistoryChart({ dates, balances }) {
  const data = {
    labels: dates,
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
    plugins: { legend: { display: false } },
  };

  return (
    <div style={{ height: 200 }}>
      <Line data={data} options={options} redraw={true} />
    </div>
  );
}
