import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, TrendingUp, Users, Package, Download, Search, MoreHorizontal, DollarSign, Database, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [stats, setStats] = useState({ totalSales: 0, totalUsers: 0, totalTalents: 0, commission: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const usersSnap = await getDocs(collection(db, 'users'));
    const talentsSnap = await getDocs(collection(db, 'talents'));
    const transSnap = await getDocs(collection(db, 'transactions'));
    
    const sales = transSnap.size * 120;
    setStats({
      totalSales: sales,
      totalUsers: usersSnap.size,
      totalTalents: talentsSnap.size,
      commission: sales * 0.20
    });

    setRecentTransactions(transSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setTalents(talentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRole = async (userId: string, currentRoles: string[], role: string) => {
    const newRoles = currentRoles.includes(role) 
      ? currentRoles.filter(r => r !== role) 
      : [...currentRoles, role];
    
    try {
      await updateDoc(doc(db, 'users', userId), { roles: newRoles });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const seedMoroccanData = async () => {
    setLoading(true);
    const mockData = [
      { title: 'Master UI Marocaine', category: 'Design', trainerName: 'Anas El Alami', description: 'Design Moderne & Zellige.', imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750' },
      { title: 'Darija for Founders', category: 'Darija', trainerName: 'Ghita Benani', description: 'Business Darija expertise.', imageUrl: 'https://images.unsplash.com/photo-1523240715639-9635efa828ce' },
      { title: 'HESTIM Coding Lab', category: 'Coding', trainerName: 'Mehdi Choukri', description: 'Full stack development.', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' }
    ];

    try {
      for (const item of mockData) {
        await setDoc(doc(collection(db, 'talents')), {
          ...item,
          rating: 5,
          createdAt: new Date().toISOString(),
          trainerId: 'mock-admin',
          status: 'pending'
        });
      }
      await fetchData();
      alert('Moroccan Mock Data Created in Firestore!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveTalent = async (id: string) => {
    try {
      await updateDoc(doc(db, 'talents', id), { status: 'approved' });
      await fetchData();
    } catch (err) { console.error(err); }
  };

  const exportData = () => {
    // Simulated export
    const data = JSON.stringify({ stats, recentTransactions, users }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talent-academy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-50 border border-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
            <Shield className="text-primary w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">System Admin</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-1">Hestim Management Protocol</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={seedMoroccanData}
            disabled={loading}
            className="bg-primary text-white px-6 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>{loading ? 'Seeding...' : 'Seed Moroccan Data'}</span>
          </button>

          <button
            onClick={exportData}
            className="bg-surface border border-border-subtle text-text-main px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Generate Data Dump</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Gross Sales', value: `${stats.totalSales} DHS`, sub: 'Direct Revenue', icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
          { label: 'Platform Fee', value: `${stats.commission} DHS`, sub: '20% Reserved', icon: DollarSign, color: 'text-primary', bg: 'bg-blue-50' },
          { label: 'Academy Members', value: stats.totalUsers, sub: 'Verified Scholars', icon: Users, color: 'text-accent', bg: 'bg-pink-50' },
          { label: 'Talent Catalog', value: stats.totalTalents, sub: 'Session Types', icon: Package, color: 'text-warning', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface p-8 rounded-[32px] border border-border-subtle shadow-sm group hover:border-primary transition-all hover:shadow-xl"
          >
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">{item.label}</h4>
            <div className="text-3xl font-black text-text-main leading-none tabular-nums tracking-tighter">{item.value}</div>
            <p className="text-[10px] font-bold text-text-muted mt-3 italic opacity-60">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* User Table */}
        <div className="lg:col-span-2 bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-black text-text-main tracking-tight italic">Academy Members</h2>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
               <input placeholder="Search directory..." className="bg-white border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-[11px] font-semibold focus:outline-none focus:ring-2 ring-primary/10" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <th className="px-8 py-5">Full Identity</th>
                  <th className="px-8 py-5">Access Roles</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5">Set Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={u.photoURL} alt="" className="w-9 h-9 rounded-full border border-border-subtle shadow-sm" />
                        <div>
                          <p className="text-sm font-bold text-text-main leading-tight mb-1">{u.displayName}</p>
                          <p className="text-[10px] font-bold text-text-muted tracking-tight">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.roles?.map((r: string) => (
                          <span key={r} className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded shadow-sm border ${
                            r === 'admin' ? 'bg-indigo-50 text-success border-success/10' : 'bg-gray-50 text-text-muted border-border-subtle'
                          }`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-success">
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        <span>Valid</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => toggleRole(u.id, u.roles || [], 'admin')}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all border ${
                          u.roles?.includes('admin') ? 'bg-indigo-50 text-primary border-primary' : 'bg-surface border-border-subtle text-text-muted hover:bg-gray-50'
                        }`}
                      >
                         {u.roles?.includes('admin') ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm flex flex-col">
           <div className="p-8 border-b border-border-subtle bg-gray-50/50">
              <h2 className="text-xl font-black text-text-main tracking-tight italic">Order Stream</h2>
           </div>
           <div className="p-8 space-y-8 flex-grow">
             {recentTransactions.map(t => (
               <div key={t.id} className="flex items-center justify-between group">
                 <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-success transition-all shadow-sm">
                       <TrendingUp className="w-5 h-5 text-success group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main mb-0.5">Success</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">120 DHS Received</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">Just now</p>
                 </div>
               </div>
             ))}
             {recentTransactions.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full opacity-20 py-12">
                 <Package className="w-12 h-12 mb-3" />
                 <p className="text-xs font-black uppercase tracking-widest">No transaction flow</p>
               </div>
             )}
           </div>
           <div className="p-8 bg-gray-50/50 border-t border-border-subtle">
              <p className="text-[10px] font-bold text-text-muted leading-relaxed">
                Platform fee of 20% is automatically deducted and held in the school escrow account.
              </p>
           </div>
        </div>
      </div>

      {/* Talent Moderation Section */}
      <div className="bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-black text-text-main tracking-tight italic">Talent Moderation Queue</h2>
          <span className="text-[10px] font-black px-3 py-1 bg-amber-50 text-warning rounded-full border border-warning/10 uppercase tracking-widest animate-pulse">Pending Review</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-text-muted">
                <th className="px-8 py-5">Talent Info</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {talents.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <img src={t.imageUrl} alt="" className="w-14 h-10 object-cover rounded-lg border border-border-subtle shadow-sm" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-sm font-bold text-text-main leading-tight mb-1">{t.title}</p>
                        <p className="text-[10px] font-bold text-text-muted tracking-tight italic">by {t.trainerName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-primary rounded border border-primary/10">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {t.status === 'approved' ? (
                      <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-success">
                        <CheckCircle className="w-4 h-4" />
                        <span>Live on Site</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-warning">
                        <MoreHorizontal className="w-4 h-4" />
                        <span>Pending Approval</span>
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right space-x-3">
                    {t.status !== 'approved' && (
                      <button 
                        onClick={() => approveTalent(t.id)}
                        className="bg-success text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/10"
                      >
                         Approve
                      </button>
                    )}
                    <button className="bg-gray-100 text-text-muted px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-danger transition-all">
                       Reject
                    </button>
                  </td>
                </tr>
              ))}
              {talents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center opacity-30 italic font-bold text-text-muted uppercase tracking-[0.4em]">No talents to moderate</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
