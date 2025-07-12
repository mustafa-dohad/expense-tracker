// ===============================
// User Profile Page JS (user.js)
// ===============================
// Handles: Fetching user data, editing profile, password change, account deletion (admin-protected), UI updates
// Modular, well-commented, and matches dashboard/app.js style

// -------------------------------
// Section 1: DOM Elements
// -------------------------------
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const deleteBtn = document.getElementById('delete-account-btn');
const statusMsg = document.getElementById('status-msg');

// -------------------------------
// Section 2: State
// -------------------------------
let currentUser = null;

// -------------------------------
// Section 3: Utility Functions
// -------------------------------
function showStatus(msg, type = 'info') {
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg ' + type;
  statusMsg.classList.add('show');
  setTimeout(() => {
    statusMsg.classList.remove('show');
    setTimeout(() => {
      statusMsg.className = 'status-msg';
    }, 300);
  }, 2000);
}

function setProfileForm(user) {
  profileForm.elements['first_name'].value = user.first_name;
  profileForm.elements['last_name'].value = user.last_name;
  profileForm.elements['email'].value = user.email;
  profileForm.elements['phone'].value = user.phone || '';
  profileForm.elements['currency_code'].value = user.currency_code || 'USD';
  profileForm.elements['timezone'].value = user.timezone || 'UTC';
  // Removed profile picture logic
  // Admin protection for delete
  if (user.id === 3) {
    deleteBtn.disabled = true; // Disable for user ID 3
    deleteBtn.textContent = '🔒 Delete Account (PROTECTED)';
    deleteBtn.title = 'This account cannot be deleted.';
    deleteBtn.classList.add('admin-protected');
  } else {
    deleteBtn.disabled = false;
    deleteBtn.textContent = 'Delete Account';
    deleteBtn.title = '';
    deleteBtn.classList.remove('admin-protected');
  }
  // Set profile name and email in header
  document.getElementById('profile-name').textContent = user.first_name + ' ' + user.last_name;
  document.getElementById('profile-email').textContent = user.email;
}

// -------------------------------
// Section 4: Fetch User Data
// -------------------------------
async function fetchUserProfile() {
  try {
    const res = await fetch('../backend/get_user_data.php', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch user data');
    const data = await res.json();
    if (data.status === "success" && data.user) {
      currentUser = data.user; // <-- Add this line
      setProfileForm(data.user); // Only use the user object
    } else {
      showStatus('Could not load user data', 'error');
    }
  } catch (err) {
    showStatus('Error loading profile: ' + err.message, 'error');
  }
}

// -------------------------------
// Section 5: Update Profile
// -------------------------------
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(profileForm);
  // Removed profile picture logic
  try {
    const res = await fetch('../backend/edit_user_profile.php', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      showStatus('Profile updated!', 'success');
      fetchUserProfile();
    } else {
      showStatus(data.message || 'Update failed', 'error');
    }
  } catch (err) {
    showStatus('Error updating profile: ' + err.message, 'error');
  }
});

// -------------------------------
// Section 6: Change Password
// -------------------------------
passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(passwordForm);
  try {
    const res = await fetch('../backend/change_password.php', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      showStatus('Password changed!', 'success');
      passwordForm.reset();
    } else {
      showStatus(data.message || 'Password change failed', 'error');
    }
  } catch (err) {
    showStatus('Error changing password: ' + err.message, 'error');
  }
});

// -------------------------------
// Section 7: Delete Account (Admin-Protected)
// -------------------------------
deleteBtn.addEventListener('click', async () => {
  // Debug: Log current user info
  console.log('Current user:', currentUser);
  console.log('Button disabled:', deleteBtn.disabled);
  console.log('Button text:', deleteBtn.textContent);
  
  // Triple-check protection for user ID 3 (in case button was somehow enabled)
  if (currentUser && currentUser.id === 3) {
    showStatus('⚠️ This account cannot be deleted.', 'error');
    return;
  }
  
  // Extra safety check - prevent if button is disabled
  if (deleteBtn.disabled) {
    showStatus('⚠️ Delete account is disabled for this user', 'error');
    return;
  }
  
  // For user ID 3, NEVER show confirmation dialog
  if (currentUser && currentUser.id === 3) {
    showStatus('⚠️ This account cannot be deleted.', 'error');
    return;
  }
  
  // Extra confirmation for safety (only for non-admin users)
  const confirmMessage = '⚠️ WARNING: This will permanently delete your account and all your data. This action cannot be undone.\n\nAre you absolutely sure you want to proceed?';
  if (!confirm(confirmMessage)) return;
  
  try {
    const res = await fetch('../backend/delete_user.php', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      showStatus('Account deleted. Goodbye!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } else {
      showStatus(data.message || 'Account deletion failed', 'error');
    }
  } catch (err) {
    showStatus('Error deleting account: ' + err.message, 'error');
  }
});

// -------------------------------
// Section 8: Profile Picture Preview
// -------------------------------
// Remove profilePicInput and profilePicImg references

// ===============================
// Section X: Dynamic Currency & Timezone Dropdowns
// ===============================
const currencyList = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "ZAR", name: "South African Rand" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "THB", name: "Thai Baht" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "RUB", name: "Russian Ruble" },
  // ... add more as needed ...
];

