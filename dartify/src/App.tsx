import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import HomePage from './pages/HomePage';
import PlayerSetupPage from './pages/PlayerSetupPage';
import GamePage from './pages/GamePage';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<PlayerSetupPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;