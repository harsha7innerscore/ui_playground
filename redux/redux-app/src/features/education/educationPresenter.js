// Education presenter - handles business logic for the education module
import { actions } from './educationSlice';

export const createEducationPresenter = (dispatch, navigate, model) => {
  // Load subjects list
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

  // Handle subject selection
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

  // Handle chapter selection/expansion
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

  // Handle subchapter selection
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

  // Navigate back to subjects list
  const onBackToSubjects = () => {
    dispatch(actions.resetView());
    navigate('/route');
  };

  // Load subject from URL
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

  // Load chapter from URL
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

  // Load subchapter from URL
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