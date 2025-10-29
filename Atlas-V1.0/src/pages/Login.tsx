import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, Mail, Lock, AlertCircle, Wallet, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        return;
      }
      
      try {
        const success = await login(email, password);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setError('Email ou mot de passe incorrect');
        }
      } catch (err) {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } else {
      if (!email || !password || !confirmPassword || !firstName || !lastName) {
        setError('Veuillez remplir tous les champs');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      // Logique d'inscription ici
      setError('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setIsLogin(true);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="w-full max-w-6xl flex items-center justify-center relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Section 3D - Côté gauche */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
            {/* Portefeuille avec tendances */}
            <div className="relative">
              <div className="w-64 h-64 relative flex items-center justify-center">
                {/* Portefeuille principal */}
                <div className="relative">
                  <div className="w-32 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-2xl transform rotate-3 relative">
                    {/* Détails du portefeuille */}
                    <div className="absolute inset-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl">
                      <div className="flex items-center justify-center h-full">
                        <Wallet className="w-8 h-8 text-slate-300" />
                      </div>
                    </div>
                    {/* Fermeture du portefeuille */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-slate-800 rounded-full"></div>
                  </div>
                  
                  {/* Billets qui sortent */}
                  <div className="absolute -top-2 left-2 w-6 h-12 bg-green-500 rounded-sm transform -rotate-12 shadow-lg opacity-90">
                    <div className="w-full h-2 bg-green-600 mt-1"></div>
                    <div className="w-full h-1 bg-green-600 mt-1"></div>
                  </div>
                  <div className="absolute -top-1 left-4 w-6 h-12 bg-green-400 rounded-sm transform -rotate-6 shadow-lg opacity-80">
                    <div className="w-full h-2 bg-green-500 mt-1"></div>
                    <div className="w-full h-1 bg-green-500 mt-1"></div>
                  </div>
                </div>
                
                {/* Flèches de tendance animées */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-4">
                    {/* Flèche montante */}
                    <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '0s'}}>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                      <div className="text-xs font-bold text-green-600 mt-1">+15%</div>
                    </div>
                    
                    {/* Flèche descendante */}
                    <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '1s'}}>
                      <TrendingDown className="w-8 h-8 text-red-500" />
                      <div className="text-xs font-bold text-red-600 mt-1">-3%</div>
                    </div>
                    
                    {/* Flèche montante 2 */}
                    <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '2s'}}>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                      <div className="text-xs font-bold text-blue-600 mt-1">+8%</div>
                    </div>
                  </div>
                </div>
                
                {/* Indicateurs de performance flottants */}
                <div className="absolute -right-12 top-8">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse" style={{animationDelay: '0.5s'}}>
                    ROI +127%
                  </div>
                </div>
                
                <div className="absolute -left-16 top-16">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse" style={{animationDelay: '1.5s'}}>
                    €2.5M
                  </div>
                </div>
                
                <div className="absolute -right-8 bottom-8">
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse" style={{animationDelay: '2.5s'}}>
                    1,200+ clients
                  </div>
                </div>
                
                {/* Particules d'argent */}
                <div className="absolute top-4 -left-8 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-70" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-12 -right-6 w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-70" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-6 -left-4 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-70" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-12 -right-10 w-2 h-2 bg-indigo-400 rounded-full animate-bounce opacity-70" style={{animationDelay: '3s'}}></div>
              </div>
              


            </div>



            {/* Texte motivant */}
            <div className="text-center space-y-4 mt-16">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Phronesis Capital
              </h1>
              <p className="text-xl text-slate-600 font-medium">
                Investissement & Trading Intelligent
              </p>
              <div className="flex items-center justify-center space-x-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+127%</div>
                  <div className="text-sm text-slate-500">ROI Moyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">€2.5M</div>
                  <div className="text-sm text-slate-500">Géré</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">1,200+</div>
                  <div className="text-sm text-slate-500">Clients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de connexion - Côté droit */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40">
              {/* En-tête mobile */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Phronesis Capital</h1>
                <p className="text-slate-600">Connectez-vous à votre compte</p>
              </div>

              {/* Toggle Login/Register */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    isLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    !isLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  S'inscrire
                </button>
              </div>

              {error && (
                <div className={`mb-6 p-4 border rounded-xl flex items-center space-x-3 ${
                  error.includes('réussie') 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champs d'inscription */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prénom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                          placeholder="John"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                          placeholder="Doe"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                      placeholder="edgardagossa5@gmail.com"
                      required
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                      placeholder="123"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation mot de passe pour inscription */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                        placeholder="Confirmer le mot de passe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Options pour login seulement */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                {/* Bouton de connexion/inscription */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    isLogin ? 'Se connecter' : 'Créer un compte'
                  )}
                </button>
              </form>


            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                © 2024 Phronesis Capital. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Login;