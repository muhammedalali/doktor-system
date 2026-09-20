'use client';  
import { useState, useEffect } from 'react';  
import { useTheme } from '@/context/ThemeContext';  
import { supabase } from '@/lib/supabase';

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

  const fetchContacts = async () => {
    const { data, error } = await supabase.from('phonebook').select('*');
    if (!error && data) {
      setContacts(data);
    }
  };

  useEffect(() => {          
    const sessionUser = sessionStorage.getItem('user');     
    const localUser = localStorage.getItem('user');     
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});          
    setCurrentUser(activeUser);          

    fetchContacts();

    const channel = supabase
      .channel('realtime_phonebook')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'phonebook' }, () => {
        fetchContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    const newContactObj = {              
      name: newName.trim().toLocaleUpperCase('tr-TR'),              
      department: newDept.trim().toLocaleUpperCase('tr-TR'),              
      dahili: newDahili,          
    };          

    await supabase.from('phonebook').insert([newContactObj]);

    setNewName(''); setNewDept(''); setNewDahili('');          
    setShowAddModal(false);      
  };      

  const handleSaveEditContact = async (e) => {          
    e.preventDefault();          
    if (!editingContact) return;          

    await supabase.from('phonebook').update(editingContact).eq('id', editingContact.id);
    setEditingContact(null);      
  };      

  const handleDeleteContactConfirm = async () => {          
    if (!deletingId) return;          
    await supabase.from('phonebook').delete().eq('id', deletingId);
    setDeletingId(null);      
  };      

  return (          
    <div className="p-6 max-w-6xl mx-auto space-y-6">              
      {/* Header */}              
      <div className={`flex justify-between items-center border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>                  
        <div className="flex items-center gap-4">                      
          <button                          
            onClick={() => setIsSidebarOpen(true)}                          
            className={`px-4 py-2.5 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-105 ${                              
              isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'                          }`}                      
          >                          
            <span className="text-lg">☰</span>                          
            <span className="text-xs font-black tracking-widest uppercase">MENÜ</span>                      
          </button>                      
          <h1 className="text-2xl sm:text-3xl font-black text-blue-500">TELEFON REHBERİ</h1>                  
        </div>                  
        <div className="flex items-center gap-3">                      
          {isAdmin && (                          
            <button                              
              onClick={() => setShowAddModal(true)}                              
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"                          >                              
              + YENİ DAHİLİ NUMARA EKLE                          
            </button>                      
          )}                      
          <input                          
            type="text"                          
            placeholder="İSİM VEYA DAHİLİ ARA..."                          
            value={searchTerm}                          
            onChange={(e) => setSearchTerm(e.target.value)}                          
            className={`px-4 py-2.5 rounded-xl border-2 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 uppercase ${                              
              isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-400 text-slate-900'                          }`}                      
          />                  
        </div>              
      </div>              

      {/* Contacts Grid */}              
      <div className="grid md:grid-cols-2 gap-4">                  
        {filteredContacts.map((contact) => (                      
          <div                          
            key={contact.id}                          
            className={`p-5 rounded-2xl border-2 font-black flex justify-between items-center shadow-md ${                              
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'                          }`}                      
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
                  <button                                          
                    onClick={() => setEditingContact(contact)}                                          
                    className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg text-xs cursor-pointer"                                      >                                          
                    ✏️                                      
                  </button>                                      
                  <button                                          
                    onClick={() => setDeletingId(contact.id)}                                          
                    className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-lg text-xs cursor-pointer"                                      >                                          
                    🗑️                                      
                  </button>                                  
                </div>                              
              )}                          
            </div>                      
          </div>                  
        ))}              
      </div>              

      {/* Add Modal */}              
      {showAddModal && (                  
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">                      
          <div className={`w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl ${                          
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'                      }`}>                          
            <div className="flex justify-between items-center mb-4 pb-2 border-b">                              
              <h3 className="text-lg font-black text-emerald-500">+ YENİ DAHİLİ NUMARA EKLE</h3>                              
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-black text-xl cursor-pointer">✕</button>                          
            </div>                          
            <form onSubmit={handleAddContact} className="space-y-4 font-black">                              
              <div>                                  
                <label className="block text-xs mb-1">DOKTOR VEYA BİRİM ADI</label>                                  
                <input                                      
                  type="text"                                      
                  required                                      
                  placeholder="ÖRNEK: DR. İBRAHİM KAYA"                                      
                  value={newName}                                      
                  onChange={(e) => setNewName(e.target.value.toLocaleUpperCase('tr-TR'))}                                      
                  className={`w-full px-3 py-2 rounded-xl border-2 font-black uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                                  
                />                              
              </div>                              
              <div>                                  
                <label className="block text-xs mb-1">BİRİM ADI</label>                                  
                <input                                      
                  type="text"                                      
                  required                                      
                  placeholder="ÖRNEK: KARDİYOLOJİ"                                      
                  value={newDept}                                      
                  onChange={(e) => setNewDept(e.target.value.toLocaleUpperCase('tr-TR'))}                                      
                  className={`w-full px-3 py-2 rounded-xl border-2 font-black uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                                  
                />                              
              </div>                              
              <div>                                  
                <label className="block text-xs mb-1">DAHİLİ TELEFON NUMARASI</label>                                  
                <input                                      
                  type="text"                                      
                  required                                      
                  placeholder="1088"                                      
                  value={newDahili}                                      
                  onChange={(e) => setNewDahili(e.target.value)}                                      
                  className={`w-full px-3 py-2 rounded-xl border-2 font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                                  
                />                              
              </div>                              
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-base shadow-lg cursor-pointer">                                  
                NUMARAYI REHBERE KAYDET                              
              </button>                          
            </form>                      
          </div>                  
        </div>              
      )}              

      {/* Edit Modal */}              
      {editingContact && (                  
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">                      
          <div className={`w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl ${                          
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'                      }`}>                          
            <div className="flex justify-between items-center mb-4 pb-2 border-b">                              
              <h3 className="text-lg font-black text-amber-500">✏️ NUMARAYI DÜZENLE</h3>                              
              <button onClick={() => setEditingContact(null)} className="text-slate-400 font-black text-xl cursor-pointer">✕</button>                          
            </div>                          
            <form onSubmit={handleSaveEditContact} className="space-y-4 font-black">                              
              <div>                                  
                <label className="block text-xs mb-1">DOKTOR VEYA BİRİM ADI</label>                                  
                <input                                      
                  type="text"                                      
                  required                                      
                  value={editingContact.name}                                      
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value.toLocaleUpperCase('tr-TR') })}                                      
                  className={`w-full px-3 py-2 rounded-xl border-2 font-black uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                                  
                />                              
              </div>                              
              <div>                                  
                <label className="block text-xs mb-1">BİRİM ADI</label>                                  
                <input                                      
                  type="text"                                      
                  required                                      
                  value={editingContact.department}                                      
                  onChange={(e) => setEditingContact({ ...editingContact, department: e.target.value.toLocaleUpperCase('tr-TR') })}                                      
                  className={`w-full px-3 py-2 rounded-xl border-2 font-black uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                                  
                />                              
              </div>                              
              <div>                                  
                <label className="block text-xs mb-1">DAHİLİ TELEFON NUMARASI</label>                                  
                <input                                      
                  type="text"                                      
                  required                                      
                  value={editingContact.dahili}                                      
                  onChange={(e) => setEditingContact({ ...editingContact, dahili: e.target.value })}                                      
                  className={`w-full px-3 py-2 rounded-xl border-2 font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                                  
                />                              
              </div>                              
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-base shadow-lg cursor-pointer">                                  
                KAYDET                              
              </button>                          
            </form>                      
          </div>                  
        </div>              
      )}              

      {/* Delete Modal */}              
      {deletingId && (                  
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">                      
          <div className={`w-full max-w-sm rounded-2xl border-2 p-6 shadow-2xl text-center ${                          
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'                      }`}>                          
            <h3 className="text-xl font-black mb-2 text-rose-500">🗑️ DAHİLİ NUMARAYI SİL</h3>                          
            <p className="text-xs font-bold text-slate-400 mb-6">Bu numaray rehberden silmek istediğinize emin misiniz?</p>                          
            <div className="flex gap-3">                              
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-black rounded-xl text-sm cursor-pointer"> İPTAL</button>                              
              <button onClick={handleDeleteContactConfirm} className="flex-1 py-2.5 bg-rose-600 text-white font-black rounded-xl text-sm shadow-md cursor-pointer">SİL</button>                          
            </div>                      
          </div>                  
        </div>              
      )}          
    </div>      
  );  
}