import { useNavigate } from "react-router-dom"
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react'
import moment from 'moment'

const FlashcardSetCard = ({ flashcardSet }) => {

  const navigate = useNavigate()

  // documentId can be missing if the document was deleted
  const documentId = flashcardSet?.documentId?._id

  const handleStudyNow = () => {
    if (!documentId) return
    navigate(`/documents/${documentId}/flashcards`)
  }

  const cards = flashcardSet?.cards || []
  const reviewCount = cards.filter((card) => card.lastReviewed).length
  const totalCards = cards.length
  const progressPercentage = totalCards > 0 ? Math.round((reviewCount / totalCards) * 100) : 0

  return (
    <div
      className="group flex flex-col bg-white border border-[#DCE6E8] rounded-2xl cursor-pointer hover:border-[#4F9DA6] hover:shadow-lg hover:shadow-[#4F9DA6]/10 transition-all duration-200"
      onClick={handleStudyNow}
    >
      <div className="flex-1 p-5 space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] shadow-md shadow-[#4F9DA6]/20">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-semibold text-[#2A3439] truncate"
              title={flashcardSet?.documentId?.title}
            >
              {flashcardSet?.documentId?.title || 'Untitled document'}
            </h3>
            <p className="text-xs text-[#647278] mt-0.5">
              Created {moment(flashcardSet.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex">
            <span className="px-2.5 py-1 rounded-lg bg-[#F7FAFB] border border-[#DCE6E8] text-xs font-semibold text-[#647278]">
              {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
            </span>
          </div>
          {reviewCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF2F2]">
              <TrendingUp className="w-3.5 h-3.5 text-[#3D7F87]" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-[#3D7F87]">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#647278] uppercase tracking-wide">
                Progress
              </span>
              <span className="text-xs font-medium text-[#647278]">
                {reviewCount}/{totalCards} reviewed
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={totalCards}
              aria-valuenow={reviewCount}
              className="h-2 bg-[#EAF2F2] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Study Button */}
      <div className="p-5 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleStudyNow()
          }}
          disabled={!documentId}
          className="relative inline-flex w-full items-center justify-center h-10 rounded-xl bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] hover:from-[#468D95] hover:to-[#356E75] text-white text-sm font-semibold shadow-md shadow-[#4F9DA6]/25 active:scale-[0.98] transition-all duration-200 overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4F9DA6]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            Study Now
          </span>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />
        </button>
      </div>
    </div>
  )
}

export default FlashcardSetCard