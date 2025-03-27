const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-256-GCM';
  }

  generateKey() {
    const ivLength = this.algorithm === 'AES-256-CBC' ? 16 : 12;
    const key = crypto.lib.WordArray.random(32);
    const iv = crypto.lib.WordArray.random(ivLength);
    return { 
      key: key.toString(), 
      iv: iv.toString(),
      algorithm: this.algorithm
    };
  }

  createKeyHash(key) {
    return crypto.SHA256(key).toString();
  }

  encryptFileStream(readStream, key, iv) {
    const encryptor = crypto.algo.AES.createEncryptor(
      crypto.enc.Hex.parse(key),
      { 
        iv: crypto.enc.Hex.parse(iv),
        mode: this.algorithm === 'AES-256-CBC' ? crypto.mode.CBC : crypto.mode.GCM,
        padding: this.algorithm === 'AES-256-CBC' ? crypto.pad.Pkcs7 : crypto.pad.NoPadding
      }
    );

    return readStream.pipe(
      new Transform({
        transform(chunk, encoding, callback) {
          try {
            const encrypted = encryptor.process(crypto.enc.Hex.parse(chunk.toString('hex')));
            callback(null, Buffer.from(encrypted.toString(), 'hex'));
          } catch (err) {
            callback(err);
          }
        },
        final(callback) {
          try {
            const finalBuffer = encryptor.finalize();
            callback(null, Buffer.from(finalBuffer.toString(), 'hex'));
          } catch (err) {
            callback(err);
          }
        }
      })
    );
  }

  decryptFileStream(readStream, key, iv) {
    const decryptor = crypto.algo.AES.createDecryptor(
      crypto.enc.Hex.parse(key),
      { 
        iv: crypto.enc.Hex.parse(iv),
        mode: this.algorithm === 'AES-256-CBC' ? crypto.mode.CBC : crypto.mode.GCM,
        padding: this.algorithm === 'AES-256-CBC' ? crypto.pad.Pkcs7 : crypto.pad.NoPadding
      }
    );

    return readStream.pipe(
      new Transform({
        transform(chunk, encoding, callback) {
          try {
            const decrypted = decryptor.process(crypto.enc.Hex.parse(chunk.toString('hex')));
            callback(null, Buffer.from(decrypted.toString(), 'hex'));
          } catch (err) {
            callback(err);
          }
        },
        final(callback) {
          try {
            const finalBuffer = decryptor.finalize();
            callback(null, Buffer.from(finalBuffer.toString(), 'hex'));
          } catch (err) {
            callback(err);
          }
        }
      })
    );
  }
}

module.exports = new EncryptionService();