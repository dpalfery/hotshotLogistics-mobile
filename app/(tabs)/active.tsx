import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, Phone, MessageCircle, CircleCheck as CheckCircle, MapPin } from 'lucide-react-native';
import JobCard from '@/components/JobCard';
import { activeJobs } from '@/data/mockJobs';

export default function ActiveScreen() {
  const [currentJob] = useState(activeJobs[0]);

  const handleNavigation = () => {
    Alert.alert(
      'Open Navigation',
      'This would open your preferred navigation app (Google Maps, Waze, etc.) with directions to the pickup location.',
      [{ text: 'OK' }]
    );
  };

  const handleCallCustomer = () => {
    Alert.alert(
      'Call Customer',
      `Call ${currentJob.customerName} at ${currentJob.customerPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...') }
      ]
    );
  };

  const handleMessage = () => {
    Alert.alert(
      'Message Customer',
      'This would open your messaging app to contact the customer.',
      [{ text: 'OK' }]
    );
  };

  const handleCompletePickup = () => {
    Alert.alert(
      'Complete Pickup',
      'Confirm that you have picked up the cargo and are ready to proceed to delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Pickup', 
          onPress: () => Alert.alert('Pickup confirmed! Navigate to delivery location.') 
        }
      ]
    );
  };

  if (!currentJob) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MapPin size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Active Jobs</Text>
          <Text style={styles.emptyStateText}>
            Accept a job from the Jobs tab to see it here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Job</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>IN PROGRESS</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <JobCard job={currentJob} showActions={false} />

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Job Progress</Text>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotCompleted]} />
            <Text style={styles.progressText}>Job Accepted</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={styles.progressText}>En Route to Pickup</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={[styles.progressText, styles.progressTextInactive]}>
              Pickup Complete
            </Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={[styles.progressText, styles.progressTextInactive]}>
              En Route to Delivery
            </Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={[styles.progressText, styles.progressTextInactive]}>
              Delivery Complete
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.primaryAction} onPress={handleNavigation}>
            <Navigation size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Navigate to Pickup</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction} onPress={handleCallCustomer}>
              <Phone size={18} color="#2563EB" />
              <Text style={styles.secondaryActionText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryAction} onPress={handleMessage}>
              <MessageCircle size={18} color="#2563EB" />
              <Text style={styles.secondaryActionText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryAction} onPress={handleCompletePickup}>
              <CheckCircle size={18} color="#059669" />
              <Text style={[styles.secondaryActionText, { color: '#059669' }]}>
                Complete Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Pickup Instructions</Text>
            <Text style={styles.infoText}>
              Contact customer 15 minutes before arrival. Use loading dock B for pickup.
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Safety Reminder</Text>
            <Text style={styles.infoText}>
              Verify cargo matches manifest. Take photos of any damage before loading.
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  progressSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  progressDotCompleted: {
    backgroundColor: '#059669',
  },
  progressDotActive: {
    backgroundColor: '#2563EB',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  progressTextInactive: {
    color: '#9CA3AF',
  },
  progressLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  actionsSection: {
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
  primaryAction: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    marginLeft: 6,
  },
  infoSection: {
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
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 20,
  },
});