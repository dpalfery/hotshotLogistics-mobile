import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Star, Truck, CreditCard, Bell, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Shield, FileText } from 'lucide-react-native';
import { mockDriver } from '@/data/mockDriver';

export default function ProfileScreen() {
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here.');
  };

  const handlePaymentSettings = () => {
    Alert.alert(
      'Payment Settings', 
      'This would integrate with RevenueCat for subscription management and payment processing on iOS/Android platforms.'
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert('Notification Settings', 'Configure your notification preferences here.');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact our support team for assistance.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  const MenuButton = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    showArrow = true 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuButtonContent}>
        <View style={styles.menuButtonIcon}>
          {icon}
        </View>
        <View style={styles.menuButtonText}>
          <Text style={styles.menuButtonTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.menuButtonSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Text style={styles.menuArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: mockDriver.profileImage }} 
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton} onPress={handleEditProfile}>
              <Edit size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.driverName}>{mockDriver.name}</Text>
          <Text style={styles.driverEmail}>{mockDriver.email}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{mockDriver.rating}</Text>
            <Text style={styles.ratingText}>({mockDriver.totalJobs} jobs)</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${mockDriver.totalEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockDriver.totalJobs}</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
        </View>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Truck size={20} color="#2563EB" />
            <Text style={styles.vehicleTitle}>Vehicle Information</Text>
          </View>
          <Text style={styles.vehicleType}>{mockDriver.vehicleType}</Text>
          <Text style={styles.licenseNumber}>CDL: {mockDriver.licenseNumber}</Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <MenuButton
            icon={<Edit size={20} color="#374151" />}
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />
          
          <MenuButton
            icon={<CreditCard size={20} color="#374151" />}
            title="Payment & Billing"
            subtitle="Manage payment methods and subscriptions"
            onPress={handlePaymentSettings}
          />
          
          <MenuButton
            icon={<Bell size={20} color="#374151" />}
            title="Notifications"
            subtitle="Configure notification preferences"
            onPress={handleNotificationSettings}
          />
          
          <MenuButton
            icon={<Shield size={20} color="#374151" />}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => Alert.alert('Privacy & Security', 'Privacy settings would be configured here.')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <MenuButton
            icon={<HelpCircle size={20} color="#374151" />}
            title="Help & Support"
            subtitle="Get help or contact support"
            onPress={handleSupport}
          />
          
          <MenuButton
            icon={<FileText size={20} color="#374151" />}
            title="Terms & Conditions"
            subtitle="View terms of service"
            onPress={() => Alert.alert('Terms & Conditions', 'Terms and conditions would be displayed here.')}
          />
        </View>

        <View style={styles.menuSection}>
          <MenuButton
            icon={<LogOut size={20} color="#DC2626" />}
            title="Logout"
            onPress={handleLogout}
            showArrow={false}
          />
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>HotShot Driver v1.0.0</Text>
          <Text style={styles.appBuild}>Build 2024.01.15</Text>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 4,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 20,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  vehicleCard: {
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
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  vehicleType: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  licenseNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButtonIcon: {
    marginRight: 12,
  },
  menuButtonText: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  menuButtonSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  appBuild: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
  },
  bottomPadding: {
    height: 20,
  },
});