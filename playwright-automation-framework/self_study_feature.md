# Self Study Feature - Complete Documentation

## Overview

The Self Study feature is a comprehensive learning system that allows students to independently navigate through subjects, topics, and subtopics to complete various learning tasks. The feature provides a structured learning path with progress tracking, task management, and adaptive learning experiences.

## Architecture Overview

The Self Study feature is built using React and follows a modular component architecture with the following key layers:

- **Route Layer**: `app/routes/syllabus.jsx` - Main route handler
- **Page Layer**: `app/pages/ai-tutor/Syllabus/SyllabusComponent.jsx` - Core business logic
- **Component Layer**: Various molecules and atoms for UI rendering
- **State Management**: Redux for data state, React Context for navigation state

## Core Components

### 1. Syllabus Route (`app/routes/syllabus.jsx`)

**Purpose**: Entry point and navigation orchestrator

**Key Responsibilities**:

- URL parameter management (subjectName, topicName, subtopicName)
- Navigation state determination (subjects vs topics view)
- Context provider setup (TutorProvider, PracticeProvider)
- Session data initialization and cleanup

**Navigation Flow**:

- `subjects` view: Shows subject selection grid
- `topics` view: Shows accordion-style topic/subtopic interface

### 2. SyllabusComponent (`app/pages/ai-tutor/Syllabus/SyllabusComponent.jsx`)

**Purpose**: Main business logic orchestrator and data management hub

**Key Responsibilities**:

- **Data Management**: Fetches and manages subjects, topics, subtopics, task progress
- **User State**: Handles student modes, learning credits, nudges
- **Task Management**: Orchestrates task creation, navigation, and completion
- **API Integration**: Coordinates multiple API calls for data synchronization

**Critical Functions**:

- `fetchSubjects()`: Loads available subjects
- `fetchTopicsSubtopics()`: Loads topics and subtopics for subjects
- `fetchTaskProgressList()`: Loads task progress data
- `handleAccordionTaskClick()`: Manages task interactions
- `createSelfLearn()`: Creates self-directed learning tasks
- `handleRevisionTaskClick()`: Manages revision functionality

### 3. SubjectsView (`app/components/molecules/accordionNew/SubjectsView.jsx`)

**Purpose**: Subject selection interface

**Features**:

- Grid layout of subject cards with icons
- "Continue studying" section showing recent tasks
- Mobile-responsive task card pagination
- Learning credits integration
- User guidance and onboarding

### 4. AccordionView (`app/components/molecules/accordionNew/AccordionView.jsx`)

**Purpose**: Main learning interface with expandable content

**Key Components**:

- **SubjectTab**: Subject selection tabs
- **TopicList**: Chapter/topic selection with progress tracking
- **SubtopicList**: Expandable subtopic interface with task management

**Features**:

- Responsive design (mobile/desktop layouts)
- Progress visualization with completion percentages
- Revision section with study sessions
- Breadcrumb navigation
- Task timeline and activity tracking

### 5. AccordionTaskView (`app/components/molecules/accordionNew/AccordionTaskView.jsx`)

**Purpose**: Task display and interaction interface

**Features**:

- Task timeline with chronological ordering
- Task type icons and status indicators
- Performance badges and completion tracking
- View more/less functionality for task history
- Learning credits restrictions and tooltips

### 6. AccordionSelfLearnButtons (`app/components/molecules/accordionNew/accordionSelfLearnButtons.jsx`)

**Purpose**: Action buttons for self-directed learning

**Button Types**:

- **Assessment Practice**: Test knowledge with assessments
- **Guided Practice**: Step-by-step practice sessions
- **Learn**: Core learning content
- **Prerequisite**: Foundation knowledge building

**Conditional Rendering**:

- Normal tasks: All three button types
- Chapter end assessments: Assessment + Guided practice
- Prerequisites: Only prerequisite button
- Custom assessments: No buttons displayed

### 7. TopContainer (`app/components/atoms/TopContainer/TopContainer.jsx`)

**Purpose**: User guidance and credits display

**Features**:

- AI assistant avatar and personalized greetings
- Context-sensitive welcome messages
- Learning credits container integration
- Low balance warnings and styling

## User Journey Flow

### 1. Initial Landing

1. User navigates to `/syllabus`
2. System initializes with subjects view
3. AI assistant welcomes user with guidance
4. Recent tasks displayed in "Continue studying" section

### 2. Subject Selection

1. User sees subject grid with icons (Math, Science, English, etc.)
2. User clicks on subject card
3. System fetches topics/subtopics for selected subject
4. Navigation transitions to topics view

### 3. Topic/Chapter Navigation

1. User sees topic list with progress indicators
2. Desktop: Topic list on left, subtopic details on right
3. Mobile: Breadcrumb navigation, topic-focused view
4. User selects topic to expand subtopics

### 4. Subtopic Interaction

1. User clicks subtopic to expand accordion
2. System fetches task progress data
3. Task timeline displays with activity history
4. Self-learn buttons appear for new tasks

### 5. Task Execution

1. User clicks self-learn button or task item
2. System creates/resumes task based on status
3. Navigation to practice/review screen
4. Progress tracked and synchronized

### 6. Revision Flow

1. Available after completing subtopics in a topic
2. Mock assessments and revision sessions
3. Recap Map for comprehensive review
4. Session history tracking

## Data Models

### Subject Structure

