import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import route components
import Subjects from './routes/Subjects';
import Chapters from './routes/Chapters';
import Subchapters from './routes/Subchapters';
import Tasks from './routes/Tasks';
import NotFound from './routes/NotFound';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Learning Platform</h1>
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/route" replace />} />
            <Route path="/route" element={<Subjects />} />
            <Route path="/route/:subjectId" element={<Chapters />} />
            <Route path="/route/:subjectId/:chapterId" element={<Subchapters />} />
            <Route path="/route/:subjectId/:chapterId/:subchapterId" element={<Tasks />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
