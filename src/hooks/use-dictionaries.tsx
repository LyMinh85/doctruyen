import { useState, useEffect, useCallback } from 'react';
import { DictionaryFilePath, loadDictionaryByNameInClient } from '@/lib/utils';
import { TranslationService } from '@/services/translate-service';

interface DictionaryMetadata {
  version: string;
  lastUpdated: string;
}

interface DictionaryData {
  names: Record<string, string>;
  vietphrase: Record<string, string>;
  hanViet: Record<string, string>;
  luatNhan: Record<string, string>;
  metadata: DictionaryMetadata;
}

// Current version of the dictionaries
const CURRENT_VERSION = '1.0.0';
// How often to check for updates (in milliseconds)
const UPDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Database configuration
const DB_NAME = 'dictionariesDB';
const DB_VERSION = 1;
const STORE_NAME = 'dictionaries';
const METADATA_KEY = 'metadata';

// IndexedDB helper functions
const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Your browser doesn't support IndexedDB"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error("Database error: " + (event.target as IDBOpenDBRequest).error));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for dictionaries if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

const getFromDB = async <T,>(key: string): Promise<T | null> => {
  try {
    const db = await initializeDB();
    return new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error accessing IndexedDB:", error);
    return null;
  }
};

const saveToDb = async <T,>(key: string, value: T): Promise<void> => {
  try {
    const db = await initializeDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
};

export function useDictionaries() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictionaries, setDictionaries] = useState<DictionaryData | null>(null);

  const checkNeedsUpdate = useCallback((metadata?: DictionaryMetadata) => {
    if (!metadata) return true;
    
    // Check version
    if (metadata.version !== CURRENT_VERSION) return true;
    
    // Check last updated date
    const lastUpdated = new Date(metadata.lastUpdated).getTime();
    const now = new Date().getTime();
    if (now - lastUpdated > UPDATE_INTERVAL) return true;
    
    return false;
  }, []);

  const saveDictionariesToDB = useCallback(async (data: DictionaryData) => {
    try {
      // Save each dictionary separately to optimize storage and retrieval
      await Promise.all([
        saveToDb('names', data.names),
        saveToDb('vietphrase', data.vietphrase),
        saveToDb('hanViet', data.hanViet),
        saveToDb('luatNhan', data.luatNhan),
        saveToDb(METADATA_KEY, data.metadata),
      ]);
    } catch (error) {
      console.warn('Failed to save dictionaries to IndexedDB:', error);
      // If IndexedDB fails, we still continue with the in-memory data
    }
  }, []);

  const loadDictionaries = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Only check DB if not forcing refresh
      if (!forceRefresh) {
        // Get metadata first to check if we need to update
        const metadata = await getFromDB<DictionaryMetadata>(METADATA_KEY);
        
        if (metadata && !checkNeedsUpdate(metadata)) {
          // Load all dictionaries from IndexedDB if metadata indicates they're up-to-date
          const [names, vietphrase, hanViet, luatNhan] = await Promise.all([
            getFromDB<Record<string, string>>('names'),
            getFromDB<Record<string, string>>('vietphrase'),
            getFromDB<Record<string, string>>('hanViet'),
            getFromDB<Record<string, string>>('luatNhan'),
          ]);

          if (names && vietphrase && hanViet && luatNhan) {
            const cachedData: DictionaryData = {
              names,
              vietphrase,
              hanViet,
              luatNhan,
              metadata,
            };

            // Set state
            setDictionaries(cachedData);
            
            // Load into translation service
            TranslationService.loadAllDictionaries({
              onlyName: names,
              vietPhraseOneMeaning: vietphrase,
              hanViet,
              nhanByOneMeaning: luatNhan,
              luatNhan,
            });
            
            setIsLoading(false);
            return;
          }
        }
      }

      // Fetch fresh dictionaries if needed
      const [names, vietphrase, hanViet, luatNhan] = await Promise.all([
        loadDictionaryByNameInClient(DictionaryFilePath.names),
        loadDictionaryByNameInClient(DictionaryFilePath.vietphraseQuickTranslator),
        loadDictionaryByNameInClient(DictionaryFilePath.hanViet),
        loadDictionaryByNameInClient(DictionaryFilePath.luatNhan),
      ]);

      // Create data object with metadata
      const newDictionaryData: DictionaryData = {
        names,
        vietphrase,
        hanViet,
        luatNhan,
        metadata: {
          version: CURRENT_VERSION,
          lastUpdated: new Date().toISOString(),
        },
      };

      // Save to state
      setDictionaries(newDictionaryData);
      
      // Save to IndexedDB (async operation that we don't need to await)
      saveDictionariesToDB(newDictionaryData);
      
      // Load into the translation service
      TranslationService.loadAllDictionaries({
        onlyName: names,
        vietPhraseOneMeaning: vietphrase,
        hanViet,
        nhanByOneMeaning: luatNhan,
        luatNhan,
      });
    } catch (error) {
      console.error('Failed to load dictionaries:', error);
      setError('Không thể tải từ điển. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [checkNeedsUpdate, saveDictionariesToDB]);

  // Load dictionaries on mount
  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

  // Function to manually refresh dictionaries
  const refreshDictionaries = () => {
    return loadDictionaries(true);
  };

  return {
    isLoading,
    error,
    dictionaries,
    refreshDictionaries,
  };
}
