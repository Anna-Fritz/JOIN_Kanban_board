const BASE_URL =
  "http://127.0.0.1:8000/api/user/";

let loadedUserArray = {};
let colors = [];
let userColors = {};

/**
 * Loading data from DB and moves it to an local object for display
 */
async function loadData() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
    // important when permission_classes = [IsAuthenticated] for permission to use
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  loadedUserArray = data;
  displayContacts(loadedUserArray);
}

/**
 * Sorting and displaying the contactlist
 * @param {*} users
 */
async function displayContacts(users) {
  let container = document.getElementById("contact-list");
  container.innerHTML = "";
  let sortedUsers = Object.values(users).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let lastInitial = "";
  for (let i = 0; i < sortedUsers.length; i++) {
    let user = sortedUsers[i];
    let color = user.color || generateRandomColor();
    container.innerHTML += renderContact(i, user, color, lastInitial);
    lastInitial = user.username[0].toUpperCase();
  }
}

/**
 * Highlighting selected contactcard
 * @param {*} contactCard
 * @param {*} i
 */
function contactCardClick(contactCard, i) {
  let nameElement = document.getElementById(`name${i}`);
  if (contactCard.classList.contains("contact-card-click")) {
    contactCard.classList.remove("contact-card-click");
    nameElement.classList.remove("contact-name");
  } else {
    closeAllContactClicks();
    contactCard.classList.add("contact-card-click");
    nameElement.classList.add("contact-name");
  }
}

/**
 * Unhighlighting non selected contactcards
 */
function closeAllContactClicks() {
  let contactCards = document.getElementsByClassName("contact");
  for (let contactCard of contactCards) {
    contactCard.classList.remove("contact-card-click");
  }
  let nameElements = document.getElementsByClassName("contact-name");
  for (let nameElement of nameElements) {
    nameElement.classList.remove("contact-name");
  }
}

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

/**
 * Adds a new contact, generates color, saves it, user feedback, updates DB and Display
 * @param {*} path
 * @returns
 */
async function addContactS() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let userNameInput = document.getElementById("addInputNameA").value;
  let emailInput = document.getElementById("addInputEmailB").value;
  let phoneInput = document.getElementById("addInputPhoneC").value;
  let color = generateRandomColor();
  let data = {
    username: userNameInput,
    email: emailInput,
    contactNumber: phoneInput,
    color: color,
  };
  let response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });
  cleanInputFields();
  await response.json()
  await loadData();
  displayContacts(loadedUserArray);
  renderUserDetails(userNameInput);
  showSuccessPopUp();
}


function showSuccessPopUp() {
  if (window.innerWidth < 1350) {
    document.getElementById("contact-success").style = `left: 30px;`;
  } else {
    document.getElementById("contact-success").style = `left: 64px;`;
  }
  setTimeout(closeSuccessPopUp, 1200);
}

function closeSuccessPopUp() {
  document.getElementById("contact-success").style = `left: 100%;`;
}

/**
 * Deletes the selected user from the contactlist
 * @param {*} i
 * @returns
 */
