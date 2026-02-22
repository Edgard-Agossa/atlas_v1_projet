import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface NotificationModalProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ type, message, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      textColor: 'text-green-800'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      textColor: 'text-red-800'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bgColor} border-2 ${borderColor} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Icon className={`w-8 h-8 ${iconColor} mr-3`} />
            <h3 className={`text-lg font-bold ${textColor}`}>
              {type === 'success' ? 'Succès' : type === 'error' ? 'Erreur' : 'Attention'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className={`${textColor} text-sm`}>{message}</p>
        <button
          onClick={onClose}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold ${
            type === 'success' ? 'bg-green-500 hover:bg-green-600' :
            type === 'error' ? 'bg-red-500 hover:bg-red-600' :
            'bg-yellow-500 hover:bg-yellow-600'
          } text-white transition-colors`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
