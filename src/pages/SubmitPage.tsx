import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import type { CollaboratorDomain, PositionType, Source } from '@/types';

const POST_TYPES = [
  { value: 'position', label: 'PhD Position', subType: 'PhD Student' },
  { value: 'position', label: 'Research Internship', subType: 'Research Intern' },
  { value: 'position', label: 'PostDoc Position', subType: 'PostDoc' },
  { value: 'position', label: 'Research Assistant', subType: 'Research Assistant' },
  { value: 'collaborator', label: 'Collaboration Request', subType: 'Long-term Research' },
];

const SOURCES = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'RedBook', label: 'Xiaohongshu (小红书)' },
  { value: 'Other', label: 'OpenPosition (Self-submitted)' },
];

const COLLAB_DOMAINS = [
  'Long-term Research',
  'Short-term Project',
  'Co-author Needed',
] as const;

const PRESET_TAGS = [
  'AI',
  'Machine Learning',
  'NLP',
  'Computer Vision',
  'Robotics',
  'Theory',
  'Systems',
  'Networks',
  'Security',
  'Databases',
  'Software Engineering',
  'Programming Languages',
  'Data Mining',
  'Information Retrieval',
  'HCI',
  'Graphics',
  'Bioinformatics',
] as const;

export default function SubmitPage() {
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    postType: 'phd',
    title: '',
    institution: '',
    authorName: '',
    authorAffiliation: '',
    source: '',
    originalUrl: '',
    description: '',
    selectedTags: [] as string[],
    customTags: '',
    deadline: '',
    domain: '',
  });

  const selectedType = POST_TYPES.find((t) => t.label.toLowerCase().replace(/\s/g, '') === form.postType) || POST_TYPES[0];
  const isCollaborator = selectedType.value === 'collaborator';

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="pt-[86px] min-h-screen bg-white">
        <div className="max-w-[700px] mx-auto px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-[#333] mb-3">Login Required</h2>
          <p className="text-[14px] text-[#666] mb-6">
            Please log in to submit a position or collaboration request.
          </p>
          <Link to="/login" className="inline-block px-5 py-2.5 text-[13px] font-semibold text-white rounded-sm no-underline" style={{ backgroundColor: '#781914' }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="pt-[86px] min-h-screen bg-white">
        <div className="max-w-[700px] mx-auto px-6 py-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#333] mb-2">Thank You!</h2>
          <p className="text-[14px] text-[#666] mb-6">
            Your submission has been received and is pending moderator review.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/" className="px-4 py-2 text-[13px] rounded-sm border no-underline" style={{ borderColor: '#DCDCDC', color: '#555' }}>
              Back to Homepage
            </Link>
            <Link to="/positions" className="px-4 py-2 text-[13px] rounded-sm text-white no-underline" style={{ backgroundColor: '#781914' }}>
              Browse Positions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customTags = form.customTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const mergedTags = Array.from(new Set([...form.selectedTags, ...customTags]));
    const finalTags = mergedTags.length > 0 ? mergedTags : ['General'];

    createMutation.mutate({
      title: form.title,
      type: selectedType.value as 'position' | 'collaborator',
      positionType: isCollaborator ? undefined : (selectedType.subType as PositionType),
      domain: isCollaborator && form.domain ? (form.domain as CollaboratorDomain) : undefined,
      source: (form.source || 'Other') as Source,
      institution: form.institution || undefined,
      authorName: form.authorName,
      authorAffiliation: form.authorAffiliation,
      summary: form.description.slice(0, 200),
      originalText: form.description,
      tags: finalTags.join(', '),
      originalUrl: form.originalUrl,
      deadline: form.deadline || undefined,
    });
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => {
      const alreadySelected = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: alreadySelected
          ? prev.selectedTags.filter((item) => item !== tag)
          : [...prev.selectedTags, tag],
      };
    });
  };

  return (
    <div className="pt-[86px] min-h-screen bg-white">
      <div className="max-w-[700px] mx-auto px-6 py-6">
        <div className="flex items-center gap-1 px-4 py-2 -mx-6 mb-6 text-[13px]" style={{ backgroundColor: '#E8E8E8' }}>
          <ArrowLeft className="w-3.5 h-3.5 text-[#666]" />
          <span className="text-[#666]">Back to </span>
          <Link to="/" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>Homepage</Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#333] mb-1">Submit a Post</h1>
        <p className="text-[13px] text-[#666] mb-6">Share an academic position or collaboration request with the research community.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Post Type</label>
            <div className="flex items-center flex-wrap gap-2">
              {POST_TYPES.map((type) => (
                <button
                  key={type.label}
                  type="button"
                  onClick={() => setForm({ ...form, postType: type.label.toLowerCase().replace(/\s/g, '') })}
                  className="px-3 py-1.5 text-[13px] rounded-sm border transition-all"
                  style={{
                    borderColor: form.postType === type.label.toLowerCase().replace(/\s/g, '') ? '#781914' : '#DCDCDC',
                    backgroundColor: form.postType === type.label.toLowerCase().replace(/\s/g, '') ? '#781914' : '#fff',
                    color: form.postType === type.label.toLowerCase().replace(/\s/g, '') ? '#fff' : '#555',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {isCollaborator && (
            <div>
              <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Collaboration Domain</label>
              <select
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F] bg-white"
                style={{ borderColor: '#DCDCDC' }}
              >
                <option value="">Select a domain (optional)</option>
                {COLLAB_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., PhD Position in Machine Learning at Stanford"
              className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]" style={{ borderColor: '#DCDCDC' }} />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Institution / Affiliation *</label>
            <input type="text" required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="e.g., Stanford University"
              className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]" style={{ borderColor: '#DCDCDC' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Your Name *</label>
              <input type="text" required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]" style={{ borderColor: '#DCDCDC' }} />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Contact Email *</label>
              <input type="email" required value={form.authorAffiliation} onChange={(e) => setForm({ ...form, authorAffiliation: e.target.value })}
                className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]" style={{ borderColor: '#DCDCDC' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Original Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F] bg-white" style={{ borderColor: '#DCDCDC' }}>
                <option value="">Not specified</option>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Application Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]" style={{ borderColor: '#DCDCDC' }} />
            </div>
          </div>

          <div>
              <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Original Post URL *</label>
            <input type="url" required value={form.originalUrl} onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              placeholder="https://..."
              className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]" style={{ borderColor: '#DCDCDC' }} />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the position, requirements, and how to apply..." rows={6}
              className="w-full px-3 py-2 text-sm border rounded-sm outline-none focus:border-[#2C5F6F] resize-y" style={{ borderColor: '#DCDCDC' }} />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Research Tags</label>
            <p className="text-[12px] text-[#666] mb-2">
              Choose one or more tags (based on common CS research areas). If left empty, we will auto-assign <span className="font-medium">General</span>.
            </p>
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {PRESET_TAGS.map((tag) => {
                const selected = form.selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-2.5 py-1 text-[12px] rounded-sm border transition-all"
                    style={{
                      borderColor: selected ? '#781914' : '#DCDCDC',
                      backgroundColor: selected ? '#781914' : '#fff',
                      color: selected ? '#fff' : '#555',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={form.customTags}
              onChange={(e) => setForm({ ...form, customTags: e.target.value })}
              placeholder="Optional custom tags, comma separated"
              className="w-full h-9 px-3 text-sm border rounded-sm outline-none focus:border-[#2C5F6F]"
              style={{ borderColor: '#DCDCDC' }}
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#781914' }}>
              <Send className="w-4 h-4" />
              {createMutation.isPending ? 'Submitting...' : 'Submit Post'}
            </button>
            {createMutation.isError && (
              <p className="text-[13px] text-red-600 mt-2">Error: {createMutation.error.message}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
