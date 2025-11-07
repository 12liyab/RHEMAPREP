import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Users, BarChart3, FileText } from 'lucide-react';
import { StaffManagement } from './admin/StaffManagement';
import { AttendanceRecords } from './admin/AttendanceRecords';
import { Analytics } from './admin/Analytics';
import { SessionTimeout } from './admin/SessionTimeout';

type TabType = 'staff' | 'attendance' | 'analytics' | 'settings';

export function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);

      warningTimeout = setTimeout(() => {
        setShowSessionWarning(true);
      }, 4 * 60 * 1000);

      timeout = setTimeout(() => {
        logout();
      }, 5 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimers);
    window.addEventListener('keypress', resetTimers);

    resetTimers();

    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      window.removeEventListener('mousemove', resetTimers);
      window.removeEventListener('keypress', resetTimers);
    };
  }, [logout]);

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { id: 'attendance' as TabType, label: 'Attendance Records', icon: BarChart3 },
    { id: 'staff' as TabType, label: 'Staff Management', icon: Users },
    { id: 'analytics' as TabType, label: 'Analytics', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <SessionTimeout show={showSessionWarning} onLogout={handleLogout} />

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3">
              <img src="/Logo for RHEMA PREP.J.H.S - Traditional Emblem.png" alt="RHEMA Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">RHEMA PREP</h1>
                <p className="text-xs text-gray-600">Attendance Management System</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative w-64 h-screen bg-gray-900 text-white shadow-lg transition-transform duration-200 z-40`}
        >
          <nav className="p-6 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'attendance' && <AttendanceRecords />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>
    </div>
  );
}
