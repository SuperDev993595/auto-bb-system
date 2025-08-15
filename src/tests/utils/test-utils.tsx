import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Import all reducers
import appointmentsReducer from '../../redux/actions/appointments';
import tasksReducer from '../../redux/actions/tasks';
import customersReducer from '../../redux/actions/customers';
import servicesReducer from '../../redux/actions/services';
import remindersReducer from '../../redux/actions/reminders';
import inventoryReducer from '../../redux/actions/inventory';
import invoicesReducer from '../../redux/actions/invoices';
import dashboardReducer from '../../redux/actions/dashboard';
import adminReducer from '../../redux/actions/admin';
import emailReducer from '../../redux/actions/email';

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      appointments: appointmentsReducer,
      tasks: tasksReducer,
      customers: customersReducer,
      services: servicesReducer,
      reminders: remindersReducer,
      inventory: inventoryReducer,
      invoices: invoicesReducer,
      dashboard: dashboardReducer,
      admin: adminReducer,
      email: emailReducer,
    },
    preloadedState,
  });
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
  initialAuthState?: {
    isAuthenticated?: boolean;
    user?: any;
    role?: string;
  };
}

const AllTheProviders = ({ 
  children, 
  store, 
  initialAuthState = {} 
}: { 
  children: React.ReactNode;
  store: ReturnType<typeof createTestStore>;
  initialAuthState?: any;
}) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider initialState={initialAuthState}>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    initialAuthState = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders store={store} initialAuthState={initialAuthState}>
      {children}
    </AllTheProviders>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock data generators
export const mockCustomer = {
  _id: '1',
  businessName: 'Test Auto Repair',
  contactPerson: {
    name: 'John Doe',
    phone: '123-456-7890',
    email: 'john@test.com'
  },
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345'
  },
  status: 'active',
  assignedTo: 'user1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

export const mockTask = {
  _id: '1',
  title: 'Test Task',
  description: 'Test task description',
  type: 'marketing',
  status: 'pending',
  priority: 'medium',
  assignedTo: 'user1',
  customer: '1',
  dueDate: '2024-12-31T23:59:59.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

export const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'sub_admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z'
};

export const mockAppointment = {
  _id: '1',
  customer: '1',
  service: 'oil_change',
  date: '2024-12-31T10:00:00.000Z',
  status: 'scheduled',
  notes: 'Test appointment',
  assignedTo: 'user1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

// API response mocks
export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error'
});

// Mock fetch responses
export const mockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const fillForm = async (container: HTMLElement, formData: Record<string, string>) => {
  for (const [name, value] of Object.entries(formData)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

export const submitForm = async (container: HTMLElement, formSelector = 'form') => {
  const form = container.querySelector(formSelector) as HTMLFormElement;
  if (form) {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };
export { createTestStore };
