import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types/survey';
import { QuestionCard } from './QuestionCard';

interface DraggableQuestionProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
}

export const DraggableQuestion = ({
  question,
  isSelected,
  onSelect,
}: DraggableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <QuestionCard
        question={question}
        isSelected={isSelected}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};
