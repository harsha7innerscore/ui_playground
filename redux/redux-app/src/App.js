import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './app/store';
import SubjectsView from './features/education/SubjectsView';
import SubjectDetailsView from './features/education/SubjectDetailsView';
import './App.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/route" element={<SubjectsView />} />
      <Route path="/route/:subjectId" element={<SubjectDetailsView />} />
      <Route path="/route/:subjectId/:chapterId" element={<SubjectDetailsView />} />
      <Route path="/route/:subjectId/:chapterId/:subchapterId" element={<SubjectDetailsView />} />
      <Route path="*" element={<SubjectsView />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
