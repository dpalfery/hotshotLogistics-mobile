import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Bell } from 'lucide-react-native';
import JobCard from '@/components/JobCard';
import { LegacyJob } from '@/types/job';
import { jobService } from '@/services/jobService';
import { JobStatus, JobPriority, JobQueryParams } from '@/types/api';
import { mapApiJobsToLegacy, mapLegacyPriorityToApi } from '@/utils/mappers';
import { useAuth } from '@/contexts/AuthContext';

export default function JobsScreen() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<LegacyJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');

  /**
   * Load jobs from API
   */
  const loadJobs = async (showLoader: boolean = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      const params: JobQueryParams = {
        status: JobStatus.Pending,
        pageSize: 50,
        sortBy: 'ScheduledPickupTime',
      };

      if (filter !== 'all') {
        params.priority = mapLegacyPriorityToApi(filter as any);
      }

      const response = await jobService.getJobs(params);

      if (response.ok && response.data?.items) {
        const legacyJobs = mapApiJobsToLegacy(response.data.items);
        setJobs(legacyJobs);
      } else {
        console.error('Failed to load jobs:', response.error);
        if (showLoader) {
          Alert.alert('Error', 'Failed to load jobs. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      if (showLoader) {
        Alert.alert('Error', 'An unexpected error occurred while loading jobs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
    }
  }, [isAuthenticated, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs(false);
    setRefreshing(false);
  }, [filter]);

  const filteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.priority === filter);

  const handleJobPress = async (job: LegacyJob) => {
    Alert.alert(
      'Job Details',
      `Would you like to accept this job?\n\n${job.title}\nRate: $${job.rate}\nDistance: ${job.distance} miles`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept Job',
          style: 'default',
          onPress: () => acceptJob(job.id),
        },
      ]
    );
  };

  const acceptJob = async (jobId: string) => {
    try {
      const response = await jobService.assignDriver(jobId, {
        driverId: 1,
      });

      if (response.ok) {
        Alert.alert('Success', 'Job accepted! You will receive pickup instructions shortly.');
        await loadJobs(false);
      } else {
        Alert.alert('Error', 'Failed to accept job. It may have already been assigned to another driver.');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const getJobCount = (priority: typeof filter): number => {
    if (priority === 'all') return jobs.length;
    return jobs.filter(j => j.priority === priority).length;
  };

  const FilterButton = ({ 
    label, 
    value, 
    count 
  }: { 
    label: string; 
    value: typeof filter; 
    count: number; 
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === value && styles.filterButtonTextActive
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Available Jobs</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Available Jobs</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#374151" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <Text style={styles.searchPlaceholder}>Search by location or cargo type</Text>
          </View>
          <TouchableOpacity style={styles.filterIcon}>
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <FilterButton
            label="All"
            value="all"
            count={getJobCount('all')}
          />
          <FilterButton
            label="Urgent"
            value="urgent"
            count={getJobCount('urgent')}
          />
          <FilterButton
            label="High"
            value="high"
            count={getJobCount('high')}
          />
          <FilterButton
            label="Medium"
            value="medium"
            count={getJobCount('medium')}
          />
          <FilterButton
            label="Low"
            value="low"
            count={getJobCount('low')}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.jobsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No jobs available</Text>
            <Text style={styles.emptyStateText}>
              {filter === 'all'
                ? 'Check back later for new jobs'
                : 'No jobs match the selected filter. Try adjusting your filters.'}
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => handleJobPress(job)}
            />
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  filterIcon: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  jobsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});