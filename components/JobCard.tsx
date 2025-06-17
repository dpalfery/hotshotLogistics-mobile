import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job } from '@/types/job';
import { MapPin, Clock, DollarSign, Package, Phone } from 'lucide-react-native';

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  showActions?: boolean;
}

export default function JobCard({ job, onPress, showActions = true }: JobCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#059669';
      default: return '#6B7280';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FEE2E2';
      case 'high': return '#FED7AA';
      case 'medium': return '#FEF3C7';
      case 'low': return '#D1FAE5';
      default: return '#F3F4F6';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <View style={[
            styles.priorityBadge, 
            { backgroundColor: getPriorityBgColor(job.priority) }
          ]}>
            <Text style={[
              styles.priorityText, 
              { color: getPriorityColor(job.priority) }
            ]}>
              {job.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.rateRow}>
          <DollarSign size={18} color="#059669" />
          <Text style={styles.rate}>${job.rate}</Text>
          <Text style={styles.distance}>• {job.distance} mi</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <MapPin size={16} color="#2563EB" />
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {job.pickupCity}
            </Text>
          </View>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.routeItem}>
          <MapPin size={16} color="#DC2626" />
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>Delivery</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {job.deliveryCity}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Package size={14} color="#6B7280" />
          <Text style={styles.detailText}>{job.cargoType}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.weightText}>{job.weight} lbs</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.detailText}>{formatDate(job.pickupTime)}</Text>
        </View>
      </View>

      <View style={styles.customerRow}>
        <Phone size={14} color="#6B7280" />
        <Text style={styles.customerText}>{job.customerName}</Text>
      </View>

      {job.specialInstructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsLabel}>Special Instructions:</Text>
          <Text style={styles.instructionsText}>{job.specialInstructions}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rate: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeText: {
    marginLeft: 8,
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  routeAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 8,
    marginVertical: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  weightText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 6,
  },
  instructionsContainer: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  instructionsLabel: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
  },
});