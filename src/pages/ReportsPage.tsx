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
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Download,
  BarChart3,
  FileText,
  Truck,
  Cog,
  Calendar,
  Clock,
  AlertCircle
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
  const [isExporting, setIsExporting] = useState(false)

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
      const invDate = new Date(inv.date || inv.createdAt)
      return invDate >= startDate && invDate <= endDate
    })
    
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date || apt.createdAt)
      return aptDate >= startDate && aptDate <= endDate
    })
    
    const filteredWorkOrders = workOrders.filter(wo => {
      const woDate = new Date(wo.date || wo.createdAt)
      return woDate >= startDate && woDate <= endDate
    })

    // Revenue metrics
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    const paidRevenue = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
    const outstandingRevenue = totalRevenue - paidRevenue
    const avgInvoiceValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0

    // Service metrics
    const completedServices = filteredWorkOrders.filter(wo => wo.status === 'completed').length
    const totalServices = filteredWorkOrders.length
    const avgServiceValue = totalServices > 0 ? filteredWorkOrders.reduce((sum, wo) => sum + (wo.total || 0), 0) / totalServices : 0
    
    // Customer metrics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => {
      const lastVisit = c.lastVisit || c.updatedAt
      return lastVisit && new Date(lastVisit) >= startDate
    }).length
    const newCustomers = customers.filter(c => {
      const dateCreated = c.dateCreated || c.createdAt
      return dateCreated && new Date(dateCreated) >= startDate
    }).length
    const customerRetentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0

    // Appointment metrics
    const totalAppointments = filteredAppointments.length
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length
    const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled').length
    const noShowAppointments = filteredAppointments.filter(apt => apt.status === 'no-show').length
    const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

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
        completionRate: totalServices > 0 ? (completedServices / totalServices) * 100 : 0
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

  // Generate real chart data based on actual data
  const generateChartData = () => {
    const { startDate, endDate } = getDateRange()
    const months = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      months.push(currentDate.toLocaleDateString('en-US', { month: 'short' }))
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Generate revenue data based on actual invoices
    const revenueData = months.map(month => {
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date || inv.createdAt)
        return invDate.toLocaleDateString('en-US', { month: 'short' }) === month
      })
      return monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    })

    // Generate service distribution based on actual work orders
    const serviceTypes = [...new Set(workOrders.map(wo => wo.serviceType || 'Other'))]
    const serviceData = serviceTypes.map(type => {
      return workOrders.filter(wo => (wo.serviceType || 'Other') === type).length
    })

    // Generate customer growth data
    const customerGrowthData = months.map(month => {
      const monthCustomers = customers.filter(c => {
        const dateCreated = new Date(c.dateCreated || c.createdAt)
        return dateCreated.toLocaleDateString('en-US', { month: 'short' }) === month
      })
      return monthCustomers.length
    })

    return {
      revenue: {
        labels: months,
        datasets: [{
          label: 'Revenue',
          data: revenueData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      serviceDistribution: {
        labels: serviceTypes,
        datasets: [{
          data: serviceData,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#6b7280'
          ]
        }]
      },
      customerGrowth: {
        labels: months,
        datasets: [{
          label: 'New Customers',
          data: customerGrowthData,
          backgroundColor: '#10b981',
          borderRadius: 4
        }]
      }
    }
  }

  const chartData = generateChartData()

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { startDate, endDate } = getDateRange()
      
      const reportData = {
        reportType: activeReport,
        dateRange: { 
          start: startDate.toISOString(), 
          end: endDate.toISOString(),
          display: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        },
        metrics,
        technicianMetrics,
        chartData,
        generatedAt: new Date().toISOString(),
        summary: {
          totalCustomers: customers.length,
          totalAppointments: appointments.length,
          totalInvoices: invoices.length,
          totalWorkOrders: workOrders.length,
          totalInventory: inventory.length,
          totalRevenue: metrics.revenue.total,
          totalServices: metrics.services.total
        }
      }

      // Create different export formats
      const formats = [
        { type: 'application/json', extension: 'json', name: 'JSON Report' },
        { type: 'text/csv', extension: 'csv', name: 'CSV Report' }
      ]

      const selectedFormat = formats[0] // Default to JSON, could be made configurable
      
      let content, filename
      if (selectedFormat.extension === 'csv') {
        // Generate CSV content
        const csvContent = generateCSVContent(reportData)
        content = csvContent
        filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.csv`
      } else {
        // Generate JSON content
        content = JSON.stringify(reportData, null, 2)
        filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.json`
      }

      const blob = new Blob([content], { type: selectedFormat.type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success message (could be replaced with toast notification)
      console.log(`Report exported successfully: ${filename}`)
    } catch (error) {
      console.error('Export failed:', error)
      // Show error message (could be replaced with toast notification)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Generate CSV content for export
  const generateCSVContent = (reportData: any) => {
    const { metrics, technicianMetrics, summary } = reportData
    
    let csv = 'Report Type,Value\n'
    csv += `Date Range,${reportData.dateRange.display}\n`
    csv += `Generated At,${new Date(reportData.generatedAt).toLocaleString()}\n\n`
    
    csv += 'Revenue Metrics\n'
    csv += 'Metric,Value\n'
    csv += `Total Revenue,$${metrics.revenue.total.toLocaleString()}\n`
    csv += `Paid Revenue,$${metrics.revenue.paid.toLocaleString()}\n`
    csv += `Outstanding Revenue,$${metrics.revenue.outstanding.toLocaleString()}\n`
    csv += `Average Invoice Value,$${metrics.revenue.avgInvoice.toFixed(2)}\n\n`
    
    csv += 'Service Metrics\n'
    csv += 'Metric,Value\n'
    csv += `Total Services,${metrics.services.total}\n`
    csv += `Completed Services,${metrics.services.completed}\n`
    csv += `Completion Rate,${metrics.services.completionRate.toFixed(1)}%\n`
    csv += `Average Service Value,$${metrics.services.avgValue.toFixed(2)}\n\n`
    
    csv += 'Customer Metrics\n'
    csv += 'Metric,Value\n'
    csv += `Total Customers,${metrics.customers.total}\n`
    csv += `Active Customers,${metrics.customers.active}\n`
    csv += `New Customers,${metrics.customers.new}\n`
    csv += `Retention Rate,${metrics.customers.retentionRate.toFixed(1)}%\n\n`
    
    if (technicianMetrics.length > 0) {
      csv += 'Technician Performance\n'
      csv += 'Name,Services Completed,Total Revenue,Average Service Value,Completion Rate\n'
      technicianMetrics.forEach((tech: any) => {
        csv += `${tech.name},${tech.servicesCompleted},$${tech.totalRevenue.toLocaleString()},$${tech.avgServiceValue.toFixed(2)},${tech.completionRate.toFixed(1)}%\n`
      })
    }
    
    return csv
  }

  // Calculate technician performance
  const technicianMetrics = useMemo(() => {
    return technicians.map(tech => {
      const techWorkOrders = workOrders.filter(wo => wo.technicianId === tech.id)
      const completedServices = techWorkOrders.filter(wo => wo.status === 'completed').length
      const totalRevenue = techWorkOrders.reduce((sum, wo) => sum + (wo.total || 0), 0)
      const avgServiceValue = completedServices > 0 ? totalRevenue / completedServices : 0
      
      return {
        ...tech,
        servicesCompleted: completedServices,
        totalRevenue,
        avgServiceValue,
        completionRate: techWorkOrders.length > 0 ? (completedServices / techWorkOrders.length) * 100 : 0
      }
    })
  }, [technicians, workOrders])

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${metrics.revenue.total.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">This period</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
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
              <Users className="w-6 h-6 text-blue-600" />
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
              <Cog className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Service Value</p>
              <p className="text-2xl font-bold text-yellow-600">${metrics.services.avgValue.toFixed(0)}</p>
              <p className="text-sm text-yellow-600 mt-1">Per service</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line data={chartData.revenue} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution</h3>
          <div className="h-64">
            <Doughnut data={chartData.serviceDistribution} options={{ maintainAspectRatio: false }} />
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
          <p className="text-sm text-gray-600 mt-1">{metrics.revenue.total > 0 ? ((metrics.revenue.paid / metrics.revenue.total) * 100).toFixed(1) : 0}% of total</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Outstanding</h4>
          <p className="text-3xl font-bold text-yellow-600">${metrics.revenue.outstanding.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Pending collection</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
        <div className="h-80">
          <Line data={chartData.revenue} options={{ maintainAspectRatio: false }} />
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
          <Bar data={chartData.customerGrowth} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  )

  const renderServicesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{metrics.services.total}</div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{metrics.services.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{metrics.services.completionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">${metrics.services.avgValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Avg Service Value</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution</h3>
        <div className="h-80">
          <Doughnut data={chartData.serviceDistribution} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  )

  const renderTechniciansReport = () => (
    <div className="space-y-6">
      {/* Technician Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{technicians.length}</div>
          <div className="text-sm text-gray-600">Total Technicians</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {technicianMetrics.reduce((sum, tech) => sum + tech.servicesCompleted, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            ${technicianMetrics.reduce((sum, tech) => sum + tech.totalRevenue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {technicianMetrics.length > 0 
              ? (technicianMetrics.reduce((sum, tech) => sum + tech.completionRate, 0) / technicianMetrics.length).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Completion Rate</div>
        </div>
      </div>

      {/* Technician Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Technician Performance Comparison</h3>
        <div className="h-80">
          <Bar 
            data={{
              labels: technicianMetrics.map(tech => tech.name),
              datasets: [
                {
                  label: 'Services Completed',
                  data: technicianMetrics.map(tech => tech.servicesCompleted),
                  backgroundColor: '#8b5cf6',
                  borderRadius: 4
                },
                {
                  label: 'Revenue Generated',
                  data: technicianMetrics.map(tech => tech.totalRevenue),
                  backgroundColor: '#f59e0b',
                  borderRadius: 4
                }
              ]
            }} 
            options={{ 
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value, index, values) {
                      if (index === 0) return value;
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Individual Technician Cards */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicianMetrics.map(tech => (
            <div key={tech.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{tech.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  tech.completionRate >= 90 ? 'bg-green-500' :
                  tech.completionRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Services:</span>
                  <span className="font-medium">{tech.servicesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">${tech.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg/Service:</span>
                  <span className="font-medium">${tech.avgServiceValue.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-medium">{tech.completionRate.toFixed(1)}%</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Performance</span>
                    <span>{tech.completionRate >= 90 ? 'Excellent' : tech.completionRate >= 75 ? 'Good' : 'Needs Improvement'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{inventory.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {inventory.filter(item => (item.quantity || 0) > 0).length}
          </div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {inventory.filter(item => (item.quantity || 0) <= (item.minQuantity || 0)).length}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            ${inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory
                .filter(item => (item.quantity || 0) <= (item.minQuantity || 0))
                .map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minQuantity || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (item.quantity || 0) === 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(item.quantity || 0) === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary-50 p-6 space-y-8">
      {/* Header with title and controls */}
      <div className="min-h-32 flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Reports & Analytics</h1>
          <p className="text-secondary-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-secondary-700">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="form-input"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          
          {/* Custom Date Range Inputs */}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="form-input"
                placeholder="Start Date"
              />
              <span className="text-secondary-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="form-input"
                placeholder="End Date"
              />
            </div>
          )}
          
          {/* Export Button */}
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary"
            title="Export current report data"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-success-600">${metrics.revenue.total.toLocaleString()}</p>
              <p className="text-sm text-secondary-500">This Period</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Active Customers</p>
              <p className="text-3xl font-bold text-primary-600">{metrics.customers.active}</p>
              <p className="text-sm text-secondary-500">This Period</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Services Completed</p>
              <p className="text-3xl font-bold text-info-600">{metrics.services.completed}</p>
              <p className="text-sm text-secondary-500">This Period</p>
            </div>
            <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
              <Cog className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-warning-600">{metrics.services.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-secondary-500">Service Success</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
          </div>
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
              { key: 'technicians', label: 'Technicians', icon: Users },
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
          {activeReport === 'services' && renderServicesReport()}
          {activeReport === 'technicians' && renderTechniciansReport()}
          {activeReport === 'inventory' && renderInventoryReport()}
        </div>
      </div>
    </div>
  )
}
