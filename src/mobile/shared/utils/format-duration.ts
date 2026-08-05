export function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(
    totalSeconds % 60,
  ).padStart(2, '0')}`;
}
