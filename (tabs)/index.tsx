import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Bell } from 'lucide-react-native';
import JobCard from '@/components/JobCard';
import { mockJobs } from '@/data/mockJobs';
import { Job } from '@/types/job';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.priority === filter);

  const handleJobPress = (job: Job) => {
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
          onPress: () => {
            Alert.alert('Job Accepted!', 'You will receive pickup instructions shortly.');
          },
        },
      ]
    );
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
            count={jobs.length} 
          />
          <FilterButton 
            label="Urgent" 
            value="urgent" 
            count={jobs.filter(j => j.priority === 'urgent').length} 
          />
          <FilterButton 
            label="High" 
            value="high" 
            count={jobs.filter(j => j.priority === 'high').length} 
          />
          <FilterButton 
            label="Medium" 
            value="medium" 
            count={jobs.filter(j => j.priority === 'medium').length} 
          />
          <FilterButton 
            label="Low" 
            value="low" 
            count={jobs.filter(j => j.priority === 'low').length} 
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
              Check back later or adjust your filters
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