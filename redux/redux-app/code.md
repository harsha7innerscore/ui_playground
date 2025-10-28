import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, Routes, Route, BrowserRouter } from 'react-router-dom';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

// ============= REDUX SLICE =============
const educationSlice = createSlice({
name: 'education',
initialState: {
loading: false,
error: '',
noData: '',
subjects: [],
selectedSubject: null,
selectedChapter: null,
selectedSubchapter: null,
expandedChapters: {},
chapterProgress: {},
subchapterLastTasks: {},
tasks: {},
tasksLoading: {},
noTasksSubchapters: {}
},
reducers: {
setLoading: (state, action) => {
state.loading = action.payload;
},
setError: (state, action) => {
state.error = action.payload;
},
setNoData: (state, action) => {
state.noData = action.payload;
},
setSubjects: (state, action) => {
state.subjects = action.payload;
state.noData = '';
},
setSelectedSubject: (state, action) => {
state.selectedSubject = action.payload;
},
setSelectedChapter: (state, action) => {
state.selectedChapter = action.payload;
},
setSelectedSubchapter: (state, action) => {
state.selectedSubchapter = action.payload;
},
toggleChapter: (state, action) => {
const chapterId = action.payload;
state.expandedChapters[chapterId] = !state.expandedChapters[chapterId];
},
setChapterProgress: (state, action) => {
state.chapterProgress = action.payload;
},
setSubchapterLastTasks: (state, action) => {
state.subchapterLastTasks = action.payload;
},
setTasksLoading: (state, action) => {
const { subchapterId, loading } = action.payload;
state.tasksLoading[subchapterId] = loading;
},
setTasks: (state, action) => {
const { subchapterId, tasks } = action.payload;
state.tasks[subchapterId] = tasks;
state.noTasksSubchapters[subchapterId] = false;
},
setNoTasks: (state, action) => {
state.noTasksSubchapters[action.payload] = true;
},
resetView: (state) => {
state.selectedSubject = null;
state.selectedChapter = null;
state.selectedSubchapter = null;
state.expandedChapters = {};
state.tasks = {};
}
}
});

const { actions, reducer } = educationSlice;
const store = configureStore({ reducer: { education: reducer } });

// ============= MODEL =============
const createEducationModel = () => {
const mockSubjects = [
{ id: 1, name: 'Mathematics', description: 'Advanced calculus and algebra', icon: '📐' },
{ id: 2, name: 'Physics', description: 'Classical and quantum mechanics', icon: '⚛️' },
{ id: 3, name: 'Chemistry', description: 'Organic and inorganic chemistry', icon: '🧪' }
];

const mockChapters = {
1: [
{ id: 101, subjectId: 1, name: 'Calculus', order: 1 },
{ id: 102, subjectId: 1, name: 'Algebra', order: 2 },
{ id: 103, subjectId: 1, name: 'Geometry', order: 3 }
],
2: [
{ id: 201, subjectId: 2, name: 'Mechanics', order: 1 },
{ id: 202, subjectId: 2, name: 'Thermodynamics', order: 2 }
],
3: [
{ id: 301, subjectId: 3, name: 'Periodic Table', order: 1 },
{ id: 302, subjectId: 3, name: 'Chemical Bonds', order: 2 }
]
};

const mockSubchapters = {
101: [
{ id: 1001, chapterId: 101, name: 'Limits and Continuity', order: 1 },
{ id: 1002, chapterId: 101, name: 'Derivatives', order: 2 },
{ id: 1003, chapterId: 101, name: 'Integration', order: 3 }
],
102: [
{ id: 1004, chapterId: 102, name: 'Linear Equations', order: 1 },
{ id: 1005, chapterId: 102, name: 'Quadratic Equations', order: 2 }
],
103: [
{ id: 1006, chapterId: 103, name: 'Triangles', order: 1 }
],
201: [
{ id: 2001, chapterId: 201, name: 'Newtons Laws', order: 1 },
{ id: 2002, chapterId: 201, name: 'Motion in 2D', order: 2 }
],
202: [
{ id: 2003, chapterId: 202, name: 'Heat Transfer', order: 1 }
],
301: [
{ id: 3001, chapterId: 301, name: 'Elements Overview', order: 1 }
],
302: [
{ id: 3002, chapterId: 302, name: 'Ionic Bonds', order: 1 },
{ id: 3003, chapterId: 302, name: 'Covalent Bonds', order: 2 }
]
};

const mockTasks = {
1001: [
{ id: 't1', subchapterId: 1001, name: 'Task 1: Basic Limits', attempted: true, score: 85, attemptedAt: '2025-10-20' },
{ id: 't2', subchapterId: 1001, name: 'Task 2: Advanced Limits', attempted: true, score: 90, attemptedAt: '2025-10-22' }
],
1002: [
{ id: 't3', subchapterId: 1002, name: 'Task 1: Derivative Rules', attempted: true, score: 78, attemptedAt: '2025-10-25' }
],
1004: [
{ id: 't4', subchapterId: 1004, name: 'Task 1: Solving Linear Equations', attempted: true, score: 95, attemptedAt: '2025-10-15' }
]
};

const getSubjectsData = async () => {
return new Promise((resolve) => {
setTimeout(() => {
const subjects = mockSubjects.map(subject => ({
...subject,
chapters: (mockChapters[subject.id] || []).map(chapter => ({
...chapter,
subchapters: mockSubchapters[chapter.id] || []
}))
}));
resolve(subjects);
}, 800);
});
};

const getSubchapterTasks = async (subchapterId) => {
return new Promise((resolve) => {
setTimeout(() => {
resolve(mockTasks[subchapterId] || []);
}, 500);
});
};

const getAttemptedSubchaptersCount = async (chapterId) => {
return new Promise((resolve) => {
setTimeout(() => {
const subchapters = mockSubchapters[chapterId] || [];
const attemptedCount = subchapters.filter(sub =>
mockTasks[sub.id] && mockTasks[sub.id].length > 0
).length;
resolve({ chapterId, attemptedCount, totalCount: subchapters.length });
}, 400);
});
};

const getLastAttemptedTask = async (subchapterId) => {
return new Promise((resolve) => {
setTimeout(() => {
const tasks = mockTasks[subchapterId] || [];
const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
resolve(lastTask);
}, 300);
});
};

return {
getSubjectsData,
getSubchapterTasks,
getAttemptedSubchaptersCount,
getLastAttemptedTask
};
};

