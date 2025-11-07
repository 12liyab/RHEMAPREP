import { useState, useEffect, useMemo } from 'react';
import { useFirebaseRead, firebaseDelete } from '../../hooks/useFirebaseSync';
import { Trash2, Search, MapPin, Filter, Download, Loader2 } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/export';

export function AttendanceRecords() {
  const { data: attendanceData, loading } = useFirebaseRead<Record<string, AttendanceRecord>>('attendance');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showMap, setShowMap] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (attendanceData) {
      const recordsArray = Object.entries(attendanceData)
        .map(([id, record]) => ({ ...record, id }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setRecords(recordsArray);
    }
  }, [attendanceData]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.staffName.toLowerCase().includes(search.toLowerCase()) ||
        record.staffId.toLowerCase().includes(search.toLowerCase());

      const matchesDateFrom = !dateFrom || record.checkInDate >= dateFrom;
      const matchesDateTo = !dateTo || record.checkInDate <= dateTo;

      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [records, search, dateFrom, dateTo]);

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      await firebaseDelete(`attendance/${id}`);
    } catch (err: any) {
      alert('Error deleting record: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL attendance records? This action cannot be undone.')) return;

    setExporting(true);
    try {
      for (const record of records) {
        await firebaseDelete(`attendance/${record.id}`);
      }
    } catch (err: any) {
      alert('Error clearing records: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    setExporting(true);
    try {
      exportToCSV(filteredRecords);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    setExporting(true);
    try {
      exportToExcel(filteredRecords);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    setExporting(true);
    try {
      exportToPDF(filteredRecords);
    } finally {
      setExporting(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Records</h2>

        {/* Filters */}
        <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              onClick={() => {
                setSearch('');
                setDateFrom('');
                setDateTo('');
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition font-semibold text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filteredRecords.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting || filteredRecords.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || filteredRecords.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleClearAll}
            disabled={exporting || records.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-semibold text-sm ml-auto"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Clear All
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">Total Records</p>
            <p className="text-3xl font-bold text-blue-700">{filteredRecords.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Unique Staff</p>
            <p className="text-3xl font-bold text-green-700">{new Set(filteredRecords.map(r => r.staffId)).size}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-semibold">Date Range</p>
            <p className="text-sm font-bold text-purple-700">
              {dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'All dates'}
            </p>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden lg:table-cell">Accuracy</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{record.staffName}</td>
                    <td className="py-3 px-4 text-gray-700">{record.checkInDate}</td>
                    <td className="py-3 px-4 text-gray-700">{new Date(record.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <button
                        onClick={() => setShowMap(showMap === record.id ? null : record.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition text-xs"
                      >
                        <MapPin className="w-4 h-4" />
                        View
                      </button>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-600 text-xs">
                      ±{record.accuracy}m
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Location Details */}
        {showMap && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {filteredRecords
              .filter((r) => r.id === showMap)
              .map((record) => (
                <div key={record.id} className="space-y-2">
                  <p className="font-semibold text-gray-700">{record.staffName} - {record.checkInDate}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Latitude</p>
                      <p className="font-mono font-semibold text-gray-800">{record.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Longitude</p>
                      <p className="font-mono font-semibold text-gray-800">{record.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Accuracy</p>
                      <p className="font-mono font-semibold text-gray-800">±{record.accuracy}m</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Check-in Time</p>
                      <p className="font-mono font-semibold text-gray-800">{new Date(record.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/maps?q=${record.latitude},${record.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 transition text-sm font-semibold"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
