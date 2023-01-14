import { DualKeyDictionary } from '../../src/DualKeyDictionary.js';
import { equal } from 'assert';

describe('DualKeyDictionary', function() {
  it('Returns the same value for a key-pair regardless of their ordering',
      function() {
        const dkd = new DualKeyDictionary();
        dkd.set('alpha', 'beta', 123);
        const result1 = dkd.get('alpha', 'beta');
        const result2 = dkd.get('beta', 'alpha');
        equal(result1, result2);
      });
});
