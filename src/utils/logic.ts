import { Question, LogicRule, Response } from '@/types/survey';

export const evaluateCondition = (
  answer: string | string[] | number | undefined,
  conditionType: LogicRule['conditionType'],
  conditionValue: string
): boolean => {
  if (answer === undefined || answer === null) return false;

  switch (conditionType) {
    case 'equals':
      if (Array.isArray(answer)) {
        return answer.includes(conditionValue);
      }
      return String(answer) === conditionValue;
    case 'notEquals':
      if (Array.isArray(answer)) {
        return !answer.includes(conditionValue);
      }
      return String(answer) !== conditionValue;
    case 'contains':
      if (Array.isArray(answer)) {
        return answer.some(v => v.includes(conditionValue));
      }
      return String(answer).includes(conditionValue);
    case 'greaterThan':
      return Number(answer) > Number(conditionValue);
    case 'lessThan':
      return Number(answer) < Number(conditionValue);
    default:
      return false;
  }
};

export const getNextQuestionId = (
  currentQuestionId: string,
  questions: Question[],
  logicRules: LogicRule[],
  answers: Response['answers']
): string | null => {
  const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
  if (currentIndex === -1) return null;

  const applicableRule = logicRules.find(rule => {
    if (rule.questionId !== currentQuestionId) return false;
    const answer = answers[currentQuestionId];
    return evaluateCondition(answer, rule.conditionType, rule.conditionValue);
  });

  if (applicableRule) {
    if (applicableRule.skipToEnd) return null;
    if (applicableRule.targetQuestionId) return applicableRule.targetQuestionId;
  }

  for (let i = currentIndex + 1; i < questions.length; i++) {
    if (questions[i].type !== 'group') {
      return questions[i].id;
    }
  }

  return null;
};

export const getQuestionTitle = (questionId: string, questions: Question[]): string => {
  const q = questions.find(question => question.id === questionId);
  return q?.title || '未知题目';
};

export const getConditionTypeLabel = (type: LogicRule['conditionType']): string => {
  const labels: Record<LogicRule['conditionType'], string> = {
    equals: '等于',
    notEquals: '不等于',
    contains: '包含',
    greaterThan: '大于',
    lessThan: '小于',
  };
  return labels[type];
};
