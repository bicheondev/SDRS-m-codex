import AsyncStorage from '@react-native-async-storage/async-storage';

export const DATABASE_NAME = 'ship-database-app';
export const STORE_NAME = 'app-state';
export const STATE_KEY = 'database-v1';
export const DATABASE_VERSION = 1;

const STORAGE_KEY = `${DATABASE_NAME}:${STORE_NAME}:${STATE_KEY}`;

export async function openDatabase() {
  return AsyncStorage;
}

export async function loadStoredDatabaseState() {
  const rawState = await AsyncStorage.getItem(STORAGE_KEY);
  return rawState ? JSON.parse(rawState) : null;
}

export async function saveStoredDatabaseState(state) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
