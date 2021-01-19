
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
  if ($('.notifications').css('display') == 'none') {
    $('.notifications').show(300)
  }
  else {
    $('.notifications').hide(300)
  }
})

$('.more').on('click', (e) => {

  more(e.currentTarget)

})
function more(e) {
  postid = $(e).parent().parent().attr('data-post-id')
  opt = $('div[data-post-id=' + postid + '] .options');
  if (opt.css('display') == 'none') {
    opt.show(300)
  }
  else {
    opt.hide(300)
  }
}

$('.like').on('click', (e) => {
  like(e.currentTarget)
});
function like(e) {
  postid = $(e).parent().parent().attr('data-post-id')
  url = '/1/' + postid + '/event'
  $.post(url, res => {

    console.log('likes status => ', res.status);

    c = $('.likes' + postid)[0]
    d = $('.dislikes' + postid)[0]
    f = $('div[data-post-id=' + postid + '] .dislike')
    if (res.status === 0) { Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', }).then((result) => { if (result.isConfirmed) window.location.href = '/login' }) }
    else if (res.status === 1) {
      c.innerHTML = (Number(c.textContent) + 1)
      e.src = '/img/arrow2.svg'
    }
    else if (res.status === 2) {
      c.innerHTML = (Number(c.textContent) - 1)
      e.src = '/img/arrow.svg'
    }
    else if (res.status === 3) {
      c.innerHTML = (Number(c.textContent) + 1)
      d.innerHTML = (Number(d.textContent) - 1)
      e.src = '/img/arrow2.svg'
      f.attr('src', '/img/arrow.svg')
    }
    else console.log('else1 => ', res.status);
  });
}
$('.dislike').on('click', (e) => {
  dislike(e.currentTarget)
});

function dislike(e) {
  postid = $(e).parent().parent().attr('data-post-id')
  url = '/2/' + postid + '/event'
  $.post(url, res => {
    d = $('.dislikes' + postid)[0]
    c = $('.likes' + postid)[0]
    f = $('div[data-post-id=' + postid + '] .like')
    if (res.status === 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', }).then((result) => { if (result.isConfirmed) window.location.href = '/login' })
    }
    else if (res.status === 1) {
      d.innerHTML = (Number(d.textContent) + 1)
      e.src = '/img/arrow2.svg'
    }
    else if (res.status === 2) {
      d.innerHTML = (Number(d.textContent) - 1)
      e.src = '/img/arrow.svg'
    }
    else if (res.status === 3) {
      d.innerHTML = (Number(d.textContent) + 1)
      c.innerHTML = (Number(c.textContent) - 1)
      e.src = '/img/arrow2.svg'
      f.attr('src', '/img/arrow.svg')
    }
    else console.log('else2 => ', res.status);
  });
}

$('.send').on('click', (e) => {
  send(e.currentTarget)
});

function send(e) {
  postid = $(e).parent().parent().parent().attr('data-post-id')
  msg = $('div[data-post-id=' + postid + '] input[type=text]').val() || ''
  url = '/3/' + postid + '/event'
  c = $('div[data-post-id=' + postid + '] .comments')
  console.log(c);
  if (msg.length > 0) {
    data = { msg }
    $.post(url, data, res => {
      input = $('div[data-post-id=' + postid + '] input[type=text]');
      console.log(input);
      if (res.status === 0) { Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', }).then((result) => { if (result.isConfirmed) window.location.href = '/login' }) }
      else if (res.status === 1) {
        comment = '<div class="comment"><span class="uname">' + res.username + '</span><span class="cmsg">' + res.msg + '</span><span class="cdate">' + res.date + '</span></div>'
        c.append(comment);
        input.val('')
      }
      else {
        console.log('else');
      }
    });
  }
  else {
    console.log('write comment');
  }
}

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
}
if ($.urlParam('status') == 'ok') {
  Swal.fire({ icon: 'success', title: 'Success!', text: 'Updated successfuly.' })
}

$('.follow').on('click', (e) => {
  follow(e.currentTarget)
});
function follow(e) {
  username = $(e).data('username')
  f1 = document.querySelector('.pfollowers')
  f2 = document.querySelector('.pfollowings')
  url = '/' + username + '/follow/'
  console.log('follow url => ', url);
  $.post(url, res => {
    console.log('follow res: ', res);
    if (res.status === 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', })
        .then((result) => {
          if (result.isConfirmed)
            window.location.href = '/login'
        })
    }
    else if (res.status === 1) {
      $('.follow').html('Unfollow')
      f1.innerHTML = Number(f1.textContent) + 1
    }
    else if (res.status === 2) {
      f1.innerHTML = Number(f1.textContent) - 1
      $('.follow').html('Follow')
    }
    else if (res.status === 3) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: res.message, })
    }
  });
}

