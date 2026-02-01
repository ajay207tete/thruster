import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

export interface ShippingDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShippingFormProps {
  onSubmit: (details: ShippingDetails) => void;
  onCancel: () => void;
  initialData?: Partial<ShippingDetails>;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: initialData.fullName || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'India'
  });

  const [errors, setErrors] = useState<Partial<ShippingDetails>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingDetails> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields');
    }
  };

  const updateField = (field: keyof ShippingDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Shipping Information
      </Text>

      <View style={{ marginBottom: 15 }}>
      <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping Full Name *</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: errors.fullName ? '#ff0000' : '#ccc',
            borderRadius: 8,
            padding: 12,
            fontSize: 16
          }}
          value={formData.fullName}
          onChangeText={(value) => updateField('fullName', value)}
          placeholder="Enter your full name"
        />
        {errors.fullName && <Text style={{ color: '#ff0000', fontSize: 14 }}>{errors.fullName}</Text>}
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping Phone Number *</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: errors.phone ? '#ff0000' : '#ccc',
            borderRadius: 8,
            padding: 12,
            fontSize: 16
          }}
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={{ color: '#ff0000', fontSize: 14 }}>{errors.phone}</Text>}
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping Address *</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: errors.address ? '#ff0000' : '#ccc',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            minHeight: 60
          }}
          value={formData.address}
          onChangeText={(value) => updateField('address', value)}
          placeholder="Enter your address"
          multiline
          numberOfLines={2}
        />
        {errors.address && <Text style={{ color: '#ff0000', fontSize: 14 }}>{errors.address}</Text>}
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 15 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping City *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: errors.city ? '#ff0000' : '#ccc',
              borderRadius: 8,
              padding: 12,
              fontSize: 16
            }}
            value={formData.city}
            onChangeText={(value) => updateField('city', value)}
            placeholder="City"
          />
          {errors.city && <Text style={{ color: '#ff0000', fontSize: 14 }}>{errors.city}</Text>}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping State *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: errors.state ? '#ff0000' : '#ccc',
              borderRadius: 8,
              padding: 12,
              fontSize: 16
            }}
            value={formData.state}
            onChangeText={(value) => updateField('state', value)}
            placeholder="State"
          />
          {errors.state && <Text style={{ color: '#ff0000', fontSize: 14 }}>{errors.state}</Text>}
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping Postal Code *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: errors.postalCode ? '#ff0000' : '#ccc',
              borderRadius: 8,
              padding: 12,
              fontSize: 16
            }}
            value={formData.postalCode}
            onChangeText={(value) => updateField('postalCode', value)}
            placeholder="Postal Code"
            keyboardType="numeric"
          />
          {errors.postalCode && <Text style={{ color: '#ff0000', fontSize: 14 }}>{errors.postalCode}</Text>}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Shipping Country</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              fontSize: 16
            }}
            value={formData.country}
            onChangeText={(value) => updateField('country', value)}
            placeholder="Country"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#28a745',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Continue to Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCancel}
        style={{
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: '#f0f0f0'
        }}
      >
        <Text style={{ color: '#333' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};
