function updateClock() {
    const clockElement = document.getElementById('clock');
    const currentTime = new Date();
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    const timeString = currentTime.toLocaleString('en-US', options);
    clockElement.textContent = timeString;
  }
  
  function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
  }
  
  startClock();
  