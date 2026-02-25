import { matchUrlPattern } from '../src/proxy/url-pattern-matcher';

describe('Export verification', () => {
    it('should export matchUrlPattern function', () => {
        expect(typeof matchUrlPattern).toBe('function');
        expect(matchUrlPattern.name).toBe('matchUrlPattern');
    });
});
