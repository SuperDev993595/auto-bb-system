import { useState, useMemo } from 'react'
import { useAppSelector } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
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
  TimeScale
} from 'chart.js'
import { Doughnut, Bar, Line, Pie } from 'react-chartjs-2'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Settings,
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
  BarChart3,
  FileText,
  UserGroup,
  Truck
} from '../utils/icons'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale
)

type ReportType = 'overview' | 'revenue' | 'customers' | 'services' | 'technicians' | 'inventory'
type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom'

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('overview')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const customers = useAppSelector(state => state.customers.list)
  const appointments = useAppSelector(state => state.appointments.data)
  const { catalog, workOrders, technicians } = useAppSelector(state => state.services)
  const invoices = useAppSelector(state => state.invoices.invoices)
  const inventory = useAppSelector(state => state.inventory.items)

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    let startDate: Date
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    const endDate = dateRange === 'custom' && customEndDate ? new Date(customEndDate) : now
    return { startDate, endDate }
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    const { startDate, endDate } = getDateRange()
    
    // Filter data by date range
    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date)
      return invDate >= startDate && invDate <= endDate
    })
    
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= startDate && aptDate <= endDate
    })
    
    const filteredWorkOrders = workOrders.filter(wo => {
      const woDate = new Date(wo.date)
      return woDate >= startDate && woDate <= endDate
    })

    // Revenue metrics
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidRevenue = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
    const outstandingRevenue = totalRevenue - paidRevenue
    const avgInvoiceValue = totalRevenue / Math.max(filteredInvoices.length, 1)

    // Service metrics
    const completedServices = filteredWorkOrders.filter(wo => wo.status === 'completed').length
    const totalServices = filteredWorkOrders.length
    const avgServiceValue = filteredWorkOrders.reduce((sum, wo) => sum + wo.total, 0) / Math.max(totalServices, 1)
    
    // Customer metrics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.lastVisit && new Date(c.lastVisit) >= startDate).length
    const newCustomers = customers.filter(c => new Date(c.dateCreated) >= startDate).length
    const customerRetentionRate = (activeCustomers / Math.max(totalCustomers, 1)) * 100

    // Appointment metrics
    const totalAppointments = filteredAppointments.length
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length
    const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled').length
    const noShowAppointments = filteredAppointments.filter(apt => apt.status === 'no-show').length
    const appointmentCompletionRate = (completedAppointments / Math.max(totalAppointments, 1)) * 100

    return {
      revenue: {
        total: totalRevenue,
        paid: paidRevenue,
        outstanding: outstandingRevenue,
        avgInvoice: avgInvoiceValue
      },
      services: {
        completed: completedServices,
        total: totalServices,
        avgValue: avgServiceValue,
        completionRate: (completedServices / Math.max(totalServices, 1)) * 100
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        new: newCustomers,
        retentionRate: customerRetentionRate
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        noShow: noShowAppointments,
        completionRate: appointmentCompletionRate
      }
    }
  }, [customers, appointments, workOrders, invoices, dateRange, customStartDate, customEndDate])

  // Chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [15000, 18000, 22000, 19000, 25000, 28000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const serviceDistributionData = {
    labels: ['Oil Change', 'Brake Service', 'Tire Service', 'Engine Repair', 'Transmission', 'Other'],
    datasets: [
      {
        data: [35, 20, 15, 12, 8, 10],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#6b7280'
        ]
      }
    ]
  }

  const customerGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Customers',
        data: [8, 12, 15, 18, 22, 25],
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        label: 'Returning Customers',
        data: [45, 48, 52, 55, 58, 62],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  }

  const technicianPerformanceData = {
    labels: technicians.map(t => t.name),
    datasets: [
      {
        label: 'Services Completed',
        data: [25, 32, 28, 35],
        backgroundColor: '#8b5cf6'
      },
      {
        label: 'Revenue Generated',
        data: [15000, 19200, 16800, 21000],
        backgroundColor: '#f59e0b'
      }
    ]
  }

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${metrics.revenue.total.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+12.5% vs last period</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiCurrencyDollar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.customers.active}</p>
              <p className="text-sm text-blue-600 mt-1">{metrics.customers.retentionRate.toFixed(1)}% retention</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Services Completed</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.services.completed}</p>
              <p className="text-sm text-purple-600 mt-1">{metrics.services.completionRate.toFixed(1)}% completion rate</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <HiCog className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Service Value</p>
              <p className="text-2xl font-bold text-yellow-600">${metrics.services.avgValue.toFixed(0)}</p>
              <p className="text-sm text-yellow-600 mt-1">+8.3% vs last period</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiTrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution</h3>
          <div className="h-64">
            <Doughnut data={serviceDistributionData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.appointments.completionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Appointment Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">${metrics.revenue.avgInvoice.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Average Invoice Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{metrics.customers.new}</div>
            <div className="text-sm text-gray-600">New Customers This Period</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Total Revenue</h4>
          <p className="text-3xl font-bold text-green-600">${metrics.revenue.total.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">This period</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Paid Revenue</h4>
          <p className="text-3xl font-bold text-blue-600">${metrics.revenue.paid.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">{((metrics.revenue.paid / metrics.revenue.total) * 100).toFixed(1)}% of total</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Outstanding</h4>
          <p className="text-3xl font-bold text-yellow-600">${metrics.revenue.outstanding.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Pending collection</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
        <div className="h-80">
          <Line data={revenueChartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  )

  const renderCustomersReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{metrics.customers.total}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{metrics.customers.active}</div>
          <div className="text-sm text-gray-600">Active Customers</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{metrics.customers.new}</div>
          <div className="text-sm text-gray-600">New Customers</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{metrics.customers.retentionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Retention Rate</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Growth</h3>
        <div className="h-80">
          <Bar data={customerGrowthData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  )

  const renderTechniciansReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Technician Performance</h3>
        <div className="h-80">
          <Bar data={technicianPerformanceData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {technicians.map(tech => (
          <div key={tech.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800">{tech.name}</h4>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Services:</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium">$18,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg/Service:</span>
                <span className="font-medium">$657</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span className="font-medium">4.8/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Reports & Analytics" />
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="custom">Custom range</option>
          </select>
          
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </>
          )}
          
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-md">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'revenue', label: 'Revenue', icon: DollarSign },
              { key: 'customers', label: 'Customers', icon: Users },
              { key: 'services', label: 'Services', icon: Settings },
              { key: 'technicians', label: 'Technicians', icon: UserGroup },
              { key: 'inventory', label: 'Inventory', icon: Truck }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveReport(tab.key as ReportType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  activeReport === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeReport === 'overview' && renderOverviewReport()}
          {activeReport === 'revenue' && renderRevenueReport()}
          {activeReport === 'customers' && renderCustomersReport()}
          {activeReport === 'technicians' && renderTechniciansReport()}
          {activeReport === 'services' && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Services Report</h3>
              <p className="text-gray-400">Detailed service analytics coming soon...</p>
            </div>
          )}
          {activeReport === 'inventory' && (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Inventory Report</h3>
              <p className="text-gray-400">Inventory analytics and trends coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
