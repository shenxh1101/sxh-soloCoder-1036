import { useState } from 'react';
import { Plus, Trash2, ArrowRight, GitBranch } from 'lucide-react';
import { useSurveyStore } from '@/store/useSurveyStore';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { getConditionTypeLabel, getQuestionTitle } from '@/utils/logic';
import { LogicRule } from '@/types/survey';
import { ConfirmModal } from '@/components/common/Modal';

export const LogicPage = () => {
  const { survey, addLogicRule, deleteLogicRule } = useSurveyStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const validQuestions = survey.questions.filter(
    (q) => q.type !== 'group' && q.options
  );

  const [newRule, setNewRule] = useState<Omit<LogicRule, 'id'>>({
    questionId: validQuestions[0]?.id || '',
    conditionType: 'equals',
    conditionValue: '',
    skipToEnd: false,
    targetQuestionId: undefined,
  });

  const handleAddRule = () => {
    if (!newRule.questionId || !newRule.conditionValue) return;
    if (!newRule.skipToEnd && !newRule.targetQuestionId) return;

    addLogicRule(newRule);
    setShowAddModal(false);
    setNewRule({
      questionId: validQuestions[0]?.id || '',
      conditionType: 'equals',
      conditionValue: '',
      skipToEnd: false,
      targetQuestionId: undefined,
    });
  };

  const selectedQuestion = survey.questions.find(
    (q) => q.id === newRule.questionId
  );

  const conditionTypeOptions = [
    { value: 'equals', label: '等于' },
    { value: 'notEquals', label: '不等于' },
    { value: 'contains', label: '包含' },
  ];

  const targetQuestionOptions = [
    { value: '__end__', label: '直接结束问卷' },
    ...survey.questions
      .filter((q) => q.type !== 'group')
      .map((q) => ({ value: q.id, label: q.title })),
  ];

  return (
    <div className="flex-1 min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-xl font-bold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              逻辑设置
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              设置跳题规则，根据答题者的选择跳转到指定题目
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            disabled={validQuestions.length === 0}
          >
            <Plus className="w-4 h-4" />
            添加规则
          </Button>
        </div>

        {validQuestions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-zinc-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-2xl flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              暂无可设置逻辑的题目
            </h3>
            <p className="text-sm text-zinc-500">
              请先添加带有选项的题目（单选题、多选题、排序题）
            </p>
          </div>
        ) : survey.logicRules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-zinc-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-2xl flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              还没有逻辑规则
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              添加跳题规则，实现问卷的智能跳转
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              添加规则
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {survey.logicRules.map((rule) => {
              const sourceQuestion = survey.questions.find(
                (q) => q.id === rule.questionId
              );
              const targetLabel = rule.skipToEnd
                ? '结束问卷'
                : getQuestionTitle(rule.targetQuestionId || '', survey.questions);
              const selectedOption = sourceQuestion?.options?.find(
                (o) => o.value === rule.conditionValue
              );

              return (
                <Card key={rule.id} hover>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <GitBranch className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-500 mb-0.5">
                              当题目
                            </p>
                            <p className="font-medium text-zinc-900 truncate">
                              {sourceQuestion?.title}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium flex-shrink-0">
                            {getConditionTypeLabel(rule.conditionType)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-500 mb-0.5">
                              答案为
                            </p>
                            <p className="font-medium text-blue-700 truncate">
                              {selectedOption?.label || rule.conditionValue}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-500 mb-0.5">
                              跳转到
                            </p>
                            <p className="font-medium text-orange-600 truncate">
                              {targetLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(rule.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加逻辑规则"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddRule}>添加规则</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              选择题目
            </label>
            <Select
              value={newRule.questionId}
              onChange={(e) =>
                setNewRule({ ...newRule, questionId: e.target.value, conditionValue: '' })
              }
              options={validQuestions.map((q) => ({
                value: q.id,
                label: q.title,
              }))}
            />
          </div>

          {selectedQuestion && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  条件类型
                </label>
                <Select
                  value={newRule.conditionType}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      conditionType: e.target.value as LogicRule['conditionType'],
                    })
                  }
                  options={conditionTypeOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  选项值
                </label>
                <Select
                  value={newRule.conditionValue}
                  onChange={(e) =>
                    setNewRule({ ...newRule, conditionValue: e.target.value })
                  }
                  options={[
                    { value: '', label: '请选择' },
                    ...selectedQuestion.options!.map((o) => ({
                      value: o.value,
                      label: o.label,
                    })),
                  ]}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              跳转到
            </label>
            <Select
              value={newRule.skipToEnd ? '__end__' : newRule.targetQuestionId || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '__end__') {
                  setNewRule({ ...newRule, skipToEnd: true, targetQuestionId: undefined });
                } else {
                  setNewRule({ ...newRule, skipToEnd: false, targetQuestionId: value });
                }
              }}
              options={targetQuestionOptions}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-medium">规则预览：</span> 当「
              {selectedQuestion?.title || '题目'}」的答案{' '}
              {getConditionTypeLabel(newRule.conditionType)}「
              {newRule.conditionValue || '选项'}」时，跳转到「
              {newRule.skipToEnd
                ? '结束问卷'
                : getQuestionTitle(newRule.targetQuestionId || '', survey.questions) || '题目'}
              」
            </p>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) deleteLogicRule(deleteConfirmId);
        }}
        title="删除规则"
        message="确定要删除这条逻辑规则吗？"
      />
    </div>
  );
};
