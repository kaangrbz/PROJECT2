
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





verifiedTag = '<span class="verified"><i class="far fa-check-circle"></i></span>'

///////////////////////////////// gotopbtn ////////////////////////////
//Get the button
let tag = document.querySelector('html');
var goTopBtn = document.querySelector("#gotopbtn");
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = () => {
  scrollFunction();
  console.log('s');
};
function scrollFunction() {
  let limit = 200
  if (tag.scrollTop > limit || document.documentElement.scrollTop > limit) {
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
  tag.scrollTop = 0;
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
    $('.notifications').addClass('active')
  }
  else {
    $('.notifications').removeClass('active')
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
  message = $('div[data-post-id=' + postid + '] input[type=text]').val() || ''
  url = '/3/' + postid + '/event'
  c = $('div[data-post-id=' + postid + '] .comments')
  console.log(c);
  if (message.length > 0) {
    data = { message }
    $.post(url, data, res => {
      input = $('div[data-post-id=' + postid + '] input[type=text]');
      console.log('isverified > ', res.isverified);
      if (res.status === 0) { Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', }).then((result) => { if (result.isConfirmed) window.location.href = '/login' }) }
      else if (res.status === 1) {
        if (res.isverified)
          comment = '<div class="comment"><span class="uname">' + res.username + verifiedTag + '</span><span class="cmsg">' + res.message + '</span><span class="cdate">' + res.date + '</span></div>'
        else
          comment = '<div class="comment"><span class="uname">' + res.username + '</span><span class="cmsg">' + res.message + '</span><span class="cdate">' + res.date + '</span></div>'
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
      let counter = 5;
      let interval = setInterval(function () {
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

      let counter = 5;
      let interval = setInterval(function () {
        counter--;
        $(e).html('Update in (' + counter + 's)')
        if (counter == 0) {
          $(e).removeAttr('disabled')
          $(e).html('Update')
          clearInterval(interval);
        }
      }, 1000);
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

let ad = true
$('.notif').on('click', (e) => {
  url = '/1/notif/'
  if (ad && $('.notifications').css('display') !== 'none') {
    ad = false
    notifloading = $('.notifloading')
    $('.ncount').html('').hide(200)
    notifloading.show(200)
    ntag = $('.notifications ul')
    $.post(url, res => {
      console.log('notif res => ', res);
      if (res.status === 0) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', })
          .then((result) => {
            if (result.isConfirmed)
              window.location.href = '/login'
          })
      }
      else if (res.status === 1 || res.status == 2) {
        notifloading.hide()
        if (res.status === 2) ad = true
        result = res.result
        if (result.length > 0) {
          var limit = 11;
          try {
            result.forEach((n, index) => {
              console.log('foreach counter ',index);
              console.log('n => ', n);
              uname = res.users[index];
              switch (n.ncode) {
                case 1:
                  t = `<li><a href="post/` + n.postid + `"><b>
                  `+ ((uname.length > limit) ? uname.substring(0, limit) + '..' : uname) + `
                </b>liked your post </a><span class="ntime">
                                  `+ res.dates[index] + `
                                </span></li><hr>`
                  ntag.append(t)
                  break;

                case 2:
                  t = `<li><a title="Go to `+uname+`\'s profile" href="/` + uname + `"><b>
                    `+ ((uname.length > limit) ? uname.substring(0, limit) + '..' : uname) + `
                  </b>started to follow you</a><span title="" class="ntime">
                                    `+ res.dates[index] + `
                                  </span></li><hr>`
                  ntag.append(t)
                  break;

                case 3:
                  t = `<li><a href="/` + uname + `"><b>
                      `+ ((uname.length > limit) ? uname.substring(0, limit) + '..' : uname) + `
                    </b>started to follow you</a><span title="" class="ntime">
                                      `+ res.dates[index] + `
                                    </span></li><hr>`
                  ntag.append(t)
                  break;
              }
            });
          } catch (error) {
            t = `<li><a href="" onclick="location.reload()">There is an error please refresh the page</a><br>err: ` + error + `</li><hr>`
            ntag.append(t)
          }
        }
        else {
          t = `<li><a href="javascript:void(0)">You have no notification<i class="far fa-sad-tear"></i></a></li><hr>`
          ntag.append(t)
        }

      }
      else if (res.status === 3) {
        notifloading.hide()
        Swal.fire({ icon: 'error', title: 'Oops...', text: res.message, })
          .then((result) => {
            if (result.isConfirmed)
              location.reload();
          })
      }
    })
  }
});