const EXCHANGE_RATES = {
    'EUR-USD': 1.1,
    'USD-EUR': 1 / 1.1,
    'USD-GBP': 0.8,
    'GBP-USD': 1 / 0.8,
    'EUR-GBP': 1.1 * 0.8, // EUR -> USD -> GBP
    'GBP-EUR': 1 / (1.1 * 0.8) // GBP -> USD -> EUR
};

/**
 * Valide les paramètres de conversion
 */
function validateConversionParams(from, to, amount) {
    const errors = [];

    if (!from) errors.push('Parameter "from" is required');
    if (!to) errors.push('Parameter "to" is required');
    if (amount === undefined || amount === null || amount === '') {
        errors.push('Parameter "amount" is required');
    }

    if (amount !== undefined && amount !== null && amount !== '') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            errors.push('Parameter "amount" must be a valid number');
        } else if (numAmount < 0) {
            errors.push('Parameter "amount" must be positive');
        }
    }

    return errors;
}

function convertCurrency(from, to, amount) {
    const errors = validateConversionParams(from, to, amount);
    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();
    const numAmount = parseFloat(amount);

    if (fromCurrency === toCurrency) {
        return numAmount;
    }

    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = EXCHANGE_RATES[rateKey];

    if (!rate) {
        throw new Error(`Conversion from ${fromCurrency} to ${toCurrency} not supported`);
    }

    return Math.round(numAmount * rate * 100) / 100; // Arrondi à 2 décimales
}

/**
 * Récupère les devises supportées
 */
function getSupportedCurrencies() {
    const currencies = new Set();
    Object.keys(EXCHANGE_RATES).forEach(key => {
        const [from, to] = key.split('-');
        currencies.add(from);
        currencies.add(to);
    });
    return Array.from(currencies);
}

module.exports = {
    convertCurrency,
    validateConversionParams,
    getSupportedCurrencies,
    EXCHANGE_RATES
};