export const runEverySeconds = async (func: () => Promise<void>, seconds: number, runAtStart = true) => {
  // Run at start
  if (runAtStart)
    await func();

  setTimeout(() => {
    runEverySeconds(func, seconds, runAtStart);
  }, seconds * 1000);
}