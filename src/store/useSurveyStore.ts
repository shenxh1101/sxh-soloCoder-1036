import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Survey, Question, Option, LogicRule, QuestionType, Response } from '@/types/survey';

const STORAGE_KEY = 'survey_builder_data';

const createDefaultOptions = (): Option[] => [
  { id: uuidv4(), label: '选项1', value: '1', order: 0 },
  { id: uuidv4(), label: '选项2', value: '2', order: 1 },
];

const createDefaultSurvey = (): Survey => ({
  id: uuidv4(),
  title: '新建问卷',
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: uuidv4(),
      type: 'single',
      title: '示例题目：您的性别是？',
      required: true,
      randomOptions: false,
      order: 0,
      options: [
        { id: uuidv4(), label: '男', value: 'male', order: 0 },
        { id: uuidv4(), label: '女', value: 'female', order: 1 },
        { id: uuidv4(), label: '其他', value: 'other', order: 2 },
      ],
    },
    {
      id: uuidv4(),
      type: 'text',
      title: '示例题目：请谈谈您对我们产品的建议',
      required: false,
      randomOptions: false,
      order: 1,
    },
  ],
  logicRules: [],
  responses: [],
});

const loadFromStorage = (): Survey => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load survey from storage:', e);
  }
  return createDefaultSurvey();
};

interface SurveyStore {
  survey: Survey;
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;

  updateSurveyTitle: (title: string) => void;
  updateSurveyDescription: (description: string) => void;

  addQuestion: (type: QuestionType, afterId?: string) => void;
  addQuestionFromTemplate: (template: { type: QuestionType; title: string; options?: Option[] }, afterId?: string) => void;
  duplicateQuestion: (id: string) => void;
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  reorderQuestions: (items: Question[]) => void;
  moveQuestionToGroup: (questionId: string, groupId: string | undefined) => void;

  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionId: string, label: string) => void;
  deleteOption: (questionId: string, optionId: string) => void;
  batchUpdateOptions: (questionId: string, labels: string[]) => void;

  addLogicRule: (rule: Omit<LogicRule, 'id'>) => void;
  updateLogicRule: (id: string, updates: Partial<LogicRule>) => void;
  deleteLogicRule: (id: string) => void;

  generateMockResponses: (count: number) => void;
  clearResponses: () => void;
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const saveToStorageImpl = (survey: Survey) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...survey,
      updatedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Failed to save survey to storage:', e);
  }
};

