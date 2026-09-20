'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function PhonebookPage() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { isDarkMode, setIsSidebarOpen, activeColor } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newDahili, setNewDahili] = useState('');

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    setCurrentUser(activeUser);

    // المزامنة الفورية من Firebase
    const unsubscribe = onSnapshot(collection(db, 'phonebook'), (snapshot) => {
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setContacts(data);
    }, (err) => console.error('Phonebook fetch error:', err));

    return () => unsubscribe();
  }, []);

  const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
  const isAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || uName === 'admin';

  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLocaleUpperCase('tr-TR').includes(searchTerm.toLocaleUpperCase('tr-TR')) ||
      c.department?.toLocaleUpperCase('tr-TR').includes(searchTerm.toLocaleUpperCase('tr-TR')) ||
      c.dahili?.includes(searchTerm)
  );

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newName || !newDept || !newDahili) return;
    try {
      await addDoc(collection(db, 'phonebook'), {
        name: newName.trim().toLocaleUpperCase('tr-TR'),
        department: newDept.trim().toLocaleUpperCase('tr-TR'),
        dahili: newDahili,
        createdAt: new Date().toISOString()
      });
      setNewName(''); setNewDept(''); setNewDahili('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Add contact error:', err);
    }
  };

  const handleSaveEditContact = async (e) => {
    e.preventDefault();
    if (!editingContact) return;
    try {
      await updateDoc(doc(db, 'phonebook', editingContact.id), editingContact);
      setEditingContact(null);
    } catch (err) {
      console.error('Save contact error:', err);
    }
  };

  const handleDeleteContactConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'phonebook', deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error('Delete contact error:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className={`flex justify-between items-center border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`px-4 py-2.5 rounded-2xl border-2 font-black transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <span>☰ MENÜ</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-500">TELEFON REHBERİ</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
            >
              + YENİ DAHİLİ NUMARA EKLE
            </button>
          )}
          <input
            type="text"
            placeholder="İSİM VEYA DAHİLİ ARA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border-2 text-xs font-black uppercase ${
              isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-400 text-slate-900'
            }`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-5 rounded-2xl border-2 font-black flex justify-between items-center shadow-md ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
            }`}
          >
            <div>
              <h3 className={`text-lg font-black ${activeColor}`}>{contact.name}</h3>
              <span className="text-xs text-blue-400 font-extrabold block mt-0.5">{contact.department}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-mono font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                {contact.dahili}
              </span>
              {isAdmin && (
                <div className="flex gap-1.5">
                  <button onClick={() => setEditingContact(contact)} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg text-xs">✏️</button>
                  <button onClick={() => setDeletingId(contact.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg text-xs">🗑️</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className={`w-full max-w-md rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <h3 className="text-lg font-black text-emerald-500 mb-4">+ YENİ DAHİLİ NUMARA EKLE</h3>
            <form onSubmit={handleAddContact} className="space-y-4 font-black">
              <input type="text" required placeholder="DOKTOR VEYA BİRİM ADI" value={newName} onChange={(e) => setNewName(e.target.value.toLocaleUpperCase('tr-TR'))} className="w-full px-3 py-2 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs" />
              <input type="text" required placeholder="BİRİM ADI" value={newDept} onChange={(e) => setNewDept(e.target.value.toLocaleUpperCase('tr-TR'))} className="w-full px-3 py-2 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs" />
              <input type="text" required placeholder="DAHİLİ TELEFON NUMARASI" value={newDahili} onChange={(e) => setNewDahili(e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs font-mono" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-800 rounded-xl text-xs">İPTAL</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs">KAYDET</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className={`w-full max-w-md rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <h3 className="text-lg font-black text-amber-500 mb-4">✏️ NUMARAYI DÜZENLE</h3>
            <form onSubmit={handleSaveEditContact} className="space-y-4 font-black">
              <input type="text" required value={editingContact.name} onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value.toLocaleUpperCase('tr-TR') })} className="w-full px-3 py-2 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs" />
              <input type="text" required value={editingContact.department} onChange={(e) => setEditingContact({ ...editingContact, department: e.target.value.toLocaleUpperCase('tr-TR') })} className="w-full px-3 py-2 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs" />
              <input type="text" required value={editingContact.dahili} onChange={(e) => setEditingContact({ ...editingContact, dahili: e.target.value })} className="w-full px-3 py-2 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs font-mono" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingContact(null)} className="flex-1 py-2 bg-slate-800 rounded-xl text-xs">İPTAL</button>
                <button type="submit" className="flex-1 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs">KAYDET</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`w-full max-w-sm rounded-2xl border-2 p-6 text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <h3 className="text-xl font-black mb-2 text-rose-500">🗑️ DAHİLİ NUMARAYI SİL</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">Bu numarayı rehberden silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-black">İPTAL</button>
              <button onClick={handleDeleteContactConfirm} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black">SİL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}