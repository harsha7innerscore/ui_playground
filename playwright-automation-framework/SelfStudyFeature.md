# Self Study Feature Documentation

## Overview
The Self Study feature is a comprehensive learning management system that allows students to navigate through their curriculum, track progress, and access various learning materials and assessments.

## Location and Routing
- **Route**: The feature is accessible through routes containing "syllabus" in the path
- **Navigation**: Located at the syllabus route of the application

## Data Structure

### Hierarchical Organization
The Self Study feature organizes learning content in a three-tier hierarchy:

1. **Subjects** - Top-level academic subjects
2. **Topics (Chapters)** - Subject subdivisions containing related content
3. **Subtopics (Sub-chapters)** - Granular learning units within topics

## Special Subtopics

### Core Special Subtopics (Common to Most Subtopics)
The following special subtopics are available across almost all regular subtopics:

1. **Prerequisite** - Foundation knowledge required before starting the subtopic
2. **Chapter End Assessment (Proficient)** - Basic level assessment at chapter completion
3. **Chapter End Assessment (Advanced)** - Advanced level assessment at chapter completion
4. **Multi Subtopic Assessment** - Assessment covering multiple related subtopics

### Additional Special Subtopics
Two additional special subtopics that exist for all subtopics:

5. **Revision** - Review materials and practice content
6. **Recap** - Summary and consolidation materials

### Backend Dependency
- The visibility of these 5 special subtopics is controlled by backend configuration
- Special subtopics may or may not be displayed for a given topic depending on backend settings

## Key Features

### Progress Tracking
- **Subtopic Completion Counter**: Displays how many subtopics the student has attempted out of all available subtopics
- **Exclusion Rule**: Special subtopics are NOT included in the completion counter
- **Performance Display**: Shows the last performance result for each regular subtopic (excluding special subtopics)

### User Interactions

#### Subtopic Navigation
- **Click Action**: When a user taps on any subtopic (normal or special)
- **Result**: Displays the task progress view for the selected subtopic
- **Task Progress Navigation**: Clicking on individual task progress items navigates to their respective execution flows

## Technical Implementation Notes

### Data Filtering
- Regular subtopics and special subtopics are handled differently in progress calculations
- Special subtopics are excluded from completion statistics but included in navigation

### State Management
- Track attempted vs. available subtopics
- Maintain last performance data for each subtopic
- Handle backend-dependent special subtopic visibility

### Navigation Flow
```
Syllabus Route → Subject → Topic → Subtopic → Task Progress → Execution Flow
```

## Testing Considerations

### Test Scenarios
1. Verify proper display of subjects, topics, and subtopics hierarchy
2. Validate special subtopics appear based on backend configuration
3. Confirm progress tracking excludes special subtopics from counts
4. Test navigation flow from subtopics to task progress to execution
5. Verify performance data display for regular subtopics
6. Ensure proper handling of backend-dependent special subtopic visibility

### Edge Cases
- Topics with no available subtopics
- All subtopics completed vs. partially completed states
- Backend configuration changes affecting special subtopic visibility
- Navigation state management across different execution flows