// ============= PRESENTER =============
const createEducationPresenter = (dispatch, navigate, model) => {
const loadSubjects = async () => {
dispatch(actions.setLoading(true));
try {
const subjects = await model.getSubjectsData();
dispatch(actions.setLoading(false));

      if (!subjects || subjects.length === 0) {
        dispatch(actions.setNoData('No subjects available'));
        return;
      }

      dispatch(actions.setSubjects(subjects));
    } catch (error) {
      dispatch(actions.setLoading(false));
      dispatch(actions.setError('Failed to load subjects: ' + error.message));
      setTimeout(() => dispatch(actions.setError('')), 4000);
    }

};

const onSubjectClick = async (subject) => {
dispatch(actions.setSelectedSubject(subject));
navigate(`/route/${subject.id}`);

    const chapterPromises = subject.chapters.map(chapter =>
      model.getAttemptedSubchaptersCount(chapter.id)
    );

    try {
      const attemptedCounts = await Promise.all(chapterPromises);
      const progressMap = {};
      attemptedCounts.forEach(p => {
        progressMap[p.chapterId] = p;
      });
      dispatch(actions.setChapterProgress(progressMap));
    } catch (error) {
      dispatch(actions.setError('Failed to load chapter progress'));
      setTimeout(() => dispatch(actions.setError('')), 4000);
    }

};

const onChapterClick = async (chapter, subjectId) => {
dispatch(actions.setSelectedChapter(chapter));
dispatch(actions.toggleChapter(chapter.id));
navigate(`/route/${subjectId}/${chapter.id}`);

    const subchapterPromises = chapter.subchapters.map(async (subchapter) => {
      const lastTask = await model.getLastAttemptedTask(subchapter.id);
      return { subchapterId: subchapter.id, lastTask };
    });

    try {
      const lastTasks = await Promise.all(subchapterPromises);
      const tasksMap = {};
      lastTasks.forEach(t => {
        tasksMap[t.subchapterId] = t.lastTask;
      });
      dispatch(actions.setSubchapterLastTasks(tasksMap));
    } catch (error) {
      dispatch(actions.setError('Failed to load subchapter details'));
      setTimeout(() => dispatch(actions.setError('')), 4000);
    }

};

const onSubchapterClick = async (subchapter, subjectId, chapterId) => {
dispatch(actions.setSelectedSubchapter(subchapter.id));
dispatch(actions.setTasksLoading({ subchapterId: subchapter.id, loading: true }));
navigate(`/route/${subjectId}/${chapterId}/${subchapter.id}`);

    try {
      const tasks = await model.getSubchapterTasks(subchapter.id);
      dispatch(actions.setTasksLoading({ subchapterId: subchapter.id, loading: false }));

      if (!tasks || tasks.length === 0) {
        dispatch(actions.setNoTasks(subchapter.id));
        return;
      }

      dispatch(actions.setTasks({ subchapterId: subchapter.id, tasks }));
    } catch (error) {
      dispatch(actions.setTasksLoading({ subchapterId: subchapter.id, loading: false }));
      dispatch(actions.setError('Failed to load tasks'));
      setTimeout(() => dispatch(actions.setError('')), 4000);
    }

};

const onBackToSubjects = () => {
dispatch(actions.resetView());
navigate('/route');
};

const loadSubjectFromUrl = async (subjectId, subjects) => {
const subject = subjects.find(s => s.id === parseInt(subjectId));
if (subject) {
dispatch(actions.setSelectedSubject(subject));

      const chapterPromises = subject.chapters.map(chapter =>
        model.getAttemptedSubchaptersCount(chapter.id)
      );

      try {
        const attemptedCounts = await Promise.all(chapterPromises);
        const progressMap = {};
        attemptedCounts.forEach(p => {
          progressMap[p.chapterId] = p;
        });
        dispatch(actions.setChapterProgress(progressMap));
      } catch (error) {
        console.error('Failed to load progress');
      }
    }

};

const loadChapterFromUrl = async (chapterId, subject) => {
const chapter = subject.chapters.find(c => c.id === parseInt(chapterId));
if (chapter) {
dispatch(actions.setSelectedChapter(chapter));
dispatch(actions.toggleChapter(chapter.id));

      const subchapterPromises = chapter.subchapters.map(async (subchapter) => {
        const lastTask = await model.getLastAttemptedTask(subchapter.id);
        return { subchapterId: subchapter.id, lastTask };
      });

      try {
        const lastTasks = await Promise.all(subchapterPromises);
        const tasksMap = {};
        lastTasks.forEach(t => {
          tasksMap[t.subchapterId] = t.lastTask;
        });
        dispatch(actions.setSubchapterLastTasks(tasksMap));
      } catch (error) {
        console.error('Failed to load subchapter details');
      }
    }

};

const loadSubchapterFromUrl = async (subchapterId) => {
dispatch(actions.setSelectedSubchapter(parseInt(subchapterId)));
dispatch(actions.setTasksLoading({ subchapterId: parseInt(subchapterId), loading: true }));

    try {
      const tasks = await model.getSubchapterTasks(parseInt(subchapterId));
      dispatch(actions.setTasksLoading({ subchapterId: parseInt(subchapterId), loading: false }));

      if (!tasks || tasks.length === 0) {
        dispatch(actions.setNoTasks(parseInt(subchapterId)));
        return;
      }

      dispatch(actions.setTasks({ subchapterId: parseInt(subchapterId), tasks }));
    } catch (error) {
      dispatch(actions.setTasksLoading({ subchapterId: parseInt(subchapterId), loading: false }));
    }

};

return {
loadSubjects,
onSubjectClick,
onChapterClick,
onSubchapterClick,
onBackToSubjects,
loadSubjectFromUrl,
loadChapterFromUrl,
loadSubchapterFromUrl
};
};

// ============= SUBJECTS VIEW =============
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

// ============= SUBJECT DETAILS VIEW =============
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
                        const isSelected = selectedSubchapter === subchapter.id;
                        const subchapterTasks = tasks[subchapter.id];
                        const isTasksLoading = tasksLoading[subchapter.id];
                        const hasNoTasks = noTasksSubchapters[subchapter.id];

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

                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
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

                                {subchapterTasks && !isTasksLoading && (
                                  <div className="space-y-2">
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
                            )}
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

// ============= MAIN APP WITH ROUTER =============
function AppRoutes() {
return (
<Routes>
<Route path="/route" element={<SubjectsView />} />
<Route path="/route/:subjectId" element={<SubjectDetailsView />} />
<Route path="/route/:subjectId/:chapterId" element={<SubjectDetailsView />} />
<Route path="/route/:subjectId/:chapterId/:subchapterId" element={<SubjectDetailsView />} />
<Route path="\*" element={<SubjectsView />} />
</Routes>
);
}

export default function App() {
return (
<Provider store={store}>
<BrowserRouter>
<AppRoutes />
</BrowserRouter>
</Provider>
);
}
