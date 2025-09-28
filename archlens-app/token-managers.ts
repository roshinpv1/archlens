/**
 * Token Management for Enterprise and Apigee LLM Providers
 */

export class ApigeeTokenManager {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async getApigeeToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    // Get token from environment or fetch new one
    const token = process.env.APIGEE_TOKEN;
    if (!token) {
      throw new Error('APIGEE_TOKEN environment variable not set');
    }

    // Cache the token (assuming 1 hour expiry)
    this.token = token;
    this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return this.token;
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }
}

export class EnterpriseTokenManager {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async getValidToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    // Get token from environment or fetch new one
    const token = process.env.ENTERPRISE_LLM_TOKEN;
    if (!token) {
      throw new Error('ENTERPRISE_LLM_TOKEN environment variable not set');
    }

    // Cache the token (assuming 1 hour expiry)
    this.token = token;
    this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return this.token;
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }

  async refreshToken(): Promise<string> {
    // Clear cached token and get fresh one
    this.clearToken();
    return this.getValidToken();
  }
}
