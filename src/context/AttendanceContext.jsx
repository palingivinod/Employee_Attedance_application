import React, { createContext, useContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { INITIAL_USERS, DEFAULT_ADMIN } from '../data/initialData';

const AttendanceContext = createContext(null);

const STORAGE_KEYS = {
  USERS: 'attendance_storage_users_v8',
  CURRENT_USER: 'attendance_storage_session_v8',
  ATTENDANCE: 'attendance_storage_records_v8',
  THEME: 'attendance_theme_mode'
};

export const AttendanceProvider = ({ children }) => {
 // for theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, next ? 'dark' : 'light');
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 1. Users State - purely backed by localStorage
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load users from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  });

  // 2. Current Logged-in User Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
    }
    return null;
  });

  // 3. Attendance Records - purely backed by localStorage
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load attendance from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    return [];
  });

  // Notification state for login transition
  const [lastLoginMessage, setLastLoginMessage] = useState(null);

  // Sync users to LocalStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  }, [users]);

  // Sync session to LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
  }, [currentUser]);

  // Sync attendance records to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error('Failed to save attendance to localStorage', e);
    }
  }, [attendanceRecords]);

  // Helper: Date & Time Formats
  const getTodayString = () => dayjs().format('YYYY-MM-DD');
  const getCurrentTimeString = () => dayjs().format('hh:mm:ss A');

  // Helper: Get Today's attendance for a given user
  const getTodayAttendanceForUser = (userId) => {
    const today = getTodayString();
    return attendanceRecords.find(
      (rec) => rec.userId === userId && rec.date === today
    ) || null;
  };

  // Helper: Calculate Attended Working Days for Admin view
  const getAttendedDaysCount = (userId) => {
    const userRecords = attendanceRecords.filter((rec) => rec.userId === userId && !!rec.inTime);
    const uniqueDates = new Set(userRecords.map((r) => r.date));
    return uniqueDates.size;
  };

  /**
   * Login Handler
   * - Authenticates credentials from stored users
   * - If Employee: Automatically captures current timestamp as "In-Time" for today and saves in localStorage
   */
  const login = (emailOrUsername, password) => {
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const user = users.find(
      (u) => (u.email.toLowerCase() === cleanInput || u.id.toLowerCase() === cleanInput) && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email/ID or password. Please try again.' };
    }

    let recordedInTime = null;

    if (user.role === 'employee') {
      const today = getTodayString();
      const currentTime = getCurrentTimeString();
      
      setAttendanceRecords((prev) => {
        const existingIndex = prev.findIndex(
          (rec) => rec.userId === user.id && rec.date === today
        );

        let updated;
        if (existingIndex >= 0) {
          recordedInTime = prev[existingIndex].inTime || currentTime;
          updated = [...prev];
          if (!updated[existingIndex].inTime) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              inTime: currentTime,
              status: 'Present'
            };
          }
        } else {
          recordedInTime = currentTime;
          const newRecord = {
            id: `att-${user.id}-${today}`,
            userId: user.id,
            date: today,
            inTime: currentTime,
            outTime: null,
            status: 'Present'
          };
          updated = [newRecord, ...prev];
        }

        try {
          localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }

        return updated;
      });
    }

    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }

    const loginMsg = user.role === 'employee'
      ? `Successfully logged in at ${recordedInTime || getCurrentTimeString()}`
      : `Welcome back, Admin ${user.name}`;

    setLastLoginMessage(loginMsg);

    return {
      success: true,
      user,
      inTime: recordedInTime,
      message: loginMsg
    };
  };

  /**
   * Logout Handler
   * - If Employee: Captures current timestamp as "Out-Time", updates localStorage record, and logs out
   */
  const logout = () => {
    let recordedOutTime = null;

    if (currentUser && currentUser.role === 'employee') {
      const today = getTodayString();
      const currentTime = getCurrentTimeString();
      recordedOutTime = currentTime;

      setAttendanceRecords((prev) => {
        const existingIndex = prev.findIndex(
          (rec) => rec.userId === currentUser.id && rec.date === today
        );

        let updated;
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            outTime: currentTime,
            status: 'Completed'
          };
        } else {
          const newRecord = {
            id: `att-${currentUser.id}-${today}`,
            userId: currentUser.id,
            date: today,
            inTime: currentTime,
            outTime: currentTime,
            status: 'Completed'
          };
          updated = [newRecord, ...prev];
        }

        try {
          localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }

        return updated;
      });
    }

    setCurrentUser(null);
    setLastLoginMessage(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error(e);
    }

    return {
      success: true,
      outTime: recordedOutTime
    };
  };

  /**
   * Register User / Admin Handler
   * - Appends new user to state and persists to localStorage
   */
  const registerUser = (userData) => {
    const idClean = userData.id.trim().toUpperCase();
    const emailClean = userData.email.trim().toLowerCase();

    // Check duplicate ID
    const idExists = users.some((u) => u.id.toUpperCase() === idClean);
    if (idExists) {
      return { success: false, error: `ID "${userData.id}" is already registered!` };
    }

    // Check duplicate Email
    const emailExists = users.some((u) => u.email.toLowerCase() === emailClean);
    if (emailExists) {
      return { success: false, error: `Email "${userData.email}" is already in use!` };
    }

    const newUser = {
      id: idClean,
      name: userData.name.trim(),
      email: emailClean,
      password: userData.password,
      role: userData.role || 'employee',
      department: userData.department || 'Engineering',
      scheduledDays: 30,
      joinedDate: getTodayString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    } catch (e) {
      console.error(e);
    }

    return { success: true, user: newUser };
  };

  return (
    <AttendanceContext.Provider
      value={{
        users,
        currentUser,
        attendanceRecords,
        lastLoginMessage,
        setLastLoginMessage,
        login,
        logout,
        registerUser,
        addEmployee: registerUser,
        getTodayAttendanceForUser,
        getAttendedDaysCount,
        isDarkMode,
        toggleTheme
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
