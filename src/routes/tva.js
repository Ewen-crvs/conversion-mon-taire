const express = require('express');
const { calculateTTC } = require('../services/financialService');

const router = express.Router();

/**
 * GET /tva?ht=100&taux=20
 * Calcule le montant TTC à partir du HT et du taux de TVA
 */
router.get('/', (req, res) => {
    try {
        const { ht, taux } = req.query;

        const ttc = calculateTTC(ht, taux);

        res.json({
            ht: parseFloat(ht),
            taux: parseFloat(taux),
            ttc
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

module.exports = router;