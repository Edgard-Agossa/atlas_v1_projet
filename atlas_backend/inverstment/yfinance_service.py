import yfinance as yf
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class YFinanceService:
    @staticmethod
    def get_current_price(symbol: str) -> Optional[float]:
        """
        Récupère le prix actuel d'un actif via yfinance
        """
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1d')
            if not data.empty:
                return float(data['Close'].iloc[-1])
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du prix pour {symbol}: {str(e)}")
            return None

    @staticmethod
    def get_multiple_prices(symbols: list) -> Dict[str, float]:
        """
        Récupère les prix actuels pour plusieurs symboles
        """
        prices = {}
        for symbol in symbols:
            price = YFinanceService.get_current_price(symbol)
            if price is not None:
                prices[symbol] = price
        return prices

    @staticmethod
    def get_asset_info(symbol: str) -> Optional[Dict]:
        """
        Récupère les informations détaillées d'un actif
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                'name': info.get('longName', ''),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', ''),
                'market_cap': info.get('marketCap', 0),
                'currency': info.get('currency', 'USD'),
            }
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des infos pour {symbol}: {str(e)}")
            return None
