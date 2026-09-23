'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 📡 اشتراك لحظي واحد فقط يخدم كافة صفحات النظام
    const unsubscribe = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        // 🛡️ تصفية المكرر لضمان مطابقة الأسماء تماماً بين صفحات المشروع
        const uniqueDocsMap = new Map();
        data.forEach(item => {
          if (item.name && item.clinic) {
            const key = `${item.name.trim().toLocaleUpperCase('tr-TR')}_${item.clinic.trim().toLocaleUpperCase('tr-TR')}`;
            if (!uniqueDocsMap.has(key)) {
              uniqueDocsMap.set(key, item);
            }
          }
        });

        setDoctors(Array.from(uniqueDocsMap.values()));
      } else {
        setDoctors([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Firebase Realtime Fetch Error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DataContext.Provider value={{ doctors, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);