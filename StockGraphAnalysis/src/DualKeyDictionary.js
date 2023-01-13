/**
 * A dictionary that uses a pair of keys to look
 * up a value. The keys can be supplied in any order.
 */
export class DualKeyDictionary {
  constructor() {
    this._dict = new Map();
  }

  _keyBuilder(key1, key2) {
    const formattedKey1 = key1.trim().toUpperCase();
    const formattedKey2 = key2.trim().toUpperCase();

    if (formattedKey1 === formattedKey2) {
      throw new Error('Keys must be distinct.');
    }

    const first = formattedKey1 < formattedKey2 ? formattedKey1 : formattedKey2;
    const second = formattedKey1 === first ? formattedKey2 : formattedKey1;

    return `${first}-${second}`;
  }

  set(key1, key2, value) {
    const key = this._keyBuilder(key1, key2);
    this._dict.set(key, value);
  }

  get(key1, key2) {
    const key = this._keyBuilder(key1, key2);

    return this._dict.get(key);
  }

  has(key1, key2) {
    const key = this._keyBuilder(key1, key2);

    return this._dict.has(key);
  }
}
