import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  MessageSquare, Plus, Edit2, ArrowLeft, Users, 
  BookOpen, Star, ShieldCheck, Mail, MapPin, Loader2, UserPlus, UserCheck 
} from 'lucide-react';
import TalentCard from '../components/TalentCard';

const TrainerProfile = () => {
  const { trainerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trainer, setTrainer] = useState<any>(null);
  const [talents, setTalents] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!trainerId) return;
      
      try {
        // Fetch trainer profile
        const trainerDoc = await getDoc(doc(db, 'users', trainerId));
        if (trainerDoc.exists()) {
          setTrainer({ id: trainerDoc.id, ...trainerDoc.data() });
        }

        // Fetch trainer's talents
        const talentsQuery = query(
          collection(db, 'talents'),
          where('trainerId', '==', trainerId)
        );
        const talentsSnap = await getDocs(talentsQuery);
        setTalents(talentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Check if current user follows this trainer
        if (user) {
          const followQuery = query(
            collection(db, 'follows'),
            where('followerId', '==', user.uid),
            where('followingId', '==', trainerId),
            where('followingType', '==', 'user')
          );
          const followSnap = await getDocs(followQuery);
          setIsFollowing(followSnap.docs.length > 0);
        }

        // Get followers count
        const followersQuery = query(
          collection(db, 'follows'),
          where('followingId', '==', trainerId),
          where('followingType', '==', 'user')
        );
        const followersSnap = await getDocs(followersQuery);
        setFollowers(followersSnap.docs.length);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId, user]);

  const handleFollow = async () => {
    if (!user || !trainerId) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        const followQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', user.uid),
          where('followingId', '==', trainerId),
          where('followingType', '==', 'user')
        );
        const followSnap = await getDocs(followQuery);
        for (const docSnapshot of followSnap.docs) {
          await deleteDoc(docSnapshot.ref);
        }
        setIsFollowing(false);
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        await addDoc(collection(db, 'follows'), {
          followerId: user.uid,
          followingId: trainerId,
          followingType: 'user',
          createdAt: new Date().toISOString(),
        });
        setIsFollowing(true);
        setFollowers(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Chargement du profil...</p>
      </div>
    </div>
  );

  if (!trainer) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-bold">
      Trainer introuvable
    </div>
  );

  const isOwnProfile = user?.uid === trainerId;
  const avgRating = talents.length > 0 
    ? (talents.reduce((sum, t) => sum + (t.rating || 5), 0) / talents.length).toFixed(1) 
    : '5.0';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header Background */}
      <div className="h-[280px] relative overflow-hidden bg-slate-900 border-b border-indigo-900/20">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
          style={{ 
            backgroundImage: trainer.bannerURL ? `url(${trainer.bannerURL})` : 'none',
            filter: 'brightness(0.6)'
          }}
        />
        {!trainer.bannerURL && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-slate-900 mix-blend-multiply opacity-80" />
        )}
        
        <div className="absolute top-8 left-8 flex items-center justify-between w-[calc(100%-64px)] z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          {isOwnProfile && (
             <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Modifier mon profil
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Trainer Card */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-40 h-40 rounded-[40px] border-8 border-white shadow-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100">
                {trainer.photoURL ? (
                  <img src={trainer.photoURL} alt={trainer.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-200 uppercase">
                    {trainer.displayName?.charAt(0) || '👤'}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <h2 className="text-2xl font-black text-slate-900">{trainer.displayName}</h2>
                  <ShieldCheck className="w-6 h-6 text-primary fill-primary/10" />
                </div>
                <p className="text-slate-500 font-bold flex items-center gap-2 justify-center text-sm">
                  <Mail className="w-4 h-4 text-slate-400" /> {trainer.email}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-slate-50">
                 <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">Followers</p>
                   <p className="text-xl font-black text-slate-900">{followers}</p>
                 </div>
                 <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">Note Moyenne</p>
                   <p className="text-xl font-black text-primary">{avgRating}</p>
                 </div>
              </div>

              {!isOwnProfile && (
                <div className="w-full grid grid-cols-4 gap-3 mt-8">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`col-span-3 py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all active:scale-95 flex items-center justify-center gap-3 border shadow-lg ${
                      isFollowing
                        ? 'bg-primary text-white border-primary shadow-primary/30'
                        : 'bg-white text-primary border-primary/20 hover:border-primary'
                    }`}
                  >
                    {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     isFollowing ? <UserCheck className="w-4 h-4 text-white" /> : <UserPlus className="w-4 h-4" />}
                    {isFollowing ? 'Suivi' : 'Suivre le Trainer'}
                  </button>
                  <button
                    onClick={() => navigate(`/messaging`)}
                    className="aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Quick Stats Summary */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4"
            >
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 italic">Informations</h4>
               {[
                 { label: 'Localisation', val: trainer.location || 'Maroc', icon: MapPin },
                 { label: 'Talents Actifs', val: `${talents.length} formations`, icon: BookOpen },
                 { label: 'Vérification', val: 'Compte Certifié', icon: ShieldCheck },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">{item.label}</p>
                      <p className="text-slate-900 font-bold text-sm tracking-tight">{item.val}</p>
                    </div>
                 </div>
               ))}
            </motion.div>
          </div>

          {/* Right Column: Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-1 h-8 bg-primary rounded-full" />
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">À propos de l'instructeur</h3>
               </div>
               <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 border border-slate-100 p-8 rounded-[32px] italic">
                 "{trainer.bio || "Ce formateur n'a pas encore rédigé sa présentation. Cependant, son expertise et ses retours élèves témoignent de son excellence dans ses domaines de prédilection."}"
               </p>
            </motion.div>

            {/* Talents Grid */}
            <div className="space-y-8">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Liste des Talents <span className="text-slate-300 font-medium">({talents.length})</span>
                  </h3>
               </div>

               {talents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {talents.map((talent, i) => (
                    <motion.div
                      key={talent.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <TalentCard talent={talent} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">Aucun talent pour le moment</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
