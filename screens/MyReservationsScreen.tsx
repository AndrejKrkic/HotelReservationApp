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
  guests: any[]; // možeš definisati tip za goste ako želiš
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
    if (!token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const url = `http://192.168.0.24:5109/api/Reservations/cancel?reservationId=${reservationId}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation.');
      }

      Alert.alert('Success', 'Reservation successfully cancelled');
      fetchReservations(); // osveži listu
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong while cancelling reservation');
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
});

export default MyReservationsScreen;
