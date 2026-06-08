import { useState } from 'react';
import { Users, CheckCircle2, FileSpreadsheet, FileText, TrendingUp, Trash2 } from 'lucide-react';
import { useSurveyStore } from '@/store/useSurveyStore';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/results/StatCard';
import { SingleChart } from '@/components/results/SingleChart';
import { RatingChart } from '@/components/results/RatingChart';
import { TextAnswers } from '@/components/results/TextAnswers';
import { Button } from '@/components/common/Button';
import { exportToExcel, exportToCSV } from '@/utils/export';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/Modal';

export const ResultsPage = () => {
  const { survey, generateMockResponses, clearResponses } = useSurveyStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const completedResponses = survey.responses.filter((r) => r.completed);
  const completionRate =
    survey.responses.length > 0
      ? ((completedResponses.length / survey.responses.length) * 100).toFixed(1)
      : '0';

  const validQuestions = survey.questions.filter((q) => q.type !== 'group');

  const handleClearData = () => {
    clearResponses();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex-1 min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-xl font-bold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              结果查看
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              查看答题统计和分析结果
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowClearConfirm(true)}>
              <Trash2 className="w-4 h-4" />
              清空数据
            </Button>
            <Button variant="secondary" onClick={() => generateMockResponses(50)}>
              <TrendingUp className="w-4 h-4" />
              生成模拟数据
            </Button>
            <Button onClick={() => setShowExportModal(true)}>
              <FileSpreadsheet className="w-4 h-4" />
              导出数据
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="总答卷数"
            value={survey.responses.length}
            icon={<Users className="w-5 h-5" />}
            trend={`较昨日 +${Math.floor(Math.random() * 20)}`}
            trendUp
          />
          <StatCard
            title="完成率"
            value={`${completionRate}%`}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            title="题目数量"
            value={validQuestions.length}
            icon={<FileText className="w-5 h-5" />}
          />
        </div>

        {survey.responses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-zinc-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              还没有答卷数据
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              生成模拟数据或导出示例数据来查看分析效果
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => generateMockResponses(50)}>
                <TrendingUp className="w-4 h-4" />
                生成模拟数据
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {validQuestions.map((question) => {
              if (question.type === 'single' || question.type === 'ranking') {
                return (
                  <SingleChart
                    key={question.id}
                    question={question}
                    responses={survey.responses}
                  />
                );
              }
              if (question.type === 'multiple') {
                return (
                  <SingleChart
                    key={question.id}
                    question={question}
                    responses={survey.responses}
                  />
                );
              }
              if (question.type === 'rating') {
                return (
                  <RatingChart
                    key={question.id}
                    question={question}
                    responses={survey.responses}
                  />
                );
              }
              if (question.type === 'text') {
                return (
                  <TextAnswers
                    key={question.id}
                    question={question}
                    responses={survey.responses}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </main>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="导出数据"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            选择导出格式，数据将包含所有答卷详情和统计信息
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                exportToExcel(survey);
                setShowExportModal(false);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-zinc-200 hover:border-green-400 hover:bg-green-50 transition-all"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet className="w-7 h-7 text-green-700" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900">Excel 格式</p>
                <p className="text-xs text-zinc-500 mt-0.5">.xlsx 多工作表</p>
              </div>
            </button>
            <button
              onClick={() => {
                exportToCSV(survey);
                setShowExportModal(false);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-zinc-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-700" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900">CSV 格式</p>
                <p className="text-xs text-zinc-500 mt-0.5">.csv 通用格式</p>
              </div>
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="清空数据"
        message="确定要清空所有答卷数据吗？此操作无法撤销。"
      />
    </div>
  );
};
