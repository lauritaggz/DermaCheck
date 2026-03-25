import { buildMockAnalysisResult } from '../mock';
import { delay } from '../utils/delay';
import type { ImageAsset, SkinAnalysisResult } from '../types';

const MOCK_PROCESS_MS = 2200;

export const analysisService = {
  /**
   * Sprint 1: simula pipeline de IA; Sprint 2+ sustituir por API + modelo.
   */
  async analyzeImage(params: {
    image: ImageAsset;
    userId: string;
  }): Promise<SkinAnalysisResult> {
    await delay(MOCK_PROCESS_MS);
    return buildMockAnalysisResult({
      userId: params.userId,
      imageUri: params.image.uri,
    });
  },
};
