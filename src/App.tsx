import { Routes, Route } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import PositionsPage from '@/pages/PositionsPage';
import CollaboratorsPage from '@/pages/CollaboratorsPage';
import AboutPage from '@/pages/AboutPage';
import SubmitPage from '@/pages/SubmitPage';
import AdminPage from '@/pages/AdminPage';
import CrowdReviewPage from '@/pages/CrowdReviewPage';
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/positions" element={<PositionsPage />} />
          <Route path="/collaborators" element={<CollaboratorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/review" element={<CrowdReviewPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
