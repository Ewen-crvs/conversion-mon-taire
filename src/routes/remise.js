const express = require('express');
const { applyDiscount } = require('../services/financialService');

const router = express.Router();

/**
 * GET /remise?prix=100&pourcentage=10
 * Applique une remise sur un prix donné
 */
router.get('/', (req, res) => {
    try {
        const { prix, pourcentage } = req.query;

        const prixFinal = applyDiscount(prix, pourcentage);

        res.json({
            prixInitial: parseFloat(prix),
            pourcentage: parseFloat(pourcentage),
            prixFinal
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

module.exports = router;