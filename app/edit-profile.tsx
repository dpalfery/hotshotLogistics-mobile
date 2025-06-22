import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  CreditCard,
  Save,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react-native';
import { mockDriver } from '@/data/mockDriver';

const { width } = Dimensions.get('window');

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
  profileImage: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vehicleType?: string;
  licenseNumber?: string;
}

export default function EditProfileScreen() {
  const [formData, setFormData] = useState<FormData>({
    firstName: mockDriver.name.split(' ')[0] || '',
    lastName: mockDriver.name.split(' ')[1] || '',
    email: mockDriver.email,
    phone: mockDriver.phone,
    vehicleType: mockDriver.vehicleType,
    licenseNumber: mockDriver.licenseNumber,
    profileImage: mockDriver.profileImage || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showLicenseNumber, setShowLicenseNumber] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (XXX) XXX-XXXX';
    }

    // Vehicle type validation
    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = 'Vehicle type is required';
    }

    // License number validation
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.trim().length < 5) {
      newErrors.licenseNumber = 'License number must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagePicker = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Photo Upload',
        'Photo upload functionality would be implemented here using expo-image-picker for mobile platforms.',
        [{ text: 'OK' }]
      );
    } else {
      // On mobile, you would use expo-image-picker here
      Alert.alert(
        'Select Photo',
        'Choose how you want to update your profile photo',
        [
          { text: 'Camera', onPress: () => console.log('Open camera') },
          { text: 'Photo Library', onPress: () => console.log('Open library') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to top to show errors
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSaveSuccess(true);
      
      // Show success state briefly then navigate back
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    error, 
    icon: Icon,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'words',
    secureTextEntry = false,
    showToggle = false,
    onToggleSecure
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    icon: any;
    placeholder: string;
    keyboardType?: any;
    autoCapitalize?: any;
    secureTextEntry?: boolean;
    showToggle?: boolean;
    onToggleSecure?: () => void;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <Icon size={20} color={error ? '#DC2626' : '#6B7280'} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggleSecure} style={styles.toggleButton}>
            {secureTextEntry ? (
              <Eye size={20} color="#6B7280" />
            ) : (
              <EyeOff size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: formData.profileImage }} 
                style={styles.profileImage}
              />
              <TouchableOpacity 
                style={styles.imageEditButton} 
                onPress={handleImagePicker}
              >
                <Camera size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.imageHint}>Tap to change photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <InputField
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              error={errors.firstName}
              icon={User}
              placeholder="Enter your first name"
            />

            <InputField
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              error={errors.lastName}
              icon={User}
              placeholder="Enter your last name"
            />

            <InputField
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              error={errors.email}
              icon={Mail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChangeText={handlePhoneChange}
              error={errors.phone}
              icon={Phone}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Vehicle & License</Text>
            
            <InputField
              label="Vehicle Type"
              value={formData.vehicleType}
              onChangeText={(text) => handleInputChange('vehicleType', text)}
              error={errors.vehicleType}
              icon={Truck}
              placeholder="e.g., Sprinter Van, Box Truck"
            />

            <InputField
              label="License Number"
              value={formData.licenseNumber}
              onChangeText={(text) => handleInputChange('licenseNumber', text)}
              error={errors.licenseNumber}
              icon={CreditCard}
              placeholder="Enter your CDL number"
              autoCapitalize="characters"
              secureTextEntry={!showLicenseNumber}
              showToggle={true}
              onToggleSecure={() => setShowLicenseNumber(!showLicenseNumber)}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              (isLoading || saveSuccess) && styles.saveButtonDisabled
            ]} 
            onPress={handleSave}
            disabled={isLoading || saveSuccess}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Saved!</Text>
              </>
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  imageHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    transition: 'all 0.2s ease',
  },
  inputWrapperError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  toggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
});