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

const limit = 400;
window.onload = function setblockqu() {
  var allparags = document.getElementsByClassName('shortp');
  for (var i = 0; i < allparags.length; i++) {
    var paragtext = allparags[i].textContent;
    paragtext = paragtext.trim();
    if (paragtext.length >= limit) {
      paragtext = paragtext.substring(0, limit);
      allparags[i].innerHTML = ("<p>" + paragtext + "<b>..</b></p>");
    }
  };
}





///////////////////////////////// gotopbtn ////////////////////////////
//Get the button
let container = document.querySelector('html');
var goTopBtn = document.querySelector("#gotopbtn");
// When the user scrolls down 20px from the top of the document, show the button
container.onscroll = function () { scrollFunction() };
function scrollFunction() {
  if (container.scrollTop > 00) {
    goTopBtn.style.visibility = "visible";
    goTopBtn.style.opacity = "1";
  }
  else {
    goTopBtn.style.visibility = "hidden";
    goTopBtn.style.opacity = "0";
  }
}
// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  container.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

/* // random cool bg (optional)
function randombgcolor() {
    var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    var bgColor = "rgb(" + x + "," + y + "," + z + ",0.8)";
    document.getElementsByTagName('body')[0].style.background = bgColor;
}
setInterval(randombgcolor,1100);
*/

$('.notif').on('click', (e) => {
  console.log('ee');
  if ($('.notifications').css('display') == 'none') {
    $('.notifications').show(300)
  }
  else {
    $('.notifications').hide(300)
  }
})

$('.more').on('click', (e) => {

  val = $(e.currentTarget).parent().parent().attr('data-post-id')
  opt = $('div[data-post-id=' + val + '] .options');
  if (opt.css('display') == 'none') {
    opt.show(300)
  }
  else {
    opt.hide(300)
  }

})

$('.like').on('click', (e) => {
  var likecount = document.querySelector('.likes');
  postid = $(e.currentTarget).parent().parent().attr('data-post-id')

  url = '/like/' + postid
  $.post(url, res => {
    console.log(postid);
    a = $('#' + postid)[0]
    console.log(a);
    if (res.status === 0) {
      // if not looged in
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You should log in for this',
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed)
          window.location.href = '/login'
      })
    }
    else if (res.status === 1)
      a.innerHTML = Number(a.textContent) + 1
    else if (res.status === 2)
      a.innerHTML = Number(a.textContent) - 1
    else
      a.innerHTML = "??"

  });
});

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
}
if ($.urlParam('status') == 'ok') {
  Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: 'Updated successfuly.',
  })
}

$('.follow').on('click', (e) => {
  username = $(e.currentTarget).data('username')
  f1 = document.querySelector('.pfollowers')
  f2 = document.querySelector('.pfollowings')
  $.post('/follow/' + username, res => {
    console.log('follow status: ' + res.status);
    if (res.status === 0) {
      // if not looged in
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You should log in for this',
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          window.location.href = '/login'
        }
      })
    }
    else if (res.status === 1) {
      $('.follow').html('Follow')
      f1.innerHTML = Number(f1.textContent) - 1
    }
    else if (res.status === 2) {
      f1.innerHTML = Number(f1.textContent) + 1
      $('.follow').html('Unfollow')
    }
    else {
      console.log('else');
    }
  });
});

$('.del').on('click', e => {
  val = $(e.currentTarget).parent().parent().parent().parent().attr('data-post-id');
  url = '/delete/' + val
  $.post(url, res => {
    if (res.status === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Some errors while delete',
      })
    }
    else if (res.status === 1) {
      $('div[data-post-id=' + val + ']').removeAttr('data-post-id').remove()

      Swal.fire({
        icon: 'success',
        title: 'Yeyy...',
        text: 'Post deleted successfuly',
      })
    }
    else if (res.status === 2) {
      Swal.fire({
        icon: 'error',
        title: 'Heyy!',
        text: 'Unauthorized process',
      })
    }
    else {

    }

  })
})


$('.save').on('click', e => {
  val = $(e.currentTarget).parent().parent().parent().parent().attr('data-post-id');
  url = '/save/' + val
  $.post(url, res => {
    console.log('save status: ', res.status);
    if (res.status === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You should log in for this',
      })
    }
    else if (res.status === 1) {
      $(e.currentTarget).html('<img src="/img/saved.svg" alt="">Saved')
    }
    else if (res.status === 2) {
      $(e.currentTarget).html('<img src="/img/save.svg" alt="">Save')
    }
    else if (res.status === 3) {
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'IDK!',
        text: 'something happened',
      })
    }

  })
})
