import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchChaptersBySubject,
  fetchAttemptCountByChapter,
  selectChaptersBySubject,
  selectChaptersStatus,
  selectChaptersError,
  selectAttemptCountByChapter
} from '../features/chapters/chaptersSlice';
import { selectSubjects } from '../features/subjects/subjectsSlice';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const Chapters = () => {
  const { subjectId } = useParams();
  const dispatch = useDispatch();

  const chapters = useSelector(state => selectChaptersBySubject(state, subjectId));
  const subjects = useSelector(selectSubjects);
  const status = useSelector(selectChaptersStatus);
  const error = useSelector(selectChaptersError);

  // Find the current subject
  const currentSubject = subjects.find(subject => subject.id === subjectId);

  useEffect(() => {
    if (status === 'idle' || status === 'succeeded' && chapters.length === 0) {
      dispatch(fetchChaptersBySubject(subjectId));
    }

    // After chapters load, fetch attempt counts for each
    if (status === 'succeeded' && chapters.length > 0) {
      chapters.forEach(chapter => {
        dispatch(fetchAttemptCountByChapter(chapter.id));
      });
    }
  }, [status, dispatch, subjectId, chapters]);

  const handleRetry = () => {
    dispatch(fetchChaptersBySubject(subjectId));
  };

  // Get attempt counts for each chapter
  const getAttemptCount = (chapterId) => {
    return useSelector(state => selectAttemptCountByChapter(state, chapterId));
  };

  let content;

  if (status === 'loading') {
    content = <LoadingState />;
  } else if (status === 'failed') {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else if (chapters.length === 0) {
    content = <EmptyState message="No chapters available for this subject" />;
  } else {
    content = (
      <div className="chapters-list">
        {chapters.map((chapter) => {
          const attemptCount = getAttemptCount(chapter.id);

          return (
            <Link
              key={chapter.id}
              to={`/route/${subjectId}/${chapter.id}`}
              className="chapter-card"
            >
              <div className="chapter-info">
                <h3>{chapter.name}</h3>
                <p>{chapter.description}</p>
              </div>
              <div className="chapter-attempts">
                <span>Attempts: {attemptCount}</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="chapters-container">
      <div className="chapters-header">
        <Link to="/route" className="back-link">&larr; Back to Subjects</Link>
        <h1>Chapters for {currentSubject ? currentSubject.name : 'Subject'}</h1>
      </div>
      {content}
    </div>
  );
};

export default Chapters;