import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import SessionPage from './pages/session/SessionPage';
import { GooglerContextProvider } from './providers/GooglerContext';
import { MembersContextProvider } from './providers/MembersContext';

function App() {
  return (
    <GooglerContextProvider>
      <MembersContextProvider>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/session' element={<SessionPage />} />
          </Routes>
        </BrowserRouter>
      </MembersContextProvider>
    </GooglerContextProvider>
  );
}

export default App;
