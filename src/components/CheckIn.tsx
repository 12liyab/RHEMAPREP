import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDeviceDateTime } from '../hooks/useDeviceDateTime';
import { useFirebaseRead, firebasePush } from '../hooks/useFirebaseSync';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { StaffMember, AttendanceRecord } from '../types';

type CheckInState = 'idle' | 'loading' | 'success' | 'error';

export function CheckIn() {
  const { location, error: locationError, loading: locationLoading, getLocation } = useGeolocation();
  const { getDateTime } = useDeviceDateTime();
  const { data: staffData } = useFirebaseRead<Record<string, StaffMember>>('staff');

  const [selectedStaff, setSelectedStaff] = useState('');
  const [state, setState] = useState<CheckInState>('idle');
  const [message, setMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<any>(null);

  const staffList = staffData ? Object.entries(staffData).map(([id, member]) => ({ ...member, id })) : [];

  const handleCheckIn = async () => {
    if (!selectedStaff) {
      setMessage('Please select a staff member');
      return;
    }

    setState('loading');
    setMessage('Getting your location...');

    try {
      await getLocation();
    } catch (err) {
      setState('error');
      setMessage('Failed to get location. Please try again.');
      return;
    }
  };

  useEffect(() => {
    if (location && state === 'loading' && selectedStaff) {
      const submitAttendance = async () => {
        try {
          const dateTime = getDateTime();
          const staff = staffList.find(s => s.id === selectedStaff);

          if (!staff) {
            setState('error');
            setMessage('Staff member not found');
            return;
          }

          const attendanceRecord: AttendanceRecord = {
            id: '',
            staffId: selectedStaff,
            staffName: staff.name,
            checkInDate: dateTime.date,
            checkInTime: dateTime.time,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: dateTime.timestamp,
          };

          await firebasePush('attendance', attendanceRecord);

          setSubmittedData({
            ...attendanceRecord,
            timeString: dateTime.timeString,
            locationAccuracy: `±${location.accuracy}m`,
          });
          setState('success');
          setMessage('Check-in successful!');
          setSelectedStaff('');

          setTimeout(() => {
            setState('idle');
            setSubmittedData(null);
          }, 5000);
        } catch (err: any) {
          setState('error');
          setMessage(err.message || 'Check-in failed');
        }
      };

      submitAttendance();
    }
  }, [location, state, selectedStaff, staffList, getDateTime]);

  useEffect(() => {
    if (locationError && state === 'loading') {
      setState('error');
      setMessage(locationError);
    }
  }, [locationError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src="/Logo for RHEMA PREP.J.H.S - Traditional Emblem.png" alt="RHEMA Logo" className="h-16 w-16" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">RHEMA PREP/JHS</h1>
        <p className="text-center text-gray-600 mb-8">Staff Attendance System</p>

        {state === 'success' ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">Check-in Successful!</h2>
              <div className="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-semibold">Name:</span> {submittedData?.staffName}</p>
                <p><span className="font-semibold">Date:</span> {submittedData?.checkInDate}</p>
                <p><span className="font-semibold">Time:</span> {submittedData?.timeString}</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span><span className="font-semibold">Location:</span> {submittedData?.latitude.toFixed(4)}, {submittedData?.longitude.toFixed(4)}</span>
                </div>
                <p className="text-xs text-gray-600"><span className="font-semibold">Accuracy:</span> {submittedData?.locationAccuracy}</p>
              </div>
            </div>
          </div>
        ) : state === 'error' ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-center text-red-600 font-semibold">{message}</p>
            <button
              onClick={() => {
                setState('idle');
                setMessage('');
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Your Name
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a staff member --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!selectedStaff || locationLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {message}
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Check In
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your location and device time will be recorded automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
