export interface NewsItem {
  id: number;
  title: string;
  date: string;
  content: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: 'We are looking for people to help build OpenPosition',
    date: 'May 1, 2026',
    content:
      'OpenPosition is looking for collaborators who care about making research opportunities easier to discover. If you want to help with sourcing, moderation, product design, engineering, or community outreach, we would like to hear from you.',
  },
  {
    id: 2,
    title: 'We help researchers find internships, PhD roles, RA roles, and postdocs',
    date: 'May 1, 2026',
    content:
      'Many academic opportunities are scattered across lab pages, job boards, social posts, and personal announcements. OpenPosition brings them into one searchable place so students and researchers can find research internships, PhD openings, research assistant roles, postdocs, and collaboration calls faster.',
  },
];
