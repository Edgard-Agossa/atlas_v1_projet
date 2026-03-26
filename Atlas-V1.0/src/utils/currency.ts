/**
 * Utilitaire de conversion de devises
 * Devise de base : FCFA (XOF)
 * Taux récupérés en temps réel via Frankfurter API (api.frankfurter.dev)
 * Source : Banque Centrale Européenne + institutions officielles
 * Aucune clé API requise, aucune limite d'utilisation
 */

export type Currency = 'XOF' | 'EUR' | 'USD';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XOF: 'FCFA',
  EUR: '€',
  USD: '$',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  XOF: 'Franc CFA (FCFA)',
  EUR: 'Euro (€)',
  USD: 'Dollar US ($)',
};

// Taux de fallback (utilisés uniquement si l'API est indisponible)
// 1 EUR = 655.957 XOF (parité fixe officielle zone CFA)
// 1 USD ≈ 600 XOF
const FALLBACK_RATES: Record<Currency, number> = {
  XOF: 1,
  EUR: 1 / 655.957,
  USD: 1 / 600,
};

/**
 * Récupère les taux de conversion depuis FCFA (XOF) vers EUR et USD
 * via l'API Frankfurter (données BCE + institutions officielles)
 * Retourne les taux sous forme { XOF: 1, EUR: x, USD: y }
 */
export const fetchRates = async (): Promise<Record<Currency, number>> => {
  try {
    // On demande les taux EUR→XOF et EUR→USD pour calculer XOF→EUR et XOF→USD
    const response = await fetch(
      'https://api.frankfurter.dev/v2/rates?base=XOF&quotes=EUR,USD'
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // data est un tableau : [{ base: 'XOF', quote: 'EUR', rate: x }, ...]
    const rates: Record<Currency, number> = { XOF: 1, EUR: 1, USD: 1 };

    if (Array.isArray(data)) {
      data.forEach((item: { base: string; quote: string; rate: number }) => {
        if (item.quote === 'EUR') rates.EUR = item.rate;
        if (item.quote === 'USD') rates.USD = item.rate;
      });
    }

    return rates;
  } catch (error) {
    console.warn('Frankfurter API indisponible, utilisation des taux de fallback:', error);
    return FALLBACK_RATES;
  }
};

/**
 * Convertit un montant depuis FCFA vers la devise cible
 */
export const convertFromFCFA = (
  amount: number,
  to: Currency,
  rates: Record<Currency, number>
): number => amount * rates[to];

/**
 * Formate un montant converti dans la devise donnée
 */
export const formatCurrency = (
  amount: number,
  currency: Currency,
  rates: Record<Currency, number>
): string => {
  const converted = convertFromFCFA(amount, currency, rates);

  if (currency === 'XOF') {
    return (
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted) + ' FCFA'
    );
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
};
