import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DollarSign, TrendingUp, CircleCheck as CheckCircle } from 'lucide-react-native';
import JobCard from '@/components/JobCard';
import { completedJobs } from '@/data/mockJobs';

export default function HistoryScreen() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('week');

  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.rate, 0);
  const averageJobValue = totalEarnings / completedJobs.length;

  const FilterButton = ({ 
    label, 
    value 
  }: { 
    label: string; 
    value: typeof timeFilter; 
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        timeFilter === value && styles.filterButtonActive
      ]}
      onPress={() => setTimeFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        timeFilter === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job History</Text>
        <View style={styles.filterContainer}>
          <FilterButton label="Week" value="week" />
          <FilterButton label="Month" value="month" />
          <FilterButton label="Year" value="year" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <CheckCircle size={20} color="#059669" />
            </View>
            <Text style={styles.statValue}>{completedJobs.length}</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <DollarSign size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>${totalEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color="#EA580C" />
            </View>
            <Text style={styles.statValue}>${Math.round(averageJobValue)}</Text>
            <Text style={styles.statLabel}>Avg per Job</Text>
          </View>
        </View>

        <View style={styles.earningsChart}>
          <Text style={styles.chartTitle}>Weekly Earnings</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {[280, 450, 320, 680, 520, 390, 425].map((amount, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar,
                      { height: Math.max((amount / 680) * 80, 4) }
                    ]} 
                  />
                  <Text style={styles.chartBarLabel}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.chartTotal}>
              Total this week: $3,067
            </Text>
          </View>
        </View>

        <View style={styles.jobsSection}>
          <View style={styles.jobsHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
            </View>
          </View>

          {completedJobs.map((job) => (
            <View key={job.id} style={styles.completedJobContainer}>
              <JobCard job={job} showActions={false} />
              <View style={styles.completedBadge}>
                <CheckCircle size={16} color="#059669" />
                <Text style={styles.completedText}>Completed</Text>
                <Text style={styles.completedDate}>
                  {new Date(job.pickupTime).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>On-time delivery rate</Text>
            <Text style={styles.metricValue}>96%</Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Customer satisfaction</Text>
            <Text style={styles.metricValue}>4.8/5.0</Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total miles driven</Text>
            <Text style={styles.metricValue}>12,847 mi</Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average job distance</Text>
            <Text style={styles.metricValue}>159 mi</Text>
          </View>
        </View>

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
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
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  earningsChart: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 12,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chartBar: {
    backgroundColor: '#2563EB',
    width: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  chartTotal: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  jobsSection: {
    marginTop: 8,
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  legendContainer: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  completedJobContainer: {
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: 16,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    marginLeft: 4,
    marginRight: 6,
  },
  completedDate: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#059669',
  },
  performanceSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  metricValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  bottomPadding: {
    height: 20,
  },
});