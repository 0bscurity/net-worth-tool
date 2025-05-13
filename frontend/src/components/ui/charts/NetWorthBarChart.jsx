import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

// Helper function to format numbers as $10K, $1M, etc.
const formatNumber = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

export default function NetWorthBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Net Worth",
        data: data.values,
        backgroundColor: data.colors,
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: "x", // Vertical bar chart
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => formatNumber(context.raw),
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
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[250px] md:h-[400px]">
        <Bar data={chartData} options={options} style={{ width: "100%" }} />
      </div>
      <div className="flex flex-wrap justify-center items-center mt-4 space-x-3 mx-2">
        {data.labels.map((label, index) => (
          <div key={label} className="flex items-center space-x-1">
            <span
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: data.colors[index % data.colors.length],
              }}
            />
            <span className="text-xs md:text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
