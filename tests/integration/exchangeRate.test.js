const { convertCurrency } = require('../../src/services/conversionService');

// Mock d'une API externe pour les taux de change
class MockExchangeRateAPI {
    constructor() {
        this.rates = {
            'EUR-USD': 1.1,
            'USD-GBP': 0.8,
            'USD-EUR': 1 / 1.1,
            'GBP-USD': 1 / 0.8
        };
        this.callCount = 0;
        this.shouldFail = false;
    }

    async getExchangeRate(from, to) {
        this.callCount++;

        if (this.shouldFail) {
            throw new Error('API temporarily unavailable');
        }

        const key = `${from}-${to}`;
        const rate = this.rates[key];

        if (!rate) {
            throw new Error(`Exchange rate for ${from}-${to} not found`);
        }

        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 10));

        return {
            from,
            to,
            rate,
            timestamp: new Date().toISOString()
        };
    }

    setRate(from, to, rate) {
        this.rates[`${from}-${to}`] = rate;
    }

    simulateFailure(shouldFail = true) {
        this.shouldFail = shouldFail;
    }

    getCallCount() {
        return this.callCount;
    }

    reset() {
        this.callCount = 0;
        this.shouldFail = false;
    }
}

describe('Exchange Rate API Integration Tests', () => {
    let mockAPI;

    beforeEach(() => {
        mockAPI = new MockExchangeRateAPI();
    });

    afterEach(() => {
        mockAPI.reset();
    });

    describe('MockExchangeRateAPI', () => {
        it('should return exchange rate successfully', async () => {
            const result = await mockAPI.getExchangeRate('EUR', 'USD');

            expect(result).toEqual({
                from: 'EUR',
                to: 'USD',
                rate: 1.1,
                timestamp: expect.any(String)
            });
            expect(mockAPI.getCallCount()).toBe(1);
        });

        it('should handle unsupported currency pair', async () => {
            await expect(mockAPI.getExchangeRate('EUR', 'JPY'))
                .rejects.toThrow('Exchange rate for EUR-JPY not found');
        });

        it('should simulate API failure', async () => {
            mockAPI.simulateFailure(true);

            await expect(mockAPI.getExchangeRate('EUR', 'USD'))
                .rejects.toThrow('API temporarily unavailable');
        });

        it('should allow dynamic rate updates', async () => {
            mockAPI.setRate('EUR', 'JPY', 130);

            const result = await mockAPI.getExchangeRate('EUR', 'JPY');
            expect(result.rate).toBe(130);
        });

        it('should track API call count', async () => {
            await mockAPI.getExchangeRate('EUR', 'USD');
            await mockAPI.getExchangeRate('USD', 'GBP');

            expect(mockAPI.getCallCount()).toBe(2);
        });
    });

    describe('Integration with ConversionService', () => {
        it('should work with current fixed rates', () => {
            // Test que notre service fonctionne avec les taux fixes
            const result = convertCurrency('EUR', 'USD', 100);
            expect(result).toBe(110);
        });

        it('should handle multiple consecutive conversions', () => {
            const eurToUsd = convertCurrency('EUR', 'USD', 100);
            const usdToGbp = convertCurrency('USD', 'GBP', eurToUsd);

            expect(eurToUsd).toBe(110);
            expect(usdToGbp).toBe(88); // 110 * 0.8 = 88
        });

        it('should maintain precision across multiple operations', () => {
            const amount = 33.33;
            const converted = convertCurrency('EUR', 'USD', amount);
            const backConverted = convertCurrency('USD', 'EUR', converted);

            // Vérifier que la précision est maintenue (petite marge d'erreur acceptable)
            expect(Math.abs(backConverted - amount)).toBeLessThan(0.01);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle service errors gracefully', () => {
            expect(() => {
                convertCurrency('EUR', 'JPY', 100);
            }).toThrow('Conversion from EUR to JPY not supported');
        });

        it('should validate all inputs before processing', () => {
            expect(() => {
                convertCurrency(null, 'USD', 100);
            }).toThrow('Parameter "from" is required');
        });
    });

    describe('Performance Integration', () => {
        it('should handle multiple rapid conversions', () => {
            const startTime = Date.now();

            for (let i = 0; i < 100; i++) {
                convertCurrency('EUR', 'USD', 100 + i);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete 100 conversions in less than 100ms
            expect(duration).toBeLessThan(100);
        });

        it('should handle large amounts correctly', () => {
            const largeAmount = 999999.99;
            const result = convertCurrency('EUR', 'USD', largeAmount);

            expect(result).toBe(1099999.99);
            expect(typeof result).toBe('number');
            expect(result).not.toBeNaN();
        });
    });
});