// Configuration API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
//service API pour les compts
export class AccountService {
    private static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token &&{'Authorization': `Bearer ${token}`})
        };
    }
    // Récupérer les comptes d'un membre
    static async getMemberAccounts(memberId: number): Promise<ApiResponse<Account>> {
        const response = await fetch(`${API_BASE_URL}/investment/accounts/${memberId}/`,{
            headers: this.getAuthHeaders()
        });
        return response.json();
    }
    //créer un nouveau compte pour un membre
    static async createMemberAccounts(memberId: number): Promise<ApiResponse<Account>> {
        const response = await fetch(`${API_BASE_URL}/investment/accounts/${memberId}/create/`,{
            method: 'POST',
            headers: this.getAuthHeaders(),

        });
        return response.json();
        }
        //Effectuer un dépôt sur un compte
        static async depositToAccount(compteId: number, amount: number, description?: string){
            const response = await fetch(`${API_BASE_URL}/investment/accounts/deposit/`,{
                method: 'POST',
                headers: this.getAuthHeaders(),
                body:JSON.stringify({
                    compte_id: compteId,
                    amount,
                    description
                })
            });
            return response.json();
        }
        //effectuer un retrait sur un compte 
        static async withdrawFromAccount(compteId: number, amount: number, description?: string){
            const response = await fetch(`${API_BASE_URL}/investment/accounts/withdraw/`,{
                method: 'POST',
                headers: this.getAuthHeaders(),
                body:JSON.stringify({
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



}
























