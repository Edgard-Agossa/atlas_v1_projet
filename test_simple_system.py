import requests
import json

# Test du système simplifié
def test_simple_holdings():
    # 1. Login
    login_response = requests.post(
        "http://localhost:8000/api/auth/login/",
        json={"email": "test@test.com", "password": "test123"}
    )
    
    if login_response.status_code != 200:
        print("❌ Échec de la connexion")
        return
    
    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Test création d'un holding
    holding_data = {
        "asset": "AAPL",
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "quantity": 10,
        "avg_price": 150.00,
        "current_price": 155.00,
        "portfolio": "PHRONESIS",
        "sector": "Technology",
        "asset_type": "stock"
    }
    
    print("📤 Création d'un holding...")
    create_response = requests.post(
        "http://localhost:8000/api/investment/holdings/",
        json=holding_data,
        headers=headers
    )
    
    print(f"Status: {create_response.status_code}")
    if create_response.status_code == 201:
        print("✅ Holding créé avec succès!")
        print(json.dumps(create_response.json(), indent=2))
    else:
        print("❌ Erreur lors de la création")
        print(create_response.text[:500])
    
    # 3. Test récupération des holdings
    print("\n📥 Récupération des holdings...")
    list_response = requests.get(
        "http://localhost:8000/api/investment/holdings/",
        headers=headers
    )
    
    print(f"Status: {list_response.status_code}")
    if list_response.status_code == 200:
        holdings = list_response.json()
        print(f"✅ {len(holdings)} holdings trouvés")
        for holding in holdings[-2:]:  # Afficher les 2 derniers
            print(f"- {holding['symbol']}: {holding['quantity']} @ {holding['current_price']}€")
    else:
        print("❌ Erreur lors de la récupération")

if __name__ == "__main__":
    test_simple_holdings()