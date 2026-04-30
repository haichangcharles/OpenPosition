import { Link } from 'react-router';
import { ArrowLeft, Globe, Users, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-[86px] min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Back to Homepage */}
        <div
          className="flex items-center gap-1 px-4 py-2 -mx-6 mb-6 text-[13px]"
          style={{ backgroundColor: '#E8E8E8' }}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#666]" />
          <span className="text-[#666]">Back to </span>
          <Link to="/" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>
            Homepage
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#333] mb-6">
          About OpenPosition
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 rounded-sm border" style={{ borderColor: '#DCDCDC' }}>
            <Globe className="w-6 h-6 text-[#2C5F6F] mb-2" />
            <h3 className="text-[15px] font-semibold text-[#333] mb-1">Open Aggregation</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              We aggregate academic job postings and collaboration requests from LinkedIn, X (Twitter), and Xiaohongshu (小红书)
              into a single, searchable platform.
            </p>
          </div>
          <div className="p-4 rounded-sm border" style={{ borderColor: '#DCDCDC' }}>
            <Users className="w-6 h-6 text-[#2C5F6F] mb-2" />
            <h3 className="text-[15px] font-semibold text-[#333] mb-1">Community Driven</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              Anyone can submit a position posting or collaboration request. Our moderators review submissions
              to ensure quality and relevance.
            </p>
          </div>
          <div className="p-4 rounded-sm border" style={{ borderColor: '#DCDCDC' }}>
            <BookOpen className="w-6 h-6 text-[#2C5F6F] mb-2" />
            <h3 className="text-[15px] font-semibold text-[#333] mb-1">For Researchers</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              Whether you are looking for a PhD position, a summer internship, a postdoc, or a research collaborator,
              OpenPosition helps you discover opportunities.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-[14px] text-[#555] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#333] mb-2">What is OpenPosition?</h2>
            <p>
              OpenPosition is an open platform inspired by the design philosophy of OpenReview. We believe that
              academic opportunities — PhD positions, internships, postdocs, and research collaborations — should be
              discoverable in a centralized, structured, and transparent way.
            </p>
            <p className="mt-2">
              Currently, many professors and researchers post opportunities on personal social media accounts.
              These posts are scattered across platforms and difficult to search. OpenPosition solves this by
              collecting, categorizing, and indexing these postings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#333] mb-2">Supported Platforms</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0077B5' }} />
                <span>LinkedIn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#000' }} />
                <span>X (Twitter)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF2442' }} />
                <span>Xiaohongshu (小红书)</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#333] mb-2">How to Submit</h2>
            <p>
              If you are a professor, researcher, or student representative looking to advertise a position
              or collaboration request, please visit our <Link to="/submit" style={{ color: '#2C5F6F' }} className="no-underline hover:underline">Submit a Post</Link> page.
              We accept postings for PhD positions, research internships, postdoctoral fellowships, research assistant
              positions, and collaboration requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#333] mb-2">Contact</h2>
            <p>
              For questions, suggestions, or partnership inquiries, please reach out to us at{' '}
              <span style={{ color: '#2C5F6F' }}>contact@openposition.net</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
