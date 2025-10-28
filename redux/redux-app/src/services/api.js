// Import mock data
import subjects from '../mockData/subjects.json';
import chaptersBySubject from '../mockData/chaptersBySubject.json';
import subchaptersByChapter from '../mockData/subchaptersByChapter.json';
import tasksBySubchapter from '../mockData/tasksBySubchapter.json';
import attemptCountByChapter from '../mockData/attemptCountByChapter.json';
import lastAttemptBySubchapter from '../mockData/lastAttemptBySubchapter.json';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate network failure for error states (15% failure rate)
const shouldFail = () => Math.random() < 0.15;

// Simulate async API calls
export const api = {
  // Get all subjects
  getSubjects: async () => {
    await delay();
    if (shouldFail()) {
      throw new Error('Failed to fetch subjects');
    }
    return subjects;
  },

  // Get chapters for a specific subject
  getChaptersBySubject: async (subjectId) => {
    await delay();
    if (shouldFail()) {
      throw new Error(`Failed to fetch chapters for subject ${subjectId}`);
    }
    return chaptersBySubject[subjectId] || [];
  },

  // Get subchapters for a specific chapter
  getSubchaptersByChapter: async (chapterId) => {
    await delay();
    if (shouldFail()) {
      throw new Error(`Failed to fetch subchapters for chapter ${chapterId}`);
    }
    return subchaptersByChapter[chapterId] || [];
  },

  // Get tasks for a specific subchapter
  getTasksBySubchapter: async (subchapterId) => {
    await delay();
    if (shouldFail()) {
      throw new Error(`Failed to fetch tasks for subchapter ${subchapterId}`);
    }
    return tasksBySubchapter[subchapterId] || [];
  },

  // Get attempt count for a specific chapter
  getAttemptCountByChapter: async (chapterId) => {
    await delay();
    if (shouldFail()) {
      throw new Error(`Failed to fetch attempt count for chapter ${chapterId}`);
    }
    return attemptCountByChapter[chapterId] || 0;
  },

  // Get last attempt for a specific subchapter
  getLastAttemptBySubchapter: async (subchapterId) => {
    await delay();
    if (shouldFail()) {
      throw new Error(`Failed to fetch last attempt for subchapter ${subchapterId}`);
    }
    return lastAttemptBySubchapter[subchapterId] || null;
  }
};

export default api;