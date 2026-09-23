import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';

export interface DataKeyProvider {
  getDataKey(keyId:string):Promise<Buffer>;
}

export interface EncryptedField {
  alg:'aes-256-gcm';
  keyId:string;
  iv:string;
  tag:string;
  ciphertext:string;
  version:1;
}

export class FieldEncryptionService {
  constructor(private readonly keys:DataKeyProvider){}
  async encrypt(keyId:string,plaintext:string,aad?:string):Promise<EncryptedField>{
    const key=await this.keys.getDataKey(keyId);
    if(key.length!==32)throw Object.assign(new Error('Field encryption key must be 256-bit'),{code:'INVALID_FIELD_ENCRYPTION_KEY'});
    const iv=randomBytes(12);
    const cipher=createCipheriv('aes-256-gcm',key,iv);
    if(aad)cipher.setAAD(Buffer.from(aad));
    const ciphertext=Buffer.concat([cipher.update(plaintext,'utf8'),cipher.final()]);
    return{alg:'aes-256-gcm',keyId,iv:iv.toString('base64url'),tag:cipher.getAuthTag().toString('base64url'),ciphertext:ciphertext.toString('base64url'),version:1};
  }
  async decrypt(value:EncryptedField,aad?:string):Promise<string>{
    const key=await this.keys.getDataKey(value.keyId);
    if(key.length!==32)throw Object.assign(new Error('Field encryption key must be 256-bit'),{code:'INVALID_FIELD_ENCRYPTION_KEY'});
    const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(value.iv,'base64url'));
    if(aad)decipher.setAAD(Buffer.from(aad));
    decipher.setAuthTag(Buffer.from(value.tag,'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(value.ciphertext,'base64url')),decipher.final()]).toString('utf8');
  }
}
