import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
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
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    getRooms().then(setRooms).catch(console.error);
  }, []);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const goToMyReservations = () => {
    closeMenu();
    navigation.navigate('MyReservations' as never); // Type assertion for navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dropdown meni */}
      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton icon="dots-vertical" size={24} onPress={openMenu} />
          }
        >
          <Menu.Item
            onPress={goToMyReservations}
            title="My Reservations"
            leadingIcon="calendar"
          />
        </Menu>
      </View>

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
  menuContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
  },
});
