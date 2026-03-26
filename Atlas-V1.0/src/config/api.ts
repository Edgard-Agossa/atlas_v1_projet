// Point d'entrée unique pour l'URL de l'API backend.
// Pour changer l'URL, modifiez uniquement REACT_APP_API_URL dans le fichier .env
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default API_BASE_URL;
