import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Wallet,
  QrCode,
  RefreshCw
} from 'lucide-react';
import {AccountService, Copyadressdeposit, Prtfolios} from '../contexts/DataUrl';
// import QRCode from 'qrcode'; // Temporarily disabled
import { cryptoPaymentService, PaymentResponse, PaymentStatusResponse } from '../services/cryptoPaymentService';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentData = PaymentResponse;
type PaymentStatus = PaymentStatusResponse;

const CryptoPaymentModal: React.FC<CryptoPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [step, setStep] = useState<'amount' | 'payment' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [portfolio, setPortfolio] = useState<Prtfolios[]>([]);
  //portfolio selectionné
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [paymentData, setPaymentData] = useState<Copyadressdeposit | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'PENDING', success: false });
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();
  
  //Pour le chargement des Portfolios 
  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        const data_portfolio = await AccountService.getAllPortfolios();
    setPortfolio(Array.isArray(data_portfolio) ? data_portfolio : [])

    console.log('portfolio', data_portfolio)

      }catch(error) {
        console.error('Erreur chargement portfolios:', error)
      }
    };
    if(isOpen){
      loadPortfolios();
    
    }
  }, [ isOpen]);
  // Timer countdown
  useEffect(() => {
    if (step === 'payment' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStep('amount');
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, timeLeft]);

  // Status polling
  useEffect(() => {
    if (step === 'payment' && paymentData) {
      intervalRef.current = setInterval(checkPaymentStatus, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step, paymentData]);

  // Generate QR Code
  useEffect(() => {
    if (paymentData) {

      generateQRCode();
    }
  }, [paymentData]);

  const generateQRCode = async () => {
    if (!paymentData) return;
    // Temporarily disabled QR code generation
    setQrCodeUrl('');
  };

  //Noifications toast Pro
  const [notifiction, setNotification] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  //la fonction showNotification 
  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({message, type});
    setTimeout(()=> setNotification(null), 5000);
  }

  const [isActive, setIsActive] = useState(false)
  const initializePayment = async () => {
    if (!amount || parseFloat(amount) < 10) {

      showNotification('Montant minimum: 10 USDT');
      return;
    }
    if (!selectedPortfolio){
      setIsActive(false)
      showNotification('Veuillez sélectionner un portefeuille');
      return;
    }

    console.log('selectedPortfolio', selectedPortfolio)
    //vérifier si le porfolio est sélectionné 
    setIsActive(true)
    setLoading(true);
    try {
      const data = await AccountService.payWithUSDT(parseFloat(amount), selectedPortfolio);

      if (data.transactionId ) {
        setPaymentData({
          success: true,
          transactionId: data.transactionId,
          amount: data.amount,
          network: data.network,
          walletAddress: data.walletAddress,
          expiresAt: data.expiresAt,
          status: data.status,
          porfolio: data.porfolio
        });
        setStep('payment');
        setTimeLeft(900);
      } else {
        console.error('❌ Réponse invalide:', data);
        // alert(data.message || 'Erreur lors de l\'initialisation');
      }
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      showNotification('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData) return;

    try {
      const data = await cryptoPaymentService.checkPaymentStatus(paymentData.transactionId);
      
      if (data.success) {
        setPaymentStatus(data);
        
        if (data.status === 'CONFIRMED') {
          setStep('success');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('amount');
    setAmount('');
    setPaymentData(null);
    setPaymentStatus({ success: true, status: 'PENDING' });
    setTimeLeft(900);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Dépôt USDT
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
{/* Notification Toast */}
      {notifiction && (
        <motion.div 
          initial={{opacity: 0, y: -50}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -50}}
          className={`absolute top-4 left-6 right-6 p-3 rounded-lg flex items-center space-x-2 text-sm ${
      notifiction?.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800': 'bg-green-50 border border-green-200 text-green-800'
    }`}>
    <AlertCircle className="w-4 h-4"/>
          <span className='font-medium'>{notifiction?.message}</span>
        </motion.div>)}

          {/* Content */}
          <div className="p-6">
            {step === 'amount' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant USDT
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Minimum 10 USDT"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: 10 USDT • Maximum: 10,000 USDT</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portefeuille
                  </label>
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => setSelectedPortfolio(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionner un portefeuille</option>
                    {portfolio.map((item) => (
                      <option key={item.id} value={item.type}> {item.type} </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={initializePayment}
                    disabled={loading || isActive }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Continuer
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && paymentData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Timer */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-lg font-mono font-bold text-yellow-800 dark:text-yellow-200">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <p className="text-center text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Temps restant pour effectuer le paiement
                  </p>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {paymentData.amount} USDT
                    </p>
                    <p className="text-sm text-gray-500">Réseau: TRC20 (Tron)</p>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="flex justify-center">
                    <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg shadow-sm w-48 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">QR Code</p>
                        <p className="text-xs text-gray-400">Scannez pour payer</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse de dépôt
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={paymentData.walletAddress}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(paymentData.walletAddress)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      {paymentStatus.status === 'PENDING' && (
                        <>
                          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                          <span className="text-blue-800 dark:text-blue-200">En attente de paiement...</span>
                        </>
                      )}
                      {paymentStatus.status === 'CONFIRMED' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 dark:text-green-200">Paiement confirmé!</span>
                        </>
                      )}
                    </div>
                    {paymentStatus.tx_hash && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
                        TX: {paymentStatus.tx_hash.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Paiement Confirmé!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Votre dépôt de {paymentData?.amount} USDT a été confirmé.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Redirection automatique dans 3 secondes...
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CryptoPaymentModal;