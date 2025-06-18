document.addEventListener("DOMContentLoaded", () => {
  const leaves = JSON.parse(localStorage.getItem("leaveRequests")) || [];
  const pendingLeaves = leaves.filter((r) => r.status === "Pending").length;
  document.getElementById("pendingLeaves").textContent = pendingLeaves;
  populatePromotionTable();

  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const maintenanceCount = inventory.filter(
    (item) => item.status === "Needs Maintenance"
  ).length;
  document.getElementById("maintenanceCount").textContent = maintenanceCount;

  const clearances =
    JSON.parse(localStorage.getItem("clearanceRequests")) || [];
  const pendingClearances = clearances.filter(
    (c) => c.status === "Pending"
  ).length;
  document.getElementById("pendingClearances").textContent = pendingClearances;

  const tbody = document.getElementById("recentLeavesBody");
  tbody.innerHTML = "";
  if (!leaves.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">No leave requests found.</td></tr>';
    return;
  }
  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#recentLeavesBody tr");

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
  leaves
    .sort((a, b) => new Date(b.dateOfFiling) - new Date(a.dateOfFiling))
    .forEach((r) => {
      const sd = new Date(r.startDate),
        ed = new Date(r.endDate);
      const opts = { month: "long", day: "numeric", year: "numeric" };
      const startStr = sd.toLocaleDateString("en-US", opts);
      const endStr = ed.toLocaleDateString("en-US", opts);
      const dates =
        r.startDate === r.endDate ? startStr : `${startStr}–${endStr}`;
      const cls = r.status.toLowerCase();

      // Truncate reason for table display
      const shortReason = r.reason
        ? r.reason.length > 30
          ? r.reason.substring(0, 30) + "..."
          : r.reason
        : "No reason provided";

      const tr = document.createElement("tr");
      tr.innerHTML = `
    <td>${r.employeeName}</td>
    <td>${r.leaveType}</td>
    <td>${dates}</td>
    <td>
      
      <button class="view-icon-btn" data-id="${r.id}">
       <i class="fas fa-eye"> View</i>
      </button>
    </td>
    <td class="${cls}"><span class="leave-status ${r.status.toLowerCase()}">${
        r.status
      }</span></td>


    <td class="actions">
      ${
        r.status === "Pending"
          ? `<button onclick="location.href='/leaveManagement.html'"> <i class="fas fa-cog"></i>Manage</button>`
          : `<button class="view-icon-btn" data-id="${r.id}">
             <i class="fas fa-eye"></i>
           </button>`
      }
    </td>
  `;
      tbody.appendChild(tr);
    });



  // Add modal functionality
  const modal = document.getElementById("reasonModal");
  const modalClose = document.querySelector(".modal-close");

  // Add event listeners to all view buttons
  document.addEventListener("click", function (e) {
    if (e.target.closest(".view-icon-btn")) {
      const requestId = e.target.closest(".view-icon-btn").dataset.id;
      showRequestDetails(requestId);
    }
  });

  // Close modal when clicking X
  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  function showRequestDetails(requestId) {
    const request = leaves.find((r) => r.id == requestId);
    if (request) {
      const sd = new Date(request.startDate),
        ed = new Date(request.endDate);
      const opts = { month: "long", day: "numeric", year: "numeric" };
      const startStr = sd.toLocaleDateString("en-US", opts);
      const endStr = ed.toLocaleDateString("en-US", opts);
      const dates =
        request.startDate === request.endDate
          ? startStr
          : `${startStr} to ${endStr}`;

      document.getElementById("modalEmployee").textContent =
        request.employeeName;
      document.getElementById("modalLeaveType").textContent = request.leaveType;
      document.getElementById("modalDates").textContent = dates;
      document.getElementById("modalStatus").textContent = request.status;
      document.getElementById("modalReason").textContent =
        request.reason || "No reason provided";

      modal.style.display = "flex";
    }
  }
});


const clearances = JSON.parse(localStorage.getItem("clearanceRequests")) || [];
const pendingClearances = clearances.filter(
  (c) => c.status === "Pending"
).length;
document.getElementById("pendingClearances").textContent = pendingClearances;

const clearancesBody = document.getElementById("recentClearancesBody");
clearancesBody.innerHTML = "";

