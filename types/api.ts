/**
 * TypeScript types generated from Hotshot Logistics API Swagger specification
 * API Version: v1
 */

// ============================================================================
// Enums
// ============================================================================

export enum JobStatus {
  Pending = 0,
  Assigned = 1,
  EnRoute = 2,
  Received = 3,
}

export enum JobPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3,
}

export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}

export enum InvoiceStatus {
  Draft = 0,
  Sent = 1,
  Viewed = 2,
  PartiallyPaid = 3,
  Paid = 4,
  Overdue = 5,
  Cancelled = 6,
  WriteOff = 7,
}

export enum CreditStatus {
  None = 0,
  Approved = 1,
  OnHold = 2,
  Suspended = 3,
}

export enum DriverStatus {
  Offline = 0,
  Available = 1,
  OnJob = 2,
  OnBreak = 3,
  OutOfService = 4,
  Busy = 5,
  Unavailable = 6,
}

export enum JobAssignmentStatus {
  Active = 0,
  Inactive = 1,
}

export enum JobDocumentType {
  BillOfLading = 1,
  ProofOfDelivery = 2,
  Invoice = 3,
  Receipt = 4,
  Photo = 5,
  Signature = 6,
  Other = 7,
  Miscellaneous = 99,
}

export enum PaymentMethod {
  DirectDeposit = 0,
  Check = 1,
  Cash = 2,
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

// ============================================================================
// Address & Location Models
// ============================================================================

export interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
}

export interface Location {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string | null;
  readonly fullAddress?: string | null;
  readonly hasCoordinates?: boolean;
}

// ============================================================================
// Contact Models
// ============================================================================

export interface Contact {
  name?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary: boolean;
}

// ============================================================================
// Customer Models
// ============================================================================

export interface CreditTerms {
  paymentTermsDays: number;
  status: CreditStatus;
  approvedDate: string;
  expiryDate?: string | null;
}

