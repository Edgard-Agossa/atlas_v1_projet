import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsEnhanced: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences' | 'data'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Club d\'Investissement NARC',
    email: 'contact@narc-club.fr',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Finance, 75001 Paris',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'fr',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    transactionAlerts: true,
    performanceAlerts: false,
    twoFactorAuth: false,
    sessionTimeout: '30',
    dataRetention: '7'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Simulate save action
    console.log('Saving settings:', formData);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Palette },
    { id: 'data', label: 'Données', icon: Database }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations du club
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du club
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Préférences de notification
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notifications par email
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir les notifications importantes par email
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('emailNotifications', !formData.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.emailNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notifications push
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir les notifications en temps réel
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('pushNotifications', !formData.pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.pushNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Rapports hebdomadaires
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir un résumé hebdomadaire des performances
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('weeklyReports', !formData.weeklyReports)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.weeklyReports ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Alertes de transaction
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Être notifié lors de nouvelles transactions
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('transactionAlerts', !formData.transactionAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.transactionAlerts ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.transactionAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sécurité du compte
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Changez votre mot de passe régulièrement pour maintenir la sécurité de votre compte.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className="input-field pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Authentification à deux facteurs
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ajouter une couche de sécurité supplémentaire
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('twoFactorAuth', !formData.twoFactorAuth)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Délai d'expiration de session (minutes)
                  </label>
                  <select
                    value={formData.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                    className="input-field"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="120">2 heures</option>
                    <option value="480">8 heures</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Préférences d'affichage
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Mode sombre
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Basculer entre le thème clair et sombre
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="input-field pl-10"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="input-field"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar US ($)</option>
                      <option value="GBP">Livre Sterling (£)</option>
                      <option value="CHF">Franc Suisse (CHF)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuseau horaire
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="input-field"
                    >
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Gestion des données
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rétention des données (années)
                  </label>
                  <select
                    value={formData.dataRetention}
                    onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                    className="input-field"
                  >
                    <option value="1">1 an</option>
                    <option value="3">3 ans</option>
                    <option value="5">5 ans</option>
                    <option value="7">7 ans</option>
                    <option value="10">10 ans</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="btn-secondary flex items-center justify-center p-4">
                    <Download className="w-5 h-5 mr-2" />
                    Exporter les données
                  </button>
                  <button className="btn-secondary flex items-center justify-center p-4">
                    <Upload className="w-5 h-5 mr-2" />
                    Importer les données
                  </button>
                  <button className="btn-secondary flex items-center justify-center p-4">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Synchroniser
                  </button>
                  <button className="btn-danger flex items-center justify-center p-4">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Supprimer les données
                  </button>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">
                        Zone de danger
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        La suppression des données est irréversible. Assurez-vous d'avoir une sauvegarde.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez vos préférences et paramètres du club
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="card p-6"
          >
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsEnhanced;