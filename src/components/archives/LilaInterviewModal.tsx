// src/components/archives/LilaInterviewModal.tsx - 5-question interview to gather family member context
import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder } from '../../types/archives';

interface LilaInterviewModalProps {
  folder: ArchiveFolder;
  onClose: () => void;
  onComplete: () => void;
}

const INTERVIEW_QUESTIONS = [
  {
    field: 'personality',
    question: "Tell me about {name}! What's their personality like?",
    example: "Are they shy or outgoing? Quiet or energetic? Serious or silly?",
    icon: '💫'
  },
  {
    field: 'interests',
    question: "What does {name} love to do? What are their interests?",
    example: "Sports, crafts, reading, gaming, music, building, art, etc.",
    icon: '❤️'
  },
  {
    field: 'learning_style',
    question: "How does {name} learn best?",
    example: "Visual (seeing diagrams), auditory (hearing explanations), kinesthetic (hands-on doing)",
    icon: '🎓'
  },
  {
    field: 'challenges',
    question: "What challenges does {name} face?",
    example: "Subjects they struggle with, behavior patterns, social situations, etc.",
    icon: '💪'
  },
  {
    field: 'strengths',
    question: "What are {name}'s superpowers and strengths?",
    example: "What comes naturally? What are they really good at?",
    icon: '⭐'
  }
];

export function LilaInterviewModal({ folder, onClose, onComplete }: LilaInterviewModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = INTERVIEW_QUESTIONS[currentStep];
  const questionText = currentQuestion.question.replace('{name}', folder.folder_name);
  const isLastQuestion = currentStep === INTERVIEW_QUESTIONS.length - 1;

  async function handleNext() {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before continuing');
      return;
    }

    setError('');
    setProcessing(true);

    try {
      // Save to database immediately
      await archivesService.addContextItem({
        folder_id: folder.id,
        context_field: currentQuestion.field,
        context_value: currentAnswer.trim(),
        context_type: 'text',
        use_for_context: true,
        added_by: 'interview'
      });

      // Store answer
      setAnswers({ ...answers, [currentQuestion.field]: currentAnswer.trim() });
      setCurrentAnswer('');

      if (isLastQuestion) {
        // Interview complete!
        onComplete();
      } else {
        // Move to next question
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      setError('Failed to save answer. Please try again.');
      console.error('Interview error:', err);
    } finally {
      setProcessing(false);
    }
  }

  function handleSkipForNow() {
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#68a395] to-[#5a9285] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">LiLa's Interview ✨</h2>
              <p className="text-white/90">Getting to know {folder.folder_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {INTERVIEW_QUESTIONS.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-white' : 'bg-transparent'
                  }`}
                  style={{ width: index <= currentStep ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Current Question */}
          <div className="mb-6">
            <div className="text-4xl mb-4">{currentQuestion.icon}</div>
            <h3 className="text-2xl font-semibold text-[#5a4033] mb-3">
              {questionText}
            </h3>
            <p className="text-gray-600 italic">
              {currentQuestion.example}
            </p>
          </div>

          {/* Answer Textarea */}
          <div className="mb-6">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here... LiLa is listening! 💕"
              className="w-full min-h-[150px] p-4 border-2 border-[#d4e3d9] rounded-xl outline-none focus:border-[#68a395] resize-none text-[#5a4033]"
              disabled={processing}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Question Number */}
          <p className="text-center text-sm text-gray-500 mb-6">
            Question {currentStep + 1} of {INTERVIEW_QUESTIONS.length}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkipForNow}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-[#5a4033] rounded-xl font-medium hover:bg-gray-50 transition-colors"
              disabled={processing}
            >
              Save for Later
            </button>
            <button
              onClick={handleNext}
              disabled={processing || !currentAnswer.trim()}
              className="flex-1 px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin">✨</div>
                  <span>Saving...</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <CheckCircle size={20} />
                  <span>Complete Interview 🎉</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
