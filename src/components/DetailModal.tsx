import { useState } from 'react';
import { X, ExternalLink, User, Building2, Calendar, Tag, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post } from '@/types';
import { trpc } from '@/providers/trpc';

interface DetailModalProps {
  post: Post | null;
  onClose: () => void;
}

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

export default function DetailModal({ post, onClose }: DetailModalProps) {
  const [reportType, setReportType] = useState<'stale' | 'duplicate' | 'suspicious' | 'wrong_metadata' | 'other'>('stale');
  const [reportSent, setReportSent] = useState(false);
  const trackEvent = trpc.posts.trackEvent.useMutation();
  const reportMutation = trpc.posts.report.useMutation({
    onSuccess: () => setReportSent(true),
  });

  if (!post) return null;

  const isPosition = post.type === 'position';
  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const reviewedAt = post.lastReviewedAt ?? post.approvedAt ?? post.createdAt;

  const trackAndOpenSource = (eventType: 'source_click' | 'contact_click') => {
    trackEvent.mutate({ postId: post.id, eventType });
    window.open(post.originalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[700px] max-h-[85vh] bg-white overflow-hidden flex flex-col"
            style={{ borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: '#DCDCDC' }}>
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-semibold text-[#333] leading-snug mb-2">{post.title}</h2>
                <div className="flex items-center gap-3 text-[13px] text-[#666] flex-wrap">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.authorName}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{post.authorAffiliation}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.createdAt).toISOString().slice(0, 10)}</span>
                </div>
              </div>
              <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-[#F0F0F0] rounded transition-colors">
                <X className="w-5 h-5 text-[#666]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Type badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 text-xs rounded font-medium" style={{ backgroundColor: '#781914', color: 'white' }}>
                  {isPosition ? post.positionType : post.domain}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs rounded font-medium"
                  style={sourceBadgeStyle(post.source)}>
                  {sourceLabel(post.source)}
                </span>
                {!isPosition && post.projectStatus && (
                  <span className="inline-flex items-center px-3 py-1 text-xs rounded font-medium" style={{ border: '1px solid #DCDCDC', color: '#555' }}>
                    {post.projectStatus}
                  </span>
                )}
              </div>

              {/* Institution details */}
              {isPosition && post.institution && (
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#F7F7F7' }}>
                  <div className="flex items-center gap-2 text-sm text-[#555]">
                    <Building2 className="w-4 h-4 text-[#666]" />
                    <span className="font-medium">{post.institution}</span>
                    {post.location && <><span className="text-[#999]">|</span><span>{post.location}</span></>}
                  </div>
                </div>
              )}

              {/* Original text */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#333] mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />Original Post
                </h3>
                <div className="text-sm text-[#333] leading-relaxed whitespace-pre-wrap">{post.originalText}</div>
              </div>

              <div className="mb-4 p-3 rounded-sm text-[12px] text-[#666]" style={{ backgroundColor: '#F7F7F7', border: '1px solid #E8E8E8' }}>
                <div>Moderation: {post.moderationStatus}</div>
                <div>Visibility: {post.visibilityStatus}</div>
                <div>Last reviewed: {new Date(reviewedAt).toISOString().slice(0, 10)}</div>
                {post.deadline && <div>Deadline: {post.deadline}</div>}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-1 text-xs rounded-full" style={{ border: '1px solid #DCDCDC', color: '#555' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t" style={{ borderColor: '#DCDCDC', backgroundColor: '#FAFAFA' }}>
              <div className="flex items-center justify-between gap-3">
              <a
                href={post.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent.mutate({ postId: post.id, eventType: 'source_click' })}
                className="text-sm flex items-center gap-1.5 hover:underline"
                style={{ color: '#2C5F6F' }}
              >
                <ExternalLink className="w-4 h-4" />View Original Post
              </a>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded border hover:bg-[#F0F0F0] transition-colors" style={{ borderColor: '#DCDCDC', color: '#555' }}>
                  Close
                </button>
                <button
                  onClick={() => trackAndOpenSource('contact_click')}
                  className="px-4 py-2 text-sm rounded text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#781914' }}
                >
                  {isPosition ? 'Open Application Source' : 'Open Contact Source'}
                </button>
              </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#666]">
                <div className="flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" />
                  <select
                    value={reportType}
                    onChange={(event) => setReportType(event.target.value as typeof reportType)}
                    className="h-7 rounded-sm border bg-white px-2"
                    style={{ borderColor: '#DCDCDC' }}
                  >
                    <option value="stale">Stale</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="wrong_metadata">Wrong metadata</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={() => reportMutation.mutate({ postId: post.id, type: reportType })}
                    disabled={reportMutation.isPending || reportSent}
                    className="h-7 px-2 rounded-sm border hover:bg-[#F0F0F0] disabled:opacity-50"
                    style={{ borderColor: '#DCDCDC' }}
                  >
                    {reportSent ? 'Reported' : 'Report'}
                  </button>
                </div>
                {reportMutation.isError && <span className="text-red-600">Report failed</span>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
