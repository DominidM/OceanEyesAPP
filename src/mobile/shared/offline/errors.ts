export function isNetworkError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  const message = (error as { message?: string })?.message ?? '';
  return (
    code === 'unavailable' ||
    code === 'network-request-failed' ||
    code === 'resource-exhausted' ||
    /network|internet|fetch|offline|timeout|ECONNRESET|ENOTFOUND/i.test(message)
  );
}
