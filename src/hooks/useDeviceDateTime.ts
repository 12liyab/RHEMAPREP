export function useDeviceDateTime() {
  const getDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const timestamp = now.getTime();

    return {
      date,
      time,
      timeString,
      timestamp,
      dateObj: now,
    };
  };

  return { getDateTime };
}
