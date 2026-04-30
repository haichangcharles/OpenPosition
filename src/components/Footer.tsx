import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="py-8 px-6" style={{ backgroundColor: '#F5F5F5', borderTop: '1px solid #DCDCDC' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 text-[13px]" style={{ color: '#2C5F6F' }}>
            <Link to="/about" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>About OpenPosition</Link>
            <Link to="/submit" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>Submit a Post</Link>
            <Link to="/positions" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>All Positions</Link>
            <Link to="/collaborators" className="no-underline hover:underline" style={{ color: '#2C5F6F' }}>All Collaborators</Link>
            <span className="cursor-pointer hover:underline">Contact</span>
            <span className="cursor-pointer hover:underline">FAQ</span>
          </div>
        </div>
        <p className="text-[12px] text-[#888] leading-relaxed">
          OpenPosition is an open platform to aggregate academic job postings and collaboration opportunities from social media.
          We gratefully acknowledge contributions from the research community. © 2026 OpenPosition
        </p>
      </div>
    </footer>
  );
}
