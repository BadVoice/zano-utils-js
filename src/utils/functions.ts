export function timestampMsToDate(timestampMs: number): Date {
  return new Date(timestampMs * 1000);
}
