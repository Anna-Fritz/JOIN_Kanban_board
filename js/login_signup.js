let users = [];
const REG_URL = "http://127.0.0.1:8000/api/auth/registration/";
const LOGIN_URL = "http://127.0.0.1:8000/api/auth/login/";
const BASE_URL = "http://127.0.0.1:8000/api/user/";
const GUEST_LOGIN_URL = "http://127.0.01:8000/api/auth/login/guest/";

/**
 * Adding a user to the Database incl. popup, timing, form reset etc.
 */
async function addUser() {
  let email = document.getElementById("userEmail").value;

  const userExists = users.some((user) => user.email === email);

  if (userExists) {
    alert("An account with this email already exists!");
  } else {
    const signupSuccessElement = document.getElementById("userCreatedSuccess");
    signupSuccessElement.classList.remove("d-none");
    setTimeout(showCreatedUserSuccessPopUp, 100);
    addUserToDb();
    addUserToContactList();
    setTimeout(function () {
      window.location.href = "../index.html";
    }, 1500);
  }

  document.getElementById("userName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("confirmUserPassword").value = "";
}

/**
 * New user to DB push
 * @returns
 */
async function addUserToDb() {
  let username = splitUsername();
  let mail = document.getElementById("userEmail");
  let password = document.getElementById("userPassword");
  let confirmedPassword = document.getElementById("confirmUserPassword");
  let data = {
    username: `${username}`,
    email: `${mail.value}`,
    password: `${password.value}`,
    confirmed_password: `${confirmedPassword.value}`,
  };
  try {
    let response = await fetch(REG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorData = await response.json();
      document.getElementById("error-message").innerHTML = errorData.error;
      throw new Error(errorData.error || "An unknown error occurred");
    }

    let userData = await response.json();
    return userData;
  } catch (error) {
    return error.error;
  }
}

/**
 * retrieves the value of the username input, formats it by trimming spaces, replacing spaces with hyphens, and converting it to lowercase; if the formatted name is too short, it displays an error message
 * @returns 
 */
function splitUsername() {
  let username = document.getElementById("userName").value;
  let fullName = username.trim().replace(" ", "-").toLowerCase();
  if (fullName.length < 2) {
    document.getElementById("addNameError").innerHTML =
      "Please enter first and last name";
  } else {
    return fullName;
  }
}

async function addUserToContactList() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let username = document.getElementById("userName");
  let mail = document.getElementById("userEmail");
  let color = generateRandomColor();

  let data = {
    username: `${username.value}`,
    email: `${mail.value}`,
    contactNumber: `Not Provided`,
    color: color,
  };

  try {
    let response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return error.error;
  }
}

/**
 * Login function, checking and setting localstorage if checked. Checking data, popup animation
 * and linking to the summary after login.
 */
async function login() {
  let userEmail = document.getElementById("enterUserEmail").value;
  let userPassword = document.getElementById("enterUserPassword").value;
  let wrongCredentials = document.getElementById("loginPasswordInputError");

  let data = {
    email: userEmail,
    password: userPassword,
    remember: document.querySelector('input[name="remember"]').checked // Checkbox-Wert holen
  };

  let login = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (login.ok) {
    const data = await login.json();
    saveLoginData(data);
    const loginSuccessElement = document.getElementById("loginSuccess");
    loginSuccessElement.classList.remove("d-none");
    setTimeout(loginSuccessfullPopUp, 100);
    users = [];
    setTimeout(function () {
      window.location.href = "../html/summary.html";
    }, 1500);
  } else {
    wrongCredentials.innerHTML = "Invalid email or password";
  }
}

/**
 * Formvalidation for Signup until adding a new user to DB
 * @returns
 */
function validateNameInput() {
  let x = document.getElementById("userName").value;
  let xName = document.getElementById("addNameError");
  if (x == "") {
    xName.innerHTML = "Please enter your Name";
    return false;
  } else {
    xName.innerHTML = "";
    return validateEmailInput();
  }
}

function validateEmailInput() {
  let x = document.getElementById("userEmail").value;
  let xMail = document.getElementById("addEmailError");
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (x == "") {
    xMail.innerHTML = "Please enter your Email";
    return false;
  } else if (!emailRegex.test(x)) {
    xMail.innerHTML = "Please enter a valid Email address";
    return false;
  } else {
    xMail.innerHTML = "";
    return validatePasswordInput();
  }
}

