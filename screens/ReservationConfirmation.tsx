import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ConfirmationRouteProp = RouteProp<RootStackParamList, 'ReservationConfirmation'>;

export default function ReservationConfirmation() {
  const route = useRoute<ConfirmationRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { confirmation, guestNames = [], email } = route.params;

  const reservation = confirmation.reservation;
  const promoCode = confirmation.promoCode;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reservation Confirmed! 🎉</Text>

      <Text style={styles.label}>Reservation Token:</Text>
      <Text style={styles.value}>{reservation.token}</Text>

      <Text style={styles.label}>Room:</Text>
      <Text style={styles.value}>{reservation.room?.name}</Text>

      <Text style={styles.label}>Dates:</Text>
      <Text style={styles.value}>{reservation.checkIn.split('T')[0]} ➝ {reservation.checkOut.split('T')[0]}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{email || reservation.email}</Text>

      <Text style={styles.label}>Guests:</Text>
      {guestNames.map((name: string, index: number) => (
        <Text key={index} style={styles.value}>• {name}</Text>
      ))}

      <Text style={styles.label}>Total Price:</Text>
      <Text style={styles.value}>${reservation.totalPrice}</Text>

      {promoCode && (
        <>
          <Text style={styles.label}>Promo Code:</Text>
          <Text style={styles.value}>
            {promoCode.code} ({promoCode.discountPercentage}%)
          </Text>
        </>
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2e7d32',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginTop: 2,
    marginBottom: 4,
  },
});
