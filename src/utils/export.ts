import * as XLSX from 'xlsx';
import { Survey, Question } from '@/types/survey';

interface ExportData {
  问卷标题: string;
  导出时间: string;
  总答卷数: number;
  完成率: string;
}

const getAnswerDisplay = (
  answer: string | string[] | number | undefined,
  question: Question
): string => {
  if (answer === undefined || answer === null) return '';

  switch (question.type) {
    case 'single':
    case 'ranking':
      if (question.options) {
        const opt = question.options.find(o => o.value === answer);
        return opt?.label || String(answer);
      }
      return String(answer);
    case 'multiple':
      if (Array.isArray(answer) && question.options) {
        return answer
          .map(v => {
            const opt = question.options?.find(o => o.value === v);
            return opt?.label || v;
          })
          .join('、');
      }
      return String(answer);
    case 'rating':
      return `${answer} 分`;
    case 'text':
      return String(answer);
    default:
      return String(answer);
  }
};

export const exportToExcel = (survey: Survey) => {
  const completedResponses = survey.responses.filter(r => r.completed);
  const validQuestions = survey.questions.filter(q => q.type !== 'group');

  const summaryData: ExportData[] = [
    {
      问卷标题: survey.title,
      导出时间: new Date().toLocaleString('zh-CN'),
      总答卷数: survey.responses.length,
      完成率: survey.responses.length > 0
        ? `${((completedResponses.length / survey.responses.length) * 100).toFixed(1)}%`
        : '0%',
    },
  ];

  const header = ['答卷ID', '提交时间', '是否完成', ...validQuestions.map(q => q.title)];
  const responseData: (string | number)[][] = [header];

  survey.responses.forEach(response => {
    const row: (string | number)[] = [
      response.id.slice(0, 8),
      new Date(response.createdAt).toLocaleString('zh-CN'),
      response.completed ? '是' : '否',
    ];

    validQuestions.forEach(question => {
      const answer = response.answers[question.id];
      row.push(getAnswerDisplay(answer, question));
    });

    responseData.push(row);
  });

  const statsData: (string | number)[][] = [
    ['题目统计'],
    ['题目', '类型', '答题人数', '选项分布'],
  ];

  validQuestions.forEach(question => {
    const answeredCount = survey.responses.filter(
      r => r.answers[question.id] !== undefined && r.completed
    ).length;

    let distribution = '';
    if (['single', 'multiple', 'ranking'].includes(question.type) && question.options) {
      const counts: Record<string, number> = {};
      question.options.forEach(opt => {
        counts[opt.label] = 0;
      });

      survey.responses
        .filter(r => r.completed)
        .forEach(r => {
          const answer = r.answers[question.id];
          if (Array.isArray(answer)) {
            answer.forEach(v => {
              const opt = question.options?.find(o => o.value === v);
              if (opt) counts[opt.label]++;
            });
          } else if (answer !== undefined) {
            const opt = question.options?.find(o => o.value === answer);
            if (opt) counts[opt.label]++;
          }
        });

      distribution = Object.entries(counts)
        .map(([label, count]) => `${label}: ${count} (${answeredCount > 0 ? ((count / answeredCount) * 100).toFixed(1) : 0}%)`)
        .join('; ');
    } else if (question.type === 'rating') {
      const ratings: number[] = [];
      survey.responses
        .filter(r => r.completed)
        .forEach(r => {
          const answer = r.answers[question.id];
          if (typeof answer === 'number') ratings.push(answer);
        });
      const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : '0';
      distribution = `平均分: ${avg}`;
    }

    const typeMap: Record<string, string> = {
      single: '单选题',
      multiple: '多选题',
      text: '填空题',
      rating: '评分题',
      ranking: '排序题',
    };

    statsData.push([
      question.title,
      typeMap[question.type] || question.type,
      answeredCount,
      distribution,
    ]);
  });

  const wb = XLSX.utils.book_new();
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  const responsesWs = XLSX.utils.aoa_to_sheet(responseData);
  const statsWs = XLSX.utils.aoa_to_sheet(statsData);

  XLSX.utils.book_append_sheet(wb, summaryWs, '汇总');
  XLSX.utils.book_append_sheet(wb, responsesWs, '答卷详情');
  XLSX.utils.book_append_sheet(wb, statsWs, '题目统计');

  summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }];
  responsesWs['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 10 },
    ...validQuestions.map(() => ({ wch: 20 })),
  ];
  statsWs['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 60 }];

  XLSX.writeFile(wb, `${survey.title}_调研结果_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`);
};

export const exportToCSV = (survey: Survey) => {
  const validQuestions = survey.questions.filter(q => q.type !== 'group');

  const header = ['答卷ID', '提交时间', '是否完成', ...validQuestions.map(q => `"${q.title}"`)];
  const rows: string[] = [header.join(',')];

  survey.responses.forEach(response => {
    const row: string[] = [
      `"${response.id.slice(0, 8)}"`,
      `"${new Date(response.createdAt).toLocaleString('zh-CN')}"`,
      response.completed ? '"是"' : '"否"',
    ];

    validQuestions.forEach(question => {
      const answer = response.answers[question.id];
      row.push(`"${getAnswerDisplay(answer, question)}"`);
    });

    rows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${survey.title}_调研结果_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
