const request = require('supertest');
const app = require('../../src/app');

describe('API Routes - Functional Tests', () => {
    describe('GET /convert', () => {
        it('should convert EUR to USD successfully', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.body).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110
            });
        });

        it('should convert USD to GBP successfully', async () => {
            const response = await request(app)
                .get('/convert?from=USD&to=GBP&amount=100')
                .expect(200);

            expect(response.body).toEqual({
                from: 'USD',
                to: 'GBP',
                originalAmount: 100,
                convertedAmount: 80
            });
        });

        it('should handle case insensitive currencies', async () => {
            const response = await request(app)
                .get('/convert?from=eur&to=usd&amount=100')
                .expect(200);

            expect(response.body.from).toBe('EUR');
            expect(response.body.to).toBe('USD');
        });

        it('should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('amount');
        });

        it('should return 400 for negative amount', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=-100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('positive');
        });

        it('should return 400 for unsupported currency', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=JPY&amount=100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('not supported');
        });
    });

    describe('GET /tva', () => {
        it('should calculate TTC successfully', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=20')
                .expect(200);

            expect(response.body).toEqual({
                ht: 100,
                taux: 20,
                ttc: 120
            });
        });

        it('should handle decimal values', async () => {
            const response = await request(app)
                .get('/tva?ht=33.33&taux=19.6')
                .expect(200);

            expect(response.body.ht).toBe(33.33);
            expect(response.body.taux).toBe(19.6);
            expect(response.body.ttc).toBe(39.86);
        });

        it('should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/tva?ht=100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('taux');
        });

        it('should return 400 for negative ht', async () => {
            const response = await request(app)
                .get('/tva?ht=-100&taux=20')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('positive');
        });

        it('should return 400 for invalid tax rate', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=150')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('between 0 and 100');
        });
    });

    describe('GET /remise', () => {
        it('should apply discount successfully', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=10')
                .expect(200);

            expect(response.body).toEqual({
                prixInitial: 100,
                pourcentage: 10,
                prixFinal: 90
            });
        });

        it('should handle decimal values', async () => {
            const response = await request(app)
                .get('/remise?prix=33.33&pourcentage=15.5')
                .expect(200);

            expect(response.body.prixInitial).toBe(33.33);
            expect(response.body.pourcentage).toBe(15.5);
            expect(response.body.prixFinal).toBe(28.16);
        });

        it('should handle 100% discount', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=100')
                .expect(200);

            expect(response.body.prixFinal).toBe(0);
        });

        it('should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/remise?prix=100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('pourcentage');
        });

        it('should return 400 for negative price', async () => {
            const response = await request(app)
                .get('/remise?prix=-100&pourcentage=10')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('positive');
        });

        it('should return 400 for invalid discount percentage', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=150')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('between 0 and 100');
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /unknown-route', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/unknown-route')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Route not found');
        });
    });
});