$('.del').on('click', e => {
  del(e.currentTarget)
})

function del(e) {
  val = $(e).parent().parent().parent().parent().attr('data-post-id');
  url = '/delete/' + val
  $.post(url, res => {
    if (res.status === 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Some errors while delete', })
    }
    else if (res.status === 1) {
      $('div[data-post-id=' + val + ']').removeAttr('data-post-id').remove()
      Swal.fire({ icon: 'success', title: 'Yeyy...', text: 'Post deleted successfuly', })
    }
    else if (res.status === 2) {
      Swal.fire({ icon: 'error', title: 'Heyy!', text: 'Unauthorized process', })
    }
  })
}

$('.save').on('click', e => {
  save(e.currentTarget)
})
function save(e) {
  val = $(e).parent().parent().parent().parent().attr('data-post-id');
  url = '/save/' + val
  $.post(url, res => {
    console.log('save status: ', res);
    console.log('e=>', e);
    if (res.status === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You should log in for this',
      })
    }
    else if (res.status === 1) {
      $(e).html('<img src="/img/saved.svg" alt="">Saved')
    }
    else if (res.status === 2) {
      $(e).html('<img src="/img/save.svg" alt="">Save')
    }
    else if (res.status === 3) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: res.message,
      })
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'IDK!',
        text: 'something happened',
      })
    }
  })
}

$("#textarea").on('keyup', function () {
  $("#count").text("Characters left: " + (500 - $(this).val().length));
});

$('#update').on('click', (e) => {
  update(e.currentTarget)
});
function update(e) {
  $.post('/edit/', $('#updateform').serialize(), res => {
    $(e).attr('disabled', 'disabled')
    $('.msg').empty()
    i = $('input[type=text][name=username]')
    adiv = $('div.alts')
    adiv.empty()
    var y = $(window).scrollTop();
    if (res.status === 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', })
        .then((result) => {
          if (result.isConfirmed)
            window.location.href = '/login'
        })
    }
    else if (res.status === 1) {
      $('.msg').html('<h3 class="success">Successfuly updated.</h3>').show(300)
      $(window).scrollTop(y - 50);
      $(e).removeAttr('disabled')
    }
    else if (res.status === 2) {
      $('.msg').html('<h3 class="danger">' + res.message + '</h3>').show(300)
      $(window).scrollTop(y - 50);
      var counter = 5;
      var interval = setInterval(function () {
        counter--;
        $(e).html('Update in (' + counter + 's)')
        if (counter == 0) {
          $(e).removeAttr('disabled')
          $(e).html('Update')
          clearInterval(interval);
        }
      }, 1000);
    }
    else if (res.status === 3) {
      let alts = res.alternatives
      f = true
      $('.msg').html('<h3 class="danger">' + res.message + '</h3>').show(300)
      $(window).scrollTop(y - 50);
      alts.forEach(alt => {
        if (alt !== null) {
          if (f) {
            f = false
            adiv.append('Some alternatives: ')
          }
          a = '<span class="alt">' + alt + '</span>'
          adiv.append(a)
        }
      })
      $('.alt').on('click', (e) => {
        i.val(e.currentTarget.textContent) // i => input 
      })
      $(e).removeAttr('disabled')
    }
  });
}


$('#postbtn').on('click', (e) => {
  addpost(e.currentTarget)
});
function addpost(e) {
  $.post('/post/', $('#postform').serialize(), res => {
    $(e).attr('disabled', 'disabled')
    $('.msg').empty().hide()
    var y = $(window).scrollTop();
    var counter = 5;
    console.log('post res => ', res);
    if (res.status === 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', })
        .then((result) => {
          if (result.isConfirmed)
            window.location.href = '/login'
        })
    }
    else if (res.status === 1) {
      $('.msg').html('<h3 class="success">Successfuly added post.</h3>').show(300)
      var interval = setInterval(function () {
        $(e).html('Post in (' + counter + 's)')
        if (counter == 0) {
          $(e).removeAttr('disabled')
          $(e).html('Post')
          clearInterval(interval);
        }
        counter--;
      }, 1000);
    }
    else if (res.status === 2) {
      $('.msg').html('<h3 class="danger">' + res.message + '</h3>').show(300)
      $(window).scrollTop(y - 150);
      var interval = setInterval(function () {
        $(e).html('Post in (' + counter + 's)')
        if (counter == 0) {
          $(e).removeAttr('disabled')
          $(e).html('Post')
          clearInterval(interval);
        }
        counter--;
      }, 1000);
    }
    else if (res.status === 3) {

    }
  });
}