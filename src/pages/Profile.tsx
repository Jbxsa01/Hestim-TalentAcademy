import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2, Save, X, Upload, Loader2, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    photoURL: user?.photoURL || '',
    bannerURL: profile?.bannerURL || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, photoURL: dataUrl }));
        console.log('✅ Photo convertie en Data URL');
        setIsUploading(false);
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert('Erreur lecture image.');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, bannerURL: dataUrl }));
        console.log('✅ Bannière convertie en Data URL');
        setUploadingBanner(false);
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert('Erreur lecture bannière.');
      setUploadingBanner(false);
    } finally {
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Profil mis à jour');
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error('❌ Erreur mise à jour:', err);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-3xl font-black text-gray-900">Mon Profil</h1>
          <div className="w-10" />
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] shadow-2xl overflow-hidden"
        >
          {/* Cover Background */}
          <div 
            className={`h-32 bg-gradient-to-r from-primary to-primary/70 transition-all ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={formData.bannerURL ? { backgroundImage: `url(${formData.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            onClick={() => isEditing && bannerInputRef.current?.click()}
          >
            {isEditing && (
              <div className="w-full h-full flex items-center justify-center gap-2 bg-black/20">
                <Upload className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-sm">Cliquez pour changer la bannière</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Profile Content */}
          <div className="px-10 pb-12">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-[28px] border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  {formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt={formData.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary/20">
                      {formData.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-black text-gray-900 mb-2">{formData.displayName}</h2>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{formData.email}</p>
                <p className="text-sm text-gray-500 mt-2">Membre depuis {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
              </div>
            </div>

            {!isEditing ? (
              <>
                {/* View Mode */}
                <div className="space-y-6 mb-8">
                  {formData.bio && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Bio</label>
                      <p className="text-gray-700">{formData.bio}</p>
                    </div>
                  )}
                  {formData.phone && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Téléphone</label>
                      <p className="text-gray-700">{formData.phone}</p>
                    </div>
                  )}
                  {formData.location && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Localisation</label>
                      <p className="text-gray-700">{formData.location}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                    Modifier le Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Nom Complet</label>
                    <input
                      required
                      value={formData.displayName}
                      onChange={e => setFormData({...formData, displayName: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="Parlez un peu de vous..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none min-h-[120px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Localisation</label>
                    <input
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="Ex: Casablanca, Maroc"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Save className="w-5 h-5" />
                      Enregistrer
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-black text-primary mb-2">0</div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Talents</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-black text-green-500 mb-2">0 DHS</div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenus</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-black text-purple-500 mb-2">4.8</div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Note</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
