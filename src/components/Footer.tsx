import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden py-6 md:py-8 px-4 md:px-6" style={{ backgroundColor: '#F5F5F5', borderTop: '1px solid #DCDCDC' }}>
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="mb-4">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-x-3 gap-y-2 text-[14px] md:text-[13px]" style={{ color: '#2C5F6F' }}>
            <Link to="/about" className="min-w-0 break-words no-underline hover:underline py-0.5" style={{ color: '#2C5F6F' }}>About OpenPosition</Link>
            <Link to="/submit" className="min-w-0 break-words no-underline hover:underline py-0.5" style={{ color: '#2C5F6F' }}>Submit a Post</Link>
            <Link to="/positions" className="min-w-0 break-words no-underline hover:underline py-0.5" style={{ color: '#2C5F6F' }}>All Positions</Link>
            <Link to="/collaborators" className="min-w-0 break-words no-underline hover:underline py-0.5" style={{ color: '#2C5F6F' }}>All Collaborators</Link>
            <span className="min-w-0 break-words cursor-pointer hover:underline py-0.5">Contact</span>
            <span className="min-w-0 break-words cursor-pointer hover:underline py-0.5">FAQ</span>
          </div>
        </div>
        <p className="text-[13px] md:text-[12px] text-[#7A7A7A] leading-relaxed break-words">
          OpenPosition is an open platform to aggregate academic job postings and collaboration opportunities from social media.
          We gratefully acknowledge contributions from the research community. © 2026 OpenPosition
        </p>
      </div>
    </footer>
  );
}
