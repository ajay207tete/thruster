import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { apiService } from '@/services/api';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadImage(result.assets[0].base64, result.assets[0].fileName || 'image.jpg');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (base64Image: string, filename: string) => {
    try {
      setUploading(true);

      // Add data URL prefix if not present
      const imageData = base64Image.startsWith('data:')
        ? base64Image
        : `data:image/jpeg;base64,${base64Image}`;

      const response = await apiService.uploadImage({
        image: imageData,
        filename: filename
      });

      if (response.success) {
        onImageUploaded(response.url);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      {currentImage ? (
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: currentImage }}
            style={{ width: 100, height: 100, borderRadius: 8 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              backgroundColor: '#ff0000',
              borderRadius: 15,
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={pickImage}
            disabled={uploading}
          >
            <Ionicons name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#00ff00',
            borderStyle: 'dashed',
          }}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <Ionicons name="refresh" size={24} color="#00ff00" />
          ) : (
            <Ionicons name="add" size={24} color="#00ff00" />
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={{
          marginTop: 10,
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: '#00ff00',
          borderRadius: 6,
        }}
        onPress={pickImage}
        disabled={uploading}
      >
        <ThemedText style={{
          color: '#000000',
          fontSize: 14,
          fontWeight: 'bold'
        }}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
