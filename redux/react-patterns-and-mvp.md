# React Patterns and MVP Equivalents

## Redux Slice Data Structure Examples

Here's how the data would be structured in each slice for our educational content hierarchy:

```javascript
// 1. Subjects Slice
const subjectsSlice = {
  entities: {
    "subject1": {
      id: "subject1",
      name: "Mathematics",
      description: "Study of numbers, quantities, and shapes",
      imageUrl: "/images/math.png",
      chapterCount: 5,
      totalProgress: 35 // percentage
    },
    "subject2": {
      id: "subject2",
      name: "Physics",
      description: "Study of matter, energy, and their interactions",
      imageUrl: "/images/physics.png",
      chapterCount: 4,
      totalProgress: 20
    }
    // more subjects...
  },
  ids: ["subject1", "subject2"], // for maintaining order
  status: "succeeded", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  selectedSubjectId: "subject1"
}

// 2. Chapters Slice - Best Practice Normalized Structure
const chaptersSlice = {
  entities: {
    "chapter1": {
      id: "chapter1",
      subjectId: "subject1", // reference to parent subject
      name: "Algebra",
      description: "Study of mathematical symbols and rules",
      totalSubchapters: 8,
      attemptedSubchapters: 3,
      progress: 37.5 // percentage
    },
    "chapter2": {
      id: "chapter2",
      subjectId: "subject1",
      name: "Geometry",
      description: "Study of shapes and their properties",
      totalSubchapters: 6,
      attemptedSubchapters: 2,
      progress: 33.3
    }
    // more chapters...
  },
  ids: ["chapter1", "chapter2"],
  bySubject: {
    "subject1": ["chapter1", "chapter2"]
    // other subjects and their chapters...
  },
  status: "succeeded",
  error: null,
  selectedChapterId: "chapter1"
}

// 3. Subchapters Slice
const subchaptersSlice = {
  entities: {
    "subchapter1": {
      id: "subchapter1",
      chapterId: "chapter1", // reference to parent chapter
      name: "Linear Equations",
      description: "Solving equations of the form ax + b = c",
      taskCount: 15,
      attemptedTasks: 8,
      lastAttemptedTaskId: "task12",
      progress: 53.3
    },
    "subchapter2": {
      id: "subchapter2",
      chapterId: "chapter1",
      name: "Quadratic Equations",
      description: "Solving equations of the form ax² + bx + c = 0",
      taskCount: 12,
      attemptedTasks: 0,
      lastAttemptedTaskId: null,
      progress: 0
    }
    // more subchapters...
  },
  ids: ["subchapter1", "subchapter2"],
  byChapter: {
    "chapter1": ["subchapter1", "subchapter2"]
    // other chapters and their subchapters...
  },
  status: "succeeded",
  error: null,
  selectedSubchapterId: "subchapter1"
}

// 4. Tasks Slice
const tasksSlice = {
  entities: {
    "task1": {
      id: "task1",
      subchapterId: "subchapter1", // reference to parent subchapter
      title: "Solve for x: 3x + 5 = 14",
      description: "Find the value of x in this linear equation",
      difficulty: "easy",
      attempted: true,
      completed: true,
      score: 100,
      attemptDate: "2025-10-25T14:30:00Z"
    },
    "task2": {
      id: "task2",
      subchapterId: "subchapter1",
      title: "Solve the system of equations: 2x + y = 7, x - y = 1",
      description: "Find the values of x and y that satisfy both equations",
      difficulty: "medium",
      attempted: true,
      completed: false,
      score: 25,
      attemptDate: "2025-10-26T09:15:00Z"
    }
    // more tasks...
  },
  ids: ["task1", "task2"],
  bySubchapter: {
    "subchapter1": ["task1", "task2"]
    // other subchapters and their tasks...
  },
  status: "loading", // currently loading tasks
  error: null,
  filters: {
    difficulty: null, // "easy" | "medium" | "hard" | null
    completed: null, // true | false | null (for all)
  }
}
```

## Traditional MVP Pattern
**Model-View-Presenter** is a UI pattern with three distinct parts:
- **Model**: Manages data, business logic, and rules
- **View**: Displays information and captures user input
- **Presenter**: Acts as a middleman, connecting Model and View

## React's Nearest Equivalent to MVP

### Container/Presentational Pattern

The closest equivalent to MVP in React is the **Container/Presentational Pattern** (also known as Smart/Dumb components):

#### Comparison with MVP

| MVP Component | React Equivalent | Responsibility |
|---------------|-----------------|----------------|
| Model | Redux Store / Context API | Data storage, business logic |
| View | Presentational Components | Rendering UI, forwarding events |
| Presenter | Container Components | Connecting data to views, handling events |

#### Why It's Similar to MVP

1. **Clear Separation of Concerns**:
   - Presentational components focus solely on how things look
   - Container components focus on how things work
   - Data stores manage application state

2. **Unidirectional Data Flow**:
   - Data flows from containers to presentational components as props
   - Events flow from presentational components to containers as callbacks
   - Similar to how Presenter mediates between Model and View

3. **Testability**:
   - Presentational components are pure and easy to test
   - Container logic can be tested independently
   - Same testing benefits as MVP

### Implementation in Modern React

In modern React applications, this pattern is often implemented using:

```jsx
// Presentational Component (View)
const SubjectCard = ({ title, description, progress, onClick }) => (
  <div className="card" onClick={onClick}>
    <h3>{title}</h3>
    <p>{description}</p>
    <ProgressBar value={progress} />
  </div>
);

// Container Component (Presenter)
const SubjectListContainer = () => {
  const subjects = useSelector(state => state.subjects.items);
  const loading = useSelector(state => state.subjects.loading);
  const error = useSelector(state => state.subjects.error);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleSubjectClick = (subjectId) => {
    navigate(`/route/${subjectId}`);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorView message={error} />;
  if (!subjects.length) return <EmptyState message="No subjects found" />;

  return (
    <div className="subject-list">
      {subjects.map(subject => (
        <SubjectCard
          key={subject.id}
          title={subject.title}
          description={subject.description}
          progress={subject.progress}
          onClick={() => handleSubjectClick(subject.id)}
        />
      ))}
    </div>
  );
};

// Redux Store (Model)
const subjectsSlice = createSlice({
  name: 'subjects',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {/*...*/},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});
```

## Key Differences from Traditional MVP

1. **Component Hierarchy vs. Strict Layers**:
   - React uses a component tree rather than strict MVP layers
   - Components can be nested, unlike traditional MVP's flat structure

2. **Hooks Change the Dynamic**:
   - Modern React uses hooks to mix state logic into components
   - This can blur the line between container and presentational components

3. **JSX Combines View Logic and Templates**:
   - Traditional MVP often has separate template files
   - React combines rendering logic and templates in JSX

## When to Use This Pattern

This pattern is most valuable when:
- You need clear separation between UI and business logic
- Components need to be highly reusable across the application
- You want to maximize testability
- The application has complex state management requirements

## Alternatives in React

Other patterns that incorporate some MVP principles:
- **Custom Hooks**: Extract and reuse logic (similar to Presenter)
- **Context + Reducers**: Provide a Model-like structure with easier consumption
- **Render Props**: Share behavior between components in a View-like way