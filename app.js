// Application State
let currentUser = null;
let currentRole = null;
let simulationInterval = null;
let reportGenerationInterval = null;

// Demo Data
const demoCredentials = {
  student: { email: "demo.student@university.edu", password: "student123" },
  teacher: { email: "demo.teacher@university.edu", password: "teacher123" },
  admin: { email: "demo.admin@university.edu", password: "admin123" }
};

let students = [
  {
    id: "STU001",
    name: "John Doe",
    studentId: "2021CS001", 
    department: "Computer Science",
    semester: 6,
    meritScore: 785,
    cgpa: 8.5,
    totalCredits: 145,
    attendancePercentage: 87,
    certificates: [
      { name: "AWS Cloud Practitioner", organization: "Amazon", status: "verified", impact: 25, date: "2024-08-15" },
      { name: "Google Analytics", organization: "Google", status: "verified", impact: 15, date: "2024-07-20" },
      { name: "Microsoft Azure", organization: "Microsoft", status: "pending", impact: 0, date: "2024-09-20" }
    ],
    performanceTrend: [720, 735, 750, 770, 785],
    attendanceTrend: [82, 85, 86, 87, 87]
  },
  {
    id: "STU002", 
    name: "Jane Smith",
    studentId: "2021EC002",
    department: "Electronics", 
    semester: 4,
    meritScore: 892,
    cgpa: 9.2,
    totalCredits: 98,
    attendancePercentage: 93,
    certificates: [
      { name: "Cisco Network Associate", organization: "Cisco", status: "verified", impact: 30, date: "2024-06-10" }
    ],
    performanceTrend: [820, 840, 865, 880, 892],
    attendanceTrend: [90, 91, 92, 93, 93]
  },
  {
    id: "STU003",
    name: "Mike Johnson", 
    studentId: "2022ME003",
    department: "Mechanical",
    semester: 2,
    meritScore: 654,
    cgpa: 7.1,
    totalCredits: 45,
    attendancePercentage: 71,
    certificates: [],
    performanceTrend: [620, 630, 640, 650, 654],
    attendanceTrend: [68, 69, 70, 71, 71]
  }
];

let teachers = [
  {
    id: "TEACH001",
    name: "Dr. Sarah Wilson",
    department: "Computer Science",
    courses: [
      { id: "CS301", name: "Data Structures", students: ["STU001"], gpsEnabled: true, location: { lat: 19.0760, lng: 72.8777, radius: 100 } },
      { id: "CS401", name: "Machine Learning", students: ["STU001", "STU002"], gpsEnabled: false, location: null }
    ]
  }
];

let departments = [
  { name: "Computer Science", totalStudents: 150, averageScore: 758, attendanceRate: 85, students: ["STU001"] },
  { name: "Electronics", totalStudents: 120, averageScore: 742, attendanceRate: 88, students: ["STU002"] },
  { name: "Mechanical", totalStudents: 100, averageScore: 689, attendanceRate: 78, students: ["STU003"] }
];

// New Admin Features Data
let aiReportTemplates = {
  naac: {
    name: "NAAC Assessment Report",
    sections: ["Executive Summary", "Curricular Aspects", "Teaching-Learning", "Research", "Infrastructure", "Student Support", "Governance"],
    estimatedTime: "5-7 minutes"
  },
  nba: {
    name: "NBA Accreditation Report", 
    sections: ["Program Outcomes", "Curriculum", "Faculty", "Infrastructure", "Student Performance", "Industry Interaction"],
    estimatedTime: "6-8 minutes"
  },
  custom: {
    name: "Custom Institutional Report",
    sections: ["Overview", "Academics", "Student Analytics", "Department Performance", "Trends & Insights"],
    estimatedTime: "3-5 minutes"
  },
  department: {
    name: "Department Performance Report",
    sections: ["Department Overview", "Faculty Analysis", "Student Performance", "Course Analytics"],
    estimatedTime: "2-4 minutes"
  }
};

let reportQueue = [];

let erpIntegrations = [
  {
    id: "ERP001",
    name: "University ERP System",
    type: "Student Information System",
    status: "connected",
    lastSync: "2024-09-26T06:30:00Z",
    syncFrequency: "real_time",
    endpoint: "https://erp.university.edu/api",
    health: "excellent"
  },
  {
    id: "ERP002", 
    name: "Academic Management System",
    type: "Academic Records",
    status: "pending_configuration",
    lastSync: null,
    syncFrequency: "daily",
    endpoint: "",
    health: "unknown"
  }
];

let systemPermissions = {
  certificate_verification: {
    teachers_can_verify: true,
    department_specific_only: true,
    auto_approve_verified: false
  },
  gps_attendance: {
    teachers_can_control_gps: true,
    teachers_can_manual_attendance: true,
    students_can_self_mark: false
  },
  reports_analytics: {
    teachers_view_department: true,
    teachers_generate_ai: false,
    students_view_own: true
  }
};

