import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { cryptoPaymentService } from '../services/cryptoPaymentService';

interface PaymentHistoryItem {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: string;
  network: string;
  status: string;
  wallet_address: string;
  tx_hash?: string;
  created_at: string;
  confirmed_at?: string;
}

const CryptoPaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const data = await cryptoPaymentService.getPaymentHistory();
      
      if (data.success) {
        setPayments(data.payments);
      } else {
        setError('Erreur lors du chargement de l\'historique');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'FAILED':
        return 'Échoué';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  };

  const getTronScanLink = (txHash: string) => {
    return `https://tronscan.org/#/transaction/${txHash}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historique des Paiements Crypto
        </h3>
        <button
          onClick={fetchPaymentHistory}
          className="btn-secondary text-sm"
        >
          Actualiser
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun paiement crypto
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Vos transactions crypto apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    payment.type === 'DEPOSIT' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    {payment.type === 'DEPOSIT' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {payment.type === 'DEPOSIT' ? 'Dépôt' : 'Retrait'} USDT
                      </span>
                      <span className="text-sm text-gray-500">
                        ({payment.network})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {cryptoPaymentService.formatUSDT(payment.amount)} USDT
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    {getStatusIcon(payment.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {payment.tx_hash && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Transaction: {payment.tx_hash.substring(0, 20)}...
                    </span>
                    <a
                      href={getTronScanLink(payment.tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      <span className="mr-1">Voir sur TronScan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {payment.confirmed_at && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Confirmé le {new Date(payment.confirmed_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoPaymentHistory;