import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchTasksBySubchapter,
  selectTasksBySubchapter,
  selectTasksStatus,
  selectTasksError
} from '../features/tasks/tasksSlice';
import { selectSubchaptersByChapter } from '../features/subchapters/subchaptersSlice';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const Tasks = () => {
  const { subjectId, chapterId, subchapterId } = useParams();
  const dispatch = useDispatch();

  const tasks = useSelector(state => selectTasksBySubchapter(state, subchapterId));
  const subchapters = useSelector(state => selectSubchaptersByChapter(state, chapterId));
  const status = useSelector(selectTasksStatus);
  const error = useSelector(selectTasksError);

  // Find the current subchapter
  const currentSubchapter = subchapters.find(subchapter => subchapter.id === subchapterId);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasksBySubchapter(subchapterId));
    }
  }, [status, dispatch, subchapterId]);

  const handleRetry = () => {
    dispatch(fetchTasksBySubchapter(subchapterId));
  };

  let content;

  if (status === 'loading') {
    content = <LoadingState />;
  } else if (status === 'failed') {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else if (tasks.length === 0) {
    content = <EmptyState message="No tasks available for this subchapter" />;
  } else {
    content = (
      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-info">
              <h3>{task.name}</h3>
              <p>{task.description}</p>
            </div>
            <div className="task-difficulty">
              <span className={`difficulty-tag ${task.difficulty.toLowerCase()}`}>
                {task.difficulty}
              </span>
            </div>
            <button className="start-task-button">Start Task</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <Link to={`/route/${subjectId}/${chapterId}`} className="back-link">
          &larr; Back to Subchapters
        </Link>
        <h1>
          Tasks for {currentSubchapter ? currentSubchapter.name : 'Subchapter'}
        </h1>
      </div>
      {content}
    </div>
  );
};

export default Tasks;