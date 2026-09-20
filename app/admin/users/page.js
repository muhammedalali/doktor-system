'use client'; 
import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import { supabase } from '@/lib/supabase';

const SECURITY_QUESTIONS = [   
  'En sevdiğiniz yemek nedir?',   
  'En sevdiğiniz spor dalı nedir?',   
  'Ortaokulunuzun adı nedir?',   
  'En sevdiğiniz çocukluk arkadaşınızın adı nedir?', 
  'İlk evcil hayvanınızın adı nedir?'
];

export default function AdminUsersPage() {   
  const { isDarkMode, activeColor, setIsSidebarOpen } = useTheme();   
  const [users, setUsers] = useState([]);   
  const [username, setUsername] = useState('');   
  const [surname, setSurname] = useState('');   
  const [birthDate, setBirthDate] = useState('');   
  const [phone, setPhone] = useState('');   
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);   
  const [securityAnswer, setSecurityAnswer] = useState('');   
  const [password, setPassword] = useState('');   
  const [userMsg, setUserMsg] = useState('');   

  const [systemIssues, setSystemIssues] = useState([]);   
  const [adminReplyText, setAdminReplyText] = useState({});   
  const router = useRouter();   

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchIssues = async () => {
    const { data, error } = await supabase.from('system_issues').select('*');
    if (!error && data) {
      setSystemIssues(data);
    }
  };

  useEffect(() => {     
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const currentUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    const nameStr = currentUser.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';     

    if (nameStr !== 'ADMIN' && currentUser.role !== 'YÖNETİCİ' && nameStr !== 'admin') {       
      router.push('/dashboard');       
      return;     
    }     

    fetchUsers();
    fetchIssues();

    const usersChannel = supabase
      .channel('admin_users_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    const issuesChannel = supabase
      .channel('admin_issues_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_issues' }, () => {
        fetchIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(issuesChannel);
    };
  }, [router]);   

  const handleAddUser = async (e) => {     
    e.preventDefault();     
    if (!username || !surname || !password) return;     

    const cleanUsername = username.trim().toLocaleUpperCase('tr-TR');     
    const cleanSurname = surname.trim().toLocaleUpperCase('tr-TR');          

    const newUserObj = {       
      username: cleanUsername,       
      surname: cleanSurname,       
      fullName: `${cleanUsername} ${cleanSurname}`,       
      birthDate: birthDate || null,       
      phone: phone || '05555555555',       
      securityQuestion,       
      securityAnswer: securityAnswer.trim().toLocaleUpperCase('tr-TR') || 'CEVAP',       
      password,       
      role: 'KULLANICI',     
    };     

    const { error } = await supabase.from('users').insert([newUserObj]);

    if (!error) {
      setUsername(''); setSurname(''); setBirthDate(''); setPhone(''); setSecurityAnswer(''); setPassword('');     
      setUserMsg('Kullanıcı başarıyla kaydedildi!');     
      setTimeout(() => setUserMsg(''), 3000);   
    } else {
      alert('Hata: Kullanıcı eklenemedi!');
    }
  };   

  const handleDeleteUser = async (id) => {     
    await supabase.from('users').delete().eq('id', id);
  };   

  const handleDeleteIssue = async (id) => {     
    await supabase.from('system_issues').delete().eq('id', id);
  };   

  const handleSendAdminReply = async (id) => {     
    const reply = adminReplyText[id];     
    if (!reply) return;     

    await supabase
      .from('system_issues')
      .update({ adminReply: reply, isRead: true })
      .eq('id', id);

    setAdminReplyText((prev) => ({ ...prev, [id]: '' }));   
  };   

  return (     
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>              
      {/* Header */}       
      <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-lg flex justify-between items-center ${         
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'       }`}>         
        <div className="flex items-center gap-4">           
          <button             
            onClick={() => setIsSidebarOpen(true)}             
            className={`px-4 py-2.5 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-105 ${               
              isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400 hover:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'             }`}           
          >             
            <span className="text-lg">☰</span>             
            <span className="text-xs font-black tracking-widest uppercase">MENÜ</span>           
          </button>           
          <h1 className="text-lg sm:text-2xl font-black tracking-wide text-amber-500 uppercase">               
            KULLANICI YÖNETİM PANELİ           
          </h1>         
        </div>       
      </div>       

      <div className="grid md:grid-cols-3 gap-6">                  
        {/* New User Add Form */}         
        <div className={`p-6 rounded-2xl border-2 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>           
          <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">➕ YENİ KULLANICI EKLE</h3>           
          {userMsg && <div className="p-3 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-xl">{userMsg}</div>}                      
          <form onSubmit={handleAddUser} className="space-y-4 font-black">             
            <div>               
              <label className="block text-xs mb-1 text-slate-400">KULLANICI ADI</label>               
              <input                  
                type="text"                  
                value={username}                  
                onChange={(e) => setUsername(e.target.value.toLocaleUpperCase('tr-TR'))}                  
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black uppercase outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                  
                required                
              />             
            </div>             
            <div>               
              <label className="block text-xs mb-1 text-slate-400">SOYADI</label>               
              <input                  
                type="text"                  
                value={surname}                  
                onChange={(e) => setSurname(e.target.value.toLocaleUpperCase('tr-TR'))}                  
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black uppercase outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                  
                required                
              />             
            </div>             
            <div>               
              <label className="block text-xs mb-1 text-slate-400">DOĞUM TARİHİ</label>               
              <input                  
                type="date"                  
                value={birthDate}                  
                onChange={(e) => setBirthDate(e.target.value)}                  
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                
              />             
            </div>             
            <div>               
              <label className="block text-xs mb-1 text-slate-400">TELEFON NUMARASI</label>               
              <input                  
                type="text"                  
                placeholder="05XXXXXXXXX"                 
                value={phone}                  
                onChange={(e) => setPhone(e.target.value)}                  
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-mono outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                
              />             
            </div>             
            <div>               
              <label className="block text-xs mb-1 text-amber-400">GÜVENLİK SORUSU</label>               
              <select                 
                value={securityQuestion}                 
                onChange={(e) => setSecurityQuestion(e.target.value)}                 
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}               
              >                 
                {SECURITY_QUESTIONS.map((q, idx) => (                   
                  <option key={idx} value={q}>{q}</option>                 
                ))}               
              </select>             
            </div>             
            <div>               
              <label className="block text-xs mb-1 text-amber-400">GÜVENLİK SORUSU CEVABI</label>               
              <input                  
                type="text"                  
                placeholder="Örn: Lahmacun"                 
                value={securityAnswer}                  
                onChange={(e) => setSecurityAnswer(e.target.value)}                  
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black uppercase outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                
              />             
            </div>             
            <div>               
              <label className="block text-xs mb-1 text-slate-400">ŞİFRE</label>               
              <input                  
                type="password"                  
                value={password}                  
                onChange={(e) => setPassword(e.target.value)}                  
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}                  
                required                
              />             
            </div>             
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer">               
              KULLANICIYI KAYDET             
            </button>           
          </form>         
        </div>         

        {/* Requests & Issues List */}         
        <div className="md:col-span-2 space-y-6">                      
          <div className={`p-6 rounded-2xl border-2 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>             
            <div className="flex justify-between items-center">               
              <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">                 
                <span>📩 GELEN BİLDİRİMLER VE TALEPLER</span>                 
                <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-mono">                   
                  {systemIssues.length}                 
                </span>               
              </h3>             
            </div>             
            {systemIssues.length > 0 ? (               
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">                 
                {systemIssues.map((req) => (                   
                  <div key={req.id} className={`p-4 border-2 rounded-2xl space-y-3 font-black ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                     
                    <div className="flex justify-between items-center">                       
                      <div className="text-sm text-emerald-400">@{req.username}</div>                       
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">                         
                        {req.category} | {req.urgency}                       
                      </span>                     
                    </div>                     
                    <p className="text-slate-300 text-xs font-normal font-sans">                       
                      {req.description}                     
                    </p>                     
                    {req.adminReply && (                       
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs">                           
                        Yanıtınız: {req.adminReply}                       
                      </div>                     
                    )}                     
                    <div className="flex gap-2 items-center pt-2 border-t border-slate-800/60">                       
                      <input                         
                        type="text"                         
                        placeholder="Kullanıcıya yanıt yazın..."                         
                        value={adminReplyText[req.id] || ''}                         
                        onChange={(e) => setAdminReplyText({ ...adminReplyText, [req.id]: e.target.value })}                         
                        className={`flex-1 px-3 py-1.5 rounded-xl border-2 font-normal text-xs outline-none ${                           
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'                         }`}                       
                      />                       
                      <button                         
                        onClick={() => handleSendAdminReply(req.id)}                         
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl cursor-pointer"                       >                         
                        YANITLA                       
                      </button>                       
                      <button                         
                        onClick={() => handleDeleteIssue(req.id)}                         
                        className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs rounded-xl cursor-pointer"                       >                         
                        SİL                       
                      </button>                     
                    </div>                   
                  </div>                 
                ))}               
              </div>             
            ) : (               
              <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl text-xs text-slate-500 text-center font-bold">                 
                Henüz bekleyen herhangi bir destek talebi bulunmuyor.               
              </div>             
            )}           
          </div>           

          <div className={`p-6 rounded-2xl border-2 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>             
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">KAYITLI KULLANICILAR ({users.length})</h3>             
            <div className="space-y-3">               
              {users.map((u) => (                 
                <div key={u.id} className={`flex justify-between items-center p-4 border-2 rounded-xl font-black ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                   
                  <div>                     
                    <span className={`font-extrabold text-sm tracking-wide ${activeColor}`}>{u.username} {u.surname || ''}</span>                     
                    <span className="ml-3 text-xs text-emerald-400 font-mono">@{u.username.toLowerCase()}</span>                     
                    <div className="text-[11px] text-slate-400 font-mono mt-1">                       
                      Soru: {u.securityQuestion || 'Yok'} | Cevap: {u.securityAnswer || 'Yok'}                     
                    </div>                   
                  </div>                   
                  {u.username !== 'ADMIN' && u.username !== 'admin' && (                     
                    <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs rounded-lg font-black cursor-pointer transition-all">                       
                      KULLANICIYI SİL                     
                    </button>                   
                  )}                 
                </div>               
              ))}             
            </div>           
          </div>         
        </div>       
      </div>     
    </div>   
  ); 
}