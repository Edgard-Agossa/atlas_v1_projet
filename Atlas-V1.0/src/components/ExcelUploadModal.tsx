import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, RefreshCw, AlertCircle } from 'lucide-react';
import NotificationModal from './NotificationModal';
import API_BASE_URL from '../config/api';

interface ExcelUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ALLOWED_SHEETS = ['Table_Membre', 'Membres', 'Journal_Transactions', 'Flux_Capitaux'];

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [sheetsColumns, setSheetsColumns] = useState<Record<string, string[]>>({});
  const [sheetHandlers, setSheetHandlers] = useState<Record<string, string | null>>({});
  const [sheetName, setSheetName] = useState('');
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheetWarning, setSheetWarning] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setSheets([]);
    setSheetName('');
    setSheetWarning('');
    setLoadingSheets(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selected);

      const res = await fetch(`${API_BASE_URL}/investment/upload-assets/sheets/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.sheets?.length > 0) {
        setSheets(data.sheets);
        setSheetsColumns(data.sheets_columns || {});
        setSheetHandlers(data.sheet_handlers || {});
        const match = data.sheets.find((s: string) =>
          ALLOWED_SHEETS.includes(s) || data.sheet_handlers?.[s]
        );
        if (match) {
          setSheetName(match);
        } else {
          setSheetWarning(`Aucun onglet reconnu. Onglets disponibles : ${data.sheets.join(', ')}`);
          setSheetName(data.sheets[0]);
        }
      } else {
        setNotification({ type: 'error', message: data.error || 'Impossible de lire les onglets' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Erreur de connexion au serveur' });
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !sheetName) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheet_name', sheetName);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/investment/upload-assets/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: 'success',
          message: `${data.processed_count} ligne(s) traitée(s) depuis l'onglet "${data.sheet_used}"`,
        });
        setTimeout(() => { onSuccess(); onClose(); }, 1800);
      } else {
        // Le backend retourne les onglets disponibles si l'onglet n'existe pas
        const msg = data.available_sheets
          ? `${data.error}\n\nOnglets disponibles : ${data.available_sheets.join(', ')}`
          : data.error || "Erreur lors de l'importation";
        setNotification({ type: 'error', message: msg });
      }
    } catch {
      setNotification({ type: 'error', message: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const isSheetAllowed = ALLOWED_SHEETS.includes(sheetName);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Importer fichier Excel</h2>
              <p className="text-xs text-gray-400">Membres & investissements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Zone fichier */}
          <label htmlFor="file-upload" className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
            file
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-upload" />
            {loadingSheets ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-blue-600 font-medium">Lecture des onglets...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <FileSpreadsheet className="w-8 h-8 text-blue-500" />
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 truncate max-w-[280px]">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · cliquez pour changer</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliquez pour sélectionner</p>
                <p className="text-xs text-gray-400">.xlsx ou .xls</p>
              </div>
            )}
          </label>

          {/* Sélecteur d'onglet — affiché dès que le fichier est chargé */}
          {sheets.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Onglet à importer
                <span className="ml-2 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {sheets.length} onglet{sheets.length > 1 ? 's' : ''} dans le fichier
                </span>
              </label>
              <select
                value={sheetName}
                onChange={e => setSheetName(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-colors ${
                  isSheetAllowed
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700'
                }`}
              >
                {sheets.map(s => (
                  <option key={s} value={s}>
                    {s}{ALLOWED_SHEETS.includes(s) ? ' ✓' : ''}
                  </option>
                ))}
              </select>

              {/* Handler détecté */}
              {sheetHandlers[sheetName] && (
                <div className="mt-2 flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Migration : <span className="font-semibold">{
                      sheetHandlers[sheetName] === 'handle_membres' ? 'Membres → Comptes membres' :
                      sheetHandlers[sheetName] === 'handle_portfolio_snapshot' ? 'Portfolio → Récapitulatif (SnapshotRow)' :
                      sheetHandlers[sheetName] === 'handle_transactions' ? 'Transactions → Journal' :
                      sheetHandlers[sheetName] === 'handle_flux_capitaux' ? 'Flux → Transactions dépôts/retraits' :
                      sheetHandlers[sheetName]
                    }</span>
                  </p>
                </div>
              )}
              {/* Avertissement si onglet non reconnu */}
              {!sheetHandlers[sheetName] && sheetName && (
                <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Aucun handler pour cet onglet. L'import peut échouer.
                  </p>
                </div>
              )}
              {sheetsColumns[sheetName]?.length > 0 && (
                <div className="mt-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Colonnes détectées dans "{sheetName}"
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sheetsColumns[sheetName].map((col, i) => {
                      const isKnown = ['Email', 'ID membre', 'Nom & prénom', 'Montant versé', 'Nbre de part', 'Valeur Brute', 'Statut Portfolio', 'Password'].includes(col);
                      return (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isKnown
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {col}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1" />
                    Vert = colonne reconnue par l'import
                  </p>
                </div>
              )}
              {/* Avertissement si onglet non reconnu */}
              {!isSheetAllowed && sheetName && (
                <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Cet onglet n'est pas dans la liste reconnue ({ALLOWED_SHEETS.join(', ')}). L'import peut échouer.
                  </p>
                </div>
              )}

              {/* Avertissement global si aucun onglet reconnu */}
              {sheetWarning && (
                <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">{sheetWarning}</p>
                </div>
              )}
            </div>
          )}

          {/* Bouton importer */}
          <button
            onClick={handleUpload}
            disabled={!file || !sheetName || loading || loadingSheets}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors"
          >
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Importation...</>
              : <><Upload className="w-4 h-4" />Importer</>
            }
          </button>
        </div>
      </div>

      {notification && (
        <NotificationModal type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  );
};

export default ExcelUploadModal;
