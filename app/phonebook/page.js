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
    const now = Date.now();
    try {
      await addDoc(collection(db, 'phonebook'), {
        name: newName.trim().toLocaleUpperCase('tr-TR'),
        department: newDept.trim().toLocaleUpperCase('tr-TR'),
        dahili: newDahili,
        createdAt: now,
        updatedAt: now
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
      await updateDoc(doc(db, 'phonebook', editingContact.id), {
        ...editingContact,
        updatedAt: Date.now() // تم تحديث زمن التعديل لتمييز العملية عن الإضافة
      });
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
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 pb-4 gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`px-4 py-2.5 rounded-2xl border-2 font-black transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <span>☰ MENÜ</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-500 uppercase tracking-wide">TELEFON REHBERİ</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-all active:scale-95"
            >
              + YENİ DAHİLİ NUMARA EKLE
            </button>
          )}
          <input
            type="text"
            placeholder="İSİM VEYA DAHİLİ ARA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border-2 text-xs font-black uppercase outline-none focus:border-blue-500 ${
              isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-400 text-slate-900'
            }`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-5 rounded-2xl border-2 font-black flex justify-between items-center shadow-md transition-all hover:scale-[1.01] ${
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
                  <button onClick={() => setEditingContact(contact)} className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs cursor-pointer transition-all" title="Düzenle">✏️</button>
                  <button onClick={() => setDeletingId(contact.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs cursor-pointer transition-all" title="Sil">🗑️</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: YENİ NUMARA EKLEME */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <h3 className="text-base font-black text-emerald-500 uppercase mb-4">+ YENİ DAHİLİ NUMARA EKLE</h3>
            <form onSubmit={handleAddContact} className="space-y-4 font-black">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DOKTOR VEYA BİRİM ADI</label>
                <input type="text" required placeholder="Örn: DR. AHMET YILMAZ" value={newName} onChange={(e) => setNewName(e.target.value.toLocaleUpperCase('tr-TR'))} className="w-full px-3.5 py-2.5 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DEPARTMAN / POLİKLİNİK</label>
                <input type="text" required placeholder="Örn: DAHİLİYE POLİKLİNİĞİ" value={newDept} onChange={(e) => setNewDept(e.target.value.toLocaleUpperCase('tr-TR'))} className="w-full px-3.5 py-2.5 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DAHİLİ TELEFON NO</label>
                <input type="text" required placeholder="Örn: 1044" value={newDahili} onChange={(e) => setNewDahili(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs font-mono outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-black cursor-pointer">İPTAL</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg transition-all">KAYDET</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUMARA DÜZENLEME */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <h3 className="text-base font-black text-amber-500 uppercase mb-4">✏️ DAHİLİ NUMARAYI DÜZENLE</h3>
            <form onSubmit={handleSaveEditContact} className="space-y-4 font-black">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DOKTOR VEYA BİRİM ADI</label>
                <input type="text" required value={editingContact.name} onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value.toLocaleUpperCase('tr-TR') })} className="w-full px-3.5 py-2.5 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DEPARTMAN / POLİKLİNİK</label>
                <input type="text" required value={editingContact.department} onChange={(e) => setEditingContact({ ...editingContact, department: e.target.value.toLocaleUpperCase('tr-TR') })} className="w-full px-3.5 py-2.5 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DAHİLİ TELEFON NO</label>
                <input type="text" required value={editingContact.dahili} onChange={(e) => setEditingContact({ ...editingContact, dahili: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border-2 bg-slate-950 border-slate-800 text-xs font-mono outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingContact(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-black cursor-pointer">İPTAL</button>
                <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-lg transition-all">GÜNCELLE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SİLME ONAYI */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl border-2 p-6 text-center shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <h3 className="text-base font-black mb-2 text-rose-500 uppercase">🗑️ DAHİLİ NUMARAYI SİL</h3>
            <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed">Bu numarayı rehberden silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3 font-black">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleDeleteContactConfirm} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs cursor-pointer shadow-lg transition-all">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}