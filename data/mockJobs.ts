import { LegacyJob } from '@/types/job';

export const mockJobs: LegacyJob[] = [
  {
    id: 'job_1',
    title: 'Electronics Delivery',
    pickupAddress: '123 Tech Street, Austin, TX 78701',
    deliveryAddress: '456 Innovation Blvd, Dallas, TX 75201',
    pickupCity: 'Austin',
    deliveryCity: 'Dallas',
    distance: 195,
    rate: 450,
    priority: 'high',
    cargoType: 'Electronics',
    weight: 150,
    pickupTime: '2024-01-16T09:00:00Z',
    deliveryTime: '2024-01-16T15:00:00Z',
    status: 'available',
    customerName: 'TechCorp Solutions',
    customerPhone: '(512) 555-0123',
    specialInstructions: 'Handle with care - fragile electronics. Use loading dock B.',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'job_2',
    title: 'Medical Supplies Rush',
    pickupAddress: '789 Medical Center Dr, Houston, TX 77030',
    deliveryAddress: '321 Hospital Way, San Antonio, TX 78229',
    pickupCity: 'Houston',
    deliveryCity: 'San Antonio',
    distance: 197,
    rate: 520,
    priority: 'urgent',
    cargoType: 'Medical',
    weight: 85,
    pickupTime: '2024-01-16T06:00:00Z',
    deliveryTime: '2024-01-16T10:00:00Z',
    status: 'available',
    customerName: 'MedSupply Inc',
    customerPhone: '(713) 555-0456',
    specialInstructions: 'Temperature sensitive - keep refrigerated. Emergency delivery.',
    createdAt: '2024-01-15T08:15:00Z'
  },
  {
    id: 'job_3',
    title: 'Auto Parts Delivery',
    pickupAddress: '555 Industrial Pkwy, Fort Worth, TX 76102',
    deliveryAddress: '888 Mechanic St, Waco, TX 76701',
    pickupCity: 'Fort Worth',
    deliveryCity: 'Waco',
    distance: 89,
    rate: 280,
    priority: 'medium',
    cargoType: 'Automotive',
    weight: 220,
    pickupTime: '2024-01-16T11:00:00Z',
    deliveryTime: '2024-01-16T14:00:00Z',
    status: 'available',
    customerName: 'AutoZone Distribution',
    customerPhone: '(817) 555-0789',
    createdAt: '2024-01-15T12:45:00Z'
  },
  {
    id: 'job_4',
    title: 'Construction Materials',
    pickupAddress: '999 Builder Ave, Plano, TX 75023',
    deliveryAddress: '777 Construction Blvd, Tyler, TX 75701',
    pickupCity: 'Plano',
    deliveryCity: 'Tyler',
    distance: 112,
    rate: 350,
    priority: 'low',
    cargoType: 'Construction',
    weight: 450,
    pickupTime: '2024-01-17T08:00:00Z',
    deliveryTime: '2024-01-17T12:00:00Z',
    status: 'available',
    customerName: 'BuildRight Supply',
    customerPhone: '(972) 555-0321',
    specialInstructions: 'Heavy load - ensure proper securing. Forklift available at both locations.',
    createdAt: '2024-01-15T14:20:00Z'
  },
  {
    id: 'job_5',
    title: 'Food Service Delivery',
    pickupAddress: '444 Restaurant Row, Arlington, TX 76010',
    deliveryAddress: '222 Dining District, Beaumont, TX 77701',
    pickupCity: 'Arlington',
    deliveryCity: 'Beaumont',
    distance: 267,
    rate: 380,
    priority: 'medium',
    cargoType: 'Food',
    weight: 180,
    pickupTime: '2024-01-16T14:00:00Z',
    deliveryTime: '2024-01-16T19:00:00Z',
    status: 'available',
    customerName: 'Fresh Foods Co',
    customerPhone: '(817) 555-0654',
    specialInstructions: 'Refrigerated transport required. Delivery before 7 PM.',
    createdAt: '2024-01-15T16:10:00Z'
  }
];

export const activeJobs: LegacyJob[] = [
  {
    id: 'job_active_1',
    title: 'Electronics Delivery',
    pickupAddress: '123 Tech Street, Austin, TX 78701',
    deliveryAddress: '456 Innovation Blvd, Dallas, TX 75201',
    pickupCity: 'Austin',
    deliveryCity: 'Dallas',
    distance: 195,
    rate: 450,
    priority: 'high',
    cargoType: 'Electronics',
    weight: 150,
    pickupTime: '2024-01-16T09:00:00Z',
    deliveryTime: '2024-01-16T15:00:00Z',
    status: 'in_progress',
    customerName: 'TechCorp Solutions',
    customerPhone: '(512) 555-0123',
    specialInstructions: 'Handle with care - fragile electronics. Use loading dock B.',
    createdAt: '2024-01-15T10:30:00Z'
  }
];

export const completedJobs: LegacyJob[] = [
  {
    id: 'job_completed_1',
    title: 'Medical Supplies',
    pickupAddress: '789 Medical Center Dr, Houston, TX 77030',
    deliveryAddress: '321 Hospital Way, San Antonio, TX 78229',
    pickupCity: 'Houston',
    deliveryCity: 'San Antonio',
    distance: 197,
    rate: 520,
    priority: 'urgent',
    cargoType: 'Medical',
    weight: 85,
    pickupTime: '2024-01-14T06:00:00Z',
    deliveryTime: '2024-01-14T10:00:00Z',
    status: 'completed',
    customerName: 'MedSupply Inc',
    customerPhone: '(713) 555-0456',
    createdAt: '2024-01-13T08:15:00Z'
  },
  {
    id: 'job_completed_2',
    title: 'Auto Parts Rush',
    pickupAddress: '555 Industrial Pkwy, Fort Worth, TX 76102',
    deliveryAddress: '888 Mechanic St, Waco, TX 76701',
    pickupCity: 'Fort Worth',
    deliveryCity: 'Waco',
    distance: 89,
    rate: 280,
    priority: 'medium',
    cargoType: 'Automotive',
    weight: 220,
    pickupTime: '2024-01-13T11:00:00Z',
    deliveryTime: '2024-01-13T14:00:00Z',
    status: 'completed',
    customerName: 'AutoZone Distribution',
    customerPhone: '(817) 555-0789',
    createdAt: '2024-01-12T12:45:00Z'
  },
  {
    id: 'job_completed_3',
    title: 'Construction Materials',
    pickupAddress: '999 Builder Ave, Plano, TX 75023',
    deliveryAddress: '777 Construction Blvd, Tyler, TX 75701',
    pickupCity: 'Plano',
    deliveryCity: 'Tyler',
    distance: 112,
    rate: 350,
    priority: 'low',
    cargoType: 'Construction',
    weight: 450,
    pickupTime: '2024-01-12T08:00:00Z',
    deliveryTime: '2024-01-12T12:00:00Z',
    status: 'completed',
    customerName: 'BuildRight Supply',
    customerPhone: '(972) 555-0321',
    createdAt: '2024-01-11T14:20:00Z'
  }
];