```javascript
{
  _id: "string",
  name: "string",
  master_uuid: "string"
}
```

### Topic Structure

```javascript
{
  topic: {
    topicId: "string",
    topicMasterUuid: "string",
    topicInfo: {
      name: "string",
      topic_features: {
        Assessment: { is_enabled: boolean },
        GuidedPractice: { is_enabled: boolean },
        Learn: { is_enabled: boolean },
        Revision: { is_enabled: boolean },
        Handwriting: { is_enabled: boolean }
      }
    }
  },
  subtopics: [SubtopicObject]
}
```

### Task Structure

```javascript
{
  _id: "string",
  journeyId: "string",
  taskType: "assessment|guidedPractise|learnSubtopic|revision",
  taskStatus: "notstarted|inprogress|completed",
  taskAttributes: {
    topicName: "string",
    subtopicName: "string",
    proficiencyLevel: "proficient|advanced"
  },
  analytics: {
    percentage: number
  },
  createdBy: "student|system",
  dueDate: "date",
  endedAt: "date"
}
```

## State Management

### Redux Slices

- **subjectSlice**: Subject list and loading states
- **topicsSubtopicsSlice**: Topic/subtopic data
- **accordionTopicProgressSlice**: Topic completion progress
- **accordionTaskProgressListSlice**: Task history and progress
- **accordionSubtopicLastTaskPerformanceSlice**: Subtopic performance data

### Context Providers

- **TutorProvider**: Learning session management
- **PracticeProvider**: Practice mode state
- **RootContext**: Global application state

## Learning Credits System

### Student Modes

- **NORMAL**: Full access to all features
- **FREE**: Limited access, requires credits for advanced features
- **SMART_LEARN**: Enhanced features with credit consumption

### Credit Management

- Credit balance tracking and display
- Nudge system for credit requests
- Parental notification system
- Feature restriction enforcement

## Task Types and Features

### 1. Assessment Practice

- Multiple choice questions
- Performance tracking with badges
- Immediate feedback and explanations
- Proficiency level progression

### 2. Guided Practice

- Step-by-step problem solving
- Hint system and guidance
- Adaptive difficulty adjustment
- Real-time assistance

### 3. Learn Subtopic

- Core content delivery
- Interactive learning modules
- Progress checkpoints
- Knowledge reinforcement

### 4. Revision

- Comprehensive topic review
- Mock assessments
- Spaced repetition algorithm
- Performance analytics

### 5. Prerequisite Learning

- Foundation knowledge building
- Prerequisite identification
- Targeted skill development
- Mastery verification

## Technical Implementation Details

### API Integration

- **getSubjectsListV2()**: Fetches available subjects
- **getTopicsSubtopicsList()**: Loads topic/subtopic hierarchy
- **getStudentTopicProgressData()**: Progress tracking data
- **getTaskProgressList()**: Task history and status
- **callSelfLearn()**: Creates self-directed learning tasks
- **startTask()**: Initializes task sessions

### Performance Optimizations

- Lazy loading of components with React.Suspense
- Memoized components to prevent unnecessary re-renders
- Progressive data fetching (subjects → topics → subtopics → tasks)
- Efficient state updates with Redux Toolkit

### Responsive Design

- Mobile-first approach with Chakra UI breakpoints
- Adaptive layouts for different screen sizes
- Touch-friendly interactions on mobile
- Desktop-optimized multi-column layouts

## Error Handling and Edge Cases

### User Authentication

- Session validation and renewal
- Automatic logout on session expiry
- Forbidden access handling with ForbiddenLayout

### Data Loading States

- Skeleton loading components
- Progressive enhancement
- Error boundaries for component failures
- Retry mechanisms for failed API calls

### User Experience

- Empty state handling with informative messages
- Loading states for all async operations
- Toast notifications for user feedback
- Graceful degradation for feature unavailability

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Role Attributes**: Proper semantic structure
- **Focus Management**: Logical focus order and indicators
- **Color Contrast**: WCAG compliant color combinations

## Analytics and Tracking

### User Behavior Tracking

- Subject selection patterns
- Task completion rates
- Time spent on activities
- Learning path optimization

### Performance Metrics

- Task success rates by difficulty
- Common error patterns
- Feature usage analytics
- A/B testing capabilities

## Security Considerations

- User data encryption in transit and at rest
- Session management and CSRF protection
- Input validation and sanitization
- Role-based access control

## Future Enhancement Opportunities

1. **AI-Powered Recommendations**: Personalized learning path suggestions
2. **Collaborative Learning**: Peer interaction and group study features
3. **Advanced Analytics**: Predictive modeling for learning outcomes
4. **Gamification**: Achievement systems and leaderboards
5. **Offline Capabilities**: Content caching for offline access
6. **Multi-language Support**: Internationalization and localization

## Testing Considerations

The Self Study feature requires comprehensive testing across multiple dimensions:

- **Unit Testing**: Individual component behavior
- **Integration Testing**: Component interaction flows
- **E2E Testing**: Complete user journey validation
- **Accessibility Testing**: Screen reader and keyboard navigation
- **Performance Testing**: Load testing and optimization
- **Mobile Testing**: Cross-device compatibility
- **API Testing**: Backend service integration

This documentation provides a complete overview of the Self Study feature's architecture, functionality, and implementation details, serving as a comprehensive reference for development, testing, and maintenance activities.