export interface Customer {
  id?: string | null;
  companyName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: Address;
  contacts?: Contact[] | null;
  creditTerms?: CreditTerms;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdateCreditLimitRequest {
  newLimit: number;
}

// ============================================================================
// Driver Models
// ============================================================================

export interface PersonalInfo {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth: string;
  ssn?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface LicenseInfo {
  licenseNumber?: string | null;
  licenseState?: string | null;
  licenseExpiryDate: string;
  licenseClass?: string | null;
  endorsements?: string[] | null;
}

export interface VehicleInfo {
  vehicleType?: string | null;
  make?: string | null;
  model?: string | null;
  year: number;
  licensePlateNumber?: string | null;
  vin?: string | null;
  insurancePolicyNumber?: string | null;
  insuranceExpiryDate: string;
}

export interface Certification {
  name?: string | null;
  issuingAuthority?: string | null;
  certificationNumber?: string | null;
  issueDate: string;
  expiryDate?: string | null;
}

export interface WorkingHours {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilitySchedule {
  regularHours?: WorkingHours[] | null;
  vacationDays?: string[] | null;
  availableForEmergency: boolean;
  preferredServiceAreas?: string[] | null;
}

export interface PerformanceMetrics {
  onTimeDeliveryRate: number;
  customerRating: number;
  completedJobs: number;
  cancelledJobs: number;
  totalMilesDriven: number;
  averageDeliveryTime: number;
  safetyIncidents: number;
}

export interface PaymentInfo {
  hourlyRate: number;
  perMileRate: number;
  bankAccountNumber?: string | null;
  routingNumber?: string | null;
  taxId?: string | null;
  paymentMethod: PaymentMethod;
}

export interface DriverDto {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  licenseNumber?: string | null;
  licenseExpiryDate: string;
  personalInfo?: PersonalInfo;
  license?: LicenseInfo;
  vehicle?: VehicleInfo;
  certifications?: Certification[] | null;
  availability?: AvailabilitySchedule;
  performance?: PerformanceMetrics;
  paymentDetails?: PaymentInfo;
  isActive: boolean;
  currentStatus: DriverStatus;
  createdAt: string;
  updatedAt?: string | null;
}

// ============================================================================
// Job Models
// ============================================================================

export interface CargoDetails {
  description?: string | null;
  weight: number;
  dimensions?: string | null;
  quantity: number;
  value: number;
  isFragile: boolean;
  isHazardous: boolean;
  requiresTemperatureControl: boolean;
  temperatureRange?: string | null;
  specialInstructions?: string | null;
  packagingType?: string | null;
}

export interface PricingDetails {
  baseRate: number;
  mileageRate: number;
  fuelSurcharge: number;
  tollCharges: number;
  additionalCharges: number;
  totalAmount: number;
  currency?: string | null;
  discount: number;
  tax: number;
  taxRate: number;
  notes?: string | null;
  readonly subtotal?: number;
  readonly netAmount?: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  timestamp: string;
  status?: string | null;
  notes?: string | null;
}

export interface TrackingInfo {
  updates?: LocationUpdate[] | null;
  currentStatus?: string | null;
  lastUpdateTime?: string | null;
  estimatedArrival?: string | null;
  totalDistance: number;
  isActive: boolean;
  currentLocation?: LocationUpdate;
  readonly updateCount?: number;
}

export interface JobDocument {
  id?: string | null;
  jobId?: string | null;
  documentType: JobDocumentType;
  fileName?: string | null;
  fileSize: number;
  mimeType?: string | null;
  storageUrl?: string | null;
  description?: string | null;
  uploadedAt: string;
  uploadedBy?: string | null;
  isRequired: boolean;
  isVerified: boolean;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

export interface Job {
  id?: string | null;
  customerId?: string | null;
  title?: string | null;
  pickupLocation?: Location;
  deliveryLocation?: Location;
  cargo?: CargoDetails;
  status: JobStatus;
  priority: JobPriority;
  pricing?: PricingDetails;
  amount: number;
  scheduledPickupTime: string;
  estimatedDeliveryTime: string;
  actualPickupTime?: string | null;
  actualDeliveryTime?: string | null;
  specialInstructions?: string | null;
  assignedDriverId?: number | null;
  documents?: JobDocument[] | null;
  tracking?: TrackingInfo;
  createdAt: string;
  updatedAt?: string | null;
}

export interface JobPagedResult {
  items?: Job[] | null;
  page: number;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  readonly totalPages?: number;
  readonly hasPreviousPage?: boolean;
  readonly hasNextPage?: boolean;
  readonly count?: number;
}

export interface JobStatusSummaryDto {
  pendingCount: number;
  assignedCount: number;
  enRouteCount: number;
  receivedCount: number;
  totalCount: number;
}

export interface AssignDriverRequest {
  driverId: number;
}

export interface UpdateJobStatusRequest {
  status: JobStatus;
}

// ============================================================================
// Job Assignment Models
// ============================================================================

export interface AssignJobRequest {
  jobId?: string | null;
  driverId: number;
}

export interface JobAssignmentDto {
  id?: string | null;
  jobId?: string | null;
  driverId: number;
  assignedAt: string;
  status: JobAssignmentStatus;
  driver?: DriverDto;
  job?: Job;
}

// ============================================================================
// Tracking Models
// ============================================================================

export interface StartTrackingRequest {
  jobId?: string | null;
  driverId: number;
}

export interface UpdateLocationRequest {
  jobId?: string | null;
  driverId: number;
  locationUpdate?: LocationUpdate;
}

export interface LocationTracking {
  id: number;
  jobId?: string | null;
  driverId: number;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  timestamp: string;
}

export interface RouteDeviationRequest {
  jobId?: string | null;
  currentLocation?: LocationUpdate;
}

export interface RouteDeviationResult {
  jobId?: string | null;
  hasDeviated: boolean;
  currentLocation?: LocationUpdate;
  checkedAt: string;
  message?: string | null;
}

export interface PublicTrackingInfo {
  jobId?: string | null;
  currentLatitude: number;
  currentLongitude: number;
  lastUpdated: string;
  status?: string | null;
  estimatedArrival?: string | null;
}

export interface TrackingResult {
  success: boolean;
  jobId?: string | null;
  driverId?: number | null;
  message?: string | null;
  timestamp: string;
}

// ============================================================================
// Billing Models
// ============================================================================

export interface PaymentTerms {
  days: number;
  earlyPaymentDiscount: number;
  earlyPaymentDiscountDays: number;
  latePaymentPenalty: number;
  latePaymentPenaltyDays: number;
}

export interface InvoiceLineItem {
  id: number;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  readonly amount?: number;
  taxApplicable: boolean;
  sortOrder: number;
}

export interface Invoice {
  id?: string | null;
  invoiceNumber?: string | null;
  customerId?: string | null;
  jobId?: string | null;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems?: InvoiceLineItem[] | null;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  readonly balanceDue?: number;
  terms?: PaymentTerms;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ProcessPaymentRequest {
  amount: number;
  paymentMethod?: string | null;
  reference?: string | null;
}

export interface PaymentResult {
  success: boolean;
  invoiceId?: string | null;
  amount: number;
  paymentMethod?: string | null;
  processedAt: string;
}

export interface TaxCalculationRequest {
  amount: number;
  state?: string | null;
}

export interface TaxCalculationResult {
  amount: number;
  state?: string | null;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
}

export interface OverdueInvoiceSummary {
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  customerId?: string | null;
  amount: number;
  balanceDue: number;
  dueDate: string;
  daysOverdue: number;
}

export interface AccountsReceivableReport {
  totalOverdueAmount: number;
  overdueInvoiceCount: number;
  generatedAt: string;
  overdueInvoices?: OverdueInvoiceSummary[] | null;
}

// ============================================================================
// User Profile Models
// ============================================================================

export interface UserProfile {
  id?: string | null;
  displayName?: string | null;
  givenName?: string | null;
  surname?: string | null;
  userPrincipalName?: string | null;
  mail?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  officeLocation?: string | null;
  mobilePhone?: string | null;
  businessPhones?: string | null;
  preferredLanguage?: string | null;
  lastModifiedDateTime?: string | null;
  roles?: string[] | null;
}

// ============================================================================
// Error Models
// ============================================================================

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface JobQueryParams {
  status?: JobStatus;
  priority?: JobPriority;
  customerId?: string;
  assignedDriverId?: number;
  createdAfter?: string;
  createdBefore?: string;
  scheduledAfter?: string;
  scheduledBefore?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  hasAssignedDriver?: boolean;
  isOverdue?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
