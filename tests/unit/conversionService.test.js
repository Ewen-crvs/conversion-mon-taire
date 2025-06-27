const {
    convertCurrency,
    validateConversionParams,
    getSupportedCurrencies
} = require('../../src/services/conversionService');

describe('ConversionService - Unit Tests', () => {
    describe('validateConversionParams', () => {
        it('should return no errors for valid params', () => {
            const errors = validateConversionParams('EUR', 'USD', '100');
            expect(errors).toEqual([]);
        });

        it('should return error when from is missing', () => {
            const errors = validateConversionParams(null, 'USD', '100');
            expect(errors).toContain('Parameter "from" is required');
        });

        it('should return error when to is missing', () => {
            const errors = validateConversionParams('EUR', null, '100');
            expect(errors).toContain('Parameter "to" is required');
        });

        it('should return error when amount is missing', () => {
            const errors = validateConversionParams('EUR', 'USD', null);
            expect(errors).toContain('Parameter "amount" is required');
        });

        it('should return error when amount is not a number', () => {
            const errors = validateConversionParams('EUR', 'USD', 'abc');
            expect(errors).toContain('Parameter "amount" must be a valid number');
        });

        it('should return error when amount is negative', () => {
            const errors = validateConversionParams('EUR', 'USD', '-100');
            expect(errors).toContain('Parameter "amount" must be positive');
        });

        it('should return multiple errors', () => {
            const errors = validateConversionParams(null, null, 'abc');
            expect(errors).toHaveLength(3);
        });
    });

    describe('convertCurrency', () => {
        it('should convert EUR to USD correctly', () => {
            const result = convertCurrency('EUR', 'USD', 100);
            expect(result).toBe(110);
        });

        it('should convert USD to GBP correctly', () => {
            const result = convertCurrency('USD', 'GBP', 100);
            expect(result).toBe(80);
        });

        it('should convert USD to EUR correctly', () => {
            const result = convertCurrency('USD', 'EUR', 110);
            expect(result).toBe(100);
        });

        it('should handle same currency conversion', () => {
            const result = convertCurrency('EUR', 'EUR', 100);
            expect(result).toBe(100);
        });

        it('should handle case insensitive currencies', () => {
            const result = convertCurrency('eur', 'usd', 100);
            expect(result).toBe(110);
        });

        it('should round to 2 decimal places', () => {
            const result = convertCurrency('EUR', 'USD', 33.33);
            expect(result).toBe(36.66);
        });

        it('should throw error for unsupported conversion', () => {
            expect(() => {
                convertCurrency('EUR', 'JPY', 100);
            }).toThrow('Conversion from EUR to JPY not supported');
        });

        it('should throw error for invalid params', () => {
            expect(() => {
                convertCurrency(null, 'USD', 100);
            }).toThrow('Parameter "from" is required');
        });

        it('should convert EUR to GBP (indirect)', () => {
            const result = convertCurrency('EUR', 'GBP', 100);
            expect(result).toBe(88); // 100 * 1.1 * 0.8 = 88
        });
    });

    describe('getSupportedCurrencies', () => {
        it('should return array of supported currencies', () => {
            const currencies = getSupportedCurrencies();
            expect(currencies).toContain('EUR');
            expect(currencies).toContain('USD');
            expect(currencies).toContain('GBP');
            expect(currencies.length).toBe(3);
        });
    });
});