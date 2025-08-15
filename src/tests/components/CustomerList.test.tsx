import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render, mockCustomer, mockApiResponse, mockFetchResponse } from '../utils/test-utils';
import CustomerList from '../../pages/customers/CustomerList';

// Mock the API service
jest.mock('../../services/customers', () => ({
  getCustomers: jest.fn(),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
}));

describe('CustomerList Component', () => {
  const mockCustomers = [
    mockCustomer,
    {
      ...mockCustomer,
      _id: '2',
      businessName: 'Another Auto Repair',
      contactPerson: {
        ...mockCustomer.contactPerson,
        name: 'Jane Smith',
        email: 'jane@test.com'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders customer list with loading state', () => {
    render(<CustomerList />);
    
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Loading customers...')).toBeInTheDocument();
  });

  it('renders customer list with data', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('Test Auto Repair')).toBeInTheDocument();
      expect(screen.getByText('Another Auto Repair')).toBeInTheDocument();
    });
  });

  it('displays customer information correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });
  });

  it('shows add customer button', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('Add Customer')).toBeInTheDocument();
    });
  });

  it('opens add customer modal when button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Customer');
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Add New Customer')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search customers...');
      fireEvent.change(searchInput, { target: { value: 'Test Auto' } });
    });

    expect(screen.getByDisplayValue('Test Auto')).toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('shows customer status badges', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('handles customer deletion', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockFetchResponse(mockApiResponse(mockCustomers)))
      .mockResolvedValueOnce(mockFetchResponse(mockApiResponse({ success: true })));

    render(<CustomerList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('delete-customer');
      fireEvent.click(deleteButtons[0]);
    });

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('filters customers by status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'active' } });
    });

    // Should filter to show only active customers
    expect(screen.getByText('Test Auto Repair')).toBeInTheDocument();
  });

  it('sorts customers by business name', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const sortButton = screen.getByTestId('sort-business-name');
      fireEvent.click(sortButton);
    });

    // Should sort customers alphabetically
    const customerNames = screen.getAllByTestId('customer-name');
    expect(customerNames[0]).toHaveTextContent('Another Auto Repair');
    expect(customerNames[1]).toHaveTextContent('Test Auto Repair');
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

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
      expect(screen.getByText('Customer 10')).toBeInTheDocument();
    });

    // Should show pagination controls
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('exports customer data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const exportButton = screen.getByTestId('export-customers');
      fireEvent.click(exportButton);
    });

    // Should trigger export functionality
    expect(screen.getByText(/exporting/i)).toBeInTheDocument();
  });

  it('handles customer editing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const editButtons = screen.getAllByTestId('edit-customer');
      fireEvent.click(editButtons[0]);
    });

    // Should open edit modal
    expect(screen.getByText('Edit Customer')).toBeInTheDocument();
  });

  it('validates customer form inputs', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Customer');
      fireEvent.click(addButton);
    });

    // Try to submit empty form
    const submitButton = screen.getByText('Add Customer');
    fireEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/business name is required/i)).toBeInTheDocument();
    });
  });

  it('handles customer view details', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockFetchResponse(mockApiResponse(mockCustomers))
    );

    render(<CustomerList />);

    await waitFor(() => {
      const viewButtons = screen.getAllByTestId('view-customer');
      fireEvent.click(viewButtons[0]);
    });

    // Should navigate to customer details
    expect(window.location.pathname).toContain('/customers/1');
  });
});
