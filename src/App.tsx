import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './presentation/pages/HomePage';
import { SetupPage } from './presentation/pages/SetupPage';
import { WorkoutPage } from './presentation/pages/WorkoutPage';
import { SessionDetailPage } from './presentation/pages/SessionDetailPage';

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup/:id" element={<SetupPage />} />
          <Route path="/start/:id" element={<WorkoutPage />} />
          <Route path="/session/:sessionId" element={<SessionDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
