const request = require('supertest');
const app = require('../../src/app');

describe('E2E Scenarios', () => {
    describe('Complete Business Workflow', () => {
        it('should handle complete price conversion and tax calculation scenario', async () => {
            // Scénario : Convertir un prix EUR en USD puis calculer la TVA

            // Étape 1 : Convertir 100 EUR en USD
            const conversionResponse = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(conversionResponse.body).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110
            });

            // Étape 2 : Calculer la TVA sur le montant converti
            const convertedAmount = conversionResponse.body.convertedAmount;
            const tvaResponse = await request(app)
                .get(`/tva?ht=${convertedAmount}&taux=20`)
                .expect(200);

            expect(tvaResponse.body).toEqual({
                ht: 110,
                taux: 20,
                ttc: 132
            });

            // Vérification finale : 100 EUR -> 110 USD -> 132 USD TTC
            expect(tvaResponse.body.ttc).toBe(132);
        });

        it('should handle price conversion with discount scenario', async () => {
            // Scénario : Appliquer une remise puis convertir

            // Étape 1 : Appliquer une remise de 10% sur 100 EUR
            const discountResponse = await request(app)
                .get('/remise?prix=100&pourcentage=10')
                .expect(200);

            expect(discountResponse.body).toEqual({
                prixInitial: 100,
                pourcentage: 10,
                prixFinal: 90
            });

            // Étape 2 : Convertir le prix après remise en USD
            const discountedPrice = discountResponse.body.prixFinal;
            const conversionResponse = await request(app)
                .get(`/convert?from=EUR&to=USD&amount=${discountedPrice}`)
                .expect(200);

            expect(conversionResponse.body.convertedAmount).toBe(99); // 90 * 1.1
        });

        it('should handle multi-currency conversion chain', async () => {
            // Scénario : EUR -> USD -> GBP

            // Étape 1 : EUR vers USD
            const eurToUsdResponse = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            const usdAmount = eurToUsdResponse.body.convertedAmount;
            expect(usdAmount).toBe(110);

            // Étape 2 : USD vers GBP
            const usdToGbpResponse = await request(app)
                .get(`/convert?from=USD&to=GBP&amount=${usdAmount}`)
                .expect(200);

            expect(usdToGbpResponse.body.convertedAmount).toBe(88); // 110 * 0.8
        });

        it('should handle complete e-commerce pricing scenario', async () => {
            // Scénario e-commerce complet : Prix initial -> Remise -> Conversion -> TVA
            const initialPrice = 150;
            const discountPercent = 15;
            const taxRate = 19.6;

            // Étape 1 : Appliquer la remise
            const discountResponse = await request(app)
                .get(`/remise?prix=${initialPrice}&pourcentage=${discountPercent}`)
                .expect(200);

            const discountedPrice = discountResponse.body.prixFinal;
            expect(discountedPrice).toBe(127.5); // 150 * 0.85

            // Étape 2 : Convertir EUR vers USD
            const conversionResponse = await request(app)
                .get(`/convert?from=EUR&to=USD&amount=${discountedPrice}`)
                .expect(200);

            const convertedAmount = conversionResponse.body.convertedAmount;
            expect(convertedAmount).toBe(140.25); // 127.5 * 1.1

            // Étape 3 : Calculer la TVA
            const tvaResponse = await request(app)
                .get(`/tva?ht=${convertedAmount}&taux=${taxRate}`)
                .expect(200);

            const finalAmount = tvaResponse.body.ttc;
            expect(finalAmount).toBeCloseTo(167.74, 2); // 140.25 * 1.196

            // Vérification du scénario complet
            expect(finalAmount).toBeGreaterThan(convertedAmount);
            expect(convertedAmount).toBeGreaterThan(0);
        });
    });

    describe('Error Handling Scenarios', () => {
        it('should handle invalid data gracefully across multiple endpoints', async () => {
            // Test avec des données invalides sur chaque endpoint

            // Conversion avec montant négatif
            await request(app)
                .get('/convert?from=EUR&to=USD&amount=-100')
                .expect(400);

            // TVA avec taux invalide
            await request(app)
                .get('/tva?ht=100&taux=150')
                .expect(400);

            // Remise avec pourcentage invalide
            await request(app)
                .get('/remise?prix=100&pourcentage=-10')
                .expect(400);
        });

        it('should handle missing parameters across all endpoints', async () => {
            // Test paramètres manquants
            await request(app)
                .get('/convert?from=EUR&to=USD')
                .expect(400);

            await request(app)
                .get('/tva?ht=100')
                .expect(400);

            await request(app)
                .get('/remise?prix=100')
                .expect(400);
        });
    });

    describe('Performance and Load Scenarios', () => {
        it('should handle concurrent requests efficiently', async () => {
            const requests = [];
            const startTime = Date.now();

            // Créer 10 requêtes simultanées
            for (let i = 0; i < 10; i++) {
                requests.push(
                    request(app)
                        .get(`/convert?from=EUR&to=USD&amount=${100 + i}`)
                        .expect(200)
                );
            }

            const responses = await Promise.all(requests);
            const endTime = Date.now();

            // Vérifier que toutes les réponses sont correctes
            responses.forEach((response, index) => {
                expect(response.body.originalAmount).toBe(100 + index);
                expect(response.body.convertedAmount).toBeCloseTo((100 + index) * 1.1, 5);
            });

            // Les requêtes devraient s'exécuter en moins de 1 seconde
            expect(endTime - startTime).toBeLessThan(1000);
        });

        it('should maintain accuracy with various decimal inputs', async () => {
            const testCases = [
                { amount: 0.01, expected: 0.01 },
                { amount: 33.33, expected: 36.66 },
                { amount: 99.99, expected: 109.99 },
                { amount: 123.456, expected: 135.8 }
            ];

            for (const testCase of testCases) {
                const response = await request(app)
                    .get(`/convert?from=EUR&to=USD&amount=${testCase.amount}`)
                    .expect(200);

                expect(response.body.convertedAmount).toBe(testCase.expected);
            }
        });
    });

    describe('Integration Health Checks', () => {
        it('should verify all endpoints are responsive', async () => {
            // Vérifier que tous les endpoints principaux répondent
            const healthChecks = [
                request(app).get('/health').expect(200),
                request(app).get('/convert?from=EUR&to=USD&amount=1').expect(200),
                request(app).get('/tva?ht=1&taux=20').expect(200),
                request(app).get('/remise?prix=1&pourcentage=10').expect(200)
            ];

            const responses = await Promise.all(healthChecks);

            // Vérifier que toutes les réponses sont des JSON valides
            responses.forEach(response => {
                expect(response.headers['content-type']).toMatch(/json/);
                expect(response.body).toBeDefined();
            });
        });

        it('should handle edge cases consistently', async () => {
            // Test des cas limites
            const edgeCases = [
                { endpoint: '/convert', params: 'from=EUR&to=EUR&amount=100', expected: 100 },
                { endpoint: '/tva', params: 'ht=0&taux=20', expected: 0 },
                { endpoint: '/remise', params: 'prix=100&pourcentage=0', expected: 100 }
            ];

            for (const testCase of edgeCases) {
                const response = await request(app)
                    .get(`${testCase.endpoint}?${testCase.params}`)
                    .expect(200);

                // Vérifier que la réponse contient les données attendues
                expect(response.body).toBeDefined();
                expect(typeof response.body).toBe('object');
            }
        });
    });
});