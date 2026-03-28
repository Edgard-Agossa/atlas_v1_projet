import { tr } from "date-fns/locale";
import { PortfolioType } from "../types";

import API_BASE_URL from '../config/api';

//Interface pour les tyes de données
interface Account {
  id: number;
  account_number: string;
  balance: number;
  portfolio: string;
  portfolio_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  date_heure: string;
  portfolio: string;
  description: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  accounts?: T[];
  transactions?: T[];
  portfolios?: T[];
  copyadressdeposit?: T[];
}

export interface Prtfolios {
  id: number;
  name: string;
  type: string;
  cash: number;
  is_active: boolean;
  created_by: string;
  created_at: string;


}

export interface Copyadressdeposit {
  success: boolean;
  transactionId: string;
  amount: string;
  network: string;
  walletAddress: string;
  porfolio: string;

  expiresAt: string;  // Ajoutez ça
  status: 'PENDING';

}
//service API pour les compts
export class AccountService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
  // Récupérer les comptes d'un membre
  static async getMemberAccounts(memberId: number): Promise<ApiResponse<Account>> {
    const response = await fetch(`${API_BASE_URL}/investment/accounts/${memberId}/`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }
  //créer un nouveau compte pour un membre
  static async createMemberAccounts(memberId: number): Promise<ApiResponse<Account>> {
    const response = await fetch(`${API_BASE_URL}/investment/accounts/${memberId}/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),

    });
    return response.json();
  }
  //Effectuer un dépôt sur un compte
  static async depositToAccount(compteId: number, amount: number, description?: string) {
    const response = await fetch(`${API_BASE_URL}/investment/accounts/deposit/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        compte_id: compteId,
        amount,
        description
      })
    });
    return response.json();
  }
  //effectuer un retrait sur un compte 
  static async withdrawFromAccount(compteId: number, amount: number, description?: string) {
    const response = await fetch(`${API_BASE_URL}/investment/accounts/withdraw/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        compte_id: compteId,
        amount,
        description
      })
    });
    return response.json();
  }

  //Récupérer les transactions d'un compte

  static async getAccountTransactions(compteId: number, limit?: number): Promise<ApiResponse<Transaction>> {
    const url = `${API_BASE_URL}/investment/accounts/${compteId}/transactions/` +
      (limit ? `?limit=${limit}` : '');
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Récupérer toutes les transactions
  static async getAllTransactions(): Promise<ApiResponse<Transaction>> {
    const response = await fetch(`${API_BASE_URL}/investment/accounts/transactions/all/`, {

      headers: this.getAuthHeaders()
    });

    return response.json();
  }
  //Récupérer les portofilio
  static async getAllPortfolios(): Promise<Prtfolios[]> {
    const resp = await fetch(`${API_BASE_URL}/investment/portfolio/`, {
      headers: this.getAuthHeaders()
    });
    return resp.json()
  }

  //GÉNÉRATION DE LA TRANSACTION
  static async payWithUSDT(amount: number, choixPortfolio: string): Promise<Copyadressdeposit> {
    try {
      const response = await fetch(`${API_BASE_URL}/investment/crypto/payment/init/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount: amount, portfolio: choixPortfolio })
      });
      console.log('Envoi:', { amount: amount, Portfolio: choixPortfolio });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentData = await response.json();
      console.log('paiement', paymentData);
      return paymentData;
    } catch (error) {
      console.error('Erreur lors du paiement USDT:', error);
      throw error;
    }
  }



  //Récupérer la somme totale de chaque comptes a chaque utilisateur connecter
  static async getTotalBalancesOfAuth(memberId: number): Promise<ApiResponse<Account>> {
    //Validation des paramètres 
    if (!memberId || memberId <= 0) {
      throw new Error('ID de membre invalide');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'anthentification manquant. Veuillez vous reconnecter.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/investment/accounts/member/${memberId}/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000)// Délai d'attente de 10 secondes
      });
      //Gestion des erreurs HTTP
      if (!response.ok) {
        switch (response.status) {
          case 401:
            localStorage.removeItem('token');
            localStorage.removeItem('phronesis_user');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          case 403:
            throw new Error('Accès non autorisé à ces données.');
          case 404:
            throw new Error('Membre non trouvé.');
            case 500:
              throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
              default:
                throw new Error(`Erreur inattendue ${response.status}: ${response.statusText}`);
                
              }
            }
            
            const data = await response.json();
            console.log('data', data);
            //Validation de la réponse
      if (!data || typeof data !== 'object') {
        throw new Error('Réponse API invalide ou mal formée.');
      }

      //Vérification de la structure attendue 
      if(!data.success || !data.accounts) {
        throw new Error(data.message || 'Aunne donnée de compte disponible');

      }
      return data;

    } catch (error) {
     //Gestion des erreurs éseau 
     if (error instanceof TypeError &&  error.message.includes('fetch')) {
      throw new Error('Erreur de connection. Vérifiez votre connection internet ou reconnectez-vous.');
     }

      // Gestion du timeout
     if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Délai d\'attente de la requête dépassé. Veuillez réessayer.');
     }

     //Log pour debug( en développement seulement)
     if (process.env.NODE_ENV === 'development') {
      console.error('Erreur getTotalBalancesOfAuth:', error);
     }
     //Re-lancer l'erreur pour que le compsant puisse la gérer
     throw error;
    }




  }

}
























