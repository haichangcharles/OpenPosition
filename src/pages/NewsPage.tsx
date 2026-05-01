import { Link, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { NEWS_ITEMS } from '@/data/news';

export default function NewsPage() {
  const [searchParams] = useSearchParams();
  const idParam = Number(searchParams.get('id'));
  const selected = Number.isFinite(idParam) ? NEWS_ITEMS.find((item) => item.id === idParam) : null;

  return (
    <div className="pt-[86px] min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center gap-1 px-4 py-2 -mx-4 md:-mx-6 mb-6 text-[13px]" style={{ backgroundColor: '#E8E8E8' }}>
          <ArrowLeft className="w-3.5 h-3.5 text-[#666]" />
          <span className="text-[#666]">Back to </span>
          <Link to="/" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>
            Homepage
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#333] mb-6">OpenPosition News</h1>

        {selected ? (
          <article className="rounded-sm border p-4 md:p-5" style={{ borderColor: '#DCDCDC' }}>
            <h2 className="text-xl font-semibold text-[#333] mb-2">{selected.title}</h2>
            <p className="text-[13px] text-[#888] mb-4">{selected.date}</p>
            <p className="text-[14px] text-[#555] leading-relaxed">{selected.content}</p>
            <Link to="/news" className="inline-block mt-5 text-[13px] no-underline hover:underline" style={{ color: '#2C5F6F' }}>
              View all news
            </Link>
          </article>
        ) : (
          <div className="space-y-3">
            {NEWS_ITEMS.map((item) => (
              <div key={item.id} className="rounded-sm border p-4" style={{ borderColor: '#DCDCDC' }}>
                <Link to={`/news?id=${item.id}`} className="text-[16px] font-semibold no-underline hover:underline" style={{ color: '#2C5F6F' }}>
                  {item.title}
                </Link>
                <p className="text-[13px] text-[#888] mt-1">{item.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
