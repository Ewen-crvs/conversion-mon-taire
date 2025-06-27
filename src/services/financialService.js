/**
 * Valide les paramètres pour le calcul TVA
 */
function validateTvaParams(ht, taux) {
    const errors = [];

    if (ht === undefined || ht === null || ht === '') {
        errors.push('Parameter "ht" is required');
    }
    if (taux === undefined || taux === null || taux === '') {
        errors.push('Parameter "taux" is required');
    }

    if (ht !== undefined && ht !== null && ht !== '') {
        const numHt = parseFloat(ht);
        if (isNaN(numHt)) {
            errors.push('Parameter "ht" must be a valid number');
        } else if (numHt < 0) {
            errors.push('Parameter "ht" must be positive');
        }
    }

    if (taux !== undefined && taux !== null && taux !== '') {
        const numTaux = parseFloat(taux);
        if (isNaN(numTaux)) {
            errors.push('Parameter "taux" must be a valid number');
        } else if (numTaux < 0 || numTaux > 100) {
            errors.push('Parameter "taux" must be between 0 and 100');
        }
    }

    return errors;
}

/**
 * Calcule le montant TTC à partir du HT et du taux de TVA
 */
function calculateTTC(ht, taux) {
    const errors = validateTvaParams(ht, taux);
    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    const numHt = parseFloat(ht);
    const numTaux = parseFloat(taux);

    const ttc = numHt * (1 + numTaux / 100);
    return Math.round(ttc * 100) / 100; // Arrondi à 2 décimales
}

/**
 * Valide les paramètres pour le calcul de remise
 */
function validateRemiseParams(prix, pourcentage) {
    const errors = [];

    if (prix === undefined || prix === null || prix === '') {
        errors.push('Parameter "prix" is required');
    }
    if (pourcentage === undefined || pourcentage === null || pourcentage === '') {
        errors.push('Parameter "pourcentage" is required');
    }

    if (prix !== undefined && prix !== null && prix !== '') {
        const numPrix = parseFloat(prix);
        if (isNaN(numPrix)) {
            errors.push('Parameter "prix" must be a valid number');
        } else if (numPrix < 0) {
            errors.push('Parameter "prix" must be positive');
        }
    }

    if (pourcentage !== undefined && pourcentage !== null && pourcentage !== '') {
        const numPourcentage = parseFloat(pourcentage);
        if (isNaN(numPourcentage)) {
            errors.push('Parameter "pourcentage" must be a valid number');
        } else if (numPourcentage < 0 || numPourcentage > 100) {
            errors.push('Parameter "pourcentage" must be between 0 and 100');
        }
    }

    return errors;
}

/**
 * Applique une remise sur un prix
 */
function applyDiscount(prix, pourcentage) {
    const errors = validateRemiseParams(prix, pourcentage);
    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    const numPrix = parseFloat(prix);
    const numPourcentage = parseFloat(pourcentage);

    const prixFinal = numPrix * (1 - numPourcentage / 100);
    return Math.round(prixFinal * 100) / 100; // Arrondi à 2 décimales
}

module.exports = {
    calculateTTC,
    validateTvaParams,
    applyDiscount,
    validateRemiseParams
};