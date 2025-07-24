export const getRooms = async () => {
  const response = await fetch('http://192.168.0.24:5109/api/room'); // zameniti sa tvojim IP-em
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return await response.json();
};
