import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PaymentProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  talentTitle: string;
  offerTitle: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

const MockPayment: React.FC<PaymentProps> = ({
  isOpen,
  onClose,
  amount,
  talentTitle,
  offerTitle,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('2026');
  const [cvc, setCVC] = useState('123');

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call mock payment endpoint
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'mad',
          metadata: {
            talentTitle,
            offerTitle,
            cardNumber: cardNumber.replace(/\s/g, ''),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      console.log('✅ Mock payment successful:', data);
      setSuccess(true);

      // Simulate payment processing delay
      setTimeout(() => {
        onPaymentSuccess(data.paymentIntentId);
      }, 1500);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border-subtle">
          <div>
            <h2 className="text-2xl font-black text-text-main italic">{offerTitle}</h2>
            <p className="text-sm text-text-muted font-medium mt-1">{talentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4 text-center py-8"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="bg-green-100 p-4 rounded-full"
                >
                  <Check className="w-12 h-12 text-green-600" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-green-600 mb-2">Paiement réussi!</h3>
                <p className="text-text-muted">Vous avez accès au contenu</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl">
                <p className="text-text-muted font-medium text-sm mb-2">Montant à payer</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-primary">{amount.toFixed(2)}</span>
                  <span className="text-lg font-bold text-text-muted">DHS</span>
                </div>
              </div>

              {/* Mock Warning */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 text-sm">Mode démonstration</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Ceci est un paiement simulé. Les données ne seront pas traitées par un vrai processeur de paiement.
                  </p>
                </div>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Numéro de carte</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                  />
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Exp (MM/AA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        placeholder="MM"
                        maxLength={2}
                        className="flex-1 px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-mono"
                      />
                      <span className="flex items-center text-text-muted">/</span>
                      <input
                        type="text"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        placeholder="AA"
                        maxLength={2}
                        className="flex-1 px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCVC(e.target.value)}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-border-subtle text-text-main rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">●</span>
                      Traitement...
                    </>
                  ) : (
                    'Payer maintenant'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border-subtle bg-slate-50">
          <p className="text-[10px] text-text-muted font-medium text-center">
            🧪 Paiement démonstration • Aucune donnée réelle collectée
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MockPayment;
