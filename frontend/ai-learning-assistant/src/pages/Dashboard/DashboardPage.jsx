import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/common/Spinner'
import progressService from '../../services/progressService'
import toast from 'react-hot-toast'
import { Clock, FileText, TrendingUp, BookOpen, ClipboardCheck, RefreshCw } from 'lucide-react'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9DA6]/40'

// Format a date, or return null if missing/invalid
const formatDate = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Merge documents and quizzes into one list, newest first
const buildRecentActivity = (recentActivity) => {
  if (!recentActivity) return []

  const documents = (recentActivity.documents || []).map((doc) => ({
    key: `document-${doc._id}`,
    description: doc.title,
    timestamp: doc.lastAccessed,
    link: `/documents/${doc._id}`,
    type: 'document',
  }))

  const quizzes = (recentActivity.quizzes || []).map((quiz) => {
    const documentId = quiz.documentId?._id
    return {
      key: `quiz-${quiz._id}`,
      description: quiz.title,
      timestamp: quiz.completedAt,
      // Adjust this to your real quiz route if you have one
      link: documentId ? `/documents/${documentId}` : null,
      type: 'quiz',
    }
  })

  return [...documents, ...quizzes].sort(
    (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
  )
}

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setHasError(false)
    try {
      const data = await progressService.getDashboardData()
      setDashboardData(data.data)
    } catch (error) {
      console.error(error)
      setHasError(true)
      toast.error('Failed to fetch dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return <Spinner />
  }

  if (hasError || !dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF2F2] mb-4">
            <TrendingUp className="w-8 h-8 text-[#647278]" />
          </div>
          <p className="text-[#647278] text-sm mb-4">
            {hasError ? "We couldn't load your dashboard." : 'No dashboard data available.'}
          </p>
          <button
            onClick={fetchDashboardData}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] text-white text-sm font-semibold shadow-md shadow-[#4F9DA6]/25 active:scale-[0.98] transition-all duration-200 ${focusRing}`}
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { overview, recentActivity } = dashboardData

  const stats = [
    {
      label: 'Total Documents',
      value: overview.totalDocuments,
      icon: FileText,
      bg: 'bg-[#4F9DA6]',
      to: '/documents',
    },
    {
      label: 'Total Flashcards',
      value: overview.totalFlashcards,
      icon: BookOpen,
      bg: 'bg-[#8FB89A]',
      to: '/flashcards',
    },
    {
      label: 'Total Quizzes',
      value: overview.totalQuizzes,
      icon: ClipboardCheck,
      bg: 'bg-[#6B8CAE]',
    },
  ]

  const recentActivityItems = buildRecentActivity(recentActivity)

  const statCardClasses =
    'bg-white border border-[#DCE6E8] rounded-2xl p-6 flex items-start justify-between'

  return (
    <div className="min-h-screen bg-[#F7FAFB] px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#2A3439] tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-[#647278] text-sm">
            Track your learning progress and activity.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon

            const content = (
              <>
                <div>
                  <p className="text-xs font-semibold text-[#647278] tracking-wide uppercase mb-3">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-[#2A3439]">{stat.value ?? 0}</p>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </>
            )

            // Cards with a destination are clickable; others are plain
            return stat.to ? (
              <Link
                key={stat.label}
                to={stat.to}
                className={`${statCardClasses} hover:border-[#4F9DA6] hover:shadow-md hover:shadow-[#4F9DA6]/10 transition-all duration-200 ${focusRing}`}
              >
                {content}
              </Link>
            ) : (
              <div key={stat.label} className={statCardClasses}>
                {content}
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#DCE6E8] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EAF2F2]">
              <Clock className="w-4 h-4 text-[#647278]" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-[#2A3439]">Recent Activity</h2>
          </div>

          {recentActivityItems.length > 0 ? (
            <ul className="divide-y divide-[#EAF2F2]">
              {recentActivityItems.map((activity) => (
                <li key={activity.key} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        activity.type === 'document' ? 'bg-[#4F9DA6]' : 'bg-[#8FB89A]'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2A3439] truncate">
                        {activity.type === 'document' ? 'Accessed Document: ' : 'Attempted Quiz: '}
                        {activity.description}
                      </p>
                      <p className="text-xs text-[#647278] mt-0.5">
                        {formatDate(activity.timestamp) ||
                          (activity.type === 'quiz' ? 'Not completed yet' : 'No access date')}
                      </p>
                    </div>
                  </div>

                  {activity.link && (
                    <Link
                      to={activity.link}
                      aria-label={`View ${activity.description}`}
                      className={`text-sm font-medium text-[#3D7F87] hover:text-[#2E6167] shrink-0 rounded ${focusRing}`}
                    >
                      View
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#647278]">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage