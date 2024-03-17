import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import SessionPage from './pages/session/SessionPage';
import SessionHistoryPage from './pages/sessionHistory/SessionHistoryPage';
import SessionHistoryDetailPage from './pages/sessionHistoryDetail/SessionHistoryDetailPage';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/history" element={<SessionHistoryPage />} />
        <Route path="/history/:id" element={<SessionHistoryDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
