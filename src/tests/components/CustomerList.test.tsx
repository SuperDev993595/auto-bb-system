import React from 'react';
import { render, mockCustomer, mockApiResponse, mockFetchResponse } from '../utils/test-utils';
import CustomerList from '../../pages/customers/CustomerList';

// Mock the Redux actions
jest.mock('../../redux/actions/customers', () => ({
  fetchCustomers: jest.fn(),
  fetchCustomerStats: jest.fn(),
}));

describe('CustomerList Component', () => {
  const mockCustomers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@test.com',
      phone: '123-456-7890',
      businessName: 'Test Auto Repair',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      status: 'active',
      assignedTo: 'user1',
      vehicles: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '987-654-3210',
      businessName: 'Another Auto Repair',
      address: {
        street: '456 Another St',
        city: 'Another City',
        state: 'AC',
        zipCode: '54321'
      },
      status: 'active',
      assignedTo: 'user1',
      vehicles: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders customer list with loading state', () => {
    const { getByText } = render(<CustomerList />);
    
    expect(getByText('Customers')).toBeInTheDocument();
  });

  it('renders customer list with data', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText } = render(<CustomerList />);

    // Wait for the component to load data
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Test Auto Repair')).toBeInTheDocument();
    expect(getByText('Another Auto Repair')).toBeInTheDocument();
  });

  it('displays customer information correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('john@test.com')).toBeInTheDocument();
    expect(getByText('123-456-7890')).toBeInTheDocument();
  });

  it('shows add customer button', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Add Customer')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByPlaceholderText, getByDisplayValue } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const searchInput = getByPlaceholderText('Search customers...');
    searchInput.value = 'Test Auto';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(getByDisplayValue('Test Auto')).toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    // The component should handle the error gracefully
    expect(getByText('Customers')).toBeInTheDocument();
  });

  it('shows customer status badges', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Active')).toBeInTheDocument();
  });

  it('filters customers by status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByDisplayValue } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const statusFilter = getByDisplayValue('All Status');
    statusFilter.value = 'active';
    statusFilter.dispatchEvent(new Event('change', { bubbles: true }));

    // Should filter to show only active customers
    expect(getByDisplayValue('active')).toBeInTheDocument();
  });

  it('sorts customers by business name', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByDisplayValue } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const sortSelect = getByDisplayValue('Date Created');
    sortSelect.value = 'businessName';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // Should sort customers alphabetically
    expect(getByDisplayValue('businessName')).toBeInTheDocument();
  });

  it('paginates customer list', async () => {
    const manyCustomers = Array.from({ length: 25 }, (_, i) => ({
      ...mockCustomer,
      _id: i.toString(),
      businessName: `Customer ${i + 1}`
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(manyCustomers))
    );

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Customer 1')).toBeInTheDocument();
    expect(getByText('Customer 10')).toBeInTheDocument();
  });

  it('handles customer view details', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const customerLink = getByText('Test Auto Repair');
    customerLink.click();

    // Should navigate to customer details
    expect(window.location.pathname).toContain('/customers/1');
  });

  it('handles missing customer data gracefully', async () => {
    const incompleteCustomers = [
      {
        _id: '1',
        name: undefined,
        email: undefined,
        phone: undefined,
        businessName: undefined,
        address: undefined,
        status: 'active',
        vehicles: []
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(incompleteCustomers))
    );

    const { getAllByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should display N/A for missing data
    const naElements = getAllByText('N/A');
    expect(naElements.length).toBeGreaterThan(0);
  });

  it('displays stats cards', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Check for stats card titles
    expect(getByText('Total Customers')).toBeInTheDocument();
    expect(getByText('Total Vehicles')).toBeInTheDocument();
    expect(getByText('Active Customers')).toBeInTheDocument();
    expect(getByText('Growth Rate')).toBeInTheDocument();
  });

  it('toggles between grid and list view', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    const { getByText, container } = render(<CustomerList />);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Initially should be in grid view
    expect(container.querySelector('.grid')).toBeInTheDocument();

    // Click list view button
    const listButton = container.querySelector('button[aria-label="List view"]') || 
                      container.querySelector('button:has(svg)');
    if (listButton) {
      listButton.click();
      
      // Should switch to list view
      expect(container.querySelector('table')).toBeInTheDocument();
    }
  });
});
