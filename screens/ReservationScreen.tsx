import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
// Types

type ReservationRouteProp = RouteProp<RootStackParamList, 'Reservation'>;

export default function ReservationScreen() {
  const route = useRoute<ReservationRouteProp>();
  const { roomId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState([{ name: '' }]);
  const [promoCode, setPromoCode] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [room, setRoom] = useState<any>(null);

  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  // const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);

  
  // Fetch room details
  useEffect(() => {
    fetch(`http://192.168.0.24:5109/api/room/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        setRoom(data);
        setGuests([{ name: '' }]);
      })
      .catch(console.error);
  }, []);


useEffect(() => {
    fetchOccupiedDates();
  }, []);

  const fetchOccupiedDates = async () => {
  try {
    const token = await AsyncStorage.getItem('token'); // ako koristiš AsyncStorage
    if (!token) throw new Error('Token nije pronađen');

    const response = await fetch(`http://192.168.0.24:5109/api/Reservations/occupied-dates/${roomId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Greška: ${response.status} - ${text}`);
    }

    const data = await response.json();
    setOccupiedDates(data);
  } catch (error) {
    console.error(error);
    Alert.alert('Greška', 'Neuspešno preuzimanje zauzetih datuma');
  }
};

  const getMarkedDates = () => {
    const marked: Record<string, any> = {};
    occupiedDates.forEach((isoString) => {
      const dateOnly = isoString.split('T')[0]; // "2025-07-29"
      marked[dateOnly] = { disabled: true };
    });

    if (startDate) {
      marked[startDate] = {
        ...(marked[startDate] || {}),
        selected: true,
        selectedColor: 'blue',
      };
    }

     if (endDate) {
      marked[endDate] = {
        ...(marked[endDate] || {}),
        selected: true,
        selectedColor: 'green',
      };
    }
    return marked;
  };

const getDisabledDates = (ranges: { from: string; to: string }[]) => {
  const disabled: Record<string, { disabled: true }> = {};

  ranges.forEach((range) => {
    const from = new Date(range.from);
    const to = new Date(range.to);
    for (
      let d = new Date(from);
      d <= to;
      d.setDate(d.getDate() + 1)
    ) {
      const iso = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
      disabled[iso] = { disabled: true };
    }
  });

  return disabled;
};

  const handleGuestChange = (index: number, text: string) => {
    const updated = [...guests];
    updated[index].name = text;
    setGuests(updated);
  };

  const addGuest = () => {
    if (guests.length < room.capacity) {
      setGuests([...guests, { name: '' }]);
    } else {
      Alert.alert('Max guests reached!');
    }
  };

  const removeGuest = (index: number) => {
    const updated = guests.filter((_, i) => i !== index);
    setGuests(updated);
  };

  const calculatePrice = async () => {
    const payload = {
      roomId: room.id,
      checkInDate: startDate,
      checkOutDate: endDate,
      email,
      promoCode,
      guestNames: guests.map((g) => g.name || ''),
    };

    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch('http://192.168.0.24:5109/api/Reservations/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error calculating price');
      }

      const data = await response.json();
      setPrice(data.totalPrice);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const reserveRoom = async () => {

     // Validacija email-a (jednostavan regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert('Invalid email', 'Please enter a valid email address.');
    return;
  }

  // Validacija da li je bar jedno ime gosta uneto
  const hasAtLeastOneGuest = guests.some((g) => g.name && g.name.trim() !== '');
  if (!hasAtLeastOneGuest) {
    Alert.alert('Missing guest name', 'Please enter at least one guest name.');
    return;
  }
    const payload = {
      roomId: room.id,
      checkInDate: startDate,
      checkOutDate: endDate,
      email,
      promoCode,
      guestNames: guests.map((g) => g.name || ''),
    };
  const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch('http://192.168.0.24:5109/api/Reservations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`,},
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Reservation failed');
      }

      const data = await response.json();
     navigation.reset({
  index: 0,
  routes: [
    {
      name: 'ReservationConfirmation',
      params: {
        confirmation: data,
        guestNames: guests.map((g) => g.name),
        email: email,
      },
    },
  ],
});
    } catch (error: any) {
      Alert.alert('Reservation failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Reservation for Room #{roomId}</Text>

          <Text style={styles.label}>From Date</Text>
          {/* <DateTimePicker
            value={fromDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => selectedDate && setFromDate(selectedDate)}
            style={{ alignSelf: 'flex-start' }}
          /> */}
           <Calendar
        onDayPress={(day) => {
          const dateStr = day.dateString; // "YYYY-MM-DD"
          if (occupiedDates.includes(dateStr)) {
            Alert.alert('Zauzeto', 'Ovaj datum je već rezervisan.');
            return;
          }
          setStartDate(dateStr);
        }}
        markedDates={getMarkedDates()}
        disableAllTouchEventsForDisabledDays={true}
      />

          <Text style={styles.label}>To Date</Text>
          {/* <DateTimePicker
            value={toDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => selectedDate && setToDate(selectedDate)}
            style={{ alignSelf: 'flex-start' }}
          /> */}

           <Calendar
        onDayPress={(day) => {
          const dateStr = day.dateString; // "YYYY-MM-DD"
          if (occupiedDates.includes(dateStr)) {
            Alert.alert('Zauzeto', 'Ovaj datum je već rezervisan.');
            return;
          }
          setEndDate(dateStr);
        }}
        markedDates={getMarkedDates()}
        disableAllTouchEventsForDisabledDays={true}
      />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

          <Text style={styles.label}>Guests</Text>
          {guests.map((guest, index) => (
            <View key={index} style={styles.guestRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={guest.name}
                onChangeText={(text) => handleGuestChange(index, text)}
                placeholder={`Guest ${index + 1} full name`}
              />
              {index > 0 && <Button title="X" onPress={() => removeGuest(index)} />}
            </View>
          ))}

          {guests.length < room?.capacity && <Button title="Add Guest" onPress={addGuest} />}

          <Text style={styles.label}>Promo Code (optional)</Text>
          <TextInput style={styles.input} value={promoCode} onChangeText={setPromoCode} />

          <Button title="Calculate Price" onPress={calculatePrice} />

          {price !== null && (
            <Text style={styles.priceText}>Total Price: {price}€</Text>
          )}

          <View style={{ marginTop: 20 }}>
            <Button title="Reserve" onPress={reserveRoom} color="#2e7d32" />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007700',
    textAlign: 'center',
  },
});
