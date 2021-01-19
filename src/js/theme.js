function setCookie(c_name, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
}
function getCookie(c_name) {
  var i, x, y, ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g, "");
    if (x == c_name) {
      return unescape(y);
    }
  }
}

if (getCookie('mode') == 'dark') {
  document.querySelector("body").className = 'dark';
  document.getElementById('mode-btn').checked = true;
}
else if (getCookie('mode') === undefined) {
  document.querySelector("body").className = 'dark';
  document.getElementById('mode-btn').checked = true;
}
else {
  document.querySelector("body").className = '';
  document.getElementById('mode-btn').checked = false;
}

document.getElementById('mode-btn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  setCookie('mode', document.body.classList, 9999999)
})