function validatePasswordInput() {
  let x = document.getElementById("userPassword").value;
  let xPw = document.getElementById("addPasswordError");
  if (x == "") {
    xPw.innerHTML = "Please enter a Password";
    return false;
  } else {
    xPw.innerHTML = "";
    return validateConfirmPasswordInput();
  }
}

function validateConfirmPasswordInput() {
  let x = document.getElementById("confirmUserPassword").value;
  let xConfirmPw = document.getElementById("addConfirmPasswordError");
  if (x == "" || x != document.getElementById("userPassword").value) {
    xConfirmPw.innerHTML = "Please confirm your Password";
    return false;
  } else {
    xConfirmPw.innerHTML = "";
    return validatePrivacyInput();
  }
}

function validatePrivacyInput() {
  let x = document.getElementById("acceptPp").checked;
  let xPrivacy = document.getElementById("addPrivacyError");
  if (x != true) {
    xPrivacy.innerHTML = "Please accept our Privacy Policy";
  } else {
    xPrivacy.innerHTML = "";
    return addUser();
  }
}

/**
 * Popups for creating a new user and logging in
 */
function showCreatedUserSuccessPopUp() {
  if (window.innerWidth > 650) {
    document.getElementById("userCreatedSuccess").style = `left: 39%;`;
  } else {
    document.getElementById("userCreatedSuccess").style = `left: 15%;`;
  }
}

function loginSuccessfullPopUp() {
  const loginSuccessElement = document.getElementById("loginSuccess");
  loginSuccessElement.classList.remove("d-none");
  if (window.innerWidth > 650) {
    loginSuccessElement.style.left = "39%";
  } else {
    loginSuccessElement.style.left = "15%";
  }
}

/**
 * Formvalidation for login
 * @returns
 */
function validateLoginEmailInput() {
  let x = document.getElementById("enterUserEmail").value;
  let xName = document.getElementById("loginEmailInputError");
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (x == "") {
    xName.innerHTML = "Please enter your Email";
    return false;
  } else if (!emailRegex.test(x)) {
    xName.innerHTML = "Please enter a valid Email address";
    return false;
  } else {
    xName.innerHTML = "";
    return validateLoginPasswordInput();
  }
}

function validateLoginPasswordInput() {
  let x = document.getElementById("enterUserPassword").value;
  let xName = document.getElementById("loginPasswordInputError");
  if (x == "") {
    xName.innerHTML = "Please enter your Password";
    return false;
  } else {
    xName.innerHTML = "";
    return login();
  }
}

/**
 * Remember me checkbox saving data to localstorage
 */
function saveLoginData(data) {
  let fullName = data.username
    .replace("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  localStorage.setItem("username", fullName);
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("accessToken", data.accessToken);
}

/**
 * checks for an existing access token in localStorage, and if present, sends a request to refresh the token; if successful, it updates the stored access token, otherwise redirects the user to the login page
 * @returns 
 */
async function refreshToken() {
  const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        return;
    }
  const response = await fetch("http://localhost:8000/api/auth/login/refresh/", {
      method: "POST",
      credentials: "include", // included cookie
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
  });
  if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken); // save new accessToken
  } else {
      console.error("Session expired. Please login again.");
      logOut();
  }
}

/**
 * checks if users color-scheme is dark and sets the appropriate favicon
 */
function setFavicon() {
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const favicon = document.getElementById("favicon");

  if (darkModeMediaQuery.matches) {
    favicon.href = "favicon_dark.svg"; // Dark Mode Favicon
  } else {
    favicon.href = "favicon.svg"; // Light Mode Favicon
  }
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", setFavicon);

/**
 * Generating a random CSS Color for the contactlist
 * @returns
 */
function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


async function loginGuest() {
  let guestLogin = await fetch(GUEST_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (guestLogin.ok) {
    let response = await guestLogin.json();
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("guestLogin", true);
    const loginSuccessElement = document.getElementById("loginSuccess");
    loginSuccessElement.classList.remove("d-none");
    setTimeout(loginSuccessfullPopUp, 100);
    users = [];
    setTimeout(function () {
      window.location.href = "../html/summary.html";
    }, 1500);
  } else {
    wrongCredentials.innerHTML = "Guest Login temporerly not available";
  }
}