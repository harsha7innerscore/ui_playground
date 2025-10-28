// Education model - handles data access and mock data for the education module

export const createEducationModel = () => {
  // Mock data for subjects
  const mockSubjects = [
    { id: 1, name: 'Mathematics', description: 'Advanced calculus and algebra', icon: '📐' },
    { id: 2, name: 'Physics', description: 'Classical and quantum mechanics', icon: '⚛️' },
    { id: 3, name: 'Chemistry', description: 'Organic and inorganic chemistry', icon: '🧪' }
  ];

  // Mock data for chapters, organized by subject ID
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

  // Mock data for subchapters, organized by chapter ID
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

  // Mock data for tasks, organized by subchapter ID
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

  // Method to get subjects with their nested chapters and subchapters
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

  // Method to get tasks for a specific subchapter
  const getSubchapterTasks = async (subchapterId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Convert subchapterId to number to ensure consistent lookups
        const id = parseInt(subchapterId);
        const tasks = mockTasks[id] || [];
        console.log('Model fetching tasks for subchapterId:', subchapterId, 'Converted ID:', id, 'Tasks found:', tasks);
        resolve(tasks);
      }, 500);
    });
  };

  // Method to get progress data for a chapter
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

  // Method to get the last attempted task for a subchapter
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