import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// DTOs
interface Reservation {
  id: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  email: string;
}

interface ReservationWithGuestsDto {
  reservation: Reservation;
  guests: any[];
}

const MyReservationsScreen: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationWithGuestsDto[]>([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://192.168.0.24:5109/api/Reservations/my-reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ReservationWithGuestsDto[] = await response.json();
        setReservations(data);
      } else {
        Alert.alert('Error', 'Failed to fetch reservations');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while fetching reservations');
    }
  };

  const cancelReservation = async (reservationId: number) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.24:5109/api/Reservations/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationId }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Reservation cancelled');
        fetchReservations();
      } else {
        Alert.alert('Error', 'Failed to cancel reservation');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while cancelling reservation');
    }
  };

const uploadImageToCloudinary = async (uri: string, reservationId: number) => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'checkinimage.jpg',
  } as any);
  data.append('upload_preset', 'my_react_upload_preset'); // zameni sa pravim preset-om
  data.append('cloud_name', 'dmye7vdds'); // zameni sa tvojim

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dmye7vdds/image/upload', {
      method: 'POST',
      body: data,
    });

    const json = await res.json();
    console.log('Cloudinary URL:', json.secure_url);

    const token = await AsyncStorage.getItem('token');

    const response = await fetch('http://192.168.0.24:5109/api/Reservations/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reservationId,
        imageUrl: json.secure_url,
      }),
    });

    if (response.ok) {
      Alert.alert('Check-in uspešan!');
    } else {
      Alert.alert('Greška pri check-inu', 'Backend nije prihvatio zahtev.');
    }

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
};

  const handleCheckIn = async (reservationId: number) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera permission is required for check-in');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      await uploadImageToCloudinary(uri, reservationId);
    }
  };

  const renderItem = ({ item }: { item: ReservationWithGuestsDto }) => (
    <View style={styles.card}>
      <Text>
        Check-in: {new Date(item.reservation.checkIn).toLocaleDateString()}
      </Text>
      <Text>
        Check-out: {new Date(item.reservation.checkOut).toLocaleDateString()}
      </Text>
      <Text>Price: {item.reservation.totalPrice} €</Text>
      <Text>Status: {item.reservation.status}</Text>
      <Text>Email: {item.reservation.email}</Text>

      <TouchableOpacity
  style={styles.checkInButton}
  onPress={() => handleCheckIn(item.reservation.id)}
>
  <Text style={styles.checkInButtonText}>Check In</Text>
</TouchableOpacity>

      {item.reservation.status !== 'Cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelReservation(item.reservation.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      data={reservations}
      keyExtractor={(item) => item.reservation.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#eee',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkInButton: {
    marginTop: 10,
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyReservationsScreen;
