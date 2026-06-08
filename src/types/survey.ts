export type QuestionType = 'single' | 'multiple' | 'text' | 'rating' | 'ranking' | 'group';

export interface Option {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  randomOptions: boolean;
  minSelect?: number;
  maxSelect?: number;
  groupId?: string;
  order: number;
  options?: Option[];
  questions?: Question[];
}

export interface LogicRule {
  id: string;
  questionId: string;
  conditionType: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  conditionValue: string;
  targetQuestionId?: string;
  skipToEnd: boolean;
}

export interface Response {
  id: string;
  createdAt: string;
  completed: boolean;
  answers: Record<string, string | string[] | number>;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  logicRules: LogicRule[];
  responses: Response[];
}

export interface QuestionTemplate {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  category: string;
  options?: Option[];
}
