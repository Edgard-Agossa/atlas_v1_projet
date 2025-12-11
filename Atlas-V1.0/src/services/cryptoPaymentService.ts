const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface PaymentRequest {
  amount: number;
  portfolio: 'PHRONESIS' | 'FLAGSHIP';
}

export interface PaymentResponse {
  success: boolean;
  payment_id: string;
  deposit_address: string;
  amount_usdt: string;
  network: string;
  qr_code: string;
  expires_in: string;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  tx_hash?: string;
  amount_received?: string;
  confirmed_at?: string;
  message?: string;
}

class CryptoPaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async initiateDeposit(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/investment/usdt/deposit/request/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'initialisation du paiement');
      }

      return data;
    } catch (error) {
      console.error('Deposit initiation failed:', error);
      throw error;
    }
  }

//Fonction pour aller vérifier le status du paiement pour la confirmation en retour 
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/investment/crypto/transaction/${paymentId}/`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      console.log('Status check:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification du statut');
      }

      return data;
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }

  validateTronAddress(address: string): boolean {
    const tronAddressRegex = /^T[A-Za-z1-9]{33}$/;
    return tronAddressRegex.test(address);
  }

  async getPaymentHistory(): Promise<{ success: boolean; payments: any[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/investment/usdt/history/`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération de l\'historique');
      }

      return data;
    } catch (error) {
      console.error('Payment history fetch failed:', error);
      return { success: false, payments: [] };
    }
  }

  formatUSDT(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  }
}

export const cryptoPaymentService = new CryptoPaymentService();