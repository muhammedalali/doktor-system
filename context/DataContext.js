'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Yerel Depolamadan Mevcut Kullanıcıyı Yükleme
  useEffect(() => {
    const updateCurrentUser = () => {
      const sessionUser = sessionStorage.getItem('user');
      const localUser = localStorage.getItem('user');
      if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
      } else if (localUser) {
        setCurrentUser(JSON.parse(localUser));
      } else {
        setCurrentUser(null);
      }
    };

    updateCurrentUser();
    window.addEventListener('storage', updateCurrentUser);
    return () => window.removeEventListener('storage', updateCurrentUser);
  }, []);

  // 2. Doktorlar ve Kullanıcılar İçin Canlı Veri Aboneliği
  useEffect(() => {
    // Doktorlar Aboneliği
    const unsubscribeDoctors = onSnapshot(
      collection(db, 'doctors'),
      (snapshot) => {
        const docsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setDoctors(docsData);
        setLoading(false);
      },
      (err) => {
        console.error('Doktor Verileri Alınırken Hata Oluştu:', err);
        setLoading(false);
      }
    );

    // Kullanıcılar Aboneliği
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setUsers(usersData);
      },
      (err) => {
        console.error('Kullanıcı Verileri Alınırken Hata Oluştu:', err);
      }
    );

    return () => {
      unsubscribeDoctors();
      unsubscribeUsers();
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        doctors,
        setDoctors,
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);