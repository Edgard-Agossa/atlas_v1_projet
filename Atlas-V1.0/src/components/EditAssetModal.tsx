import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, TrendingUp, DollarSign, Hash, Lock, Eye, EyeOff } from 'lucide-react';

interface SnapshotRow {
  id: number;
  actif: string;
  poids: string;
  quantite: string;
  cours_achat: string;
  cours_cloture: string;
  dividende: string;
  rendement_brut: string;
  investissement: string;
  valorisation: string;
  rendement_annuel: string;
  variation_semaine: string;
}

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: SnapshotRow | null;
  snapshotId: number;
  onSuccess: () => void;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  snapshotId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<SnapshotRow>>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (asset) {
      setFormData({
        actif: asset.actif,
        poids: asset.poids,
        quantite: asset.quantite,
        cours_achat: asset.cours_achat,
        cours_cloture: asset.cours_cloture,
        dividende: asset.dividende,
        rendement_brut: asset.rendement_brut,
        investissement: asset.investissement,
        valorisation: asset.valorisation,
        rendement_annuel: asset.rendement_annuel,
        variation_semaine: asset.variation_semaine,
      });
    }
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminPassword) {
      setError('Veuillez saisir votre mot de passe pour valider la modification');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/investment/snapshots/${snapshotId}/rows/${asset?.id}/update/`,
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
        setSuccess('Actif mis à jour avec succès !');
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

  if (!isOpen || !asset) return null;

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
                Modifier l'Actif
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {asset.actif}
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

            {/* Informations de Base */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <Hash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Informations de Base
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Nom de l'actif */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Nom de l'Actif
                  </label>
                  <input
                    type="text"
                    name="actif"
                    value={formData.actif || ''}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: APPLE INC"
                  />
                </div>

                {/* Poids */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Poids (décimal)
                  </label>
                  <input
                    type="number"
                    name="poids"
                    value={formData.poids || ''}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 0.15"
                  />
                  <p className="text-xs text-gray-400 mt-1">Ex: 0.15 = 15%</p>
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    name="quantite"
                    value={formData.quantite || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Dividende */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Dividende
                  </label>
                  <input
                    type="number"
                    name="dividende"
                    value={formData.dividende || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Cours et Prix */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Cours et Prix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Cours d'achat */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Cours d'Achat
                  </label>
                  <input
                    type="number"
                    name="cours_achat"
                    value={formData.cours_achat || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Cours de clôture */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Cours de Clôture
                  </label>
                  <input
                    type="number"
                    name="cours_cloture"
                    value={formData.cours_cloture || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Investissement */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Investissement
                  </label>
                  <input
                    type="number"
                    name="investissement"
                    value={formData.investissement || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Valorisation */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Valorisation
                  </label>
                  <input
                    type="number"
                    name="valorisation"
                    value={formData.valorisation || ''}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Rendement brut */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Rendement Brut
                  </label>
                  <input
                    type="number"
                    name="rendement_brut"
                    value={formData.rendement_brut || ''}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Rendement annuel */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Rendement Annuel
                  </label>
                  <input
                    type="number"
                    name="rendement_annuel"
                    value={formData.rendement_annuel || ''}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Variation semaine */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Variation Semaine
                  </label>
                  <input
                    type="number"
                    name="variation_semaine"
                    value={formData.variation_semaine || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
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

export default EditAssetModal;
