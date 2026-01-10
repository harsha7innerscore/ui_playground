/**
 * Data generator utilities for self-study feature testing
 * Provides methods for generating test data specific to self-study functionality
 */

export interface SelfStudySessionData {
  id?: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress: number; // percentage 0-100
  startDate?: Date;
  completedDate?: Date;
}

export interface StudyGoalData {
  id?: string;
  title: string;
  description: string;
  targetDate: Date;
  isCompleted: boolean;
  progress: number; // percentage 0-100
}

export interface StudyNoteData {
  id?: string;
  sessionId?: string;
  title: string;
  content: string;
  createdDate: Date;
  lastModified: Date;
  tags: string[];
}

/**
 * Generate random test data for self-study features
 */
export class SelfStudyDataGenerator {
  private static readonly SUBJECTS = [
    'Mathematics', 'Science', 'History', 'English', 'Programming',
    'Spanish', 'Art', 'Music', 'Philosophy', 'Psychology'
  ];

  private static readonly SESSION_TITLES = [
    'Introduction to Algebra', 'World War II Overview', 'JavaScript Basics',
    'Spanish Grammar', 'Ancient Rome History', 'Calculus Fundamentals',
    'Poetry Analysis', 'Color Theory', 'Cognitive Psychology', 'Ethics in Philosophy'
  ];

  private static readonly TAGS = [
    'homework', 'exam-prep', 'review', 'practice', 'assignment',
    'research', 'notes', 'important', 'difficult', 'favorite'
  ];

  private static readonly GOAL_TITLES = [
    'Complete Math Course', 'Finish History Project', 'Master Programming Concepts',
    'Improve Language Skills', 'Prepare for Finals', 'Learn New Framework'
  ];

  /**
   * Generate random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random string of specified length
   */
  static randomString(length: number, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random UUID
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Pick random item from array
   */
  static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Pick random items from array
   */
  static randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Generate random study session data
   */
  static studySession(overrides: Partial<SelfStudySessionData> = {}): SelfStudySessionData {
    const title = this.randomChoice(this.SESSION_TITLES);
    const subject = this.randomChoice(this.SUBJECTS);
    const status = this.randomChoice(['not_started', 'in_progress', 'completed', 'paused']);

    return {
      id: this.uuid(),
      title,
      subject,
      duration: this.randomInt(15, 180), // 15 minutes to 3 hours
      difficulty: this.randomChoice(['beginner', 'intermediate', 'advanced']),
      tags: this.randomChoices(this.TAGS, this.randomInt(1, 3)),
      status,
      progress: status === 'completed' ? 100 : this.randomInt(0, 95),
      startDate: new Date(Date.now() - this.randomInt(0, 7) * 24 * 60 * 60 * 1000), // within last week
      completedDate: status === 'completed' ? new Date() : undefined,
      ...overrides
    };
  }

  /**
   * Generate random study goal data
   */
  static studyGoal(overrides: Partial<StudyGoalData> = {}): StudyGoalData {
    const title = this.randomChoice(this.GOAL_TITLES);
    const isCompleted = Math.random() > 0.7; // 30% chance of being completed

    return {
      id: this.uuid(),
      title,
      description: `Complete all requirements for ${title.toLowerCase()} including assignments and practice.`,
      targetDate: new Date(Date.now() + this.randomInt(1, 30) * 24 * 60 * 60 * 1000), // within next month
      isCompleted,
      progress: isCompleted ? 100 : this.randomInt(0, 80),
      ...overrides
    };
  }

  /**
   * Generate random study note data
   */
  static studyNote(overrides: Partial<StudyNoteData> = {}): StudyNoteData {
    const titles = [
      'Key Concepts', 'Important Formulas', 'Study Reminders', 'Practice Problems',
      'Questions to Review', 'Summary Notes', 'Exam Tips', 'Quick Reference'
    ];

    const title = this.randomChoice(titles);
    const createdDate = new Date(Date.now() - this.randomInt(0, 14) * 24 * 60 * 60 * 1000);

    return {
      id: this.uuid(),
      sessionId: this.uuid(),
      title,
      content: `This is a sample note about ${title.toLowerCase()}. Contains important information for study review.`,
      createdDate,
      lastModified: new Date(createdDate.getTime() + this.randomInt(0, 3) * 24 * 60 * 60 * 1000),
      tags: this.randomChoices(this.TAGS, this.randomInt(1, 2)),
      ...overrides
    };
  }

  /**
   * Generate multiple study sessions
   */
  static studySessions(count: number, overrides: Partial<SelfStudySessionData> = {}): SelfStudySessionData[] {
    return Array.from({ length: count }, () => this.studySession(overrides));
  }

  /**
   * Generate multiple study goals
   */
  static studyGoals(count: number, overrides: Partial<StudyGoalData> = {}): StudyGoalData[] {
    return Array.from({ length: count }, () => this.studyGoal(overrides));
  }

  /**
   * Generate multiple study notes
   */
  static studyNotes(count: number, overrides: Partial<StudyNoteData> = {}): StudyNoteData[] {
    return Array.from({ length: count }, () => this.studyNote(overrides));
  }

  /**
   * Generate test scenarios specific to self-study features
   */
  static scenarios = {
    /**
     * Generate a new study session
     */
    newSession: (): SelfStudySessionData => this.studySession({ status: 'not_started', progress: 0 }),

    /**
     * Generate an active study session
     */
    activeSession: (): SelfStudySessionData => this.studySession({
      status: 'in_progress',
      progress: this.randomInt(10, 80),
      startDate: new Date(Date.now() - this.randomInt(1, 6) * 60 * 60 * 1000) // started 1-6 hours ago
    }),

    /**
     * Generate a completed study session
     */
    completedSession: (): SelfStudySessionData => this.studySession({
      status: 'completed',
      progress: 100,
      completedDate: new Date(Date.now() - this.randomInt(0, 7) * 24 * 60 * 60 * 1000)
    }),

    /**
     * Generate a long study session
     */
    longSession: (): SelfStudySessionData => this.studySession({
      duration: this.randomInt(120, 240) // 2-4 hours
    }),

    /**
     * Generate an overdue goal
     */
    overdueGoal: (): StudyGoalData => this.studyGoal({
      targetDate: new Date(Date.now() - this.randomInt(1, 7) * 24 * 60 * 60 * 1000), // overdue by 1-7 days
      isCompleted: false,
      progress: this.randomInt(30, 70)
    }),

    /**
     * Generate a completed goal
     */
    completedGoal: (): StudyGoalData => this.studyGoal({
      isCompleted: true,
      progress: 100
    }),
  };
}

/**
 * Test data builder for fluent API specific to self-study features
 */
export class SelfStudyTestDataBuilder {
  static session(): SessionDataBuilder {
    return new SessionDataBuilder();
  }

