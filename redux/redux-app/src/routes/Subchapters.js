import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchSubchaptersByChapter,
  fetchLastAttemptBySubchapter,
  selectSubchaptersByChapter,
  selectSubchaptersStatus,
  selectSubchaptersError,
  selectLastAttemptBySubchapter
} from '../features/subchapters/subchaptersSlice';
import { selectChaptersBySubject } from '../features/chapters/chaptersSlice';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const Subchapters = () => {
  const { subjectId, chapterId } = useParams();
  const dispatch = useDispatch();

  const subchapters = useSelector(state => selectSubchaptersByChapter(state, chapterId));
  const chapters = useSelector(state => selectChaptersBySubject(state, subjectId));
  const status = useSelector(selectSubchaptersStatus);
  const error = useSelector(selectSubchaptersError);

  // Find the current chapter
  const currentChapter = chapters.find(chapter => chapter.id === chapterId);

  useEffect(() => {
    if (status === 'idle' || (status === 'succeeded' && subchapters.length === 0)) {
      dispatch(fetchSubchaptersByChapter(chapterId));
    }

    // After subchapters load, fetch last attempt for each
    if (status === 'succeeded' && subchapters.length > 0) {
      subchapters.forEach(subchapter => {
        dispatch(fetchLastAttemptBySubchapter(subchapter.id));
      });
    }
  }, [status, dispatch, chapterId, subchapters]);

  const handleRetry = () => {
    dispatch(fetchSubchaptersByChapter(chapterId));
  };

  const getLastAttempt = (subchapterId) => {
    return useSelector(state => selectLastAttemptBySubchapter(state, subchapterId));
  };

  let content;

  if (status === 'loading') {
    content = <LoadingState />;
  } else if (status === 'failed') {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else if (subchapters.length === 0) {
    content = <EmptyState message="No subchapters available for this chapter" />;
  } else {
    content = (
      <div className="subchapters-list">
        {subchapters.map((subchapter) => {
          const lastAttempt = getLastAttempt(subchapter.id);

          return (
            <Link
              key={subchapter.id}
              to={`/route/${subjectId}/${chapterId}/${subchapter.id}`}
              className="subchapter-card"
            >
              <div className="subchapter-info">
                <h3>{subchapter.name}</h3>
                <p>{subchapter.description}</p>
              </div>
              {lastAttempt && (
                <div className="last-attempt-info">
                  <span>Last attempted: {new Date(lastAttempt.timestamp).toLocaleDateString()}</span>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${lastAttempt.progress}%` }}
                    ></div>
                  </div>
                  <span>Progress: {lastAttempt.progress}%</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="subchapters-container">
      <div className="subchapters-header">
        <Link to={`/route/${subjectId}`} className="back-link">&larr; Back to Chapters</Link>
        <h1>
          Subchapters for {currentChapter ? currentChapter.name : 'Chapter'}
        </h1>
      </div>
      {content}
    </div>
  );
};

export default Subchapters;