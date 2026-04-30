import { AlertTriangle, Check, ExternalLink, Flag, X } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';

export default function CrowdReviewPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const utils = trpc.useUtils();
  const queueQuery = trpc.crowdReview.list.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );
  const voteMutation = trpc.crowdReview.vote.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.crowdReview.list.invalidate(),
        utils.posts.list.invalidate(),
      ]);
    },
  });

  if (isLoading) {
    return <div className="pt-[110px] px-6 text-sm text-[#666]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-[110px] max-w-[760px] mx-auto px-6">
        <h1 className="text-xl font-semibold text-[#333] mb-2">Community Review</h1>
        <p className="text-sm text-[#666]">
          Please <Link to="/login" className="underline">login</Link> to review pending posts.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-[110px] min-h-screen bg-white">
      <div className="max-w-[980px] mx-auto px-6 pb-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#333] mb-1">Community Review</h1>
            <p className="text-sm text-[#666]">Help verify uncertain submissions before they become public.</p>
          </div>
          <span className="text-xs text-[#666]">{queueQuery.data?.length ?? 0} waiting</span>
        </div>

        {queueQuery.isLoading ? (
          <p className="text-sm text-[#666]">Loading review queue...</p>
        ) : queueQuery.data?.length === 0 ? (
          <p className="text-sm text-[#666]">No posts need community review right now.</p>
        ) : (
          <div className="space-y-3">
            {queueQuery.data?.map((post) => (
              <article key={post.id} className="border rounded-sm p-4" style={{ borderColor: '#DCDCDC' }}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#2C5F6F]">{post.title}</h2>
                    <div className="mt-1 text-xs text-[#666]">
                      {post.type} · {post.source} · {post.institution || post.authorAffiliation}
                    </div>
                  </div>
                  <a
                    href={post.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:underline"
                    style={{ color: '#2C5F6F' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Source
                  </a>
                </div>

                <p className="mt-3 text-sm text-[#444] leading-relaxed">{post.summary}</p>
                <p className="mt-2 text-xs text-[#666] line-clamp-2">{post.originalText}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => voteMutation.mutate({ postId: post.id, vote: 'approve' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-semibold text-white"
                    style={{ backgroundColor: '#2C5F6F' }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => voteMutation.mutate({ postId: post.id, vote: 'reject', reason: 'Not relevant to academic positions or collaborations' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border text-xs"
                    style={{ borderColor: '#DCDCDC', color: '#781914' }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => voteMutation.mutate({ postId: post.id, vote: 'duplicate', reason: 'Duplicate post' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border text-xs"
                    style={{ borderColor: '#DCDCDC', color: '#555' }}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => voteMutation.mutate({ postId: post.id, vote: 'stale', reason: 'Source appears stale or closed' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border text-xs"
                    style={{ borderColor: '#DCDCDC', color: '#555' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Stale
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
