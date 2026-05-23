import dayjs from 'dayjs';

import { LocalDate } from '@/shared/api/primitives';

export function getLocalDateISO(date?: Date): LocalDate {
  const d = date ?? new Date();
  return LocalDate.parse(dayjs(d).format('YYYY-MM-DD'));
}

export function parseLocalDate(s: LocalDate): Date {
  return dayjs(s, 'YYYY-MM-DD').toDate();
}

export function addDays(d: LocalDate, n: number): LocalDate {
  return LocalDate.parse(dayjs(d).add(n, 'day').format('YYYY-MM-DD'));
}

export function formatHumanDate(d: LocalDate, locale: string): string {
  const date = dayjs(d);
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

  if (d === today) return locale === 'ru' ? 'Сегодня' : 'Today';
  if (d === yesterday) return locale === 'ru' ? 'Вчера' : 'Yesterday';
  if (d === tomorrow) return locale === 'ru' ? 'Завтра' : 'Tomorrow';

  return date.format('D MMM YYYY');
}
