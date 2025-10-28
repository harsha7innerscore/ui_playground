import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createEducationModel } from './educationModel';
import { createEducationPresenter } from './educationPresenter';

function SubjectsView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, noData, subjects } = useSelector(state => state.education);
  const presenterRef = useRef(null);

  useEffect(() => {
    const model = createEducationModel();
    presenterRef.current = createEducationPresenter(dispatch, navigate, model);
    presenterRef.current.loadSubjects();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
        <p className="text-gray-600 mb-8">Select a subject to view chapters and progress</p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading subjects...</span>
          </div>
        )}

        {noData && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg">{noData}</p>
          </div>
        )}

        {!loading && !noData && subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => presenterRef.current.onSubjectClick(subject)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
              >
                <div className="text-5xl mb-4">{subject.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{subject.name}</h3>
                <p className="text-gray-600 mb-4">{subject.description}</p>
                <div className="text-sm text-purple-600 font-semibold">
                  {subject.chapters.length} chapters →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubjectsView;