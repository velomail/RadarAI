/** When true, the pipeline uses in-house fixtures instead of RapidAPI / OpenAI. */
export function isMockEngine(): boolean {
  return process.env.ENGINE_MODE === 'mock';
}

export function mockEngineLabel(): string {
  return '[mock engine]';
}
