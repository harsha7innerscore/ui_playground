import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSubjects, selectSubjects, selectSubjectsStatus, selectSubjectsError } from '../features/subjects/subjectsSlice';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const Subjects = () => {
  const dispatch = useDispatch();
  const subjects = useSelector(selectSubjects);
  const status = useSelector(selectSubjectsStatus);
  const error = useSelector(selectSubjectsError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSubjects());
    }
  }, [status, dispatch]);

  const handleRetry = () => {
    dispatch(fetchSubjects());
  };

  let content;

  if (status === 'loading') {
    content = <LoadingState />;
  } else if (status === 'failed') {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else if (subjects.length === 0) {
    content = <EmptyState message="No subjects available" />;
  } else {
    content = (
      <div className="subjects-grid">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            to={`/route/${subject.id}`}
            className="subject-card"
          >
            <img src={subject.image} alt={subject.name} />
            <h3>{subject.name}</h3>
            <p>{subject.description}</p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="subjects-container">
      <h1>Subjects</h1>
      {content}
    </div>
  );
};

export default Subjects;