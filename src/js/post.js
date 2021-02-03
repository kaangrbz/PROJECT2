$(window).on('beforeunload', () => {
  // $('.posts').empty() // delete all posts before reload
});

e = true
$(window).on('scroll', function () {
  if ($(window).scrollTop() + $(window).height() >= $(document).height() - 500) {
    getpost()
  }
});
$(window).on('load', () => {
  getpost()
})

var sj = true
verifiedTag = '<span class="verified" title="Verified account"><i class="far fa-check-circle"></i></span>'
hiddenTag = '<span class="hidden" title="Hidden post, just you can see this post"><i class="far fa-eye-slash"></i></span>'
// bannerTag = '<div class="banner"><a href="https://tr.link/ref/devkaan"><img src="//cdn.tr.link/img/728x90.png" title="Para Kazanmak İçin Tıkla Kayıt OL" /></a></div>'
bannerTag = ''
function getpost() {
  var y = $(window).scrollTop();
  var adlimit = 4
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
            for (let abs = 0; abs < r.length; abs++) {

              if ((abs + 1) % adlimit === 0) {
                $('.posts').append(bannerTag)
              }
              let e = r[abs];

              p = e.postid
              f = '.post[data-post-id=' + p + ']'
              b = $(f + ' .options div[class!=arrow]');
              hidden = '<a title="Hide post" class="visibility" href="javascript:void(0)"><i class="far fa-eye"></i> Make visible</a>';
              visible = '<a title="Make the post visible" class="visibility" href="javascript:void(0)"><i class="far fa-eye-slash"></i> Make hidden</a>';
              d = new Date(e.createdAt)
              hour = d.getHours(), min = d.getMinutes(), day = d.getDate(), month = d.getMonth() + 1, hour = (hour < 10) ? '0' + hour : hour
              min = (min < 10) ? '0' + min : min, day = (day < 10) ? '0' + day : day, month = (month < 10) ? '0' + month : month
              dd = day + '.' + month + '.' + String(d.getFullYear()).substring(2) + ' ' + hour + ':' + min


              a = `<div class="post" style="display: none;" data-post-id="` + e.postid + `"><div class="header">
            <div class="user">
              <img src="/img/80x80.jpg" alt="user profile">
              <div class="u">
                <a href="/` + res.username + `">
                  ` + res.username + `
                  </a>
                  `+ ((res.isverified) ? verifiedTag : '') + `
                `+ ((!res.visibility[abs]) ? hiddenTag : '') + `
                <div class="pdate">
                ` + dd + `
                </div>
              </div>
            </div>
            <div class="more" title="Options">
              <i class="fas fa-ellipsis-h"></i>
            </div>
            <div class="options">
              <div class="arrow"></div>
              <div>
                `+ ((res.isme) ? '<a class="del" title="Delete comment" href="javascript:void(0)"><img src="/img/delete.svg" alt="">Delete</a>' : '') + `
                <a title="Share comment" href="javascript:void(0)"><img src="/img/share.svg" alt="">Share</a>
                <a title="Report comment" href="javascript:void(0)"><img src="/img/report.svg" alt="">Report</a>
                <a title="Save comment" class="save"  href="javascript:void(0)"><img src="/img/save.svg" alt="">Save</a>
                `+ ((res.isme) ? (res.visibility[abs] ? visible : hidden) : '') + `
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

              $(f).show(100)
              // <a class="save" href="javascript:void(0)"><img src="/img/save.svg" alt="">Save</a>
              $(f + ' .like').on('click', (e) => { like(e.currentTarget) })
              $(f + ' .more').on('click', (e) => { more(e.currentTarget) })
              $(f + ' .dislike').on('click', (e) => { dislike(e.currentTarget) })
              $(f + ' .send').on('click', (e) => { send(e.currentTarget) })
              $(f + ' .del').on('click', (e) => { del(e.currentTarget) })
              $(f + ' .save').on('click', (e) => { save(e.currentTarget) })
            }
            // r.forEach((e, abs) => {

            // });
          } catch (error) {
            $('.posts').append('Upload post error, Please refresh the page err:<br>' + error)
          }
        }

        else if (res.status === 4) {
          // for index page
          adlimit = 10
          sj = true
          try {
            r = res.result
            counts = res.counts
            r.forEach((e, abs) => {
              if ((abs + 1) === adlimit) {
                adlimit = 0
                $('.posts').append(bannerTag)
              }
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
            $('.posts').append('Upload post error, Please refresh the page err:<br>' + error)
          }
          $('.posts').append(bannerTag)
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