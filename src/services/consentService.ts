import { delay } from '../utils/delay';
import type { ConsentStatus } from '../types';

const MOCK_LATENCY_MS = 400;

export const consentService = {
  async acceptConsent(policyVersion: string): Promise<ConsentStatus> {
    await delay(MOCK_LATENCY_MS);
    return {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      policyVersion,
    };
  },
};
