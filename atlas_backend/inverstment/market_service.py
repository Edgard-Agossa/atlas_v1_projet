"""
Service de prix en temps réel — sources gratuites sans clé API.
- Cryptos  : CoinGecko API v3
- Forex    : Frankfurter API (BCE)
- Actions  : Yahoo Finance (yfinance)
"""
import requests
from decimal import Decimal

# ─── Mapping symbole → CoinGecko ID ──────────────────────────────────────────

COINGECKO_IDS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'XLM': 'stellar',
    'ATOM': 'cosmos',
    'NEAR': 'near',
    'FTM': 'fantom',
    'SAND': 'the-sandbox',
    'MANA': 'decentraland',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'XMR': 'monero',
    'TRX': 'tron',
}

# ─── Mapping symbole → Yahoo Finance ticker ───────────────────────────────────

YAHOO_TICKERS = {
    # Matières premières
    'XAUUSD': 'GC=F',    # Or (Gold)
    'XAGUSD': 'SI=F',    # Argent (Silver)
    'XTIUSD': 'CL=F',    # Pétrole WTI
    'XBRUSD': 'BZ=F',    # Pétrole Brent
    'XPTUSD': 'PL=F',    # Platine
    'XPDUSD': 'PA=F',    # Palladium
    'GOLD': 'GC=F',
    'SILVER': 'SI=F',
    'OIL': 'CL=F',
    # Indices
    'SP500': '^GSPC',
    'NASDAQ': '^IXIC',
    'DOW': '^DJI',
    'CAC40': '^FCHI',
    'DAX': '^GDAXI',
    # ETFs
    'SPY': 'SPY',
    'QQQ': 'QQQ',
    'GLD': 'GLD',
    'SLV': 'SLV',
    # Actions
    'AAPL': 'AAPL',
    'MSFT': 'MSFT',
    'GOOGL': 'GOOGL',
    'AMZN': 'AMZN',
    'TSLA': 'TSLA',
    'META': 'META',
    'NVDA': 'NVDA',
}

# ─── Forex pairs ──────────────────────────────────────────────────────────────

FOREX_PAIRS = {
    'EUR/USD': ('EUR', 'USD'),
    'EUR/XOF': ('EUR', 'XOF'),
    'USD/XOF': ('USD', 'XOF'),
    'GBP/USD': ('GBP', 'USD'),
    'USD/JPY': ('USD', 'JPY'),
    'EUR/GBP': ('EUR', 'GBP'),
    'EURUSD': ('EUR', 'USD'),
    'EURXOF': ('EUR', 'XOF'),
    'USDXOF': ('USD', 'XOF'),
}


def get_crypto_prices(symbols: list[str]) -> dict:
    """Récupère les prix crypto depuis CoinGecko (gratuit, sans clé)."""
    ids_map = {s: COINGECKO_IDS.get(s.upper()) for s in symbols if COINGECKO_IDS.get(s.upper())}
    if not ids_map:
        return {}

    ids_str = ','.join(ids_map.values())
    try:
        resp = requests.get(
            'https://api.coingecko.com/api/v3/simple/price',
            params={'ids': ids_str, 'vs_currencies': 'usd', 'include_24hr_change': 'true'},
            timeout=8
        )
        if not resp.ok:
            return {}
        data = resp.json()
        result = {}
        for symbol, cg_id in ids_map.items():
            if cg_id in data:
                price_usd = data[cg_id].get('usd', 0)
                change_24h = data[cg_id].get('usd_24h_change', 0)
                result[symbol.upper()] = {
                    'price': round(price_usd, 4),   # Prix en USD
                    'currency': 'USD',
                    'variation': round(change_24h, 4) if change_24h else 0,
                    'source': 'coingecko',
                }
        return result
    except Exception:
        return {}


