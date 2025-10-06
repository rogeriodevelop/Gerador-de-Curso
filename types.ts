
export interface CourseContent {
  title: string;
  introduction: string;
  modules: CourseModule[];
}

export interface CourseModule {
  title: string;
  durationMinutes: number;
  sections: CourseSection[];
}

export interface CourseSection {
  title:string;
  content: string;
  codeExample?: {
    language: string;
    code: string;
  };
  imageSuggestion?: string;
}

export enum AgentStage {
  Redator = 'Redator',
  Designer = 'Designer',
  Developer = 'Developer',
  QA = 'QA',
}

export interface AgentStatus {
  stage: AgentStage;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}
