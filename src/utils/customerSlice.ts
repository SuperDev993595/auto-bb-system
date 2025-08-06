import { createSlice } from '@reduxjs/toolkit'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  accountNumber?: string
  vehicle?: string
  originalDebt?: number
  currentDebt?: number
}

interface CustomerState {
  list: Customer[]
}

const initialState = {
  list: [
    {
      id: '1',
      name: 'John Doe',
      vehicle: 'Toyota Corolla',
      accountNumber: 'ACC001',
      originalDebt: 1200,
      currentDebt: 850,
      phone: '555-123-4567',
      email: 'john.doe@example.com',
      address: '123 Main St, Cityville'
    },
    {
      id: '2',
      name: 'Jane Smith',
      vehicle: 'Honda Civic',
      accountNumber: 'ACC002',
      originalDebt: 1400,
      currentDebt: 920,
      phone: '555-234-5678',
      email: 'jane.smith@example.com',
      address: '456 Oak Ave, Townville'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      vehicle: 'Ford Focus',
      accountNumber: 'ACC003',
      originalDebt: 2000,
      currentDebt: 1520,
      phone: '555-345-6789',
      email: 'mike.j@example.com',
      address: '789 Pine Rd, Village'
    },
    {
      id: '4',
      name: 'Emily Brown',
      vehicle: 'Chevrolet Cruze',
      accountNumber: 'ACC004',
      originalDebt: 980,
      currentDebt: 480,
      phone: '555-456-7890',
      email: 'emily.b@example.com',
      address: '321 Maple St, Hamlet'
    },
    {
      id: '5',
      name: 'Chris Green',
      vehicle: 'Nissan Sentra',
      accountNumber: 'ACC005',
      originalDebt: 1650,
      currentDebt: 1350,
      phone: '555-567-8901',
      email: 'chris.green@example.com',
      address: '654 Elm St, Suburbia'
    },
    {
      id: '6',
      name: 'Sophia Turner',
      vehicle: 'Mazda 3',
      accountNumber: 'ACC006',
      originalDebt: 1100,
      currentDebt: 900,
      phone: '555-678-9012',
      email: 'sophia.t@example.com',
      address: '987 Cedar Ln, Hilltown'
    },
    {
      id: '7',
      name: 'Daniel Lee',
      vehicle: 'Hyundai Elantra',
      accountNumber: 'ACC007',
      originalDebt: 1300,
      currentDebt: 1150,
      phone: '555-789-0123',
      email: 'daniel.lee@example.com',
      address: '753 Birch Blvd, Lakeside'
    },
    {
      id: '8',
      name: 'Grace Wilson',
      vehicle: 'Kia Forte',
      accountNumber: 'ACC008',
      originalDebt: 1050,
      currentDebt: 850,
      phone: '555-890-1234',
      email: 'grace.w@example.com',
      address: '159 Spruce St, Rivertown'
    },
    {
      id: '9',
      name: 'Ethan Clark',
      vehicle: 'Volkswagen Jetta',
      accountNumber: 'ACC009',
      originalDebt: 1700,
      currentDebt: 1400,
      phone: '555-901-2345',
      email: 'ethan.c@example.com',
      address: '852 Aspen Ct, Baycity'
    },
    {
      id: '10',
      name: 'Lily Evans',
      vehicle: 'Subaru Impreza',
      accountNumber: 'ACC010',
      originalDebt: 1500,
      currentDebt: 950,
      phone: '555-012-3456',
      email: 'lily.evans@example.com',
      address: '951 Willow Dr, Mountville'
    },
    {
      id: '11',
      name: 'Noah Walker',
      vehicle: 'BMW 3 Series',
      accountNumber: 'ACC011',
      originalDebt: 3000,
      currentDebt: 2200,
      phone: '555-111-2233',
      email: 'noah.w@example.com',
      address: '11 Noble Ln, Prestigetown'
    },
    {
      id: '12',
      name: 'Mia Scott',
      vehicle: 'Mercedes C-Class',
      accountNumber: 'ACC012',
      originalDebt: 2800,
      currentDebt: 2000,
      phone: '555-222-3344',
      email: 'mia.s@example.com',
      address: '22 Pearl St, Royalcity'
    },
    {
      id: '13',
      name: 'Oliver King',
      vehicle: 'Audi A4',
      accountNumber: 'ACC013',
      originalDebt: 3200,
      currentDebt: 2700,
      phone: '555-333-4455',
      email: 'oliver.k@example.com',
      address: '33 Sapphire Ave, Upperhill'
    },
    {
      id: '14',
      name: 'Chloe Young',
      vehicle: 'Lexus IS',
      accountNumber: 'ACC014',
      originalDebt: 3500,
      currentDebt: 2950,
      phone: '555-444-5566',
      email: 'chloe.y@example.com',
      address: '44 Ruby Rd, Oldtown'
    },
    {
      id: '15',
      name: 'Lucas Adams',
      vehicle: 'Tesla Model 3',
      accountNumber: 'ACC015',
      originalDebt: 4000,
      currentDebt: 3800,
      phone: '555-555-6677',
      email: 'lucas.a@example.com',
      address: '55 Diamond St, Siliconburg'
    },
    {
      id: '16',
      name: 'Ella Martinez',
      vehicle: 'Toyota Camry',
      accountNumber: 'ACC016',
      originalDebt: 1450,
      currentDebt: 1150,
      phone: '555-666-7788',
      email: 'ella.m@example.com',
      address: '66 Garnet Ln, Seaside'
    },
    {
      id: '17',
      name: 'Benjamin Rivera',
      vehicle: 'Ford Fusion',
      accountNumber: 'ACC017',
      originalDebt: 1600,
      currentDebt: 1000,
      phone: '555-777-8899',
      email: 'benjamin.r@example.com',
      address: '77 Opal Way, Midtown'
    },
    {
      id: '18',
      name: 'Zoe Brooks',
      vehicle: 'Chevrolet Malibu',
      accountNumber: 'ACC018',
      originalDebt: 1350,
      currentDebt: 800,
      phone: '555-888-9900',
      email: 'zoe.b@example.com',
      address: '88 Emerald Blvd, Greenside'
    },
    {
      id: '19',
      name: 'Henry Perez',
      vehicle: 'Nissan Altima',
      accountNumber: 'ACC019',
      originalDebt: 1750,
      currentDebt: 1150,
      phone: '555-999-0011',
      email: 'henry.p@example.com',
      address: '99 Quartz Ave, Rockville'
    },
    {
      id: '20',
      name: 'Ava Nguyen',
      vehicle: 'Hyundai Sonata',
      accountNumber: 'ACC020',
      originalDebt: 1900,
      currentDebt: 1550,
      phone: '555-000-1122',
      email: 'ava.n@example.com',
      address: '100 Topaz Ct, Sunsetview'
    }
  ]
}

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
})

export default customerSlice.reducer
