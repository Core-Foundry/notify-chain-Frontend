/**
 * ApiKeyRotationService: Manages seamless API key rotation without downtime.
 */
export interface ApiKeyMetadata {
  keyId: string;
  maskedKey: string;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'ROTATING' | 'REVOKED';
}

export class ApiKeyRotationService {
  private activeKeys: Map<string, ApiKeyMetadata> = new Map();

  public registerKey(keyId: string, maskedKey: string): ApiKeyMetadata {
    const meta: ApiKeyMetadata = {
      keyId,
      maskedKey,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      status: 'ACTIVE'
    };
    this.activeKeys.set(keyId, meta);
    return meta;
  }

  public initiateRotation(oldKeyId: string, newKeyId: string, newMaskedKey: string): void {
    const oldKey = this.activeKeys.get(oldKeyId);
    if (oldKey) oldKey.status = 'ROTATING';
    this.registerKey(newKeyId, newMaskedKey);
  }

  public completeRevocation(oldKeyId: string): void {
    const oldKey = this.activeKeys.get(oldKeyId);
    if (oldKey) oldKey.status = 'REVOKED';
  }
}
