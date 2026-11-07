import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bell, User, Menu } from 'lucide-react'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9DA6]/40'

const Header = ({ toggleSidebar, isSidebarOpen, notificationCount = 0 }) => {
  const { user } = useAuth()

  const initial = user?.username?.trim()?.charAt(0)?.toUpperCase()

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-[#DCE6E8]">
      <div className="flex items-center h-full px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={isSidebarOpen}
          className={`md:hidden inline-flex items-center justify-center w-10 h-10 text-[#647278] hover:text-[#2A3439] hover:bg-[#EAF2F2] rounded-xl transition-all duration-200 ${focusRing}`}
        >
          <Menu size={24} />
        </button>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Notifications */}
          <button
            aria-label={
              notificationCount > 0
                ? `Notifications (${notificationCount} new)`
                : 'Notifications'
            }
            className={`relative inline-flex items-center justify-center w-10 h-10 text-[#647278] hover:text-[#2A3439] hover:bg-[#EAF2F2] rounded-xl transition-all duration-200 group ${focusRing}`}
          >
            <Bell
              size={20}
              strokeWidth={2}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4F9DA6] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* User profile */}
          <div className="pl-3 border-l border-[#DCE6E8]">
            <Link
              to="/profile"
              aria-label="Open profile"
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-[#F7FAFB] transition-colors duration-200 group ${focusRing}`}
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] flex items-center justify-center text-white shadow-md shadow-[#4F9DA6]/20 group-hover:shadow-lg group-hover:shadow-[#4F9DA6]/30 transition-all duration-200">
                {initial ? (
                  <span className="text-sm font-semibold">{initial}</span>
                ) : (
                  <User size={18} strokeWidth={2.5} />
                )}
              </div>

              <div className="hidden sm:flex flex-col min-w-0">
                <p className="text-sm font-semibold text-[#2A3439] leading-tight truncate max-w-40">
                  {user?.username || 'User'}
                </p>
                {user?.email && (
                  <p className="text-xs text-[#647278] leading-tight truncate max-w-40">
                    {user.email}
                  </p>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header