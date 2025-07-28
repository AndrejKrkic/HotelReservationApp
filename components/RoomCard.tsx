import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

interface Props {
  room: {
    id: number;
    name: string;
    capacity: number;
    description: string;
    pricePerNight: number;
    imageUrl: string;
  };
}

export default function RoomCard({ room }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleReserve = () => {
    navigation.navigate('Reservation', { roomId: room.id });
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: room.imageUrl }} style={styles.image} />
      <Text style={styles.name}>{room.name}</Text>
      <Text>Capacity: {room.capacity}</Text>
      <Text>{room.description}</Text>
      <Text style={styles.price}>{room.pricePerNight}€ / night</Text>
      <Button title="Rezerviši" onPress={handleReserve} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  price: {
    marginTop: 6,
    fontWeight: '600',
  },
});
