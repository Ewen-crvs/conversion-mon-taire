const express = require('express');
const { convertCurrency } = require('../services/conversionService');

const router = express.Router();

/**
 * GET /convert?from=EUR&to=USD&amount=100
 * Convertit un montant d'une devise à une autre
 */
router.get('/', (req, res) => {
    try {
        const { from, to, amount } = req.query;

        const convertedAmount = convertCurrency(from, to, amount);

        res.json({
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            originalAmount: parseFloat(amount),
            convertedAmount
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

module.exports = router;