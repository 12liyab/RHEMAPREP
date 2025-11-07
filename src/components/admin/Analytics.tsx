import { useEffect, useState } from 'react';
import { useFirebaseRead } from '../../hooks/useFirebaseSync';
import { AttendanceRecord } from '../../types';
import { Loader2, TrendingUp, Users, Clock } from 'lucide-react';

export function Analytics() {
  const { data: attendanceData, loading } = useFirebaseRead<Record<string, AttendanceRecord>>('attendance');
  const { data: staffData } = useFirebaseRead<Record<string, any>>('staff');

  const [stats, setStats] = useState({
    totalRecords: 0,
    totalStaff: 0,
    uniqueStaffPresent: 0,
    averageCheckInPerStaff: 0,
    attendanceByDate: {} as Record<string, number>,
    attendanceByStaff: {} as Record<string, number>,
  });

  useEffect(() => {
    if (!attendanceData) return;

    const records = Object.values(attendanceData);
    const staffCount = staffData ? Object.keys(staffData).length : 0;
    const uniqueStaff = new Set(records.map(r => r.staffId));

    const byDate: Record<string, number> = {};
    const byStaff: Record<string, number> = {};

    records.forEach(record => {
      byDate[record.checkInDate] = (byDate[record.checkInDate] || 0) + 1;
      byStaff[record.staffName] = (byStaff[record.staffName] || 0) + 1;
    });

    setStats({
      totalRecords: records.length,
      totalStaff: staffCount,
      uniqueStaffPresent: uniqueStaff.size,
      averageCheckInPerStaff: records.length > 0 ? Number((records.length / uniqueStaff.size).toFixed(1)) : 0,
      attendanceByDate: byDate,
      attendanceByStaff: byStaff,
    });
  }, [attendanceData, staffData]);

  const topStaff = Object.entries(stats.attendanceByStaff)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const recentDays = Object.entries(stats.attendanceByDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold">Total Check-ins</p>
              <p className="text-4xl font-bold mt-2">{stats.totalRecords}</p>
            </div>
            <Clock className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold">Total Staff</p>
              <p className="text-4xl font-bold mt-2">{stats.totalStaff}</p>
            </div>
            <Users className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold">Present (Unique)</p>
              <p className="text-4xl font-bold mt-2">{stats.uniqueStaffPresent}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-semibold">Avg Check-ins per Staff</p>
              <p className="text-4xl font-bold mt-2">{stats.averageCheckInPerStaff}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Days */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Check-ins by Day (Last 7 Days)</h3>
          <div className="space-y-3">
            {recentDays.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              recentDays.map(([date, count]) => {
                const maxCount = Math.max(...Object.values(stats.attendanceByDate));
                const percentage = (count / (maxCount || 1)) * 100;
                return (
                  <div key={date}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{date}</span>
                      <span className="text-sm font-bold text-blue-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Staff */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top 10 Most Present Staff</h3>
          <div className="space-y-2">
            {topStaff.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              topStaff.map(([name, count], index) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500 text-sm w-6">{index + 1}.</span>
                    <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-gray-600 text-sm font-semibold">Attendance Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.totalStaff > 0
                ? ((stats.uniqueStaffPresent / stats.totalStaff) * 100).toFixed(1)
                : '0'}
              %
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-gray-600 text-sm font-semibold">Staff Absent</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.totalStaff - stats.uniqueStaffPresent}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-gray-600 text-sm font-semibold">Total Days Tracked</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Object.keys(stats.attendanceByDate).length}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-gray-600 text-sm font-semibold">Avg Daily Present</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {Object.keys(stats.attendanceByDate).length > 0
                ? (stats.totalRecords / Object.keys(stats.attendanceByDate).length).toFixed(0)
                : '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
