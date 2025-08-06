import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
)

const doughnutData = {
  labels: ['Paid Debt', 'Remaining Debt'],
  datasets: [
    {
      data: [1750, 8250],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    },
  ],
}

const barData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Payments',
      data: [500, 700, 800, 650, 900],
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    },
  ],
}

const lineData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Visits',
      data: [20, 35, 28, 42],
      borderColor: '#facc15',
      backgroundColor: '#fef9c3',
      tension: 0.4,
      fill: true,
    },
  ],
}

const value = 75

export default function Dashboard() {
  return (
    <div className="p-6 md:p-10 space-y-10 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-800">📊 Business Dashboard</h1>
        <span className="text-sm text-gray-500">Updated: {new Date().toLocaleDateString()}</span>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm">Total Debt</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">$10,000</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm">Paid This Month</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">$900</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm">Active Customers</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">42</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Debt Status */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Debt Status</h2>
          <Doughnut data={doughnutData} />
        </div>

        {/* Monthly Payments */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Monthly Payments</h2>
          <Bar data={barData} />
        </div>

        {/* Customer Visits */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Customer Visits</h2>
          <Line data={lineData} />
        </div>

        {/* Collection Efficiency */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col items-center justify-center col-span-full md:col-span-2 xl:col-span-1">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Collection Efficiency</h2>
          <div className="w-40 h-40">
            <CircularProgressbar
              value={value}
              text={`${value}%`}
              styles={buildStyles({
                textColor: "#14b8a6",
                pathColor: "#14b8a6",
                trailColor: "#e5e7eb",
                textSize: "18px",
                strokeLinecap: "round",
              })}
            />
          </div>
          <span className="mt-4 text-md font-medium text-teal-700">
            {value}% efficiency this month
          </span>
        </div>
      </div>
    </div>
  )
}