if (!clearances.length) {
  clearancesBody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;">No clearance requests found.</td></tr>';
} else {
  clearances
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((request) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td data-label="Request Date">${request.date}</td>
      <td data-label="Employee">${request.employee}</td>
      <td data-label="Type">${request.type}</td>
      <td data-label="Status">
        <span class="clearance-status ${request.status.toLowerCase()}">${
        request.status
      }</span>
      </td>
      <td data-label="Actions">
        <button class="manage-btn" onclick="location.href='clearanceSystem.html'">
          <i class="fas fa-cog"></i> Manage
        </button>
      </td>
    `;
      clearancesBody.appendChild(tr);
    });
}

// Add clearance search functionality
// Promotion eligibility rules (in years)
const promotionRules = {
    "Firefighter": { nextRank: "Sergeant", minYears: 2 },
    "Sergeant": { nextRank: "Lieutenant", minYears: 3 },
    "Lieutenant": { nextRank: "Captain", minYears: 4 },
    "Captain": { nextRank: "Chief", minYears: 5 },
    "Chief": { nextRank: "N/A", minYears: 0 }
  };
  
  function calculateYearsInRank(dateHired) {
    const hiredDate = new Date(dateHired);
    const today = new Date();
    const diffTime = Math.abs(today - hiredDate);
    return (diffTime / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  }
  
  function checkPromotionEligibility(rank, yearsInRank) {
    const rule = promotionRules[rank] || { nextRank: "N/A", minYears: 0 };
    
    if (rule.nextRank === "N/A") {
      return { status: "At highest rank", eligible: false, nextRank: "N/A" };
    }
    
    if (yearsInRank >= rule.minYears) {
      return { status: "Eligible", eligible: true, nextRank: rule.nextRank };
    } else {
      const yearsNeeded = (rule.minYears - yearsInRank).toFixed(1);
      return { 
        status: `Needs ${yearsNeeded} more years`, 
        eligible: false, 
        nextRank: rule.nextRank 
      };
    }
  }
  
  function populatePromotionTable() {
    const personnelList = JSON.parse(localStorage.getItem("personnelList")) || [];
    const tbody = document.getElementById("promotionBody");
    tbody.innerHTML = "";
  
    if (personnelList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No personnel records found.</td></tr>';
      return;
    }
  
    personnelList.forEach(person => {
      const yearsInRank = calculateYearsInRank(person.dateHired);
      const eligibility = checkPromotionEligibility(person.rank, yearsInRank);
      const statusClass = eligibility.eligible ? "eligible" : 
                         eligibility.status.includes("Needs") ? "not-eligible" : "pending";
  
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${person.fullName}</td>
        <td>${person.rank}</td>
        <td>${yearsInRank} years</td>
        <td>${eligibility.nextRank}</td>
        <td>
          <span class="promotion-indicator ${statusClass}"></span>
          <span class="eligibility-status ${statusClass}">${eligibility.status}</span>
        </td>
        <td>
          <button class="manage-btn" onclick="managePromotion('${person.fullName}')">
            <i class="fas fa-user-edit"></i> Manage
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  
    // Add search functionality
    document.getElementById("promotionSearchInput").addEventListener("input", function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#promotionBody tr");
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
  }
  
  function managePromotion(employeeName) {
    // You can implement specific promotion management logic here
    alert(`Managing promotion for ${employeeName}`);
    // Or redirect to a promotion management page:
    // location.href = `/promotionManagement.html?employee=${encodeURIComponent(employeeName)}`;
  }
  
  // Call this when the page loads
  document.addEventListener("DOMContentLoaded", populatePromotionTable);


  function viewCandidate(candidateId) {
    // In a real implementation, you would fetch candidate data based on the ID
    // For this example, we'll use placeholder data
    const candidateData = {
      id: candidateId,
      name: "John Smith",
      position: "Software Engineer",
      applicationDate: "2023-10-15",
      stage: "Technical Interview",
      interviewDate: "2023-11-02",
      status: "In Process",
      notes:
        "Candidate performed well in the initial screening. Strong technical background. Scheduled for technical interview with engineering team.",
    };

    // Populate the modal with candidate data
    document.getElementById("modalCandidateName").textContent =
      candidateData.name;
    document.getElementById("modalPosition").textContent =
      candidateData.position;
    document.getElementById("modalAppDate").textContent =
      candidateData.applicationDate;
    document.getElementById("modalStage").textContent = candidateData.stage;
    document.getElementById("modalInterviewDate").textContent =
      candidateData.interviewDate;
    document.getElementById("modalRecruitmentStatus").textContent =
      candidateData.status;
    document.getElementById("modalCandidateNotes").textContent =
      candidateData.notes;

    // Show the modal
    document.getElementById("candidateModal").style.display = "flex";
  }

  // Close modal when clicking the X button
  document
    .querySelector("#candidateModal .modal-close")
    .addEventListener("click", function () {
      document.getElementById("candidateModal").style.display = "none";
    });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === document.getElementById("candidateModal")) {
      document.getElementById("candidateModal").style.display = "none";
    }
  });


  function viewTraining(trainingId) {
    // In a real implementation, you would fetch training data based on the ID
    // For this example, we'll use placeholder data
    const trainingData = {
      id: trainingId,
      employee: "John Smith",
      rank: "Captain",
      kme: "Advanced Leadership",
      dates: "2023-09-15 to 2023-09-20",
      hours: "40",
      status: "Completed",
      location: "Fort Leadership Training Center",
      instructor: "Col. James Wilson",
      notes:
        "Excellent performance throughout the course. Demonstrated strong leadership skills during field exercises. Recommended for advanced tactical training next fiscal year.",
    };

    // Populate the modal with training data
    document.getElementById("modalTrainingEmployee").textContent =
      trainingData.employee;
    document.getElementById("modalTrainingRank").textContent =
      trainingData.rank;
    document.getElementById("modalTrainingKME").textContent = trainingData.kme;
    document.getElementById("modalTrainingDates").textContent =
      trainingData.dates;
    document.getElementById("modalTrainingHours").textContent =
      trainingData.hours;
    document.getElementById("modalTrainingStatus").textContent =
      trainingData.status;
    document.getElementById("modalTrainingLocation").textContent =
      trainingData.location;
    document.getElementById("modalTrainingInstructor").textContent =
      trainingData.instructor;
    document.getElementById("modalTrainingNotes").textContent =
      trainingData.notes;

    // Show the modal
    document.getElementById("trainingModal").style.display = "flex";
  }

  // Close modal when clicking the X button
  document
    .querySelector("#trainingModal .modal-close")
    .addEventListener("click", function () {
      document.getElementById("trainingModal").style.display = "none";
    });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === document.getElementById("trainingModal")) {
      document.getElementById("trainingModal").style.display = "none";
    }
  });


  function viewPlacement(placementId) {
    // Sample BFP placement data
    const placementData = {
      id: placementId,
      employee: "SFO1 Juan Dela Cruz",
      rank: "Senior Fire Officer 1",
      designation: "Fire Truck Commander",
      station: "Central Fire Station",
      years: "2.5",
      promoDate: "2021-05-15",
      status: "Eligible",
      rating: "92% (Outstanding)",
      nextPosition: "Senior Fire Officer 2 - Station Training Officer",
      notes:
        "Excellent leadership skills demonstrated during recent major fire incidents. Completed all required training courses. Recommended for promotion in next cycle.",
    };

    // Populate the modal with placement data
    document.getElementById("modalPlacementEmployee").textContent =
      placementData.employee;
    document.getElementById("modalPlacementRank").textContent =
      placementData.rank;
    document.getElementById("modalPlacementDesignation").textContent =
      placementData.designation;
    document.getElementById("modalPlacementStation").textContent =
      placementData.station;
    document.getElementById("modalPlacementYears").textContent =
      placementData.years;
    document.getElementById("modalPlacementPromoDate").textContent =
      placementData.promoDate;
    document.getElementById("modalPlacementStatus").textContent =
      placementData.status;
    document.getElementById("modalPlacementRating").textContent =
      placementData.rating;
    document.getElementById("modalPlacementNextPosition").textContent =
      placementData.nextPosition;
    document.getElementById("modalPlacementNotes").textContent =
      placementData.notes;

    // Show the modal
    document.getElementById("placementModal").style.display = "flex";
  }

  // Close modal when clicking the X button
  document
    .querySelector("#placementModal .modal-close")
    .addEventListener("click", function () {
      document.getElementById("placementModal").style.display = "none";
    });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === document.getElementById("placementModal")) {
      document.getElementById("placementModal").style.display = "none";
    }
  });