let auditLogs = [
  { id: 1, action: "Certificate Verified", user: "Dr. Sarah Wilson", target: "John Doe - AWS Certificate", timestamp: "2024-09-26 06:25:00", severity: "info" },
  { id: 2, action: "GPS Attendance Enabled", user: "Dr. Sarah Wilson", target: "CS301 - Data Structures", timestamp: "2024-09-26 06:20:00", severity: "info" },
  { id: 3, action: "ERP Sync Completed", user: "System", target: "University ERP System", timestamp: "2024-09-26 06:30:00", severity: "success" },
  { id: 4, action: "Permission Updated", user: "Admin", target: "Certificate Verification Settings", timestamp: "2024-09-26 06:15:00", severity: "warning" }
];

// Simulated user location (Mumbai coordinates for demo)
let userLocation = { lat: 19.0760, lng: 72.8777 };

// Utility Functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function generateAIInsights(student) {
  const insights = [];
  
  if (student.attendancePercentage < 75) {
    insights.push({
      type: "warning",
      title: "Attendance Alert",
      message: "Your attendance is below 75%. Consider attending more classes to improve your merit score."
    });
  }
  
  if (student.certificates.length < 3) {
    insights.push({
      type: "suggestion",
      title: "Skill Enhancement",
      message: "Adding more certified skills could boost your merit score by 50-100 points."
    });
  }
  
  if (student.cgpa > 8.0) {
    insights.push({
      type: "positive",
      title: "Excellent Performance",
      message: "Your CGPA is excellent! Focus on maintaining this performance and adding practical experience."
    });
  }
  
  return insights;
}

function updateMeritScore(studentId, change, reason) {
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.meritScore += change;
    console.log(`Merit Score Updated: ${student.name} ${change > 0 ? '+' : ''}${change} points (${reason})`);
    
    // Add audit log
    auditLogs.unshift({
      id: auditLogs.length + 1,
      action: "Merit Score Updated",
      user: currentUser ? currentUser.name : "System",
      target: `${student.name} - ${reason}`,
      timestamp: new Date().toLocaleString(),
      severity: change > 0 ? "success" : "warning"
    });
    
    if (currentRole === 'student' && currentUser && students.find(s => s.id === currentUser.id)) {
      updateStudentDashboard();
    }
  }
}

// Authentication
function login(role, email, password) {
  const credentials = demoCredentials[role];
  if (credentials && credentials.email === email && credentials.password === password) {
    currentRole = role;
    
    if (role === 'student') {
      currentUser = students[0];
    } else if (role === 'teacher') {
      currentUser = teachers[0];
    } else {
      currentUser = { name: "System Administrator", role: "admin" };
    }
    
    // Add audit log
    auditLogs.unshift({
      id: auditLogs.length + 1,
      action: "User Login",
      user: currentUser.name,
      target: `${role} portal access`,
      timestamp: new Date().toLocaleString(),
      severity: "info"
    });
    
    return true;
  }
  return false;
}

function logout() {
  console.log('Logout function called');
  
  // Add audit log
  if (currentUser) {
    auditLogs.unshift({
      id: auditLogs.length + 1,
      action: "User Logout",
      user: currentUser.name,
      target: `${currentRole} portal`,
      timestamp: new Date().toLocaleString(),
      severity: "info"
    });
  }
  
  // Clear application state
  currentUser = null;
  currentRole = null;
  
  // Stop any running intervals
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  if (reportGenerationInterval) {
    clearInterval(reportGenerationInterval);
    reportGenerationInterval = null;
  }
  
  // Reset form values
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.reset();
  }
  
  // Force show login page immediately
  showLoginPage();
  
  showNotification('Logged out successfully', 'info');
}

function showLoginPage() {
  console.log('Showing login page');
  
  // Hide all dashboard pages
  const dashboards = ['student-dashboard', 'teacher-dashboard', 'admin-dashboard'];
  dashboards.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('hidden');
      element.style.display = 'none';
    }
  });
  
  // Hide modals
  const modals = ['student-detail-modal', 'erp-config-modal'];
  modals.forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  });
  
  // Show login page
  const loginPage = document.getElementById('login-page');
  if (loginPage) {
    loginPage.classList.remove('hidden');
    loginPage.style.display = 'flex';
  }
}

function showDashboard(role) {
  console.log(`Showing dashboard for role: ${role}`);
  
  // Hide login page
  const loginPage = document.getElementById('login-page');
  if (loginPage) {
    loginPage.classList.add('hidden');
    loginPage.style.display = 'none';
  }
  
  // Hide all other dashboards
  const allDashboards = ['student-dashboard', 'teacher-dashboard', 'admin-dashboard'];
  allDashboards.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('hidden');
      element.style.display = 'none';
    }
  });
  
  // Show target dashboard
  const targetDashboard = document.getElementById(`${role}-dashboard`);
  if (targetDashboard) {
    targetDashboard.classList.remove('hidden');
    targetDashboard.style.display = 'block';
    
    // Initialize dashboard content
    setTimeout(() => {
      if (role === 'student') {
        initializeStudentDashboard();
      } else if (role === 'teacher') {
        initializeTeacherDashboard();
      } else if (role === 'admin') {
        initializeAdminDashboard();
      }
    }, 100);
  }
}

