import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ReservationScreen from './screens/ReservationScreen';
import ReservationConfirmation from './screens/ReservationConfirmation';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

export type RootStackParamList = {
  Home: undefined;
  Reservation: { roomId: number }; // 👈 dodajemo parametar
   ReservationConfirmation: {
    confirmation: any;
    guestNames: string[];
    email: string;
  };
   Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Hotel Rooms' }} />
        <Stack.Screen name="Reservation" component={ReservationScreen} options={{ title: 'Reservation' }} />
        <Stack.Screen name="ReservationConfirmation" component={ReservationConfirmation} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
