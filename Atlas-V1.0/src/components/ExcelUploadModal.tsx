import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import NotificationModal from './NotificationModal';

interface ExcelUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetName, setSheetName] = useState('Table_Membre');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

const handleUpload = async () => {
  if (!file) return;

  setLoading(true);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sheet_name', sheetName);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:8080/api/investment/upload-assets/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setNotification({ type: 'success', message: `${data.processed_count} lignes traitées avec succès` });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setNotification({ type: 'error', message: data.error || 'Erreur lors de l\'importation' });
    }
  } catch (error) {
    setNotification({ type: 'error', message: 'Erreur de connexion au serveur' });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Importer fichier Excel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Onglet à importer</label>
            <select
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Table_Membre">Table Membre</option>
              <option value="Portfolio">Portfolio</option>
              <option value="Transactions">Transactions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fichier Excel</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {file ? file.name : 'Cliquez pour sélectionner un fichier'}
                </p>
              </label>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center"
          >
            {loading ? (
              'Importation...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importer
              </>
            )}
          </button>
        </div>
      </div>

      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ExcelUploadModal;
