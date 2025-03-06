const SUMMARY_URL =
  "http://127.0.0.1:8000/api/summary/";

/**
 * Getting DB data for summary
 */
async function renderKeyMetrics() {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
      return;
  }

  let response = await fetch(SUMMARY_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (response.status === 401) {
    await refreshToken();
    return renderKeyMetrics();
  }
  if (response.ok) {
    const data = await response.json();
    fillKeyMetrics(data);  
  }
}

/**
 * Rendering summarydata in HTML
 */
function fillKeyMetrics(summary) {
  let toDoCount = summary.todo_count;
  document.getElementById("render-to-do-count").innerHTML = `${toDoCount}`;
  let doneCount = summary.done_count;
  document.getElementById("render-done-count").innerHTML = `${doneCount}`;
  checkUrgentTasks(summary);
  fillKeyMetricsAmounts(summary);
}

/**
 * Checks for urgent tasks in the provided task list, updates the count in the UI, and displays the next urgent deadline if any exist.
 * 
 * @param {Array} summary - The list of tasks to be checked for urgency.
 */
function checkUrgentTasks(summary) {
  let urgentCount = summary.urgent_count;
  if (urgentCount > 0) {
    document.getElementById(
      "render-urgent-count"
    ).innerHTML = `${urgentCount}`;
    getNextUrgentDate(summary);
  } else {
    document.getElementById("render-urgent-count").innerHTML = `0`;
    document.getElementById(
      "upcoming-deadline"
    ).innerHTML = `No Urgent Deadlines`;
  }
}

/**
 * Updates the key metrics on the board (total tasks, in-progress tasks, and tasks awaiting feedback) based on the provided tasks array.
 */
function fillKeyMetricsAmounts(summary) {
  let allTasks = summary.total_tasks;
  document.getElementById("tasks-in-board-count").innerHTML = `${allTasks}`;
  let inProgressCount = summary.in_progress_count;
  document.getElementById(
    "tasks-in-progress-count"
  ).innerHTML = `${inProgressCount}`;
  let awaitFeedbackCount = summary.awaiting_feedback_count;
  document.getElementById(
    "tasks-await-feedback-count"
  ).innerHTML = `${awaitFeedbackCount}`;
}

/**
 * Selecting next urgent date for summary and display in HTML
 */
function getNextUrgentDate(summary) {
  let nextDate = summary.most_urgent_due_date;
  let dateObjekt = new Date(nextDate);
  let formatedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObjekt);
  document.getElementById("rendered-deadline").innerHTML = `${formatedDate}`;
}

/**
 * Checking user and displaying the correct greeting in summary
 */
function checkUserStatus() {
  if (localStorage.getItem("pageLoaded") == null) {
    if (localStorage.getItem("username") == null) {
      updateGreetingGuest();
      showMobileGreeting();
    } else {
      updateGreeting();
      getUsername();
      showMobileGreeting();
    }
    localStorage.setItem("pageLoaded", "true");
  } else {
    if (localStorage.getItem("username") == null) {
      updateGreetingGuest();
    } else {
      updateGreeting();
      getUsername();
    }
  }
}

/**
 * Timecheck for greeting in summary
 */
function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const greetingCont = document.getElementById("variable-greeting");
  const greetingContMobile = document.getElementById(
    "variable-greeting-mobile"
  );
  let greeting;
  if (hour >= 6 && hour < 12) {
    greeting = "Good Morning,";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good Afternoon,";
  } else if (hour >= 18 && hour < 24) {
    greeting = "Good Evening,";
  } else {
    greeting = "Good Night,";
  }
  greetingCont.innerHTML = greeting;
  greetingContMobile.innerHTML = greeting;
}

/**
 * Timecheck for Guestlogin
 */
function updateGreetingGuest() {
  const now = new Date();
  const hour = now.getHours();
  const greetingCont = document.getElementById("variable-greeting");
  const greetingContMobile = document.getElementById(
    "variable-greeting-mobile"
  );
  let greeting;
  if (hour >= 6 && hour < 12) {
    greeting = "Good Morning!";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good Afternoon!";
  } else if (hour >= 18 && hour < 24) {
    greeting = "Good Evening!";
  } else {
    greeting = "Good Night!";
  }

  greetingCont.innerHTML = greeting;
  greetingContMobile.innerHTML = greeting;
  document.getElementById("greeting-user-name").classList.add("d-none");
  document.getElementById("greeting-user-name-mobile").classList.add("d-none");
}

/**
 * Updating greeting time for correct greeting
 */
setInterval(updateGreeting, 3600000);
setInterval(updateGreetingGuest, 3600000);

/**
 * Getting and saving username for display in summary
 */
function saveUsernameLocal(username) {
  localStorage.setItem("username", username);
}

function getUsername() {
  let storedUserName = localStorage.getItem("username");
  setUserGreeting(storedUserName);
}

/**
 * Display user in greeting, app and mobile
 */
function setUserGreeting(username) {
  document.getElementById("greeting-user-name").innerHTML = `${username}`;
  document.getElementById(
    "greeting-user-name-mobile"
  ).innerHTML = `${username}`;
}

/**
 * displays a mobile greeting message
 */
function showMobileGreeting() {
  if (window.innerWidth < 1210) {
    document.getElementById("greeting-user-mobile").classList.remove("d-none");
    setTimeout(hideMobileGreeting, 2000);
  }
}

/**
 * hides the mobile greeting message
 */
function hideMobileGreeting() {
  document.getElementById("greeting-user-mobile").classList.add("d-none");
}
