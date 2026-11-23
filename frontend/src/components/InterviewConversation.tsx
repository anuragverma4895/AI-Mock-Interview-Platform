import { Bot, CheckCircle2, ClipboardList, MessageCircle, UserRound } from 'lucide-react';
import type { InterviewQuestion } from '../types';

type Props = {
  questions: InterviewQuestion[];
  variant?: 'dark' | 'light';
  revealScores?: boolean;
};

/**
 * An interview-wide transcript: each question and answer belong to one row.
 * During an active interview, scores are deliberately concealed.
 */
export default function InterviewConversation({ questions, variant = 'dark', revealScores = false }: Props) {
  const dark = variant === 'dark';
  return (
    <section
      aria-label="Interview conversation"
      className={dark
        ? 'rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-xl p-4 sm:p-6'
        : 'rounded-2xl border border-slate-200 bg-white/90 shadow-lg p-4 sm:p-6'}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <MessageCircle className={dark ? 'w-6 h-6 text-cyan-300' : 'w-6 h-6 text-indigo-600'} />
          <div>
            <h2 className={dark ? 'text-xl sm:text-2xl font-bold text-white' : 'text-xl sm:text-2xl font-bold text-slate-900'}>
              {revealScores ? 'Interview conversation & scoring' : 'Conversation'}
            </h2>
            <p className={dark ? 'text-sm text-white/65 mt-1' : 'text-sm text-slate-500 mt-1'}>
              {revealScores
                ? 'Every question, your complete answer, and its evaluation in one place.'
                : 'Questions and answers are saved here. Feedback is revealed at the end.'}
            </p>
          </div>
        </div>
        <span className={dark
          ? 'px-3 py-1.5 rounded-full bg-white/10 text-blue-100 border border-white/15 text-xs font-medium'
          : 'px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium'}>
          {questions.filter(q => Boolean(q.answer?.trim())).length} of {questions.length} answered
        </span>
      </div>

      {questions.length === 0 ? (
        <p className={dark ? 'text-blue-100/70' : 'text-slate-500'}>Your interview questions will appear here.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <article
              key={question._id || index}
              className={dark
                ? 'rounded-xl bg-slate-900/35 border border-white/15 overflow-hidden'
                : 'rounded-xl bg-white border border-slate-200 overflow-hidden'}
            >
              <div className={dark
                ? 'flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-white/5 border-b border-white/10'
                : 'flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200'}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={dark ? 'font-bold text-white' : 'font-bold text-slate-800'}>Question {index + 1}</span>
                  <span className={dark ? 'text-xs px-2 py-1 bg-blue-500/20 text-blue-100 rounded-md' : 'text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md'}>{question.category}</span>
                  <span className={dark ? 'text-xs capitalize text-white/65' : 'text-xs capitalize text-slate-500'}>{question.difficulty}</span>
                </div>
                {revealScores ? (
                  <span className={typeof question.score === 'number'
                    ? 'rounded-lg bg-emerald-100 text-emerald-800 px-3 py-1 font-bold'
                    : 'rounded-lg bg-amber-100 text-amber-700 px-3 py-1 text-sm font-medium'}>
                    {typeof question.score === 'number' ? question.score.toFixed(1) + ' / 5' : 'Not evaluated'}
                  </span>
                ) : (
                  <span className={dark ? 'text-xs text-white/50' : 'text-xs text-slate-400'}>
                    {question.answer?.trim() ? 'Answered' : 'Awaiting response'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className={dark
                  ? 'px-4 sm:px-5 py-4 border-b lg:border-b-0 lg:border-r border-white/10'
                  : 'px-4 sm:px-5 py-4 border-b lg:border-b-0 lg:border-r border-slate-200'}>
                  <div className={dark ? 'flex items-center gap-2 text-blue-200 text-xs font-semibold mb-2' : 'flex items-center gap-2 text-indigo-700 text-xs font-semibold mb-2'}>
                    <Bot className="w-4 h-4" /> INTERVIEW QUESTION
                  </div>
                  <p className={dark ? 'text-white leading-relaxed whitespace-pre-wrap break-words' : 'text-slate-800 leading-relaxed whitespace-pre-wrap break-words'}>
                    {question.question}
                  </p>
                </div>
                <div className="px-4 sm:px-5 py-4">
                  <div className={dark ? 'flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-2' : 'flex items-center gap-2 text-teal-700 text-xs font-semibold mb-2'}>
                    <UserRound className="w-4 h-4" /> YOUR ANSWER
                  </div>
                  <p className={dark ? 'text-blue-50/95 leading-relaxed whitespace-pre-wrap break-words' : 'text-slate-700 leading-relaxed whitespace-pre-wrap break-words'}>
                    {question.answer?.trim() || 'Waiting for your answer...'}
                  </p>
                </div>
              </div>
              {revealScores && (
                <div className="px-4 sm:px-5 py-4 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                    {question.feedback ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ClipboardList className="w-4 h-4 text-slate-500" />}
                    EVALUATION & FEEDBACK
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                    {question.feedback || 'No evaluation available for this question.'}
                  </p>
                  {question.evaluationSource === 'heuristic' && (
                    <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Approximate keyword-based fallback score — not an AI assessment.
                    </p>
                  )}
                  {(question.strengths?.length || question.improvements?.length) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-700 mb-1">Strengths</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {(question.strengths || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-700 mb-1">Areas to improve</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {(question.improvements || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
