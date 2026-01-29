export type MatchType = 'domain' | 'exact' | 'prefix';

export interface Reminder {
  id: string;
  url: string;
  matchType: MatchType;
  note: string;
  createdAt: number;
}
