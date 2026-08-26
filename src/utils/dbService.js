import {
  ref,
  get,
  set,
  onValue
} from 'firebase/database';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  onSnapshot as onFirestoreSnapshot
} from 'firebase/firestore';
import { realtimeDb, db as firestoreDb } from '../config/firebase';
import { INITIAL_USERS } from '../data/initialData';

const USERS_PATH = 'users';
const ATTENDANCE_PATH = 'attendance';

// Track active cloud engine ('realtime' | 'firestore' | null)
let activeCloudEngine = null;
let lastCloudError = null;

export const getCloudStatus = () => {
  return {
    engine: activeCloudEngine,
    error: lastCloudError,
    connected: !!activeCloudEngine
  };
};

/**
 * Sync / Fetch users from Cloud Database (Realtime DB prioritized)
 */
export const fetchCloudUsers = async () => {
  lastCloudError = null;

  // 1. Try Firebase Realtime Database first (configured with timestamp security rules)
  if (realtimeDb) {
    try {
      const usersRef = ref(realtimeDb, USERS_PATH);
      const snapshot = await get(usersRef);

      activeCloudEngine = 'realtime';

      if (!snapshot.exists()) {
        const initialMap = {};
        INITIAL_USERS.forEach((u) => {
          initialMap[u.id] = u;
        });
        await set(usersRef, initialMap);
        console.info('Cloud Realtime DB initialized with default admin Sri urjith');
        return INITIAL_USERS;
      }

      const val = snapshot.val();
      const users = Object.values(val || {});
      return users.length > 0 ? users : INITIAL_USERS;
    } catch (rtdbErr) {
      console.warn('Realtime DB fetch notice:', rtdbErr);
      lastCloudError = rtdbErr.message || String(rtdbErr);
    }
  }

  // 2. Try Cloud Firestore as fallback
  if (firestoreDb) {
    try {
      const usersCol = collection(firestoreDb, USERS_PATH);
      const snapshot = await getDocs(usersCol);

      activeCloudEngine = 'firestore';

      if (snapshot.empty) {
        for (const user of INITIAL_USERS) {
          await setDoc(doc(firestoreDb, USERS_PATH, user.id), user);
        }
        return INITIAL_USERS;
      }

      const users = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data());
      });
      return users;
    } catch (firestoreErr) {
      console.warn('Firestore fetch notice:', firestoreErr);
      lastCloudError = firestoreErr.message || String(firestoreErr);
    }
  }

  activeCloudEngine = null;
  throw new Error(lastCloudError || 'Cloud storage unreachable');
};

/**
 * Save user to Cloud Database
 */
export const saveCloudUser = async (user) => {
  let saved = false;

  // 1. Realtime Database
  if (realtimeDb) {
    try {
      const userRef = ref(realtimeDb, `${USERS_PATH}/${user.id}`);
      await set(userRef, user);
      saved = true;
      activeCloudEngine = 'realtime';
    } catch (err) {
      console.warn('Realtime DB save user notice:', err);
      lastCloudError = err.message;
    }
  }

  // 2. Firestore
  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, USERS_PATH, user.id);
      await setDoc(userRef, user, { merge: true });
      saved = true;
      if (!activeCloudEngine) activeCloudEngine = 'firestore';
    } catch (err) {
      console.warn('Firestore save user notice:', err);
      if (!lastCloudError) lastCloudError = err.message;
    }
  }

  if (!saved) {
    throw new Error(lastCloudError || 'Failed to save user to cloud storage');
  }

  return user;
};

/**
 * Fetch attendance logs from Cloud Database
 */
export const fetchCloudAttendance = async () => {
  // 1. Realtime Database
  if (realtimeDb) {
    try {
      const attRef = ref(realtimeDb, ATTENDANCE_PATH);
      const snapshot = await get(attRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        return Object.values(val || {});
      }
      return [];
    } catch (err) {
      console.warn('Realtime DB attendance fetch notice:', err);
    }
  }

  // 2. Firestore
  if (firestoreDb) {
    try {
      const attCol = collection(firestoreDb, ATTENDANCE_PATH);
      const snapshot = await getDocs(attCol);
      const records = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data());
      });
      return records;
    } catch (err) {
      console.warn('Firestore attendance fetch notice:', err);
    }
  }

  return [];
};

/**
 * Save attendance record to Cloud Database
 */
export const saveCloudAttendanceRecord = async (record) => {
  let saved = false;

  // 1. Realtime Database
  if (realtimeDb) {
    try {
      const attRef = ref(realtimeDb, `${ATTENDANCE_PATH}/${record.id}`);
      await set(attRef, record);
      saved = true;
      activeCloudEngine = 'realtime';
    } catch (err) {
      console.warn('Realtime DB save attendance notice:', err);
      lastCloudError = err.message;
    }
  }

  // 2. Firestore
  if (firestoreDb) {
    try {
      const attRef = doc(firestoreDb, ATTENDANCE_PATH, record.id);
      await setDoc(attRef, record, { merge: true });
      saved = true;
      if (!activeCloudEngine) activeCloudEngine = 'firestore';
    } catch (err) {
      console.warn('Firestore save attendance notice:', err);
      if (!lastCloudError) lastCloudError = err.message;
    }
  }

  if (!saved) {
    throw new Error(lastCloudError || 'Failed to save attendance to cloud');
  }

  return record;
};

/**
 * Real-time subscribers for Users (Realtime DB & Firestore)
 */
export const subscribeToCloudUsers = (onUpdate, onError) => {
  if (realtimeDb) {
    try {
      const usersRef = ref(realtimeDb, USERS_PATH);
      return onValue(
        usersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const users = Object.values(val || {});
            if (users.length > 0) onUpdate(users);
          }
        },
        (err) => {
          if (onError) onError(err);
        }
      );
    } catch (err) {
      console.warn('Realtime DB user subscription notice:', err);
    }
  }

  if (firestoreDb) {
    try {
      const usersCol = collection(firestoreDb, USERS_PATH);
      return onFirestoreSnapshot(
        usersCol,
        (snapshot) => {
          const users = [];
          snapshot.forEach((docSnap) => {
            users.push(docSnap.data());
          });
          if (users.length > 0) onUpdate(users);
        },
        (err) => {
          if (onError) onError(err);
        }
      );
    } catch (err) {
      console.warn('Firestore user subscription notice:', err);
    }
  }

  return () => {};
};

/**
 * Real-time subscribers for Attendance (Realtime DB & Firestore)
 */
export const subscribeToCloudAttendance = (onUpdate, onError) => {
  if (realtimeDb) {
    try {
      const attRef = ref(realtimeDb, ATTENDANCE_PATH);
      return onValue(
        attRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            onUpdate(Object.values(val || {}));
          }
        },
        (err) => {
          if (onError) onError(err);
        }
      );
    } catch (err) {
      console.warn('Realtime DB attendance subscription notice:', err);
    }
  }

  if (firestoreDb) {
    try {
      const attCol = collection(firestoreDb, ATTENDANCE_PATH);
      return onFirestoreSnapshot(
        attCol,
        (snapshot) => {
          const records = [];
          snapshot.forEach((docSnap) => {
            records.push(docSnap.data());
          });
          onUpdate(records);
        },
        (err) => {
          if (onError) onError(err);
        }
      );
    } catch (err) {
      console.warn('Firestore attendance subscription notice:', err);
    }
  }

  return () => {};
};
