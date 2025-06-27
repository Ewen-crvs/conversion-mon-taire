# Microservice de Conversion et Calculs Financiers

🚀 **Microservice REST API** pour les conversions de devises et calculs financiers

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [CI/CD](#cicd)
- [Structure du projet](#structure-du-projet)

## ✨ Fonctionnalités

### Conversions de devises
- ✅ **EUR ↔ USD** (1 EUR = 1.1 USD)
- ✅ **USD ↔ GBP** (1 USD = 0.8 GBP)
- ✅ **EUR ↔ GBP** (conversion indirecte)

### Calculs financiers
- ✅ **Calcul TVA** : HT → TTC avec taux personnalisé
- ✅ **Application remise** : Prix initial → Prix après remise

## 🚀 Installation

### Prérequis
- Node.js 16+
- npm ou yarn

### Installation rapide
```bash
# Cloner le projet
git clone https://github.com/username/microservice-conversion.git
cd microservice-conversion

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 🎯 Utilisation

### Démarrage
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start

# Tests
npm test
npm run test:coverage
```

### Test rapide
```bash
curl "http://localhost:3000/health"
curl "http://localhost:3000/convert?from=EUR&to=USD&amount=100"
```

## 📖 API Documentation

### 🔄 Conversion de devises

**Endpoint :** `GET /convert`

**Paramètres :**
- `from` : Devise source (EUR, USD, GBP)
- `to` : Devise cible (EUR, USD, GBP)
- `amount` : Montant à convertir (> 0)

**Exemple :**
```bash
GET /convert?from=EUR&to=USD&amount=100
```

**Réponse :**
```json
{
  "from": "EUR",
  "to": "USD", 
  "originalAmount": 100,
  "convertedAmount": 110
}
```

### 🧮 Calcul TVA

**Endpoint :** `GET /tva`

**Paramètres :**
- `ht` : Montant hors taxes (≥ 0)
- `taux` : Taux de TVA en % (0-100)

**Exemple :**
```bash
GET /tva?ht=100&taux=20
```

**Réponse :**
```json
{
  "ht": 100,
  "taux": 20,
  "ttc": 120
}
```

### 💰 Application remise

**Endpoint :** `GET /remise`

**Paramètres :**
- `prix` : Prix initial (≥ 0)
- `pourcentage` : Remise en % (0-100)

**