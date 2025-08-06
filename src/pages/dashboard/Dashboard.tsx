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
import { useAppSelector } from '../../redux'
import { 
  HiCurrencyDollar, 
  HiUsers, 
  HiCalendar, 
  HiCog, 
  HiTrendingUp,
  HiClock
} from 'react-icons/hi'

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

export default function Dashboard() {
  const customers = useAppSelector(state => state.customers.list)
  const appointments = useAppSelector(state => state.appointments.data)
  const { catalog, workOrders, technicians } = useAppSelector(state => state.services)

  // Calculate metrics
  const totalCustomers = customers.length
  const totalVehicles = customers.reduce((sum, customer) => sum + (customer.vehicles?.length || 0), 0)
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length
  const completedServices = workOrders.filter(wo => wo.status === 'completed').length
  const totalRevenue = workOrders.reduce((sum, wo) => sum + wo.total, 0)
  const avgServiceValue = totalRevenue / Math.max(workOrders.length, 1)

  // Service distribution data
  const serviceDistribution = {
    labels: ['Oil Change', 'Brake Service', 'Tire Service', 'Engine Repair', 'Other'],
    datasets: [
      {
        data: [35, 20, 15, 18, 12],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  }

  // Monthly revenue data
  const monthlyRevenue = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 15000, 18000, 16000, 22000, 25000],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  }

  // Customer growth data
  const customerGrowth = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Customers',
        data: [5, 8, 12, 15],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const efficiency = 85

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🔧 Auto Repair Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
          Updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiUsers className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{todayAppointments}</p>
              <p className="text-sm text-blue-600 mt-1">3 confirmed, 2 pending</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiCalendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+18% from last month</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiCurrencyDollar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Service Value</p>
              <p className="text-3xl font-bold text-gray-900">${avgServiceValue.toFixed(0)}</p>
              <p className="text-sm text-purple-600 mt-1">+5% from last month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <HiTrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Service Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Service Distribution</h2>
          <div className="h-64">
            <Doughnut data={serviceDistribution} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Revenue</h2>
          <div className="h-64">
            <Bar data={monthlyRevenue} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Customer Growth</h2>
          <div className="h-64">
            <Line data={customerGrowth} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Efficiency */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Shop Efficiency</h2>
          <div className="flex items-center justify-center">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={efficiency}
                text={`${efficiency}%`}
                styles={buildStyles({
                  textColor: "#059669",
                  pathColor: "#059669",
                  trailColor: "#e5e7eb",
                  textSize: "18px",
                  strokeLinecap: "round",
                })}
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">Technician utilization</p>
            <p className="text-xs text-green-600 mt-1">Above target (80%)</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Oil change completed</p>
                <p className="text-xs text-gray-500">John Smith - 2020 Toyota Camry</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New appointment scheduled</p>
                <p className="text-xs text-gray-500">Lisa Brown - Brake inspection</p>
                <p className="text-xs text-gray-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Parts order pending</p>
                <p className="text-xs text-gray-500">Brake pads for Honda Civic</p>
                <p className="text-xs text-gray-400">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Technicians</span>
              <span className="font-semibold">{technicians.filter(t => t.isActive).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vehicles Serviced</span>
              <span className="font-semibold">{totalVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Services Available</span>
              <span className="font-semibold">{catalog.filter(s => s.isActive).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Services</span>
              <span className="font-semibold">{completedServices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Service Time</span>
              <span className="font-semibold">2.5 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
