import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import SessionPage from './pages/session/SessionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/session' element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
