import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

export function useQuranDb(): SQLiteDatabase {
  return useSQLiteContext();
}
