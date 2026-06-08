import { v4 as uuidv4 } from 'uuid';
import { Survey, Question, Response } from '@/types/survey';

export const generateMockResponses = (survey: Survey, count: number): Response[] => {
  const responses: Response[] = [];

  for (let i = 0; i < count; i++) {
    const answers: Response['answers'] = {};
    const validQuestions = survey.questions.filter(q => q.type !== 'group');

    validQuestions.forEach(q => {
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
            '期待更多新功能的推出。',
            '满足了我的基本需求。',
            '价格合理，质量不错。',
          ];
          answers[q.id] = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
          break;
      }
    });

    responses.push({
      id: uuidv4(),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: Math.random() > 0.15,
      answers,
    });
  }

  return responses;
};

export const calculateQuestionStats = (question: Question, responses: Response[]) => {
  const completedResponses = responses.filter(r => r.completed);
  const answeredCount = completedResponses.filter(
    r => r.answers[question.id] !== undefined
  ).length;

  if (question.type === 'single' || question.type === 'ranking') {
    const counts: Record<string, { label: string; count: number; value: string }> = {};
    question.options?.forEach(opt => {
      counts[opt.value] = { label: opt.label, count: 0, value: opt.value };
    });

    completedResponses.forEach(r => {
      const answer = r.answers[question.id];
      if (answer && typeof answer === 'string' && counts[answer]) {
        counts[answer].count++;
      }
    });

    return {
      type: question.type,
      answeredCount,
      totalCount: completedResponses.length,
      data: Object.values(counts),
    };
  }

  if (question.type === 'multiple') {
    const counts: Record<string, { label: string; count: number; value: string }> = {};
    question.options?.forEach(opt => {
      counts[opt.value] = { label: opt.label, count: 0, value: opt.value };
    });

    completedResponses.forEach(r => {
      const answer = r.answers[question.id];
      if (Array.isArray(answer)) {
        answer.forEach(v => {
          if (counts[v]) counts[v].count++;
        });
      }
    });

    return {
      type: question.type,
      answeredCount,
      totalCount: completedResponses.length,
      data: Object.values(counts),
    };
  }

  if (question.type === 'rating') {
    const ratings: number[] = [];
    completedResponses.forEach(r => {
      const answer = r.answers[question.id];
      if (typeof answer === 'number') ratings.push(answer);
    });

    const avg = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    const distribution = [1, 2, 3, 4, 5].map(score => ({
      label: `${score} 分`,
      count: ratings.filter(r => r === score).length,
      value: String(score),
    }));

    return {
      type: question.type,
      answeredCount,
      totalCount: completedResponses.length,
      average: avg,
      data: distribution,
    };
  }

  if (question.type === 'text') {
    const textAnswers: string[] = [];
    completedResponses.forEach(r => {
      const answer = r.answers[question.id];
      if (typeof answer === 'string' && answer.trim()) {
        textAnswers.push(answer);
      }
    });

    return {
      type: question.type,
      answeredCount,
      totalCount: completedResponses.length,
      data: textAnswers,
    };
  }

  return null;
};