const timezoneList = [
  "UTC", "Asia/Kolkata", "Asia/Karachi", "Asia/Dubai", "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Asia/Bangkok", "Asia/Jakarta", "Asia/Manila", "Asia/Hong_Kong", "Asia/Seoul", "Asia/Kuala_Lumpur", "Asia/Riyadh", "Asia/Tehran", "Asia/Jerusalem", "Asia/Baghdad", "Asia/Kathmandu", "Asia/Yangon", "Asia/Tashkent", "Asia/Almaty", "Asia/Baku", "Asia/Tbilisi", "Asia/Yekaterinburg", "Asia/Vladivostok", "Asia/Magadan", "Asia/Krasnoyarsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Srednekolymsk", "Asia/Sakhalin", "Asia/Kamchatka", "Asia/Anadyr", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Europe/Istanbul", "Europe/Madrid", "Europe/Rome", "Europe/Zurich", "Europe/Amsterdam", "Europe/Prague", "Europe/Warsaw", "Europe/Bucharest", "Europe/Athens", "Europe/Helsinki", "Europe/Stockholm", "Europe/Copenhagen", "Europe/Dublin", "Europe/Lisbon", "Europe/Vienna", "Europe/Brussels", "Europe/Oslo", "Europe/Budapest", "Europe/Sofia", "Europe/Belgrade", "Europe/Zagreb", "Europe/Skopje", "Europe/Tallinn", "Europe/Riga", "Europe/Vilnius", "Europe/Bratislava", "Europe/Ljubljana", "Europe/Sarajevo", "Europe/Podgorica", "Europe/Tirane", "Europe/Chisinau", "Europe/Kiev", "Europe/Minsk", "Europe/Monaco", "Europe/San_Marino", "Europe/Vatican", "Europe/Andorra", "Europe/Luxembourg", "Europe/Malta", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Jersey", "Europe/Isle_of_Man", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "America/Buenos_Aires", "America/Lima", "America/Bogota", "America/Caracas", "America/Santiago", "America/Montevideo", "America/La_Paz", "America/Asuncion", "America/Guatemala", "America/Panama", "America/Havana", "America/Kingston", "America/Puerto_Rico", "America/Anchorage", "America/Honolulu", "Pacific/Auckland", "Pacific/Fiji", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Port_Moresby", "Pacific/Tongatapu", "Pacific/Samoa", "Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth", "Australia/Adelaide", "Australia/Darwin", "Australia/Hobart", "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi", "Africa/Casablanca", "Africa/Algiers", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Tripoli", "Africa/Khartoum", "Africa/Dakar", "Africa/Kampala", "Africa/Harare", "Africa/Lusaka", "Africa/Maputo", "Africa/Windhoek", "Africa/Gaborone", "Africa/Maseru", "Africa/Mbabane", "Africa/Lilongwe", "Africa/Blantyre", "Africa/Bujumbura", "Africa/Kigali", "Africa/Brazzaville", "Africa/Libreville", "Africa/Lome", "Africa/Porto-Novo", "Africa/Cotonou", "Africa/Malabo", "Africa/Bangui", "Africa/Ndjamena", "Africa/Douala", "Africa/Yaounde", "Africa/Bamako", "Africa/Ouagadougou", "Africa/Niamey", "Africa/Abuja", "Africa/Conakry", "Africa/Freetown", "Africa/Monrovia", "Africa/Bissau", "Africa/Sao_Tome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Kinshasa", "Africa/Mogadishu", "Africa/Djibouti", "Africa/Asmara", "Africa/Juba", "Africa/Khartoum", "Africa/Tripoli", "Africa/Tunis", "Africa/Algiers", "Africa/Casablanca", "Africa/El_Aaiun"
  // ... add more as needed ...
];

document.addEventListener('DOMContentLoaded', () => {
  // Populate currency dropdown
  const currencySelect = document.getElementById('currency_code');
  if (currencySelect) {
    currencySelect.innerHTML = currencyList.map(c =>
      `<option value="${c.code}">${c.code} - ${c.name}</option>`
    ).join('');
  }
  // Populate timezone dropdown
  const timezoneSelect = document.getElementById('timezone');
  if (timezoneSelect) {
    timezoneSelect.innerHTML = timezoneList.map(tz =>
      `<option value="${tz}">${tz}</option>`
    ).join('');
  }
});

// -------------------------------
// Section 9: On Page Load
// -------------------------------
document.addEventListener('DOMContentLoaded', fetchUserProfile); 