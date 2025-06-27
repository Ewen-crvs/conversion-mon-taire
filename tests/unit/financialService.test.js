const {
    calculateTTC,
    validateTvaParams,
    applyDiscount,
    validateRemiseParams
} = require('../../src/services/financialService');

describe('FinancialService - Unit Tests', () => {
    describe('validateTvaParams', () => {
        it('should return no errors for valid params', () => {
            const errors = validateTvaParams('100', '20');
            expect(errors).toEqual([]);
        });

        it('should return error when ht is missing', () => {
            const errors = validateTvaParams(null, '20');
            expect(errors).toContain('Parameter "ht" is required');
        });

        it('should return error when taux is missing', () => {
            const errors = validateTvaParams('100', null);
            expect(errors).toContain('Parameter "taux" is required');
        });

        it('should return error when ht is not a number', () => {
            const errors = validateTvaParams('abc', '20');
            expect(errors).toContain('Parameter "ht" must be a valid number');
        });

        it('should return error when ht is negative', () => {
            const errors = validateTvaParams('-100', '20');
            expect(errors).toContain('Parameter "ht" must be positive');
        });

        it('should return error when taux is not a number', () => {
            const errors = validateTvaParams('100', 'abc');
            expect(errors).toContain('Parameter "taux" must be a valid number');
        });

        it('should return error when taux is negative', () => {
            const errors = validateTvaParams('100', '-5');
            expect(errors).toContain('Parameter "taux" must be between 0 and 100');
        });

        it('should return error when taux is over 100', () => {
            const errors = validateTvaParams('100', '150');
            expect(errors).toContain('Parameter "taux" must be between 0 and 100');
        });
    });

    describe('calculateTTC', () => {
        it('should calculate TTC correctly', () => {
            const result = calculateTTC(100, 20);
            expect(result).toBe(120);
        });

        it('should handle zero tax', () => {
            const result = calculateTTC(100, 0);
            expect(result).toBe(100);
        });

        it('should handle decimal values', () => {
            const result = calculateTTC(33.33, 19.6);
            expect(result).toBe(39.86);
        });

        it('should round to 2 decimal places', () => {
            const result = calculateTTC(33.33, 20);
            expect(result).toBe(40);
        });

        it('should throw error for invalid params', () => {
            expect(() => {
                calculateTTC(null, 20);
            }).toThrow('Parameter "ht" is required');
        });
    });

    describe('validateRemiseParams', () => {
        it('should return no errors for valid params', () => {
            const errors = validateRemiseParams('100', '10');
            expect(errors).toEqual([]);
        });

        it('should return error when prix is missing', () => {
            const errors = validateRemiseParams(null, '10');
            expect(errors).toContain('Parameter "prix" is required');
        });

        it('should return error when pourcentage is missing', () => {
            const errors = validateRemiseParams('100', null);
            expect(errors).toContain('Parameter "pourcentage" is required');
        });

        it('should return error when prix is not a number', () => {
            const errors = validateRemiseParams('abc', '10');
            expect(errors).toContain('Parameter "prix" must be a valid number');
        });

        it('should return error when prix is negative', () => {
            const errors = validateRemiseParams('-100', '10');
            expect(errors).toContain('Parameter "prix" must be positive');
        });

        it('should return error when pourcentage is not a number', () => {
            const errors = validateRemiseParams('100', 'abc');
            expect(errors).toContain('Parameter "pourcentage" must be a valid number');
        });

        it('should return error when pourcentage is negative', () => {
            const errors = validateRemiseParams('100', '-5');
            expect(errors).toContain('Parameter "pourcentage" must be between 0 and 100');
        });

        it('should return error when pourcentage is over 100', () => {
            const errors = validateRemiseParams('100', '150');
            expect(errors).toContain('Parameter "pourcentage" must be between 0 and 100');
        });
    });

    describe('applyDiscount', () => {
        it('should apply discount correctly', () => {
            const result = applyDiscount(100, 10);
            expect(result).toBe(90);
        });

        it('should handle zero discount', () => {
            const result = applyDiscount(100, 0);
            expect(result).toBe(100);
        });

        it('should handle 100% discount', () => {
            const result = applyDiscount(100, 100);
            expect(result).toBe(0);
        });

        it('should handle decimal values', () => {
            const result = applyDiscount(33.33, 15.5);
            expect(result).toBe(28.16);
        });

        it('should round to 2 decimal places', () => {
            const result = applyDiscount(33.33, 10);
            expect(result).toBe(30);
        });

        it('should throw error for invalid params', () => {
            expect(() => {
                applyDiscount(null, 10);
            }).toThrow('Parameter "prix" is required');
        });
    });
});