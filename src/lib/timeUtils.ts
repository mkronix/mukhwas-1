export function parse24HourTime(value: string): { hours12: number; minutes: number; period: 'AM' | 'PM' } {
  const [hours24, minutes] = value.split(':').map(Number);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return { hours12, minutes, period };
}

export function formatTimeToAmPm(value: string): string {
  const { hours12, minutes, period } = parse24HourTime(value);
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function convertTo24Hour(hours12: number, minutes: number, period: 'AM' | 'PM'): string {
  let h = hours12;
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
