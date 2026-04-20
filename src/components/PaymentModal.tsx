import React, { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  offer: { title: string; price: number; duration: string } | null;
  talent: { title: string; trainerName: string } | null;
  isProcessing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  offer,
  talent,
  isProcessing,
}) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Le nom est requis';
    }

    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      newErrors.cardNumber = 'Numéro de carte invalide (16 chiffres)';
    }

    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Format: MM/YY';
    }

    if (formData.cvc.length !== 3) {
      newErrors.cvc = 'CVC invalide (3 chiffres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formattedValue = value
      .slice(0, 16)
      .replace(/(\d{4})/g, '$1 ')
      .trim();
    setFormData({ ...formData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      const formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      setFormData({ ...formData, expiryDate: formattedValue });
    } else {
      setFormData({ ...formData, expiryDate: value });
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setFormData({ ...formData, cvc: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Simulate payment processing
    try {
      // Show success for 2 seconds before processing actual purchase
      setPaymentSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Process the actual purchase
      await onConfirm();
      
      // Reset form after successful purchase
      setFormData({ cardName: '', cardNumber: '', expiryDate: '', cvc: '' });
      setPaymentSuccess(false);
      onClose();
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-indigo-700 px-6 py-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Paiement Sécurisé</h2>
                  <p className="text-white/80 text-sm">Complétez votre inscription</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-white/10 rounded-xl p-3 text-white text-sm">
                <p className="font-medium">{talent?.title}</p>
                <p className="text-white/70 mt-1">{offer?.title}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20">
                  <span className="font-bold">Montant à payer</span>
                  <span className="text-lg font-black">{offer?.price} DHS</span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {!paymentSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Card Holder Name */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      placeholder="Prénom Nom"
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      disabled={isProcessing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 ${
                        errors.cardName
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      } focus:outline-none`}
                    />
                    {errors.cardName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cardName}
                      </p>
                    )}
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={isProcessing}
                      maxLength="19"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 font-mono text-lg tracking-widest ${
                        errors.cardNumber
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      } focus:outline-none`}
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-main mb-2">
                        Expiration
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        disabled={isProcessing}
                        maxLength="5"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 font-mono ${
                          errors.expiryDate
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        } focus:outline-none`}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-text-main mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="XXX"
                        value={formData.cvc}
                        onChange={handleCvcChange}
                        disabled={isProcessing}
                        maxLength="3"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 font-mono tracking-wider ${
                          errors.cvc
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        } focus:outline-none`}
                      />
                      {errors.cvc && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.cvc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">
                      <span className="font-bold">Paiement 100% sécurisé.</span> Vos données sont chiffrées et protégées.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-primary to-indigo-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <CreditCard className="w-4 h-4" />
                        </motion.div>
                        <span>Traitement...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Confirmer le paiement</span>
                      </>
                    )}
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-xl font-bold text-text-muted hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </form>
              ) : (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-text-main mb-2">Paiement Confirmé!</h3>
                  <p className="text-text-muted text-sm mb-4">
                    Bienvenue! Vous allez être redirigé vers votre apprentissage.
                  </p>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-success"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
