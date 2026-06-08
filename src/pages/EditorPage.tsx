import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useSurveyStore } from '@/store/useSurveyStore';
import { Header } from '@/components/layout/Header';
import { DraggableQuestion } from '@/components/survey/DraggableQuestion';
import { QuestionTypeSelector } from '@/components/survey/QuestionTypeSelector';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { QuestionType } from '@/types/survey';

export const EditorPage = () => {
  const { survey, selectedQuestionId, setSelectedQuestionId, addQuestion, reorderQuestions } = useSurveyStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [insertAfterId, setInsertAfterId] = useState<string | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = survey.questions.findIndex((q) => q.id === active.id);
      const newIndex = survey.questions.findIndex((q) => q.id === over.id);
      const newItems = arrayMove(survey.questions, oldIndex, newIndex);
      reorderQuestions(newItems);
    }
  };

  const handleSelectType = (type: QuestionType) => {
    addQuestion(type, insertAfterId);
  };

  const openAddModal = (afterId?: string) => {
    setInsertAfterId(afterId);
    setShowAddModal(true);
  };

  return (
    <div className="flex-1 min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold text-zinc-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            题目列表
          </h2>
          <Button onClick={() => openAddModal()}>
            <Plus className="w-4 h-4" />
            添加题目
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={survey.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {survey.questions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-zinc-300">
                  <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-2xl flex items-center justify-center">
                    <Plus className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                    还没有题目
                  </h3>
                  <p className="text-sm text-zinc-500 mb-4">
                    点击下方按钮添加第一道题目
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4" />
                    添加题目
                  </Button>
                </div>
              ) : (
                survey.questions.map((question, index) => (
                  <div key={question.id} className="relative group">
                    <DraggableQuestion
                      question={question}
                      isSelected={selectedQuestionId === question.id}
                      onSelect={() => setSelectedQuestionId(question.id)}
                    />
                    <button
                      onClick={() => openAddModal(question.id)}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border border-zinc-300 rounded-full p-1.5 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

        {survey.questions.length > 0 && (
          <Button
            variant="outline"
            className="w-full mt-8 py-4 border-dashed text-zinc-500"
            onClick={() => openAddModal()}
          >
            <Plus className="w-5 h-5" />
            添加题目
          </Button>
        )}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="选择题目类型"
        size="lg"
      >
        <QuestionTypeSelector
          onSelect={handleSelectType}
          onClose={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};
