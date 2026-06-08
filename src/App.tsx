import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { EditorPage } from '@/pages/EditorPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { LogicPage } from '@/pages/LogicPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { ResultsPage } from '@/pages/ResultsPage';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-zinc-50">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/logic" element={<LogicPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