async function deleteContact(userId) {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let response = await fetch(BASE_URL + userId + "/", {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  await loadData();
  document.getElementById("render-contact-details").innerHTML = "";
  closeContactDetailsMobile();
  return response;
}

/**
 * Cleaning the Inputfields for Add new contact form
 */
function cleanInputFields() {
  let userNameInput = document.getElementById("addInputNameA");
  let emailInput = document.getElementById("addInputEmailB");
  let phoneInput = document.getElementById("addInputPhoneC");
  if (userNameInput) userNameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (phoneInput) phoneInput.value = "";
}

/**
 * HTML Rendering the Detail of a contact
 * @param {*} i
 */
function renderContactDetails(i) {
  let contactDetail = document.getElementById("render-contact-details");
  let contactDetailsMobile = document.getElementById(
    "render-contact-details-mobile"
  );
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let user = sortedUsers[i];
  let color = user.color || generateRandomColor();

  let isMobile = window.innerWidth < 1192;
  let htmlContent = generateContactDetailsHTML(i, user, color, isMobile);

  if (isMobile) {
    contactDetailsMobile.innerHTML = htmlContent;
    document
      .getElementById("contact-details-mobile")
      .classList.remove("d-none");
    document.getElementById("details-mobile-add-btn").classList.add("d-none");
  } else {
    contactDetail.innerHTML = htmlContent;
    contactDetail.style = `width: 100%; left: 0;`;
    document.getElementById(
      "initials-detail"
    ).style.background = `${colors[i]}`;
  }
}

/**
 * Getting the first character from the names
 * @param {*} name
 * @returns
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
}

/**
 * Saving changes after a contact is edited from indexed user and handles the color
 * @returns
 */
async function saveContact(userId) {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let editNameInput = document.getElementById("editInputName").value;
  let editEmailInput = document.getElementById("editInputEmail").value;
  let editPhoneInput = document.getElementById("editInputPhone").value;
  let colorName;
  for(let i = 0; i < loadedUserArray.length; i++) {
    if(userId == loadedUserArray[i].id){
      colorName = loadedUserArray[i].color
    }
  }
  let updatedData = {
    username: editNameInput,
    email : editEmailInput,
    contactNumber: editPhoneInput,
    color: colorName
  };
  
  await fetch(BASE_URL + userId + "/" , {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(updatedData),
    });
  closeEditContactPopup();
  closeContactDetailsMobile();
  document.getElementById("render-contact-details").innerHTML = "";
  await loadData();
  displayContacts(loadedUserArray);
  renderUserDetails(editNameInput);
}

/**
 * sorts loaded user list by alphabet and finds user index to render contact details
 * @param {*} username 
 */
function renderUserDetails(username) {
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let index = sortedUsers.findIndex(user => user.username === username);
  document.getElementById(`contact-info${index}`).classList.add('contact-card-click');
  document.getElementById(`name${index}`).classList.add('contact-name');
  renderContactDetails(index);
}

/**
 * Rendering the contactedit popup
 * @param {*} i
 */
function renderEdit(i, userId) {
  window.currentlyEditingUserIndex = i;
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  if (i >= 0 && i < sortedUsers.length) {
    let user = sortedUsers[i];
    let editContainer = document.getElementById("editContact");
    editContainer.innerHTML = "";
    editContainer.innerHTML = generateEditContactHTML(user, userId);
  }
}

function closeContactDetailsMobile() {
  document.getElementById("contact-details-mobile").classList.add("d-none");
  document.getElementById("details-mobile-add-btn").classList.remove("d-none");
}

function openMobileEditMenu() {
  document.getElementById(
    "details-mobile-round-btn"
  ).style = `background-color: var(--darkLightBlue)`;
  document.getElementById(
    "mobile-edit-menu"
  ).style = `right: 12px; width: 116px`;
}

function closeMobileEditMenu() {
  document.getElementById("mobile-edit-menu").style = `right: 0; width: 0`;
  document.getElementById(
    "details-mobile-round-btn"
  ).style = `background-color: var(--darkGray)`;
}

function stop(event) {
  event.stopPropagation();
}

/**
 * Clears the Errorfields on contact forms
 */
function clearValidateFields() {
  let xName = document.getElementById("validSpanFieldName");
  let xEmail = document.getElementById("validSpanFieldEmail");
  let xPhone = document.getElementById("validSpanFieldPhone");
  xName.innerHTML = "";
  xEmail.innerHTML = "";
  xPhone.innerHTML = "";
}

/**
 * Clears the Errorfields on contact forms
 */
function clearEditFields() {
  let yName = document.getElementById("editValidSpanFieldName");
  let yEmail = document.getElementById("editValidSpanFieldEmail");
  let yPhone = document.getElementById("editValidSpanFieldPhone");
  yName.innerHTML = "";
  yEmail.innerHTML = "";
  yPhone.innerHTML = "";
}

/**
 * Checking regex for the name and points to the email if correct
 * @returns
 */
function validateName() {
  let x = document.forms["addContactForm"]["addName"].value;
  let xName = document.getElementById("validSpanFieldName");
  if (x == "") {
    xName.innerHTML = "Please fill your name";
    return false;
  } else {
    return validateEmail();
  }
}

/**
 * Checking regex for the email and points to the phonenumber
 * @returns
 */
function validateEmail() {
  let x = document.forms["addContactForm"]["addEmail"].value;
  let xEmail = document.getElementById("validSpanFieldEmail");
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (x == "") {
    xEmail.innerHTML = "Please fill your email";
    return false;
  } else if (!emailPattern.test(x)) {
    xEmail.innerHTML = "Please enter a valid email address";
    return false;
  } else {
    return validatePhone();
  }
}

/**
 * checking regex for the phone and if correct adds the new contact
 * @returns
 */
function validatePhone() {
  let x = document.forms["addContactForm"]["addPhone"].value;
  let xPhone = document.getElementById("validSpanFieldPhone");
  if (x == "") {
    xPhone.innerHTML = "Please fill your phone";
    return false;
  } else {
    addContactS();
    closeContactPopup();
    setTimeout(() => {
      loadData();
    }, 500);
    return false;
  }
}

/**
 * Checking regex for the name and points to the email if correct
 * @returns
 */
function editValidateName(userId) {
  let x = document.forms["editForm"]["editName"].value;
  let xName = document.getElementById("editValidSpanFieldName");
  if (x == "") {
    xName.innerHTML = "Please fill your name";
    return false;
  } else {
    return editValidateEmail(userId);
  }
}

/**
 * Checking regex for the email and points to the phone if correct
 * @returns
 */
function editValidateEmail(userId) {
  let x = document.forms["editForm"]["editEmail"].value;
  let xEmail = document.getElementById("editValidSpanFieldEmail");
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (x == "") {
    xEmail.innerHTML = "Please fill your email";
    return false;
  } else if (!emailPattern.test(x)) {
    xEmail.innerHTML = "Please enter a valid email address";
    return false;
  } else {
    return editValidatePhone(userId);
  }
}

/**
 * Checking regex for the phone and saves the contact if correct
 * @returns
 */
function editValidatePhone(userId) {
  let x = document.forms["editForm"]["editPhone"].value;
  let xPhone = document.getElementById("editValidSpanFieldPhone");
  if (x == "") {
    xPhone.innerHTML = "Please fill your phone";
    return false;
  } else {
    saveContact(userId);
    return false;
  }
}
