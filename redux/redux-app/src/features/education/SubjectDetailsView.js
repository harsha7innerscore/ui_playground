import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createEducationModel } from './educationModel';
import { createEducationPresenter } from './educationPresenter';

function SubjectDetailsView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { error, subjects, selectedSubject, expandedChapters, chapterProgress, subchapterLastTasks, selectedSubchapter, tasks, tasksLoading, noTasksSubchapters } = useSelector(state => state.education);
  const presenterRef = useRef(null);

  useEffect(() => {
    const model = createEducationModel();
    presenterRef.current = createEducationPresenter(dispatch, navigate, model);

    if (!selectedSubject && subjects.length > 0 && params.subjectId) {
      presenterRef.current.loadSubjectFromUrl(params.subjectId, subjects);
    }

    if (selectedSubject && params.chapterId) {
      presenterRef.current.loadChapterFromUrl(params.chapterId, selectedSubject);
    }

    if (params.subchapterId) {
      presenterRef.current.loadSubchapterFromUrl(params.subchapterId);
    }

  }, [dispatch, navigate, params, selectedSubject, subjects]);

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => presenterRef.current.onBackToSubjects()}
          className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow" >
          ← Back to Subjects
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{selectedSubject.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedSubject.name}</h1>
              <p className="text-gray-600">{selectedSubject.description}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {selectedSubject.chapters.map(chapter => {
            const progress = chapterProgress[chapter.id];
            const isExpanded = expandedChapters[chapter.id];

            return (
              <div key={chapter.id} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => presenterRef.current.onChapterClick(chapter, selectedSubject.id)}
                  className="w-full p-5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {chapter.name}
                    </h3>
                    {progress && (
                      <p className="text-sm text-gray-600">
                        Progress: {progress.attemptedCount}/{progress.totalCount} subchapters attempted
                      </p>
                    )}
                  </div>
                  <div className="text-2xl text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="space-y-3">
                      {chapter.subchapters.map(subchapter => {
                        const lastTask = subchapterLastTasks[subchapter.id];
                        const isSelected = selectedSubchapter && (parseInt(selectedSubchapter) === parseInt(subchapter.id));
                        const subchapterTasks = tasks[subchapter.id];
                        const isTasksLoading = tasksLoading[subchapter.id];
                        const hasNoTasks = noTasksSubchapters[subchapter.id];

                        // Always log the render state for every subchapter to help with debugging
                        console.warn('🔍 SUBCHAPTER RENDER STATE:', {
                          subchapterId: subchapter.id,
                          selectedSubchapter,
                          isSelected,
                          'subchapter.id type': typeof subchapter.id,
                          'selectedSubchapter type': typeof selectedSubchapter,
                          subchapterTasks,
                          isTasksLoading,
                          hasNoTasks,
                          'Array.isArray(subchapterTasks)': Array.isArray(subchapterTasks),
                          'subchapterTasks length': subchapterTasks ? subchapterTasks.length : 'N/A'
                        });

                        return (
                          <div key={subchapter.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <button
                              onClick={() => presenterRef.current.onSubchapterClick(subchapter, selectedSubject.id, chapter.id)}
                              className="w-full text-left hover:bg-gray-50 p-2 rounded transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800">{subchapter.name}</h4>
                                  {lastTask && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Last: {lastTask.name} (Score: {lastTask.score}%) - {lastTask.attemptedAt}
                                    </p>
                                  )}
                                </div>
                                <div className="text-purple-600 text-sm font-semibold">
                                  View Tasks →
                                </div>
                              </div>
                            </button>

                            {/* Always show the debug section, regardless of isSelected */}
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                {/* Debug information panel */}
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-3">
                                  <h5 className="font-bold text-sm text-yellow-800 mb-1">DEBUG INFO:</h5>
                                  <div className="text-xs text-yellow-900 font-mono">
                                    <div>subchapter.id: {subchapter.id} ({typeof subchapter.id})</div>
                                    <div>selectedSubchapter: {selectedSubchapter} ({typeof selectedSubchapter})</div>
                                    <div>isSelected: {isSelected ? 'true' : 'false'}</div>
                                    <div>isTasksLoading: {isTasksLoading ? 'true' : 'false'}</div>
                                    <div>hasNoTasks: {hasNoTasks ? 'true' : 'false'}</div>
                                    <div>subchapterTasks: {subchapterTasks ? `Array[${subchapterTasks.length}]` : 'undefined'}</div>
                                    <div>isArray: {Array.isArray(subchapterTasks) ? 'true' : 'false'}</div>
                                  </div>
                                </div>

                                {isTasksLoading && (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                    <span className="ml-2 text-sm text-gray-600">Loading tasks...</span>
                                  </div>
                                )}

                                {hasNoTasks && !isTasksLoading && (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    No tasks attempted yet
                                  </div>
                                )}

                                {Array.isArray(subchapterTasks) && subchapterTasks.length > 0 && !isTasksLoading && (
                                  <div className="space-y-2">
                                    <div className="bg-green-100 p-2 text-center text-green-800 text-sm rounded mb-2">
                                      ✅ Tasks loaded successfully: {subchapterTasks.length} tasks
                                    </div>
                                    {subchapterTasks.map(task => (
                                      <div key={task.id} className="bg-purple-50 p-3 rounded border border-purple-100">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-sm text-gray-800">{task.name}</span>
                                          <span className={`text-sm font-semibold ${
                                            task.score >= 80 ? 'text-green-600' :
                                            task.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                          }`}>
                                            {task.score}%
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Attempted on: {task.attemptedAt}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubjectDetailsView;