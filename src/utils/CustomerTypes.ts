// Vehicle Information
export interface Vehicle {
    id: string
    make: string
    model: string
    year: number
    vin: string
    licensePlate: string
    mileage: number
    color?: string
    customerId: string
}

// Service Record
export interface ServiceRecord {
    id: string
    vehicleId: string
    customerId: string
    date: string
    serviceType: string
    description: string
    partsUsed: ServicePart[]
    laborHours: number
    laborRate: number
    totalCost: number
    technicianId: string
    technicianName: string
    status: 'completed' | 'in-progress' | 'cancelled'
    notes?: string
    nextServiceDue?: string
    nextServiceMileage?: number
}

// Parts used in service
export interface ServicePart {
    id: string
    name: string
    partNumber: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

// Communication Log
export interface CommunicationLog {
    id: string
    customerId: string
    date: string
    type: 'phone' | 'email' | 'in-person' | 'sms'
    direction: 'inbound' | 'outbound'
    subject?: string
    content: string
    employeeId: string
    employeeName: string
}

// Customer Profile
export interface Customer {
    id: string
    name: string
    phone: string
    email: string
    address: string
    dateCreated: string
    lastVisit?: string
    vehicles: Vehicle[]
    serviceHistory: ServiceRecord[]
    communicationLog: CommunicationLog[]
    notes: string
    preferences: {
        preferredContactMethod: 'phone' | 'email' | 'sms'
        reminderPreferences: {
            appointmentReminders: boolean
            serviceReminders: boolean
            followUpReminders: boolean
        }
    }
    // Keep existing debt-related fields for backward compatibility
    accountNumber?: string
    originalDebt?: number
    currentDebt?: number
}

// Appointment types
export interface Appointment {
    id: string
    customerId: string
    customerName: string
    vehicleId: string
    vehicleInfo: string
    scheduledDate: string
    scheduledTime: string
    estimatedDuration: number // in minutes
    serviceType: string
    description: string
    status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
    technicianId?: string
    technicianName?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    createdDate: string
    notes?: string
}

// Service Catalog
export interface ServiceCatalogItem {
    id: string
    name: string
    description: string
    category: string
    estimatedDuration: number // in minutes
    laborRate: number
    parts: ServicePart[]
    isActive: boolean
}

// Technician
export interface Technician {
    id: string
    name: string
    email: string
    phone: string
    specializations: string[]
    hourlyRate: number
    isActive: boolean
}

// Work Order
export interface WorkOrder {
    id: string
    appointmentId?: string
    customerId: string
    vehicleId: string
    date: string
    status: 'created' | 'in-progress' | 'waiting-parts' | 'completed' | 'invoiced'
    services: ServiceCatalogItem[]
    partsUsed: ServicePart[]
    laborHours: number
    technicianId: string
    technicianName: string
    subtotal: number
    tax: number
    total: number
    notes?: string
    customerSignature?: string
    completedDate?: string
}

// Invoice Item
export interface InvoiceItem {
    type: 'service' | 'part' | 'labor' | 'other'
    name: string
    description?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    reference?: string
    referenceModel?: 'ServiceCatalog' | 'InventoryItem' | 'WorkOrder'
}

// Invoice
export interface Invoice {
    _id: string
    invoiceNumber: string
    customer: {
        _id: string
        name: string
        email?: string
        phone?: string
    }
    workOrder?: string
    appointment?: string
    vehicle: {
        make: string
        model: string
        year: number
        vin?: string
        licensePlate?: string
    }
    items: InvoiceItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    discountType: 'percentage' | 'fixed' | 'none'
    discountValue: number
    discountAmount: number
    total: number
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
    issueDate: string
    dueDate: string
    paidDate?: string
    paymentMethod?: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'online' | 'other'
    paymentReference?: string
    paidAmount: number
    balance: number
    notes?: string
    terms?: string
    createdBy: string
    createdAt: string
    updatedAt: string
}

// Inventory Item
export interface InventoryItem {
    id: string
    partNumber: string
    name: string
    description: string
    category: string
    supplier: string
    costPrice: number
    sellPrice: number
    quantityOnHand: number
    minStockLevel: number
    maxStockLevel: number
    location: string
    isActive: boolean
    lastUpdated: string
}

// Reminder/Notification
export interface Reminder {
    id: string
    type: 'appointment' | 'service-due' | 'follow-up' | 'payment-due'
    customerId: string
    customerName: string
    vehicleId?: string
    appointmentId?: string
    scheduledDate: string
    message: string
    status: 'pending' | 'sent' | 'delivered' | 'failed'
    method: 'email' | 'sms' | 'phone'
    createdDate: string
    sentDate?: string
}