// Student Dashboard Functions
function initializeStudentDashboard() {
  console.log('Initializing student dashboard');
  if (!currentUser || currentRole !== 'student') return;
  
  // Update basic info
  const elements = {
    'student-name': currentUser.name,
    'student-merit-score': currentUser.meritScore,
    'student-cgpa': currentUser.cgpa,
    'student-attendance': currentUser.attendancePercentage + '%',
    'student-id': currentUser.studentId,
    'student-department': currentUser.department,
    'student-semester': currentUser.semester,
    'student-credits': currentUser.totalCredits
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
  
  updateGPSClasses();
  updateStudentCertificates();
  updateAIRecommendations();
  updateStudentPortfolio();
  updateStudentAnalytics();
  startRealTimeUpdates();
}

function updateStudentDashboard() {
  if (currentRole === 'student') {
    initializeStudentDashboard();
  }
}

function updateStudentPortfolio() {
  const container = document.getElementById('student-portfolio');
  if (!container || !currentUser) return;
  
  const portfolioData = [
    { title: "Academic Achievement", value: `${currentUser.cgpa} CGPA`, description: `Semester ${currentUser.semester}` },
    { title: "Merit Score Ranking", value: "Top 15%", description: "Among department peers" },
    { title: "Certificates Earned", value: currentUser.certificates.length, description: "Professional certifications" },
    { title: "Attendance Rate", value: `${currentUser.attendancePercentage}%`, description: "This semester" }
  ];
  
  container.innerHTML = `
    <div class="portfolio-grid">
      ${portfolioData.map(item => `
        <div class="portfolio-item">
          <h4>${item.title}</h4>
          <div class="metric-val">${item.value}</div>
          <p>${item.description}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function updateStudentAnalytics() {
  setTimeout(() => {
    const canvas = document.getElementById('student-performance-chart');
    if (canvas && window.Chart && currentUser) {
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'],
          datasets: [{
            label: 'Merit Score Trend',
            data: currentUser.performanceTrend,
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }
  }, 200);
}

function updateGPSClasses() {
  const container = document.getElementById('gps-classes-list');
  if (!container || !currentUser) return;
  
  container.innerHTML = '';
  
  const availableClasses = teachers[0].courses.filter(course => 
    course.students.includes(currentUser.id) && course.gpsEnabled
  );
  
  if (availableClasses.length === 0) {
    container.innerHTML = '<p class="text-center text-sm">No GPS-enabled classes available at this time.</p>';
    return;
  }
  
  availableClasses.forEach(course => {
    const distance = course.location ? calculateDistance(
      userLocation.lat, userLocation.lng,
      course.location.lat, course.location.lng
    ) : null;
    
    const inRange = distance && distance <= course.location.radius;
    
    const classItem = document.createElement('div');
    classItem.className = 'gps-class-item';
    
    classItem.innerHTML = `
      <div class="class-info">
        <h4>${course.name}</h4>
        <p>Course ID: ${course.id}</p>
        <p>Distance: ${distance ? Math.round(distance) + 'm' : 'Unknown'}</p>
      </div>
      <div>
        <div class="gps-status ${inRange ? 'in-range' : 'out-of-range'} mb-8">
          ${inRange ? 'In Range' : 'Out of Range'}
        </div>
        <button class="btn btn--primary btn--sm" ${!inRange ? 'disabled' : ''} 
                onclick="markAttendance('${course.id}')">
          ${inRange ? 'Mark Attendance' : 'Move Closer'}
        </button>
      </div>
    `;
    
    container.appendChild(classItem);
  });
}

function markAttendance(courseId) {
  const course = teachers[0].courses.find(c => c.id === courseId);
  if (!course) return;
  
  const distance = calculateDistance(
    userLocation.lat, userLocation.lng,
    course.location.lat, course.location.lng
  );
  
  if (distance <= course.location.radius) {
    showNotification('Attendance marked successfully!', 'success');
    updateMeritScore(currentUser.id, 2, 'GPS Attendance Verified');
    
    currentUser.attendancePercentage = Math.min(100, currentUser.attendancePercentage + 1);
    const attendanceEl = document.getElementById('student-attendance');
    if (attendanceEl) {
      attendanceEl.textContent = currentUser.attendancePercentage + '%';
    }
  } else {
    showNotification('You are not within the required GPS range.', 'error');
  }
}

function updateStudentCertificates() {
  const container = document.getElementById('student-certificates');
  if (!container || !currentUser) return;
  
  container.innerHTML = '';
  
  if (currentUser.certificates.length === 0) {
    container.innerHTML = '<p class="text-center">No certificates uploaded yet. Upload your first certificate to boost your merit score!</p>';
    return;
  }
  
  currentUser.certificates.forEach(cert => {
    const certItem = document.createElement('div');
    certItem.className = 'certificate-item';
    
    const statusClass = cert.status === 'verified' ? 'status-verified' : 
                       cert.status === 'pending' ? 'status-pending' : 'status-rejected';
    
    certItem.innerHTML = `
      <div class="certificate-details">
        <h4>${cert.name}</h4>
        <p>Organization: ${cert.organization}</p>
        <p>Status: <span class="${statusClass}">${cert.status}</span></p>
        <p>Date: ${cert.date}</p>
      </div>
      <div class="certificate-impact">
        ${cert.impact > 0 ? `+${cert.impact} points` : 'Pending verification'}
      </div>
    `;
    
    container.appendChild(certItem);
  });
}

function updateAIRecommendations() {
  const container = document.getElementById('ai-recommendations');
  if (!container || !currentUser) return;
  
  container.innerHTML = '';
  
  const insights = generateAIInsights(currentUser);
  
  insights.forEach(insight => {
    const insightItem = document.createElement('div');
    insightItem.className = 'ai-insight';
    
    insightItem.innerHTML = `
      <h4>${insight.title}</h4>
      <p>${insight.message}</p>
    `;
    
    container.appendChild(insightItem);
  });
}

function uploadCertificate() {
  const fileInput = document.getElementById('certificate-upload');
  if (!fileInput) return;
  
  const file = fileInput.files[0];
  
  if (!file) {
    showNotification('Please select a certificate file.', 'error');
    return;
  }
  
  const statusContainer = document.getElementById('certificate-status');
  if (statusContainer) {
    statusContainer.className = 'certificate-status processing';
    statusContainer.innerHTML = `
      <div class="processing-indicator">
        <div class="loading"></div>
        <span>Processing certificate with AI-powered OCR...</span>
      </div>
    `;
    
    setTimeout(() => {
      const newCert = {
        name: "New Certificate",
        organization: "Detected Organization",
        status: "pending",
        impact: 0,
        date: new Date().toISOString().split('T')[0]
      };
      
      if (currentUser && currentUser.certificates) {
        currentUser.certificates.push(newCert);
      }
      
      statusContainer.className = 'certificate-status success';
      statusContainer.innerHTML = `
        <h4>Certificate Processed Successfully!</h4>
        <p>Certificate: ${newCert.name}</p>
        <p>Organization: ${newCert.organization}</p>
        <p>Status: Pending teacher verification</p>
      `;
      
      updateStudentCertificates();
      fileInput.value = '';
      
      showNotification('Certificate uploaded and processed successfully!', 'success');
    }, 3000);
  }
}

// Teacher Dashboard Functions
function initializeTeacherDashboard() {
  console.log('Initializing teacher dashboard');
  if (!currentUser || currentRole !== 'teacher') return;
  
  const teacherNameEl = document.getElementById('teacher-name');
  if (teacherNameEl) {
    teacherNameEl.textContent = currentUser.name;
  }
  
  // Update metrics
  const deptStudents = students.filter(s => s.department === currentUser.department);
  const pendingCerts = deptStudents.reduce((count, student) => 
    count + student.certificates.filter(cert => cert.status === 'pending').length, 0);
  
  updateElement('teacher-student-count', deptStudents.length);
  updateElement('pending-verifications', pendingCerts);
  updateElement('dept-average', departments.find(d => d.name === currentUser.department)?.averageScore || 758);
  
  updateTeacherCourses();
  updateAttendanceList();
  updateStudentAnalysis();
  updatePendingCertificates();
  updateTeacherDepartmentChart();
}

function updateTeacherDepartmentChart() {
  setTimeout(() => {
    const canvas = document.getElementById('teacher-dept-chart');
    if (canvas && window.Chart) {
      const ctx = canvas.getContext('2d');
      const deptStudents = students.filter(s => s.department === currentUser.department);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: deptStudents.map(s => s.name),
          datasets: [{
            label: 'Merit Score',
            data: deptStudents.map(s => s.meritScore),
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, 200);
}

function generateTeacherReport() {
  showNotification('Generating department report...', 'info');
  setTimeout(() => {
    showNotification('Department report generated successfully!', 'success');
  }, 2000);
}

function updateTeacherCourses() {
  const container = document.getElementById('teacher-courses');
  if (!container || !currentUser || !currentUser.courses) return;
  
  container.innerHTML = '';
  
  currentUser.courses.forEach(course => {
    const courseItem = document.createElement('div');
    courseItem.className = 'course-item';
    
    courseItem.innerHTML = `
      <div class="course-info">
        <h4>${course.name}</h4>
        <p>Course ID: ${course.id}</p>
        <p>${course.students.length} students enrolled</p>
      </div>
      <div class="gps-toggle">
        <span>GPS Attendance:</span>
        <div class="toggle-switch ${course.gpsEnabled ? 'active' : ''}" 
             onclick="toggleGPS('${course.id}')">
          <div class="toggle-slider"></div>
        </div>
      </div>
    `;
    
    container.appendChild(courseItem);
  });
}

function toggleGPS(courseId) {
  if (!currentUser || !currentUser.courses) return;
  
  const course = currentUser.courses.find(c => c.id === courseId);
  if (course) {
    course.gpsEnabled = !course.gpsEnabled;
    
    if (course.gpsEnabled && !course.location) {
      course.location = { lat: 19.0760, lng: 72.8777, radius: 100 };
    }
    
    updateTeacherCourses();
    showNotification(`GPS attendance ${course.gpsEnabled ? 'enabled' : 'disabled'} for ${course.name}`, 'success');
  }
}

function updateAttendanceList() {
  const container = document.getElementById('attendance-list');
  if (!container || !currentUser || !currentUser.courses) return;
  
  container.innerHTML = '';
  
  const todayAttendance = currentUser.courses.flatMap(course => 
    course.students.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return {
        course: course.name,
        student: student,
        status: 'present',
        gpsVerified: course.gpsEnabled,
        time: '09:30 AM'
      };
    })
  );
  
  if (todayAttendance.length === 0) {
    container.innerHTML = '<p class="text-center">No attendance records for today.</p>';
    return;
  }
  
  todayAttendance.forEach(record => {
    if (!record.student) return;
    
    const attendanceItem = document.createElement('div');
    attendanceItem.className = 'attendance-item';
    
    attendanceItem.innerHTML = `
      <div class="student-info">
        <h4>${record.student.name}</h4>
        <p>${record.course} - ${record.time}</p>
        <p>GPS Verified: ${record.gpsVerified ? 'Yes' : 'No'}</p>
      </div>
      <div class="attendance-actions">
        <button class="btn btn--secondary btn--sm" onclick="markProxy('${record.student.id}')">
          Mark Proxy
        </button>
        <button class="btn btn--outline btn--sm" onclick="addManualAttendance('${record.student.id}')">
          Add Manual
        </button>
      </div>
    `;
    
    container.appendChild(attendanceItem);
  });
}

function markProxy(studentId) {
  const student = students.find(s => s.id === studentId);
  if (student) {
    updateMeritScore(studentId, -10, 'Proxy Attendance Detected');
    student.attendancePercentage = Math.max(0, student.attendancePercentage - 5);
    showNotification(`${student.name} marked for proxy attendance.`, 'warning');
    updateAttendanceList();
  }
}

function addManualAttendance(studentId) {
  const student = students.find(s => s.id === studentId);
  if (student) {
    updateMeritScore(studentId, 2, 'Manual Attendance Added');
    student.attendancePercentage = Math.min(100, student.attendancePercentage + 1);
    showNotification(`Manual attendance added for ${student.name}.`, 'success');
    updateAttendanceList();
  }
}

function updateStudentAnalysis() {
  const container = document.getElementById('department-students');
  if (!container || !currentUser) return;
  
  container.innerHTML = '';
  
  const departmentStudents = students.filter(s => s.department === currentUser.department);
  
  departmentStudents.forEach(student => {
    const studentCard = document.createElement('div');
    studentCard.className = 'student-card';
    
    studentCard.innerHTML = `
      <div class="student-header">
        <div class="student-info">
          <h4>${student.name}</h4>
          <p>${student.studentId} - Semester ${student.semester}</p>
        </div>
        <div class="status status--success">Active</div>
      </div>
      <div class="student-metrics">
        <div class="metric">
          <div class="metric-label">Merit Score</div>
          <div class="metric-val">${student.meritScore}</div>
        </div>
        <div class="metric">
          <div class="metric-label">CGPA</div>
          <div class="metric-val">${student.cgpa}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Attendance</div>
          <div class="metric-val">${student.attendancePercentage}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Certificates</div>
          <div class="metric-val">${student.certificates.length}</div>
        </div>
      </div>
    `;
    
    container.appendChild(studentCard);
  });
}

function updatePendingCertificates() {
  const container = document.getElementById('pending-certificates');
  if (!container) return;
  
  container.innerHTML = '';
  
  const pendingCerts = [];
  students.forEach(student => {
    student.certificates.forEach(cert => {
      if (cert.status === 'pending') {
        pendingCerts.push({ student, cert });
      }
    });
  });
  
  if (pendingCerts.length === 0) {
    container.innerHTML = '<p class="text-center">No pending certificate verifications.</p>';
    return;
  }
  
  pendingCerts.forEach(({ student, cert }) => {
    const certItem = document.createElement('div');
    certItem.className = 'pending-cert-item';
    
    certItem.innerHTML = `
      <div class="certificate-details">
        <h4>${cert.name}</h4>
        <p>Student: ${student.name}</p>
        <p>Organization: ${cert.organization}</p>
        <p>Uploaded: ${cert.date}</p>
      </div>
      <div class="cert-verification-actions">
        <button class="btn btn--primary btn--sm" onclick="verifyCertificate('${student.id}', '${cert.name}', true)">
          Verify
        </button>
        <button class="btn btn--secondary btn--sm" onclick="verifyCertificate('${student.id}', '${cert.name}', false)">
          Reject
        </button>
      </div>
    `;
    
    container.appendChild(certItem);
  });
}

function verifyCertificate(studentId, certName, approved) {
  const student = students.find(s => s.id === studentId);
  const cert = student ? student.certificates.find(c => c.name === certName) : null;
  
  if (cert) {
    if (approved) {
      cert.status = 'verified';
      cert.impact = 20;
      updateMeritScore(studentId, cert.impact, 'Certificate Verified');
      showNotification(`Certificate verified for ${student.name}!`, 'success');
    } else {
      cert.status = 'rejected';
      updateMeritScore(studentId, -5, 'Certificate Rejected');
      showNotification(`Certificate rejected for ${student.name}.`, 'warning');
    }
    
    updatePendingCertificates();
    
    // Update metrics
    if (currentRole === 'teacher') {
      const deptStudents = students.filter(s => s.department === currentUser.department);
      const pendingCount = deptStudents.reduce((count, student) => 
        count + student.certificates.filter(cert => cert.status === 'pending').length, 0);
      updateElement('pending-verifications', pendingCount);
    }
  }
}

// Admin Dashboard Functions
function initializeAdminDashboard() {
  console.log('Initializing admin dashboard');
  updateDepartmentAnalysis();
  updateAdminCharts();
  updateERPIntegrations();
  updateAuditLogs();
  updateReportQueue();
}

function updateDepartmentAnalysis() {
  const container = document.getElementById('department-analysis');
  if (!container) return;
  
  container.innerHTML = '';
  
  departments.forEach(dept => {
    const deptCard = document.createElement('div');
    deptCard.className = 'department-card';
    deptCard.onclick = () => showDepartmentStudents(dept);
    
    deptCard.innerHTML = `
      <div class="department-header">
        <h3 class="department-name">${dept.name}</h3>
        <div class="status status--success">Active</div>
      </div>
      <div class="department-stats">
        <div class="metric">
          <div class="metric-label">Total Students</div>
          <div class="metric-val">${dept.totalStudents}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Avg Merit Score</div>
          <div class="metric-val">${dept.averageScore}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Attendance Rate</div>
          <div class="metric-val">${dept.attendanceRate}%</div>
        </div>
      </div>
    `;
    
    container.appendChild(deptCard);
  });
}

function showDepartmentStudents(department) {
  const deptStudents = students.filter(s => s.department === department.name);
  showNotification(`${department.name} Department: ${deptStudents.length} students`, 'info');
}

function updateAdminCharts() {
  setTimeout(() => {
    const deptCanvas = document.getElementById('department-chart');
    if (deptCanvas && window.Chart) {
      const deptCtx = deptCanvas.getContext('2d');
      new Chart(deptCtx, {
        type: 'bar',
        data: {
          labels: departments.map(d => d.name),
          datasets: [{
            label: 'Average Merit Score',
            data: departments.map(d => d.averageScore),
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    const trendCanvas = document.getElementById('performance-trend-chart');
    if (trendCanvas && window.Chart) {
      const trendCtx = trendCanvas.getContext('2d');
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Institution Average',
            data: [720, 735, 750, 740, 755, 729],
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }, 200);
}

// AI Report Generator Functions
function generateAIReport() {
  const template = document.getElementById('report-template').value;
  const period = document.getElementById('report-period').value;
  const departments = Array.from(document.getElementById('report-departments').selectedOptions).map(option => option.value);
  
  if (!template) {
    showNotification('Please select a report template.', 'error');
    return;
  }
  
  const templateInfo = aiReportTemplates[template];
  if (!templateInfo) return;
  
  const reportId = 'RPT' + (reportQueue.length + 1).toString().padStart(3, '0');
  const newReport = {
    id: reportId,
    template: template,
    templateName: templateInfo.name,
    period: period,
    departments: departments,
    status: 'generating',
    progress: 0,
    startTime: new Date(),
    estimatedCompletion: templateInfo.estimatedTime,
    requestedBy: currentUser.name
  };
  
  reportQueue.push(newReport);
  
  // Add audit log
  auditLogs.unshift({
    id: auditLogs.length + 1,
    action: "AI Report Generation Started",
    user: currentUser.name,
    target: `${templateInfo.name} - ${reportId}`,
    timestamp: new Date().toLocaleString(),
    severity: "info"
  });
  
  showNotification(`Report generation started: ${templateInfo.name}`, 'success');
  updateReportQueue();
  
  // Simulate report generation progress
  simulateReportGeneration(reportId);
}

function simulateReportGeneration(reportId) {
  const report = reportQueue.find(r => r.id === reportId);
  if (!report) return;
  
  const interval = setInterval(() => {
    report.progress += Math.random() * 15 + 5;
    
    if (report.progress >= 100) {
      report.progress = 100;
      report.status = 'completed';
      report.downloadUrl = '#'; // Simulated download URL
      
      // Add completion audit log
      auditLogs.unshift({
        id: auditLogs.length + 1,
        action: "AI Report Generation Completed",
        user: "System",
        target: `${report.templateName} - ${reportId}`,
        timestamp: new Date().toLocaleString(),
        severity: "success"
      });
      
      showNotification(`Report completed: ${report.templateName}`, 'success');
      clearInterval(interval);
    }
    
    updateReportQueue();
  }, 1000);
}

function updateReportQueue() {
  const container = document.getElementById('report-queue-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (reportQueue.length === 0) {
    container.innerHTML = '<p class="text-center">No reports in queue.</p>';
    return;
  }
  
  reportQueue.forEach(report => {
    const queueItem = document.createElement('div');
    queueItem.className = 'report-queue-item';
    
    queueItem.innerHTML = `
      <div class="report-info">
        <h4>${report.templateName}</h4>
        <p>ID: ${report.id} | Status: ${report.status}</p>
        <p>Requested by: ${report.requestedBy}</p>
      </div>
      <div class="report-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${report.progress}%"></div>
        </div>
        <p class="text-sm">${Math.round(report.progress)}% complete</p>
      </div>
      <div class="report-actions">
        ${report.status === 'completed' ? 
          '<button class="btn btn--primary btn--sm" onclick="downloadReport(\'' + report.id + '\')">Download</button>' :
          '<button class="btn btn--outline btn--sm" disabled>Generating...</button>'
        }
      </div>
    `;
    
    container.appendChild(queueItem);
  });
}

function downloadReport(reportId) {
  const report = reportQueue.find(r => r.id === reportId);
  if (report) {
    showNotification(`Downloading ${report.templateName}...`, 'success');
    // In a real implementation, this would trigger an actual download
  }
}

// ERP Integration Functions
function updateERPIntegrations() {
  const container = document.getElementById('erp-connections');
  if (!container) return;
  
  container.innerHTML = '';
  
  erpIntegrations.forEach(erp => {
    const erpItem = document.createElement('div');
    erpItem.className = 'erp-connection';
    
    const lastSync = erp.lastSync ? new Date(erp.lastSync).toLocaleString() : 'Never';
    
    erpItem.innerHTML = `
      <div class="erp-info">
        <h4>${erp.name}</h4>
        <p>Type: ${erp.type}</p>
        <p>Last Sync: ${lastSync}</p>
        <p>Frequency: ${erp.syncFrequency}</p>
      </div>
      <div class="erp-status-container">
        <div class="erp-status ${erp.status === 'connected' ? 'connected' : erp.status === 'pending_configuration' ? 'pending' : 'error'}">
          ${erp.status.replace('_', ' ')}
        </div>
        <div class="erp-actions mt-8">
          <button class="btn btn--outline btn--sm" onclick="configureERP('${erp.id}')">
            ${erp.status === 'connected' ? 'Reconfigure' : 'Configure'}
          </button>
          ${erp.status === 'connected' ? 
            '<button class="btn btn--primary btn--sm ml-8" onclick="syncERP(\'' + erp.id + '\')">Sync Now</button>' : ''
          }
        </div>
      </div>
    `;
    
    container.appendChild(erpItem);
  });
  
  updateSyncStatus();
}

function updateSyncStatus() {
  const container = document.getElementById('sync-status');
  if (!container) return;
  
  const connectedERPs = erpIntegrations.filter(erp => erp.status === 'connected');
  
  if (connectedERPs.length === 0) {
    container.innerHTML = '<p class="text-center">No active ERP connections to sync.</p>';
    return;
  }
  
  const syncData = [
    { name: 'Student Records', lastSync: '2 minutes ago', status: 'success' },
    { name: 'Grade Data', lastSync: '5 minutes ago', status: 'success' },
    { name: 'Attendance Data', lastSync: '1 minute ago', status: 'success' },
    { name: 'Course Information', lastSync: '10 minutes ago', status: 'warning' }
  ];
  
  container.innerHTML = `
    <div class="sync-status-grid">
      ${syncData.map(item => `
        <div class="sync-status-item">
          <h4>${item.name}</h4>
          <div class="status status--${item.status === 'success' ? 'success' : 'warning'}">${item.status}</div>
          <p class="sync-time">${item.lastSync}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function addNewERP() {
  showModal('erp-config-modal');
}

function configureERP(erpId) {
  const erp = erpIntegrations.find(e => e.id === erpId);
  if (erp) {
    // Pre-fill form with existing data
    document.getElementById('erp-name').value = erp.name;
    document.getElementById('erp-type').value = erp.type.toLowerCase().replace(' ', '_');
    document.getElementById('erp-endpoint').value = erp.endpoint;
    document.getElementById('erp-sync-freq').value = erp.syncFrequency;
  }
  showModal('erp-config-modal');
}

function saveERPConfig() {
  const name = document.getElementById('erp-name').value;
  const type = document.getElementById('erp-type').value;
  const endpoint = document.getElementById('erp-endpoint').value;
  const syncFreq = document.getElementById('erp-sync-freq').value;
  
  if (!name || !endpoint) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }
  
  // Add audit log
  auditLogs.unshift({
    id: auditLogs.length + 1,
    action: "ERP Configuration Saved",
    user: currentUser.name,
    target: name,
    timestamp: new Date().toLocaleString(),
    severity: "info"
  });
  
  showNotification('ERP configuration saved successfully!', 'success');
  hideModal('erp-config-modal');
  updateERPIntegrations();
}

function testERPConnection() {
  showNotification('Testing ERP connection...', 'info');
  setTimeout(() => {
    showNotification('ERP connection test successful!', 'success');
  }, 2000);
}

function syncERP(erpId) {
  const erp = erpIntegrations.find(e => e.id === erpId);
  if (erp) {
    showNotification(`Syncing with ${erp.name}...`, 'info');
    
    setTimeout(() => {
      erp.lastSync = new Date().toISOString();
      showNotification(`Sync completed with ${erp.name}!`, 'success');
      updateERPIntegrations();
      
      // Add audit log
      auditLogs.unshift({
        id: auditLogs.length + 1,
        action: "ERP Sync Completed",
        user: currentUser.name,
        target: erp.name,
        timestamp: new Date().toLocaleString(),
        severity: "success"
      });
    }, 3000);
  }
}

// Permissions Management Functions
function savePermissions() {
  // Add audit log
  auditLogs.unshift({
    id: auditLogs.length + 1,
    action: "Permissions Updated",
    user: currentUser.name,
    target: "System Permissions",
    timestamp: new Date().toLocaleString(),
    severity: "warning"
  });
  
  showNotification('Permissions saved successfully!', 'success');
}

function resetPermissions() {
  // Add audit log
  auditLogs.unshift({
    id: auditLogs.length + 1,
    action: "Permissions Reset",
    user: currentUser.name,
    target: "System Permissions",
    timestamp: new Date().toLocaleString(),
    severity: "warning"
  });
  
  showNotification('Permissions reset to default values!', 'info');
}

// Audit Logs Functions
function updateAuditLogs() {
  const container = document.getElementById('audit-logs');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (auditLogs.length === 0) {
    container.innerHTML = '<p class="text-center">No audit logs available.</p>';
    return;
  }
  
  auditLogs.slice(0, 20).forEach(log => { // Show last 20 logs
    const logItem = document.createElement('div');
    logItem.className = 'audit-log-item';
    
    logItem.innerHTML = `
      <div class="audit-info">
        <h4>${log.action}</h4>
        <p>User: ${log.user} | Target: ${log.target}</p>
      </div>
      <div class="audit-timestamp">
        <div class="status status--${log.severity}">${log.severity}</div>
        <p class="text-sm mt-4">${log.timestamp}</p>
      </div>
    `;
    
    container.appendChild(logItem);
  });
}

// Modal Functions
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

// Utility Functions
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

// Real-time Updates
function startRealTimeUpdates() {
  if (simulationInterval) clearInterval(simulationInterval);
  
  simulationInterval = setInterval(() => {
    students.forEach(student => {
      const change = Math.floor(Math.random() * 3) - 1;
      if (change !== 0) {
        student.meritScore += change;
        student.meritScore = Math.max(0, student.meritScore);
      }
    });
    
    if (currentRole === 'student' && currentUser) {
      const meritScoreEl = document.getElementById('student-merit-score');
      if (meritScoreEl) {
        meritScoreEl.textContent = currentUser.meritScore;
      }
    }
    
    if (Math.random() < 0.1) {
      userLocation.lat += (Math.random() - 0.5) * 0.001;
      userLocation.lng += (Math.random() - 0.5) * 0.001;
      
      if (currentRole === 'student') {
        updateGPSClasses();
      }
    }
  }, 5000);
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1001;
    max-width: 300px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Event Handlers
function handleLogin(e) {
  e.preventDefault();
  
  const role = document.getElementById('role').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log(`Attempting login for role: ${role}`);
  
  if (login(role, email, password)) {
    showNotification(`Welcome, ${currentUser.name}!`, 'success');
    setTimeout(() => {
      console.log(`Login successful, showing dashboard for: ${role}`);
      showDashboard(role);
    }, 100);
  } else {
    showNotification('Invalid credentials. Please try again.', 'error');
  }
}

function handleRoleChange() {
  const role = document.getElementById('role').value;
  if (role && demoCredentials[role]) {
    document.getElementById('email').value = demoCredentials[role].email;
    document.getElementById('password').value = demoCredentials[role].password;
  }
}

function handleTabClick(e) {
  const tabId = e.target.dataset.tab;
  const dashboard = e.target.closest('.dashboard');
  
  // Update tab buttons
  dashboard.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  
  // Update tab content
  dashboard.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const tabContent = document.getElementById(tabId);
  if (tabContent) {
    tabContent.classList.add('active');
    
    // Trigger updates for specific tabs
    if (tabId === 'admin-ai-reports-tab') {
      updateReportQueue();
    } else if (tabId === 'admin-integrations-tab') {
      updateERPIntegrations();
    } else if (tabId === 'admin-audit-tab') {
      updateAuditLogs();
    }
  }
}

// Global functions for inline event handlers
window.markAttendance = markAttendance;
window.toggleGPS = toggleGPS;
window.markProxy = markProxy;
window.addManualAttendance = addManualAttendance;
window.verifyCertificate = verifyCertificate;
window.showDepartmentStudents = showDepartmentStudents;
window.generateAIReport = generateAIReport;
window.downloadReport = downloadReport;
window.addNewERP = addNewERP;
window.configureERP = configureERP;
window.saveERPConfig = saveERPConfig;
window.testERPConnection = testERPConnection;
window.syncERP = syncERP;
window.savePermissions = savePermissions;
window.resetPermissions = resetPermissions;
window.generateTeacherReport = generateTeacherReport;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing application');
  
  // Ensure clean state on page load
  showLoginPage();
  
  // Attach event listeners
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const roleSelect = document.getElementById('role');
  if (roleSelect) {
    roleSelect.addEventListener('change', handleRoleChange);
  }
  
  const uploadBtn = document.getElementById('upload-certificate-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadCertificate);
  }
  
  const generateReportBtn = document.getElementById('generate-report-btn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateAIReport);
  }
  
  // Logout buttons
  const logoutButtons = [
    { id: 'logout-btn', handler: logout },
    { id: 'logout-btn-teacher', handler: logout },
    { id: 'logout-btn-admin', handler: logout }
  ];
  
  logoutButtons.forEach(({ id, handler }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.replaceWith(btn.cloneNode(true));
      const newBtn = document.getElementById(id);
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`${id} clicked`);
        handler();
      });
    }
  });
  
  // Tab navigation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-btn')) {
      handleTabClick(e);
    }
  });
  
  // Modal close handlers
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-modal-btn')) {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    }
  });
  
  console.log('Application initialized successfully');
});