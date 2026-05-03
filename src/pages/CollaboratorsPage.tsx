import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostsWithFallback } from '@/data/mockData';
import { DATA_UNAVAILABLE_MESSAGE } from '@/data/posts-source';
import type { CollaboratorDomain, Post } from '@/types';
import DetailModal from '@/components/DetailModal';
import { trpc } from '@/providers/trpc';
import { clearSelectedPostId, getSelectedPostId, setSelectedPostId } from '@/lib/post-url-state';

const TABS: { label: string; value: CollaboratorDomain | 'all' }[] = [
  { label: 'All Requests', value: 'all' },
  { label: 'Long-term Research', value: 'Long-term Research' },
  { label: 'Short-term Project', value: 'Short-term Project' },
  { label: 'Co-author Needed', value: 'Co-author Needed' },
];

function sourceBadgeStyle(source: Post['source']) {
  if (source === 'LinkedIn') return { backgroundColor: '#E1F0FE', color: '#0077B5' };
  if (source === 'X') return { backgroundColor: '#F0F0F0', color: '#333' };
  if (source === 'RedBook') return { backgroundColor: '#FFF0F2', color: '#FF2442' };
  return { backgroundColor: '#EEF7F1', color: '#2F855A' };
}

function sourceLabel(source: Post['source']) {
  if (source === 'LinkedIn') return 'LinkedIn';
  if (source === 'X') return 'X';
  if (source === 'RedBook') return '小红书';
  return 'OpenPosition';
}

function getReplyCount(id: number): number {
  return (id % 15) + 1;
}

export default function CollaboratorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('type') as CollaboratorDomain | 'all') || 'all';
  const selectedPostId = getSelectedPostId(searchParams);

  const [activeTab, setActiveTab] = useState<CollaboratorDomain | 'all'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const trackEvent = trpc.posts.trackEvent.useMutation();

  const { data: allPosts, isLoading, isUnavailable } = usePostsWithFallback('collaborator', searchQuery);

  const selectedCol = useMemo(() => {
    if (selectedPostId) {
      return allPosts.find((p) => p.id === selectedPostId) || null;
    }
    return null;
  }, [selectedPostId, allPosts]);

  useEffect(() => {
    if (selectedPostId && !isLoading && !selectedCol) {
      setSearchParams(clearSelectedPostId(searchParams), { replace: true });
    }
  }, [isLoading, searchParams, selectedCol, selectedPostId, setSearchParams]);

  const filtered = useMemo(() => {
    let data = [...allPosts];
    if (activeTab !== 'all') {
      data = data.filter((c) => c.domain === activeTab);
    }
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts, activeTab]);

  const modalPost = selectedPost ?? selectedCol;

  const openPost = (post: Post) => {
    setSelectedPost(post);
    setSearchParams(setSelectedPostId(searchParams, post.id), { replace: true });
    trackEvent.mutate({ postId: post.id, eventType: 'detail_open' });
  };

  const closePost = () => {
    setSelectedPost(null);
    setSearchParams(clearSelectedPostId(searchParams), { replace: true });
  };

  return (
    <div className="pt-[86px] min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center gap-1 px-4 py-2 -mx-6 mb-4 text-[13px]" style={{ backgroundColor: '#E8E8E8' }}>
          <ArrowLeft className="w-3.5 h-3.5 text-[#666]" />
          <span className="text-[#666]">Back to </span>
          <Link to="/" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>Homepage</Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#333] mb-3">Open Collaborators</h1>

        <div className="mb-4 text-[14px] text-[#555] leading-relaxed">
          <p className="mb-2">Researchers often post collaboration requests on social media. OpenPosition collects these requests to help you find the right research partner.</p>
          <ul className="list-disc pl-5 space-y-1 text-[13px] text-[#666]">
            <li>Co-author requests for papers near completion.</li>
            <li>Short-term project collaborations on specific topics.</li>
            <li>Long-term research partnerships and visiting positions.</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 mb-4" style={{ backgroundColor: '#ECEAE6', border: '1px solid #DCDCDC' }}>
          <span className="text-[13px] text-[#555]">Add:</span>
          <Link to="/submit" className="inline-flex items-center px-3 py-1.5 text-[13px] font-semibold text-white rounded-sm no-underline" style={{ backgroundColor: '#4A5568' }}>
            Post a Collaboration Request
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within collaborators..."
            className="flex-1 max-w-[400px] h-8 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]"
            style={{ borderColor: '#DCDCDC' }}
          />
          <span className="text-[13px] text-[#666]">Showing {filtered.length} results</span>
        </div>

        <div className="flex items-center flex-wrap gap-0 mb-0" style={{ borderBottom: '1px solid #DCDCDC' }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-2 text-[13px] font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.value ? '#fff' : '#E8E8E8',
                color: activeTab === tab.value ? '#781914' : '#555',
                borderTop: activeTab === tab.value ? '2px solid #781914' : '2px solid transparent',
                borderLeft: '1px solid #DCDCDC',
                borderRight: '1px solid #DCDCDC',
                borderBottom: activeTab === tab.value ? '1px solid #fff' : '1px solid #DCDCDC',
                marginBottom: activeTab === tab.value ? '-1px' : '0',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isLoading ? (
                <div className="py-12 text-center">
                  <p className="text-[13px] text-[#888]">Loading collaborator requests...</p>
                </div>
              ) : isUnavailable ? (
                <div className="py-12 text-center max-w-[560px] mx-auto">
                  <p className="text-[14px] font-semibold text-[#555]">Opportunity data is waking up</p>
                  <p className="mt-2 text-[13px] text-[#777] leading-relaxed">{DATA_UNAVAILABLE_MESSAGE}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[13px] text-[#888]">No collaborator requests found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filtered.map((col) => (
                    <div key={col.id} className="py-3 px-1 group" style={{ borderBottom: '1px solid #E8E8E8' }}>
                      <div className="flex items-start gap-2 mb-1">
                        <button
                          onClick={() => openPost(col)}
                          className="text-left text-[15px] font-semibold no-underline hover:underline bg-transparent border-0 p-0 cursor-pointer"
                          style={{ color: '#2C5F6F' }}
                        >
                          {col.title}
                        </button>
                        <a href={col.originalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="w-3.5 h-3.5 text-[#888] hover:text-[#2C5F6F]" />
                        </a>
                      </div>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#666]">
                        <span className="font-medium text-[#555]">{col.authorAffiliation}</span>
                        <span>{col.authorName}</span>
                        <span>{new Date(col.createdAt).toISOString().slice(0, 10)}</span>
                        <span className="text-[#888]">{col.projectStatus}</span>
                        <span className="flex items-center gap-1 text-[#888]">
                          <MessageCircle className="w-3 h-3" />
                          {getReplyCount(col.id)} Replies
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded-sm font-medium"
                          style={sourceBadgeStyle(col.source)}
                        >
                          {sourceLabel(col.source)}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-sm font-medium" style={{ backgroundColor: '#F0F0F0', color: '#555' }}>
                          {col.domain}
                        </span>
                        {col.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).slice(0, 3).map((tag: string) => (
                          <span key={tag.trim()} className="text-[11px] text-[#777]">{tag.trim()}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DetailModal post={modalPost} onClose={closePost} />
    </div>
  );
}