  static goal(): GoalDataBuilder {
    return new GoalDataBuilder();
  }

  static note(): NoteDataBuilder {
    return new NoteDataBuilder();
  }
}

export class SessionDataBuilder {
  private data: Partial<SelfStudySessionData> = {};

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withSubject(subject: string): this {
    this.data.subject = subject;
    return this;
  }

  withDuration(duration: number): this {
    this.data.duration = duration;
    return this;
  }

  withDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): this {
    this.data.difficulty = difficulty;
    return this;
  }

  withStatus(status: 'not_started' | 'in_progress' | 'completed' | 'paused'): this {
    this.data.status = status;
    return this;
  }

  withProgress(progress: number): this {
    this.data.progress = progress;
    return this;
  }

  withTags(tags: string[]): this {
    this.data.tags = tags;
    return this;
  }

  completed(): this {
    this.data.status = 'completed';
    this.data.progress = 100;
    this.data.completedDate = new Date();
    return this;
  }

  active(): this {
    this.data.status = 'in_progress';
    this.data.startDate = new Date();
    return this;
  }

  build(): SelfStudySessionData {
    return SelfStudyDataGenerator.studySession(this.data);
  }
}

export class GoalDataBuilder {
  private data: Partial<StudyGoalData> = {};

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  withTargetDate(targetDate: Date): this {
    this.data.targetDate = targetDate;
    return this;
  }

  withProgress(progress: number): this {
    this.data.progress = progress;
    return this;
  }

  completed(): this {
    this.data.isCompleted = true;
    this.data.progress = 100;
    return this;
  }

  overdue(): this {
    this.data.targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
    this.data.isCompleted = false;
    return this;
  }

  build(): StudyGoalData {
    return SelfStudyDataGenerator.studyGoal(this.data);
  }
}

export class NoteDataBuilder {
  private data: Partial<StudyNoteData> = {};

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withContent(content: string): this {
    this.data.content = content;
    return this;
  }

  withSessionId(sessionId: string): this {
    this.data.sessionId = sessionId;
    return this;
  }

  withTags(tags: string[]): this {
    this.data.tags = tags;
    return this;
  }

  build(): StudyNoteData {
    return SelfStudyDataGenerator.studyNote(this.data);
  }
}