import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Invoice } from '../../utils/CustomerTypes'
import { 
  fetchInvoices, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice, 
  sendInvoice, 
  addPayment, 
  fetchInvoiceStats, 
  fetchPaymentStats, 
  fetchInvoiceTemplates,
  markAsOverdue
} from '../actions/invoices'

export interface InvoiceSettings {
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    taxId?: string
    license?: string
  }
  invoiceDefaults: {
    taxRate: number
    paymentTerms: string
    lateFeePenalty: number
    currency: string
    invoicePrefix: string
    nextInvoiceNumber: number
  }
  paymentMethods: {
    cash: boolean
    check: boolean
    creditCard: boolean
    debitCard: boolean
    bankTransfer: boolean
    other: boolean
  }
  template: {
    logoUrl?: string
    primaryColor: string
    showCompanyLogo: boolean
    showTaxBreakdown: boolean
    showLaborDetails: boolean
    showPartsDetails: boolean
    footerText: string
  }
}

interface InvoicesState {
  invoices: Invoice[]
  settings: InvoiceSettings
  loading: boolean
  error: string | null
  stats: any
  paymentStats: any
  templates: any[]
}

const initialState: InvoicesState = {
  invoices: [],
  settings: {
    companyInfo: {
      name: 'B&B Auto Repair Shop',
      address: '123 Main Street\nAnytown, ST 12345',
      phone: '(555) 123-4567',
      email: 'info@bbautorepair.com',
      website: 'https://bbautorepair.com',
      taxId: '12-3456789',
      license: 'AR-12345'
    },
    invoiceDefaults: {
      taxRate: 8.0,
      paymentTerms: 'Net 30',
      lateFeePenalty: 1.5,
      currency: 'USD',
      invoicePrefix: 'INV',
      nextInvoiceNumber: 1003
    },
    paymentMethods: {
      cash: true,
      check: true,
      creditCard: true,
      debitCard: true,
      bankTransfer: false,
      other: true
    },
    template: {
      primaryColor: '#2563eb',
      showCompanyLogo: true,
      showTaxBreakdown: true,
      showLaborDetails: true,
      showPartsDetails: true,
      footerText: 'Thank you for your business! Please remit payment by the due date to avoid late fees.'
    }
  },
  loading: false,
  error: null,
  stats: null,
  paymentStats: null,
  templates: []
}

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    // Invoice Actions
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload)
      // Increment next invoice number
      state.settings.invoiceDefaults.nextInvoiceNumber += 1
    },
    
    updateInvoiceStatus: (state, action: PayloadAction<{id: string, status: Invoice['status']}>) => {
      const invoice = state.invoices.find(inv => inv._id === action.payload.id)
      if (invoice) {
        invoice.status = action.payload.status
      }
    },
    recordPayment: (state, action: PayloadAction<{
      invoiceId: string
      amount: number
      method: string
      date: string
      reference?: string
    }>) => {
      const invoice = state.invoices.find(inv => inv._id === action.payload.invoiceId)
      if (invoice) {
        invoice.paidAmount = (invoice.paidAmount || 0) + action.payload.amount
        invoice.paymentMethod = action.payload.method as Invoice['paymentMethod']
        invoice.paidDate = action.payload.date
        
        // Update status based on payment
        if (invoice.paidAmount >= invoice.total) {
          invoice.status = 'paid'
        } else if (invoice.paidAmount > 0) {
          invoice.status = 'sent' // Partial payment, keep as sent
        }
      }
    },
    
    // Bulk Actions

    
    // Settings Actions
    updateInvoiceSettings: (state, action: PayloadAction<Partial<InvoiceSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    updateCompanyInfo: (state, action: PayloadAction<Partial<InvoiceSettings['companyInfo']>>) => {
      state.settings.companyInfo = { ...state.settings.companyInfo, ...action.payload }
    },
    updateInvoiceDefaults: (state, action: PayloadAction<Partial<InvoiceSettings['invoiceDefaults']>>) => {
      state.settings.invoiceDefaults = { ...state.settings.invoiceDefaults, ...action.payload }
    },
    updateTemplate: (state, action: PayloadAction<Partial<InvoiceSettings['template']>>) => {
      state.settings.template = { ...state.settings.template, ...action.payload }
    },
    
    // Generate invoice from work order
    generateInvoiceFromWorkOrder: (state, action: PayloadAction<{
      workOrder: any // WorkOrder type
      customer: any // Customer type
    }>) => {
      const { workOrder, customer } = action.payload
      const vehicle = customer.vehicles?.find((v: any) => v.id === workOrder.vehicleId)
      
             const newInvoice: Invoice = {
         _id: `${state.settings.invoiceDefaults.invoicePrefix}${state.settings.invoiceDefaults.nextInvoiceNumber.toString().padStart(3, '0')}`,
         workOrderId: workOrder.id,
         customerId: customer.id,
        customerName: customer.name,
        vehicleInfo: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'draft',
        services: workOrder.services || [],
        parts: workOrder.partsUsed || [],
        laborHours: workOrder.laborHours || 0,
        laborRate: state.settings.invoiceDefaults.taxRate || 120,
        subtotal: workOrder.subtotal || 0,
        tax: (workOrder.subtotal || 0) * (state.settings.invoiceDefaults.taxRate / 100),
        total: workOrder.total || 0,
        paidAmount: 0,
        notes: workOrder.notes || ''
      }
      
      state.invoices.push(newInvoice)
      state.settings.invoiceDefaults.nextInvoiceNumber += 1
    },
    
    // General Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    // Fetch Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.data || []
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch invoices'
      })

    // Create Invoice
    builder
      .addCase(createInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.invoices.push(action.payload.data)
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to create invoice'
      })

    // Update Invoice
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false
        const index = state.invoices.findIndex(inv => inv._id === action.payload.data._id)
        if (index !== -1) {
          state.invoices[index] = action.payload.data
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to update invoice'
      })

    // Delete Invoice
    builder
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = state.invoices.filter(inv => inv._id !== action.payload)
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to delete invoice'
      })

    // Send Invoice
    builder
      .addCase(sendInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        state.loading = false
        const index = state.invoices.findIndex(inv => inv._id === action.payload.data._id)
        if (index !== -1) {
          state.invoices[index] = action.payload.data
        }
      })
      .addCase(sendInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to send invoice'
      })

    // Add Payment
    builder
      .addCase(addPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false
        const index = state.invoices.findIndex(inv => inv._id === action.payload.data._id)
        if (index !== -1) {
          state.invoices[index] = action.payload.data
        }
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to add payment'
      })

    // Fetch Invoice Stats
    builder
      .addCase(fetchInvoiceStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchInvoiceStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch invoice stats'
      })

    // Fetch Payment Stats
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false
        state.paymentStats = action.payload.data
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch payment stats'
      })

    // Fetch Invoice Templates
    builder
      .addCase(fetchInvoiceTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoiceTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload.data || []
      })
      .addCase(fetchInvoiceTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch invoice templates'
      })

    // Mark As Overdue
    builder
      .addCase(markAsOverdue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markAsOverdue.fulfilled, (state, action) => {
        state.loading = false
        // Update the invoices in state with the new data
        if (action.payload.data) {
          state.invoices = action.payload.data
        }
      })
      .addCase(markAsOverdue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to update overdue invoices'
      })
  }
})

export const {
  addInvoice,
  updateInvoiceStatus,
  recordPayment,
  updateInvoiceSettings,
  updateCompanyInfo,
  updateInvoiceDefaults,
  updateTemplate,
  generateInvoiceFromWorkOrder,
  setLoading,
  setError
} = invoicesSlice.actions

export default invoicesSlice.reducer
