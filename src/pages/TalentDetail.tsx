import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Star, Clock, CheckCircle2, MessageSquare, CreditCard, ArrowLeft, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TalentDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const talentDoc = await getDoc(doc(db, 'talents', id));
        if (talentDoc.exists()) {
          setTalent({ id: talentDoc.id, ...talentDoc.data() });
          const offersSnap = await getDocs(collection(db, 'talents', id, 'offers'));
          setOffers(offersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePurchase = async (offer: any) => {
    if (!user) return navigate('/login');
    setPurchasing(true);
    try {
      // Simulate Payment Flow
      const transactionData = {
        learnerId: user.uid,
        trainerId: talent.trainerId,
        offerId: offer.id,
        amount: 120,
        commission: 24,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      
      const transRef = await addDoc(collection(db, 'transactions'), transactionData);

      // Create Chat
      const chatData = {
        participants: [user.uid, talent.trainerId],
        offerId: offer.id,
        offerTitle: offer.title,
        talentTitle: talent.title,
        updatedAt: new Date().toISOString(),
        lastMessage: 'Chat unlocked! Send a message to get started.',
      };
      const chatRef = await addDoc(collection(db, 'chats'), chatData);

      navigate(`/messaging/${chatRef.id}`);
    } catch (err) {
      console.error(err);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-primary font-black animate-pulse uppercase tracking-[0.5em]">Initialisation du Portail...</div>;
  if (!talent) return <div className="text-center py-20 font-black uppercase tracking-widest opacity-20 italic">Talent introuvable.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Col: Info */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-10 shadow-2xl shadow-indigo-500/10 border border-border-subtle">
            <img
              src={talent.imageUrl}
              className="w-full h-full object-cover"
              alt={talent.title}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6">
               <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                {talent.category}
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-text-main mb-6 leading-[0.9] tracking-tighter italic">
            {talent.title}
          </h1>
          
          <div className="flex items-center space-x-12 mb-10 pb-8 border-b border-border-subtle">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em] mb-2 font-mono">Mentor HESTIM</span>
              <span className="text-xl font-black text-text-main italic">{talent.trainerName || 'Hestim Mentor'}</span>
            </div>
            <div className="flex flex-col border-l border-border-subtle pl-12">
              <span className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em] mb-2 font-mono">Note Académique</span>
              <div className="flex items-center space-x-2">
                 <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                 <span className="text-2xl font-black text-text-main tabular-nums">{talent.rating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-indigo max-w-none">
            <p className="text-text-muted text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {talent.description}
            </p>
          </div>
        </motion.div>

        {/* Right Col: Offers */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          <div className="bg-primary text-white p-10 rounded-[40px] shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-3">
                <LayoutGrid className="w-6 h-6 text-indigo-100" />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Offres Actives</h2>
              </div>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed">Inscrivez-vous pour débloquer l'accès direct au mentor et aux ressources HESTIM.</p>
            </div>
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full group-hover:scale-125 transition-all duration-700" />
          </div>

          <div className="grid gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-surface p-6 rounded-2xl border border-border-subtle hover:border-primary transition-all group relative shadow-sm hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-text-main group-hover:text-primary transition-colors tracking-tight">{offer.title}</h3>
                    <div className="flex items-center space-x-2 text-text-muted mt-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{offer.duration} session</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">120 <span className="text-xs font-bold text-text-muted">DHS</span></span>
                  </div>
                </div>
                
                <p className="text-text-muted text-sm mb-6 leading-relaxed font-medium">
                  {offer.description}
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3 text-sm font-bold text-text-main">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                    </div>
                    <span>Unlocked Chat access</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm font-bold text-text-main">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                    </div>
                    <span>Course Materials Bundle</span>
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(offer)}
                  disabled={purchasing}
                  className="w-full bg-gray-50 text-text-main py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-white transition-all flex items-center justify-center space-x-4 active:scale-95 disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{purchasing ? 'Inscription...' : 'Rejoindre la Session'}</span>
                </button>
              </div>
            ))}
            
            {offers.length === 0 && (
              <div className="bg-surface border border-dashed border-border-subtle p-12 text-center rounded-3xl">
                <p className="text-text-muted italic font-medium">No active sessions available for this talent.</p>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="pt-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-text-main tracking-tight italic">Academy Feedback</h3>
              <div className="h-0.5 flex-grow mx-6 bg-border-subtle" />
            </div>
            <div className="space-y-4">
               <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center font-black text-[10px] text-primary">AR</div>
                        <span className="font-black text-xs uppercase tracking-tight">Amine R.</span>
                     </div>
                     <div className="flex space-x-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></div>
                  </div>
                  <p className="text-text-muted text-sm font-medium leading-relaxed">Amazing session! The mentor was very patient and explained Python concepts perfectly. Recommending to everyone at Hestim.</p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TalentDetail;
