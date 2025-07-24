// import { View, Text, StyleSheet } from 'react-native';

// export default function HomeScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to Hotel Booking App</Text>
//       <Text>Select a room to begin your reservation.</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
// });

import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { getRooms } from '../services/roomService';
import RoomCard from '../components/RoomCard';

interface Room {
  id: number;
  name: string;
  capacity: number;
  description: string;
  price: number;
  imageUrl: string;
}

export default function HomeScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getRooms().then(setRooms).catch(console.error);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to FONsion Hotel</Text>
      <Text style={styles.subtitle}>Explore our available rooms:</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RoomCard room={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 16,
  },
});