import { expect, test, describe } from 'vitest';
import { toUi, toStore, round2 } from '../utils/gradient';

describe('Gradient utilities', () => {
    describe('toUi', () => {
        test('converts decay_length to gradient strength using inverse relationship', () => {
            expect(toUi(0.01)).toBe(100);
            expect(toUi(0.02)).toBe(50);
            expect(toUi(0.1)).toBe(10);
            expect(toUi(1)).toBe(1);
            expect(toUi(10)).toBe(0.1);
            expect(toUi(100)).toBe(0.01);
        });

        test('rounds to 2 decimal places for display', () => {
            expect(toUi(0.03)).toBe(33.33);
            expect(toUi(0.07)).toBe(14.29);
            expect(toUi(0.15)).toBe(6.67);
        });

        test('handles edge cases', () => {
            expect(toUi(0)).toBe(100);
            expect(toUi(-5)).toBe(100);
        });
    });

    describe('toStore', () => {
        test('converts gradient strength to decay_length using inverse relationship', () => {
            expect(toStore(100)).toBe(0.01);
            expect(toStore(50)).toBe(0.02);
            expect(toStore(10)).toBe(0.1);
            expect(toStore(1)).toBe(1);
        });

        test('maintains precision across full range', () => {
            expect(toStore(60)).toBe(0.0167);
            expect(toStore(75)).toBe(0.0133);
            expect(toStore(80)).toBe(0.0125);
            expect(toStore(90)).toBe(0.0111);
            expect(toStore(99)).toBe(0.0101);
        });

        test('produces distinct values for different inputs', () => {
            const values = [50, 51, 60, 75, 90, 100];
            const storeValues = values.map(toStore);
            const uniqueValues = new Set(storeValues);
            expect(uniqueValues.size).toBe(values.length);
        });

        test('handles edge cases', () => {
            expect(toStore(0)).toBe(100);
            expect(toStore(-5)).toBe(100);
        });
    });

    describe('round2', () => {
        test('rounds numbers to 2 decimal places', () => {
            expect(round2(1.234)).toBe(1.23);
            expect(round2(5.678)).toBe(5.68);
            expect(round2(9.999)).toBe(10);
        });

        test('handles integers', () => {
            expect(round2(5)).toBe(5);
            expect(round2(100)).toBe(100);
        });

        test('handles small values', () => {
            expect(round2(0.001)).toBe(0);
            expect(round2(0.005)).toBe(0.01);
            expect(round2(0.999)).toBe(1);
        });
    });

    describe('Conversion', () => {
        test('UI -> Store -> UI maintains value', () => {
            const uiValues = [0.01, 1, 10, 25, 50, 60, 100];
            
            uiValues.forEach(uiVal => {
                const storeVal = toStore(uiVal);
                const backToUi = toUi(storeVal);
                expect(backToUi).toBeCloseTo(uiVal, 1);
            });
        });

        test('Store -> UI -> Store maintains value', () => {
            const storeValues = [0.01, 0.02, 0.05, 0.1, 0.5, 1, 10, 50, 60, 100];
            
            storeValues.forEach(storeVal => {
                const uiVal = toUi(storeVal);
                const backToStore = toStore(uiVal);
                expect(backToStore).toBeCloseTo(storeVal, 4);
            });
        });
    });

    });

