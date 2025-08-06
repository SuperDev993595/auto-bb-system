import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Invoice } from '../../utils/CustomerTypes'

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
}

const initialState: InvoicesState = {
  invoices: [
    {
      id: 'inv001',
      workOrderId: 'wo1',
      customerId: '1',
      customerName: 'John Smith',
      vehicleInfo: '2020 Toyota Camry',
      date: '2025-08-01',
      dueDate: '2025-08-31',
      status: 'sent',
      services: [],
      parts: [
        {
          id: 'p1',
          name: 'Oil Filter',
          partNumber: 'OF-123',
          quantity: 1,
          unitPrice: 19.99,
          totalPrice: 19.99
        }
      ],
      laborHours: 0.5,
      laborRate: 120,
      subtotal: 79.99,
      tax: 6.40,
      total: 86.39,
      paidAmount: 0,
      notes: 'Regular maintenance service completed'
    },
    {
      id: 'inv002',
      workOrderId: 'wo2',
      customerId: '2',
      customerName: 'Lisa Brown',
      vehicleInfo: '2019 Ford Escape',
      date: '2025-07-28',
      dueDate: '2025-08-27',
      status: 'paid',
      services: [],
      parts: [],
      laborHours: 0.75,
      laborRate: 120,
      subtotal: 90.00,
      tax: 7.20,
      total: 97.20,
      paidAmount: 97.20,
      paymentMethod: 'credit card',
      paymentDate: '2025-07-28',
      notes: 'Tire rotation service'
    }
  ],
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
  error: null
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
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(inv => inv.id === action.payload.id)
      if (index !== -1) {
        state.invoices[index] = action.payload
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(inv => inv.id !== action.payload)
    },
    updateInvoiceStatus: (state, action: PayloadAction<{id: string, status: Invoice['status']}>) => {
      const invoice = state.invoices.find(inv => inv.id === action.payload.id)
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
      const invoice = state.invoices.find(inv => inv.id === action.payload.invoiceId)
      if (invoice) {
        invoice.paidAmount = (invoice.paidAmount || 0) + action.payload.amount
        invoice.paymentMethod = action.payload.method
        invoice.paymentDate = action.payload.date
        
        // Update status based on payment
        if (invoice.paidAmount >= invoice.total) {
          invoice.status = 'paid'
        } else if (invoice.paidAmount > 0) {
          invoice.status = 'sent' // Partial payment, keep as sent
        }
      }
    },
    
    // Bulk Actions
    markAsOverdue: (state) => {
      const today = new Date()
      state.invoices.forEach(invoice => {
        if (invoice.status === 'sent' && new Date(invoice.dueDate) < today) {
          invoice.status = 'overdue'
        }
      })
    },
    
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
        id: `${state.settings.invoiceDefaults.invoicePrefix}${state.settings.invoiceDefaults.nextInvoiceNumber.toString().padStart(3, '0')}`,
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
  }
})

export const {
  addInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  recordPayment,
  markAsOverdue,
  updateInvoiceSettings,
  updateCompanyInfo,
  updateInvoiceDefaults,
  updateTemplate,
  generateInvoiceFromWorkOrder,
  setLoading,
  setError
} = invoicesSlice.actions

export default invoicesSlice.reducer
