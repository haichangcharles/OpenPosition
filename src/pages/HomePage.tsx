import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { usePostsWithFallback } from '@/data/mockData';
import { NEWS_ITEMS } from '@/data/news';
import { getActiveRecruiters } from '@/lib/recruiters';

function getTimeAgo(date: Date) {
  const now = new Date('2026-04-28');
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

const ALL_INSTITUTIONS = [
  'A', 'Anthropic', 'Arizona State University', 'B', 'Brown University', 'UC Berkeley',
  'C', 'CMU MLD', 'Carnegie Mellon University', 'E', 'ETH Zurich', 'University of Edinburgh',
  'G', 'Google Research', 'M', 'MIT CSAIL', 'Mila', 'N', '南京大学LAMDA组',
  'S', 'Stanford University', '上海人工智能实验室', 'T', '清华大学', 'Tokyo University',
  'U', 'UCLA', 'Z', '浙江大学', '阿里巴巴达摩院',
];

export default function HomePage() {
  const [showNews, setShowNews] = useState(true);
  const { data: allPosts, isLoading } = usePostsWithFallback();

  const positions = allPosts.filter((p) => p.type === 'position').slice(0, 8);
  const collaborators = allPosts.filter((p) => p.type === 'collaborator').slice(0, 4);
  const recruiters = getActiveRecruiters(allPosts);

  return (
    <div className="pt-[76px] md:pt-[86px] min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">
        {showNews && (
          <div className="mb-6 rounded-sm border" style={{ borderColor: '#DCDCDC' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#DCDCDC' }}>
              <h2 className="text-lg font-semibold text-[#333]">News</h2>
              <button onClick={() => setShowNews(false)} className="p-0.5 hover:bg-[#F0F0F0] rounded">
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {NEWS_ITEMS.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <Link
                    to={`/about?news=${item.id}#news`}
                    className="text-sm font-semibold no-underline hover:underline"
                    style={{ color: '#2C5F6F' }}
                  >
                    {item.title}
                  </Link>
                  <span className="text-[12px] text-[#888] flex-shrink-0">{item.date}</span>
                </div>
              ))}
              <Link to="/about#news" className="inline-block text-[13px] no-underline hover:underline mt-1" style={{ color: '#2C5F6F' }}>
                View all OpenPosition news
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h2 className="text-xl font-semibold text-[#333] pb-2 mb-3" style={{ borderBottom: '1px solid #DCDCDC' }}>
              Active Recruiters
            </h2>
            <div className="space-y-0 break-words">
              {recruiters.map((recruiter) => (
                <Link key={recruiter.name} to={`/positions?q=${encodeURIComponent(recruiter.search)}`}
                  className="block py-2 text-[15px] no-underline hover:underline" style={{ color: '#2C5F6F' }}>
                  {recruiter.name}
                  {recruiter.count > 1 && (
                    <span className="ml-2 text-[12px] text-[#888]">({recruiter.count})</span>
                  )}
                </Link>
              ))}
            </div>
            <Link to="/positions" className="inline-block mt-3 text-[13px] no-underline hover:underline" style={{ color: '#2C5F6F' }}>
              Show all recruiters
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#333] pb-2 mb-3" style={{ borderBottom: '1px solid #DCDCDC' }}>
              Recently Posted
            </h2>
            {isLoading ? (
              <p className="text-[13px] text-[#888]">Loading...</p>
            ) : (
            <div className="space-y-4 break-words">
                {positions.map((pos) => (
                  <div key={pos.id}>
                    <Link to={`/positions?id=${pos.id}`}
                      className="block text-[15px] font-semibold no-underline hover:underline mb-1" style={{ color: '#2C5F6F' }}>
                      {pos.title}
                    </Link>
                    <div className="flex items-center gap-1 text-[12px] text-[#666]">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(pos.createdAt)}</span>
                      <span className="mx-1">·</span>
                      <span>{pos.institution}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/positions" className="inline-block mt-4 text-[13px] no-underline hover:underline" style={{ color: '#2C5F6F' }}>
              Show all positions
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-[#333] pb-2 mb-3" style={{ borderBottom: '1px solid #DCDCDC' }}>
            Looking for Collaborators
          </h2>
          {isLoading ? (
            <p className="text-[13px] text-[#888]">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {collaborators.map((col) => (
                <div key={col.id}>
                  <Link to={`/collaborators?id=${col.id}`}
                    className="block text-[15px] font-semibold no-underline hover:underline mb-1" style={{ color: '#2C5F6F' }}>
                    {col.title}
                  </Link>
                  <div className="flex items-center gap-1 text-[12px] text-[#666]">
                    <span>{col.authorAffiliation}</span>
                    <span className="mx-1">·</span>
                    <span>{getTimeAgo(col.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/collaborators" className="inline-block mt-3 text-[13px] no-underline hover:underline" style={{ color: '#2C5F6F' }}>
            Show all collaborator requests
          </Link>
        </div>

        <div className="mt-10 mb-2 md:mb-8">
          <h2 className="text-xl font-semibold text-[#333] pb-2 mb-3" style={{ borderBottom: '1px solid #DCDCDC' }}>
            All Institutions
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 leading-6">
            {ALL_INSTITUTIONS.map((item) => {
              if (item.length === 1) {
                return <span key={item} className="text-[13px] font-semibold text-[#555] px-1.5">{item}</span>;
              }
              return (
                <Link key={item} to={`/positions?search=${encodeURIComponent(item)}`}
                  className="text-[14px] md:text-[13px] no-underline hover:underline px-1.5 py-0.5" style={{ color: '#2C5F6F' }}>
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