def get_forex_rates(pairs: list[str]) -> dict:
    """Récupère les taux Forex depuis Frankfurter (BCE, gratuit)."""
    result = {}
    try:
        resp = requests.get(
            'https://api.frankfurter.dev/v2/rates',
            params={'base': 'EUR', 'quotes': 'USD,XOF,GBP,JPY,CHF'},
            timeout=8
        )
        if not resp.ok:
            return {}
        data = resp.json()
        rates = {}
        if isinstance(data, list):
            for item in data:
                rates[item.get('quote')] = item.get('rate', 1)
        elif isinstance(data, dict):
            rates = data.get('rates', {})

        for pair in pairs:
            if pair.upper() in FOREX_PAIRS:
                base, quote = FOREX_PAIRS[pair.upper()]
                if base == 'EUR':
                    rate = rates.get(quote, 1)
                    result[pair.upper()] = {
                        'price': round(rate, 4),
                        'currency': f'{base}/{quote}',
                        'variation': 0,
                        'source': 'frankfurter',
                    }
    except Exception:
        pass
    return result


def get_stock_prices(symbols: list[str]) -> dict:
    """Récupère les prix actions/ETFs/matières premières depuis yfinance."""
    result = {}
    try:
        import yfinance as yf
        for symbol in symbols:
            ticker_sym = YAHOO_TICKERS.get(symbol.upper(), symbol)
            try:
                t = yf.Ticker(ticker_sym)
                info = t.fast_info
                price = getattr(info, 'last_price', None) or getattr(info, 'regularMarketPrice', None)
                prev = getattr(info, 'previous_close', None)
                currency = getattr(info, 'currency', 'USD')
                if price and prev and prev > 0:
                    variation = ((price - prev) / prev) * 100
                    result[symbol.upper()] = {
                        'price': round(price, 4),   # Prix dans la devise native
                        'currency': currency,
                        'variation': round(variation, 4),
                        'source': 'yfinance',
                    }
            except Exception:
                continue
    except ImportError:
        pass
    return result


def fetch_market_price(symbol: str) -> dict | None:
    """Récupère le prix d'un symbole depuis la meilleure source disponible."""
    sym = symbol.upper()

    # Crypto
    if sym in COINGECKO_IDS:
        data = get_crypto_prices([sym])
        return data.get(sym)

    # Forex
    if '/' in sym or sym in FOREX_PAIRS:
        data = get_forex_rates([sym])
        return data.get(sym)

    # Action/ETF/Indice
    data = get_stock_prices([sym])
    return data.get(sym)


def refresh_ticker_assets():
    """Met à jour tous les TickerAsset avec les prix du marché en temps réel."""
    from .models import TickerAsset

    assets = TickerAsset.objects.filter(is_active=True)
    if not assets.exists():
        return {'updated': 0}

    symbols = list(assets.values_list('symbol', flat=True))

    # Séparer par type
    crypto_syms = [s for s in symbols if s in COINGECKO_IDS]
    forex_syms  = [s for s in symbols if '/' in s or s in FOREX_PAIRS]
    stock_syms  = [s for s in symbols if s not in COINGECKO_IDS and '/' not in s and s not in FOREX_PAIRS]

    prices = {}
    if crypto_syms:
        prices.update(get_crypto_prices(crypto_syms))
    if forex_syms:
        prices.update(get_forex_rates(forex_syms))
    if stock_syms:
        prices.update(get_stock_prices(stock_syms))

    updated = 0
    for asset in assets:
        data = prices.get(asset.symbol.upper())
        if data:
            asset.current_price = Decimal(str(data['price']))
            asset.variation_pct = Decimal(str(data['variation']))
            if 'currency' in data:
                asset.currency = data['currency']
            asset.save(update_fields=['current_price', 'variation_pct', 'currency'])
            updated += 1

    return {'updated': updated, 'prices': {k: {'price': v['price'], 'currency': v.get('currency',''), 'variation': v['variation']} for k, v in prices.items()}}
