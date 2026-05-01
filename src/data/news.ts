export interface NewsItem {
  id: number;
  title: string;
  date: string;
  content: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: 'VOA News: OpenPosition now aggregates posts from Xiaohongshu',
    date: 'Apr 15, 2026',
    content:
      'OpenPosition has expanded its data ingestion pipeline and now aggregates academic opportunities from Xiaohongshu in addition to LinkedIn and X.',
  },
  {
    id: 2,
    title: 'Survey: 78% of PhD applicants find positions through social media',
    date: 'Mar 22, 2026',
    content:
      'A recent community survey shows social platforms are now one of the primary channels for academic recruiting and early collaboration opportunities.',
  },
  {
    id: 3,
    title: 'A message from ML community leaders: join us on OpenPosition',
    date: 'Feb 10, 2026',
    content:
      'Community leaders encourage labs and individual researchers to publish open calls in a structured format to improve discoverability and fairness.',
  },
];