const deepCloneQuestion = (question: Question): Question => {
  const clone = JSON.parse(JSON.stringify(question));
  const regenerateIds = (q: Question): Question => {
    q.id = uuidv4();
    if (q.options) {
      q.options = q.options.map(opt => ({ ...opt, id: uuidv4() }));
    }
    if (q.questions) {
      q.questions = q.questions.map(regenerateIds);
    }
    return q;
  };
  return regenerateIds(clone);
};

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  survey: loadFromStorage(),
  selectedQuestionId: null,

  setSelectedQuestionId: (id) => set({ selectedQuestionId: id }),

  updateSurveyTitle: (title) => {
    set((state) => ({ survey: { ...state.survey, title, updatedAt: new Date().toISOString() } }));
    get().saveToStorage();
  },

  updateSurveyDescription: (description) => {
    set((state) => ({ survey: { ...state.survey, description, updatedAt: new Date().toISOString() } }));
    get().saveToStorage();
  },

  addQuestion: (type, afterId) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      title: type === 'group' ? '分组标题' : '请输入题目',
      required: false,
      randomOptions: false,
      order: get().survey.questions.length,
      ...(type === 'group' ? { questions: [] } : {}),
      ...(['single', 'multiple', 'ranking'].includes(type) ? { options: createDefaultOptions() } : {}),
      ...(type === 'multiple' ? { minSelect: 1 } : {}),
    };

    set((state) => {
      let questions = [...state.survey.questions];
      if (afterId) {
        const index = questions.findIndex(q => q.id === afterId);
        questions.splice(index + 1, 0, newQuestion);
      } else {
        questions.push(newQuestion);
      }
      questions = questions.map((q, i) => ({ ...q, order: i }));
      return {
        survey: { ...state.survey, questions, updatedAt: new Date().toISOString() },
        selectedQuestionId: newQuestion.id,
      };
    });
    get().saveToStorage();
  },

  addQuestionFromTemplate: (template, afterId) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: template.type,
      title: template.title,
      required: false,
      randomOptions: false,
      order: get().survey.questions.length,
      options: template.options ? template.options.map(opt => ({ ...opt, id: uuidv4() })) : undefined,
    };

    set((state) => {
      let questions = [...state.survey.questions];
      if (afterId) {
        const index = questions.findIndex(q => q.id === afterId);
        questions.splice(index + 1, 0, newQuestion);
      } else {
        questions.push(newQuestion);
      }
      questions = questions.map((q, i) => ({ ...q, order: i }));
      return {
        survey: { ...state.survey, questions, updatedAt: new Date().toISOString() },
        selectedQuestionId: newQuestion.id,
      };
    });
    get().saveToStorage();
  },

  duplicateQuestion: (id) => {
    set((state) => {
      const index = state.survey.questions.findIndex(q => q.id === id);
      if (index === -1) return state;

      const original = state.survey.questions[index];
      const duplicated = deepCloneQuestion(original);
      duplicated.title = original.title + ' (副本)';
      duplicated.order = index + 1;

      const questions = [...state.survey.questions];
      questions.splice(index + 1, 0, duplicated);
      const reordered = questions.map((q, i) => ({ ...q, order: i }));

      return {
        survey: { ...state.survey, questions: reordered, updatedAt: new Date().toISOString() },
        selectedQuestionId: duplicated.id,
      };
    });
    get().saveToStorage();
  },

  deleteQuestion: (id) => {
    set((state) => {
      const questions = state.survey.questions.filter(q => q.id !== id);
      const reordered = questions.map((q, i) => ({ ...q, order: i }));
      const logicRules = state.survey.logicRules.filter(r => r.questionId !== id && r.targetQuestionId !== id);
      return {
        survey: { ...state.survey, questions: reordered, logicRules, updatedAt: new Date().toISOString() },
        selectedQuestionId: state.selectedQuestionId === id ? null : state.selectedQuestionId,
      };
    });
    get().saveToStorage();
  },

  updateQuestion: (id, updates) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: state.survey.questions.map(q =>
          q.id === id ? { ...q, ...updates } : q
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  reorderQuestions: (items) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: items.map((q, i) => ({ ...q, order: i })),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  moveQuestionToGroup: (questionId, groupId) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: state.survey.questions.map(q =>
          q.id === questionId ? { ...q, groupId } : q
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  addOption: (questionId) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: state.survey.questions.map(q => {
          if (q.id !== questionId || !q.options) return q;
          const newOption: Option = {
            id: uuidv4(),
            label: `选项${q.options.length + 1}`,
            value: String(q.options.length + 1),
            order: q.options.length,
          };
          return { ...q, options: [...q.options, newOption] };
        }),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  updateOption: (questionId, optionId, label) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: state.survey.questions.map(q => {
          if (q.id !== questionId || !q.options) return q;
          return {
            ...q,
            options: q.options.map(opt =>
              opt.id === optionId ? { ...opt, label, value: label } : opt
            ),
          };
        }),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  deleteOption: (questionId, optionId) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: state.survey.questions.map(q => {
          if (q.id !== questionId || !q.options) return q;
          return {
            ...q,
            options: q.options
              .filter(opt => opt.id !== optionId)
              .map((opt, i) => ({ ...opt, order: i })),
          };
        }),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  batchUpdateOptions: (questionId, labels) => {
    set((state) => ({
      survey: {
        ...state.survey,
        questions: state.survey.questions.map(q => {
          if (q.id !== questionId) return q;
          const options: Option[] = labels.map((label, index) => ({
            id: uuidv4(),
            label,
            value: label,
            order: index,
          }));
          return { ...q, options };
        }),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  addLogicRule: (rule) => {
    const newRule: LogicRule = {
      ...rule,
      id: uuidv4(),
    };
    set((state) => ({
      survey: {
        ...state.survey,
        logicRules: [...state.survey.logicRules, newRule],
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  updateLogicRule: (id, updates) => {
    set((state) => ({
      survey: {
        ...state.survey,
        logicRules: state.survey.logicRules.map(r =>
          r.id === id ? { ...r, ...updates } : r
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  deleteLogicRule: (id) => {
    set((state) => ({
      survey: {
        ...state.survey,
        logicRules: state.survey.logicRules.filter(r => r.id !== id),
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  generateMockResponses: (count) => {
    const { survey } = get();
    const responses: Response[] = [];

    for (let i = 0; i < count; i++) {
      const answers: Record<string, string | string[] | number> = {};
      const questions = survey.questions.filter(q => q.type !== 'group');

      questions.forEach(q => {
        switch (q.type) {
          case 'single':
          case 'ranking':
            if (q.options && q.options.length > 0) {
              const randomIndex = Math.floor(Math.random() * q.options.length);
              answers[q.id] = q.options[randomIndex].value;
            }
            break;
          case 'multiple':
            if (q.options && q.options.length > 0) {
              const numSelected = Math.floor(Math.random() * q.options.length) + 1;
              const shuffled = [...q.options].sort(() => Math.random() - 0.5);
              answers[q.id] = shuffled.slice(0, numSelected).map(opt => opt.value);
            }
            break;
          case 'rating':
            answers[q.id] = Math.floor(Math.random() * 5) + 1;
            break;
          case 'text':
            const sampleTexts = [
              '产品整体体验不错，希望能继续优化。',
              '功能很实用，界面也很友好。',
              '建议增加更多的自定义选项。',
              '使用起来很方便，推荐！',
              '还有改进空间，加油！',
            ];
            answers[q.id] = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
            break;
        }
      });

      responses.push({
        id: uuidv4(),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: Math.random() > 0.1,
        answers,
      });
    }

    set((state) => ({
      survey: {
        ...state.survey,
        responses: [...state.survey.responses, ...responses],
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  clearResponses: () => {
    set((state) => ({
      survey: {
        ...state.survey,
        responses: [],
        updatedAt: new Date().toISOString(),
      },
    }));
    get().saveToStorage();
  },

  loadFromStorage: () => {
    set({ survey: loadFromStorage() });
  },

  saveToStorage: () => {
    saveToStorageImpl(get().survey);
  },
}));
