import { Navigate, Route, Routes } from 'react-router-dom';
import Enter from './pages/Enter';
import Menu from './pages/Menu';
import Play from './pages/Play';
import Results from './pages/Results';
import Staff from './pages/Staff';
import Stats from './pages/Stats';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Enter />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/play/:gameId" element={<Play />} />
      <Route path="/results" element={<Results />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
