import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import SessionPage from './pages/session/SessionPage';
import { MembersContextProvider } from './providers/MembersContext';

function App() {
  return (
    <MembersContextProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
        </Routes>
      </BrowserRouter>
    </MembersContextProvider>
  );
}

export default App;
