import { Job as ApiJob, JobStatus, JobPriority } from '../types/api';
import { LegacyJob } from '../types/job';

/**
 * Utility functions to map API types to legacy types for UI compatibility
 */

/**
 * Map API JobStatus to Legacy status
 */
function mapJobStatus(apiStatus: JobStatus): LegacyJob['status'] {
  switch (apiStatus) {
    case JobStatus.Pending:
      return 'available';
    case JobStatus.Assigned:
      return 'assigned';
    case JobStatus.EnRoute:
      return 'in_progress';
    case JobStatus.Received:
      return 'completed';
    default:
      return 'available';
  }
}

/**
 * Map API JobPriority to Legacy priority
 */
function mapJobPriority(apiPriority: JobPriority): LegacyJob['priority'] {
  switch (apiPriority) {
    case JobPriority.Low:
      return 'low';
    case JobPriority.Medium:
      return 'medium';
    case JobPriority.High:
      return 'high';
    case JobPriority.Urgent:
      return 'urgent';
    default:
      return 'medium';
  }
}

/**
 * Get city from location (if available)
 */
function getCityFromLocation(location?: { city?: string | null }): string {
  return location?.city || 'Unknown';
}

/**
 * Get address from location (if available)
 */
function getAddressFromLocation(location?: { address?: string | null; city?: string | null; state?: string | null }): string {
  if (!location) return 'Unknown';

  const parts: string[] = [];
  if (location.address) parts.push(location.address);
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);

  return parts.join(', ') || 'Unknown';
}

/**
 * Calculate distance from API job data
 * Since the API doesn't provide distance directly, we estimate based on pricing
 * In a real app, you might calculate this from coordinates or use a separate field
 */
function calculateDistance(job: ApiJob): number {
  // If we have coordinates, we could calculate actual distance
  // For now, we'll use a default or estimate from pricing
  if (job.pricing?.mileageRate && job.pricing?.totalAmount) {
    const estimatedMiles = (job.pricing.totalAmount - (job.pricing.baseRate || 0)) / (job.pricing.mileageRate || 1);
    return Math.round(Math.max(0, estimatedMiles));
  }
  return 0;
}

/**
 * Map API Job to Legacy Job format for UI compatibility
 */
export function mapApiJobToLegacy(apiJob: ApiJob): LegacyJob {
  const distance = calculateDistance(apiJob);

  return {
    id: apiJob.id || '',
    title: apiJob.title || 'Untitled Job',
    pickupAddress: getAddressFromLocation(apiJob.pickupLocation),
    deliveryAddress: getAddressFromLocation(apiJob.deliveryLocation),
    pickupCity: getCityFromLocation(apiJob.pickupLocation),
    deliveryCity: getCityFromLocation(apiJob.deliveryLocation),
    distance,
    rate: apiJob.amount || apiJob.pricing?.totalAmount || 0,
    priority: mapJobPriority(apiJob.priority),
    cargoType: apiJob.cargo?.description || 'General',
    weight: apiJob.cargo?.weight || 0,
    pickupTime: apiJob.scheduledPickupTime || new Date().toISOString(),
    deliveryTime: apiJob.estimatedDeliveryTime || new Date().toISOString(),
    status: mapJobStatus(apiJob.status),
    customerName: 'Customer', // API doesn't provide customer name directly
    customerPhone: '', // API doesn't provide customer phone directly
    specialInstructions: apiJob.specialInstructions || apiJob.cargo?.specialInstructions || undefined,
    createdAt: apiJob.createdAt || new Date().toISOString(),
  };
}

/**
 * Map array of API Jobs to Legacy Jobs
 */
export function mapApiJobsToLegacy(apiJobs: ApiJob[]): LegacyJob[] {
  return apiJobs.map(mapApiJobToLegacy);
}

/**
 * Map legacy priority filter to API priority
 */
export function mapLegacyPriorityToApi(priority: LegacyJob['priority']): JobPriority {
  switch (priority) {
    case 'low':
      return JobPriority.Low;
    case 'medium':
      return JobPriority.Medium;
    case 'high':
      return JobPriority.High;
    case 'urgent':
      return JobPriority.Urgent;
    default:
      return JobPriority.Medium;
  }
}
