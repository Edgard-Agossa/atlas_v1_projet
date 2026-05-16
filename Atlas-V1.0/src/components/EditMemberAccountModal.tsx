import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, User, DollarSign, TrendingUp, Calendar, Hash, Eye, EyeOff, Lock } from 'lucide-react';

interface MemberAccount {
  id: number;
  account_number: string;
  member_external_id: string;
  member_id: number;
  member_name: string;
  email: string;
  telephone: string;
  date_entree: string;
  balance: number;
  shares_count: number;
  gross_value: number;
  promesse_annuelle: number;
  frais_gestion: number;
  capital_net: number;
  parts_pct: number;
  profit_type: string;
  portfolio_type: string;
  portfolio_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditMemberAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: MemberAccount | null;
  onSuccess: () => void;
}

const EditMemberAccountModal: React.FC<EditMemberAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<MemberAccount>>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (account) {
      setFormData({
        member_external_id: account.member_external_id,
        balance: account.balance,
        shares_count: account.shares_count,
        gross_value: account.gross_value,
        promesse_annuelle: account.promesse_annuelle,
        frais_gestion: account.frais_gestion,
        capital_net: account.capital_net,
        parts_pct: account.parts_pct,
        profit_type: account.profit_type,
        date_entree: account.date_entree,
        is_active: account.is_active,
      });
    }
  }, [account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Vérifier que le mot de passe est saisi
    if (!adminPassword) {
      setError('Veuillez saisir votre mot de passe pour valider la modification');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/investment/admin/accounts/${account?.id}/update/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            admin_password: adminPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Compte mis à jour avec succès !');
        setTimeout(() => {
          onSuccess();
          onClose();
          setAdminPassword('');
        }, 1500);
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
        setAdminPassword('');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
      setAdminPassword('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl transform transition-all my-4 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Modifier le Compte Membre
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {account.member_name} • {account.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
                <Save className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">{success}</p>
              </div>
            )}

            {/* Informations du Compte */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Informations du Compte
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* ID Externe */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    ID Membre (PHR-XX / FLG-XX)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      name="member_external_id"
                      value={formData.member_external_id || ''}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="PHR-17"
                    />
                  </div>
                </div>

                {/* Date d'entrée */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Date d'Entrée
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="date"
                      name="date_entree"
                      value={formData.date_entree || ''}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="sm:col-span-2">
                  <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active || false}
                      onChange={handleChange}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Compte Actif
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Données Financières */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Données Financières
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Montant Versé */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Montant Versé (€)
                  </label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance || 0}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Nombre de Parts */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Nombre de Parts
                  </label>
                  <input
                    type="number"
                    name="shares_count"
                    value={formData.shares_count || 0}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Valeur Nette */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Valeur Nette (€)
                  </label>
                  <input
                    type="number"
                    name="gross_value"
                    value={formData.gross_value || 0}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Promesse Annuelle */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Promesse Annuelle (€)
                  </label>
                  <input
                    type="number"
                    name="promesse_annuelle"
                    value={formData.promesse_annuelle || 0}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Frais de Gestion */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Frais de Gestion (€)
                  </label>
                  <input
                    type="number"
                    name="frais_gestion"
                    value={formData.frais_gestion || 0}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Capital Net */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Capital Net (€)
                  </label>
                  <input
                    type="number"
                    name="capital_net"
                    value={formData.capital_net || 0}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Parts % */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Parts Détenues (%)
                  </label>
                  <input
                    type="number"
                    name="parts_pct"
                    value={formData.parts_pct || 0}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Type de Profit */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Type de Profit
                  </label>
                  <input
                    type="text"
                    name="profit_type"
                    value={formData.profit_type || ''}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="PHR_Prudent, FLG_Dynamique..."
                  />
                </div>
              </div>
            </div>

            {/* Informations en lecture seule */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Informations du Portfolio
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">N° Compte:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{account.account_number}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Portfolio:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{account.portfolio_name}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{account.portfolio_type}</p>
                </div>
              </div>
            </div>

            {/* Validation par Mot de Passe */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start mb-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-red-800 dark:text-red-300">
                  <p className="font-semibold mb-1">Validation Requise</p>
                  <p>Pour des raisons de sécurité, veuillez saisir votre mot de passe pour valider cette modification.</p>
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !adminPassword}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMemberAccountModal;
