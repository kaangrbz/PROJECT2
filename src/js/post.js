$(window).on('beforeunload', () => {
  // $('.posts').empty() // delete all posts before reload
});

e = true
$(window).on('scroll', function () {
  if ($(window).scrollTop() + $(window).height() >= $(document).height() - 300) {
    getpost()
  }
});
$(window).on('load', () => {
  getpost()
})

var sj = true
verifiedTag = '<span class="verified"><i class="far fa-check-circle"></i></span>'
function getpost() {
  var y = $(window).scrollTop();
  if ($(location).attr('pathname') !== '/') {
    url = $(location).attr('pathname') + '/getpost/'
  }
  else {
    url = '/index/getpost/'
  }
  l = $('.loading')
  if (sj) {
    sj = false
    l.show(300)
    $.post(url, res => {
      if (res.result) {
        if (res.status === 1) sj = true

        if (res.status === 0) {
          Swal.fire({ icon: 'error', title: 'Oops...', text: 'You should log in for this', }).then((result) => { if (result.isConfirmed) window.location.href = '/login' })
        }

        else if (res.status === 1 || res.status === 2) {
          // for profile page
          try {
            r = res.result
            lnd = res.lnd
            counts = res.counts
            r.forEach((e, abs) => {
              d = new Date(e.createdAt)
              dd = d.getDate() + '.' + d.getMonth() + '.' + String(d.getFullYear()).substring(2) + ' ' + d.getHours() + ':' + d.getMinutes()
              a = `<div class="post"  style="display: none;" data-post-id="` + e.postid + `"><div class="header">
            <div class="user">
              <img src="/img/80x80.jpg" alt="">
              <div class="u">
                <a href="/` + res.username + `">
                  ` + res.username + `
                  `+ ((res.isverified) ? verifiedTag : '') + `
                </a>
                <div class="pdate">
                ` + dd + `
                </div>
              </div>
            </div>
            <div class="more">
              <i class="fas fa-ellipsis-h"></i>
            </div>
            <div class="options">
              <div class="arrow"> </div>
              <div>
                `+((res.isme) ? '<a class="del" href="javascript:void(0)"><img src="/img/delete.svg" alt="">Delete</a>' : '')+`
                <a href="javascript:void(0)"><img src="/img/share.svg" alt="">Share</a>
                <a href="javascript:void(0)"><img src="/img/report.svg" alt="">Report</a>
                <a class="save" href="javascript:void(0)"><img src="/img/save.svg" alt="">Save</a>
              </div>
            </div>
          </div>
          <div class="article">
            <p class="ptext">
        
            ` + e.article + `
            </p>
            <div class="pmedia" style="display: none;">
              <img src="" alt="post img">
            </div>
          </div>
          <div class="buttons">
          
          `+ (res.lnd[abs][0] ?
                  '<img class="like" src="/img/arrow2.svg" alt="button">'
                  :
                  '<img class="like" src="/img/arrow.svg" alt="button">') + `
          
          `+ (res.lnd[abs][1] ?
                  '<img class="dislike" src="/img/arrow2.svg" alt="button">'
                  :
                  '<img class="dislike" src="/img/arrow.svg" alt="button">') + `
          </div>
        
          <div class="buttons">
            +<span class="likes` + e.postid + `">
            `+ counts[abs][0] + `
            </span>
            /
            -<span class="dislikes` + e.postid + `">
            `+ counts[abs][1] + `
            </span>
          </div>
          <span class="commentcount">
          `+ counts[abs][2] + `&nbsp;comment
          </span>
          <div class="comments">
            <div class="comment">
            </div>
          </div>
        
          <div class="sendcomment">
            <form onsubmit="return false">
              <input type="text">
              <button type="button" class="send">Send</button>
            </form>
          </div></div>`

              $('.posts').append(a)
              
              p = e.postid
              f = '.post[data-post-id=' + p + ']'
              $(f).show(500)
              b = $('.post .options')
              console.log('like => ', $(f + ' .like'));
              $(f + ' .like').on('click', (e) => { like(e.currentTarget) })
              $(f + ' .more').on('click', (e) => { more(e.currentTarget) })
              $(f + ' .dislike').on('click', (e) => { dislike(e.currentTarget) })
              $(f + ' .send').on('click', (e) => { send(e.currentTarget) })
              $(f + ' .del').on('click', (e) => { del(e.currentTarget) })
              $(f + ' .save').on('click', (e) => { save(e.currentTarget) })
            });
          } catch (error) {
            $('.posts').append('<br><br>Upload post error, Please refresh the page err:<br>' + error + '<br><br>')
          }
        }

        else if (res.status === 4) {
          // for index page
          sj = true
          try {
            r = res.result
            counts = res.counts
            r.forEach((e, abs) => {
              d = new Date(e.createdAt)
              h = d.getHours()
              m = d.getMinutes()
              h = h <= 9 ? '0' + h : h
              m = m <= 9 ? '0' + m : m
              dd = d.getDate() + '.' + d.getMonth() + '.' + String(d.getFullYear()).substring(2) + ' ' + h + ':' + m
              // `+ ((lnd[abs][0]) ? `<img class="like" src="/img/arrow2.svg" alt="">` : `<img class="like" src="/img/arrow.svg" alt="">`) + `
              // `+ ((lnd[abs][1]) ? `<img class="dislike" src="/img/arrow2.svg" alt="">` : `<img class="dislike" src="/img/arrow.svg" alt="">`) + `
              a = `<div class="post"  style="display: none;" data-post-id="` + e.postid + `"><div class="header">
            <div class="user">
              <img src="/img/80x80.jpg" alt="user profile">
              <div class="u">
                <a href="/` + res.usernames[abs] + `">
                  ` + res.usernames[abs] + `
                  `+ (res.isverified[abs] ? verifiedTag : '') + `
                </a>
                <div class="pdate">
                ` + dd + `
                </div>
              </div>
            </div>
            <div class="more">
              <i class="fas fa-ellipsis-h"></i>
            </div>
            <div class="options">
              <div class="arrow"> </div>
              <div>
                <a class="del" href="javascript:void(0)"><img src="/img/delete.svg" alt="">Delete</a>
                <a href="javascript:void(0)"><img src="/img/share.svg" alt="">Share</a>
                <a href="javascript:void(0)"><img src="/img/report.svg" alt="">Report</a>
                <a class="save" href="javascript:void(0)"><img src="/img/save.svg" alt="">Save</a>
              </div>
            </div>
          </div>
          <div class="article">
            <p class="ptext">
        
            ` + e.article + `
            </p>
            <div class="pmedia" style="display: none;">
              <img src="" alt="post img">
            </div>
          </div>
          <div class="buttons">
          
          `+ (res.lnd[abs][0] ?
                  '<img class="like" src="/img/arrow2.svg" alt="button">'
                  :
                  '<img class="like" src="/img/arrow.svg" alt="button">') + `
          
          `+ (res.lnd[abs][1] ?
                  '<img class="dislike" src="/img/arrow2.svg" alt="button">'
                  :
                  '<img class="dislike" src="/img/arrow.svg" alt="button">') + `
          </div>
        
          <div class="buttons">
            +<span class="likes` + e.postid + `">
            `+ counts[abs][0] + `
            </span>
            /
            -<span class="dislikes` + e.postid + `">
            `+ counts[abs][1] + `
            </span>
          </div>
          <span class="commentcount">
          `+ counts[abs][2] + `&nbsp;comment
          </span>
          <div class="comments">
            <div class="comment">
            </div>
          </div>
        
          <div class="sendcomment">
            <form onsubmit="return false">
              <input type="text">
              <button type="button" class="send">Send</button>
            </form>
          </div>
          </div>`

              $('.posts').append(a)

              p = e.postid
              f = '.post[data-post-id=' + p + ']'
              $(f).show(400)
              b = $('.post .options')
              $(f + ' .like').on('click', (e) => { like(e.currentTarget) })
              $(f + ' .more').on('click', (e) => { more(e.currentTarget) })
              $(f + ' .dislike').on('click', (e) => { dislike(e.currentTarget) })
              $(f + ' .send').on('click', (e) => { send(e.currentTarget) })
              $(f + ' .del').on('click', (e) => { del(e.currentTarget) })
              $(f + ' .save').on('click', (e) => { save(e.currentTarget) })
            });
          } catch (error) {
            $('.posts').append('<br><br>Upload post error, Please refresh the page err:<br>' + error + '<br><br>')
          }
        }
      }
      else if (res.status === 3) {
        $('.posts').append(res.message)
        // $(window).scrollTop(y + 50);
      }
      else if (res.result === null) {
      }
      else {
        console.log('somethins broked. res => \n', res);
      }

      // $(window).scrollTop(y + 150);
      l.hide()
    })
  }
}