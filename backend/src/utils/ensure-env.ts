export const ensureEnv = <T>(envKey: string): T => {
  if (!process.env[envKey])
    throw new Error(`Please define ${envKey} in .env`);

  return process.env[envKey] as T;
}