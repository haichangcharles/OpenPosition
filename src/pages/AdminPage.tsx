import { useState } from 'react';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [rejectReason, setRejectReason] = useState('Not relevant or missing source context');
  const utils = trpc.useUtils();

  const postsQuery = trpc.admin.posts.list.useQuery(
    { moderationStatus: 'pending' },
    { enabled: user?.role === 'admin' }
  );
  const reportsQuery = trpc.admin.reports.list.useQuery(
    { status: 'open' },
    { enabled: user?.role === 'admin' }
  );

  const refreshAdminData = async () => {
    await Promise.all([
      utils.admin.posts.list.invalidate(),
      utils.admin.reports.list.invalidate(),
      utils.posts.list.invalidate(),
    ]);
  };

  const approveMutation = trpc.admin.posts.approve.useMutation({ onSuccess: refreshAdminData });
  const rejectMutation = trpc.admin.posts.reject.useMutation({ onSuccess: refreshAdminData });
  const expireMutation = trpc.admin.posts.expire.useMutation({ onSuccess: refreshAdminData });
  const resolveReportMutation = trpc.admin.reports.resolve.useMutation({ onSuccess: refreshAdminData });
  const dismissReportMutation = trpc.admin.reports.dismiss.useMutation({ onSuccess: refreshAdminData });

  if (isLoading) {
    return <div className="pt-[110px] px-6 text-sm text-[#666]">Loading...</div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="pt-[110px] max-w-[760px] mx-auto px-6">
        <h1 className="text-xl font-semibold text-[#333] mb-2">Admin</h1>
        <p className="text-sm text-[#666]">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="pt-[110px] min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 pb-10">
        <h1 className="text-2xl font-semibold text-[#333] mb-1">Admin Review</h1>
        <p className="text-sm text-[#666] mb-6">Review pending posts and resolve community reports.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <section>
            <div className="flex items-center justify-between pb-2 mb-3" style={{ borderBottom: '1px solid #DCDCDC' }}>
              <h2 className="text-lg font-semibold text-[#333]">Pending Posts</h2>
              <span className="text-xs text-[#666]">{postsQuery.data?.length ?? 0} pending</span>
            </div>

            {postsQuery.isLoading ? (
              <p className="text-sm text-[#666]">Loading pending posts...</p>
            ) : postsQuery.data?.length === 0 ? (
              <p className="text-sm text-[#666]">No pending posts.</p>
            ) : (
              <div className="space-y-3">
                {postsQuery.data?.map((post) => (
                  <article key={post.id} className="border rounded-sm p-4" style={{ borderColor: '#DCDCDC' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#2C5F6F]">{post.title}</h3>
                        <div className="mt-1 text-xs text-[#666]">
                          {post.type} · {post.source} · {post.institution || post.authorAffiliation}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-[#666]">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(post.submittedAt).toISOString().slice(0, 10)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[#444] leading-relaxed">{post.summary}</p>
                    <a href={post.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs hover:underline" style={{ color: '#2C5F6F' }}>
                      {post.originalUrl}
                    </a>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => approveMutation.mutate({ id: post.id })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-semibold text-white"
                        style={{ backgroundColor: '#2C5F6F' }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => expireMutation.mutate({ id: post.id })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border text-xs"
                        style={{ borderColor: '#DCDCDC', color: '#555' }}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Expire
                      </button>
                      <input
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        className="h-8 flex-1 min-w-[220px] px-2 text-xs border rounded-sm"
                        style={{ borderColor: '#DCDCDC' }}
                      />
                      <button
                        onClick={() => rejectMutation.mutate({ id: post.id, reason: rejectReason })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border text-xs"
                        style={{ borderColor: '#DCDCDC', color: '#781914' }}
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside>
            <div className="flex items-center justify-between pb-2 mb-3" style={{ borderBottom: '1px solid #DCDCDC' }}>
              <h2 className="text-lg font-semibold text-[#333]">Open Reports</h2>
              <span className="text-xs text-[#666]">{reportsQuery.data?.length ?? 0} open</span>
            </div>

            {reportsQuery.isLoading ? (
              <p className="text-sm text-[#666]">Loading reports...</p>
            ) : reportsQuery.data?.length === 0 ? (
              <p className="text-sm text-[#666]">No open reports.</p>
            ) : (
              <div className="space-y-3">
                {reportsQuery.data?.map((report) => (
                  <article key={report.id} className="border rounded-sm p-3" style={{ borderColor: '#DCDCDC' }}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#333]">
                      <AlertTriangle className="w-4 h-4 text-[#781914]" />
                      {report.type}
                    </div>
                    <div className="mt-1 text-xs text-[#666]">Post #{report.postId} · {new Date(report.createdAt).toISOString().slice(0, 10)}</div>
                    {report.message && <p className="mt-2 text-sm text-[#555]">{report.message}</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => resolveReportMutation.mutate({ id: report.id, postId: report.postId })}
                        className="px-2 py-1 rounded-sm text-xs text-white"
                        style={{ backgroundColor: '#2C5F6F' }}
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => dismissReportMutation.mutate({ id: report.id, postId: report.postId })}
                        className="px-2 py-1 rounded-sm border text-xs"
                        style={{ borderColor: '#DCDCDC', color: '#555' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
