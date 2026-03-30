import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Students  from './pages/Students';
import Marks     from './pages/Marks';
import View      from './pages/View';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                      element={<Dashboard />} />
        <Route path="/mentor/:mentorId/students" element={<Students />} />
        <Route path="/mentor/:mentorId/marks"    element={<Marks />} />
        <Route path="/mentor/:mentorId/view"     element={<View />} />
        <Route path="*"                      element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;