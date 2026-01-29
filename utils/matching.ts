import { MatchType } from './types';

export function matchesUrl(currentUrl: string, pattern: string, type: MatchType): boolean {
  try {
    const url = new URL(currentUrl);
    
    switch (type) {
      case 'exact':
        return currentUrl === pattern;
      
      case 'prefix':
        return currentUrl.startsWith(pattern);
      
      case 'domain': {
        // pattern for domain is usually just the hostname or includes wildcards
        // For simplicity, if the pattern doesn't have a protocol, we compare hostnames
        if (!pattern.includes('://')) {
          return url.hostname.includes(pattern);
        }
        const patternUrl = new URL(pattern);
        return url.hostname === patternUrl.hostname;
      }
      
      default:
        return false;
    }
  } catch (e) {
    console.error('Invalid URL during matching:', e);
    return false;
  }
}
