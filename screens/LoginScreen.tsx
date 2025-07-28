import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.0.24:5109/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Greška prilikom prijave.');
      }

      const data = await response.json();
      await AsyncStorage.setItem('token', data.token);

      Alert.alert('Uspešna prijava');
      navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
    } catch (error: any) {
      Alert.alert('Greška', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prijava</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Lozinka" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Uloguj se" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Nemaš nalog? Registruj se</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  link: { marginTop: 12, color: 'blue', textAlign: 'center' },
});
