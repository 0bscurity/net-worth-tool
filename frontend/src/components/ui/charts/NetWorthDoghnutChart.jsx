import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function NetWorthChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.values,
      backgroundColor: data.colors,
      hoverOffset: 10,
    }]
  };

  const options = {
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}