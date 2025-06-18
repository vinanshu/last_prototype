// leaveCreditIncrementer.js - Unlimited Version

// Function to increment leave credits without limits
function incrementLeaveCredits() {
  const leaveTypes = ["vacation", "sick", "emergency"];
  const incrementAmount = 1.25; // Amount to increment by each minute

  leaveTypes.forEach((type) => {
    // Get current value or default to 0 if not set
    const current = parseFloat(localStorage.getItem(`${type}Leave`)) || 0;

    // Calculate new value (no maximum limit)
    const newValue = (current + incrementAmount).toFixed(2);

    // Store the new value
    localStorage.setItem(`${type}Leave`, newValue);

    // Update UI if elements exist
    updateLeaveCreditDisplay(type, newValue);
  });
}

// Update the display for a leave type
function updateLeaveCreditDisplay(type, value) {
  // Update main display
  const displayElement =
    document.getElementById(`${type}Days`) ||
    document.getElementById(`${type}LeaveRemaining`);
  if (displayElement) {
    displayElement.textContent = value;
  }

  // Update progress bar if exists (shows 100% for any value above original max)
  const progressBar = document.getElementById(`${type}Progress`);
  if (progressBar) {
    const originalMax = type === "emergency" ? 5 : 15;
    const percentage = Math.min((value / originalMax) * 100, 100);
    progressBar.style.width = `${percentage}%`;
    updateProgressBarColor(progressBar, percentage);
  }
}

function updateProgressBarColor(progressBar, percentage) {
  if (percentage < 20) {
    progressBar.style.background = "#e74c3c"; // red
  } else if (percentage < 50) {
    progressBar.style.background = "#f39c12"; // yellow
  } else {
    progressBar.style.background = "#2ecc71"; // green
  }
}

// Start the auto-increment
function startLeaveCreditIncrement() {
  // Initialize leave credits if they don't exist
  if (!localStorage.getItem("vacationLeave")) {
    localStorage.setItem("vacationLeave", "15");
    localStorage.setItem("sickLeave", "15");
    localStorage.setItem("emergencyLeave", "5");
  }

  // Run immediately to initialize display
  ["vacation", "sick", "emergency"].forEach((type) => {
    const current =
      parseFloat(localStorage.getItem(`${type}Leave`)) ||
      (type === "emergency" ? 5 : 15);
    updateLeaveCreditDisplay(type, current);
  });

  // Then run every minute (60000ms)
  setInterval(incrementLeaveCredits, 6000);
}

// Start when the page loads
window.addEventListener("load", startLeaveCreditIncrement);
