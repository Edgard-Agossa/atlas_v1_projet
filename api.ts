// // utils/api.ts
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
//   const token = localStorage.getItem('token');
  
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//     ...options.headers,
//   };

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.error || `Erreur: ${response.status}`);
//   }
//   return response.json();
// };