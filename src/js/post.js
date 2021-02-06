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
shareTag = '<a class="share" title="Share post" href="javascript:void(0)"><img src="/img/share.svg" alt="">Share</a>'
reportTag = '<a class="report" title="Report post" href="javascript:void(0)"><img src="/img/report.svg" alt="">Report</a>'
saveTag = '<a class="save" title="Save post" href="javascript:void(0)"><img src="/img/save.svg" alt="">Save</a>'
deleteTag = '<a class="del" title="Delete post" href="javascript:void(0)"><img src="/img/delete.svg" alt="">Delete</a>'
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
          message = `You should login for this <a href="/login">Let's login</a>`
          popup(message, 'auto', 'warning', 3000)
        }

        // for profile page
        else if (res.status === 1 || res.status === 2) {
          try {
            r = res.result
            lnd = res.lnd
            counts = res.counts
            r.forEach((post, abs) => {
              if ((abs + 1) % adlimit === 0) {
                $('.posts').append(bannerTag)
              }

              postid = post.postid
              f = '.post[data-post-id=' + postid + ']'
              b = $(f + ' .options div[class!=arrow]');
              hidden = '<a title="Hide post" class="visibility" href="javascript:void(0)"><i class="far fa-eye"></i> Make visible</a>';
              visible = '<a title="Make the post visible" class="visibility" href="javascript:void(0)"><i class="far fa-eye-slash"></i> Make hidden</a>';
              d = new Date(post.createdAt)
              hour = d.getHours(), min = d.getMinutes(), day = d.getDate(), month = d.getMonth() + 1, hour = (hour < 10) ? '0' + hour : hour
              min = (min < 10) ? '0' + min : min, day = (day < 10) ? '0' + day : day, month = (month < 10) ? '0' + month : month
              dd = day + '.' + month + '.' + String(d.getFullYear()).substring(2) + ' ' + hour + ':' + min


              a = `<div class="post" style="display: none;" data-post-id="` + postid + `"><div class="header">
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
                `+ ((res.ismine) ? deleteTag : '') + `
                `+ shareTag + `               
                `+ reportTag + ` 
                `+ saveTag + `               
                `+ ((res.ismine) ? (res.visibility[abs] ? visible : hidden) : '') + `
              </div>
            </div>
          </div>
          <div class="article">
            <p class="ptext">
        
            ` + post.article + `
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
            +<span class="likes` + postid + `">
            `+ counts[abs][0] + `
            </span>
            /
            -<span class="dislikes` + postid + `">
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

              // profile page
              $('.posts').append(a)
              $(f).show(100)
              $(f + ' .like').on('click', (e) => { like(e.currentTarget) })
              $(f + ' .more').on('click', (e) => { more(e.currentTarget) })
              $(f + ' .dislike').on('click', (e) => { dislike(e.currentTarget) })
              $(f + ' .send').on('click', (e) => { send(e.currentTarget) })
              $(f + ' .del').on('click', (e) => { del(e.currentTarget) })
              $(f + ' .save').on('click', (e) => { save(e.currentTarget) })
              $(f + ' .report').on('click', (e) => {
                message = 'Report is soon';
                popup(message, 'auto', 'warning', 2000)
              })
              $(f + ' .share').on('click', (e) => {
                $('.share-div').addClass('share-active');
                $('.options').hide(200);
                protocol = (window.location.protocol === 'http:' ? 'https:' : 'https:')
                link = protocol + '//' + window.location.hostname + '/post/' + postid
                text = 'Hey%2C%20you%20should%20see%20this%20post%0A'

                $('.link-cont .link').html(link)
                $('.link-cont .link').attr('title', link)
                $('.facebook').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + link)
                $('.twitter').attr('href', 'https://twitter.com/intent/tweet?url=' + link + '&text=' + text)
                $('.whatsapp').attr('href', 'https://wa.me/?text=' + text + '' + link)
                $('.pinterest').attr('href', 'https://pinterest.com/pin/create/button/?url=' + link + '&media=&description=' + text)
                $('.linkedin').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&url=' + link + '&title=&summary=' + text + '&source=')
                $('.mail').attr('href', 'mailto:info@example.com?&subject=' + text + '&body=' + link)
              })
              $(f + ' .visibility').on('click', (e) => { console.log('soon'); })
            })
          } catch (error) {
            $('.posts').append('Upload post error, Please refresh the page err:<br>' + error)
          }
        }

        // for index page
        else if (res.status === 4) {
          adlimit = 8
          sj = true
          try {
            r = res.result
            counts = res.counts
            r.forEach((post, abs) => {
              if ((abs + 1) === adlimit) {
                adlimit = 0
                $('.posts').append(bannerTag)
              }
              postid = post.postid;
              d = new Date(post.createdAt)
              h = d.getHours()
              m = d.getMinutes()
              h = h <= 9 ? '0' + h : h;
              m = m <= 9 ? '0' + m : m;
              dd = d.getDate() + '.' + d.getMonth() + '.' + String(d.getFullYear()).substring(2) + ' ' + h + ':' + m
              // `+ ((lnd[abs][0]) ? `<img class="like" src="/img/arrow2.svg" alt="">` : `<img class="like" src="/img/arrow.svg" alt="">`) + `
              // `+ ((lnd[abs][1]) ? `<img class="dislike" src="/img/arrow2.svg" alt="">` : `<img class="dislike" src="/img/arrow.svg" alt="">`) + `
              a = `<div class="post"  style="display: none;" data-post-id="` + postid + `"><div class="header">
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
              `+ ((res.ismine) ? deleteTag : '') + `
              `+ shareTag + `               
              `+ reportTag + ` 
              `+ saveTag + `        
              </div>
            </div>
          </div>
          <div class="article">
            <p class="ptext">
        
            ` + post.article + `
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
            +<span class="likes` + postid + `">
            `+ counts[abs][0] + `
            </span>
            /
            -<span class="dislikes` + postid + `">
            `+ counts[abs][1] + `
            </span>
          </div>
          <span class="commentcount"><span class="c">
          `+ counts[abs][2] + `</span>comment
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

              // profile page
              $('.posts').append(a)
              f = '.post[data-post-id=' + postid + ']'
              $(f).show(400)
              b = $('.post .options')
              $(f + ' .like').on('click', (e) => { like(e.currentTarget) })
              $(f + ' .more').on('click', (e) => { more(e.currentTarget) })
              $(f + ' .dislike').on('click', (e) => { dislike(e.currentTarget) })
              $(f + ' .send').on('click', (e) => { send(e.currentTarget) })
              $(f + ' .del').on('click', (e) => { del(e.currentTarget) })
              $(f + ' .save').on('click', (e) => { save(e.currentTarget) })
              $(f + ' .report').on('click', (e) => {
                message = 'Report is soon';
                popup(message, 'auto', 'warning', 2000)
              })
              $(f + ' .share').on('click', (e) => {
                $('.share-div').addClass('share-active');
                $('.options').hide(200);
                protocol = (window.location.protocol === 'http:' ? 'https:' : 'https:')
                link = protocol + '//' + window.location.hostname + '/post/' + postid
                text = 'Hey%2C%20you%20should%20see%20this%20post%0A'

                $('.link-cont .link').html(link)
                $('.link-cont .link').attr('title', link)
                $('.facebook').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + 'https://www.youtube.com/watch?v=74LAYoqo0p4')
                $('.twitter').attr('href', 'https://twitter.com/intent/tweet?url=' + link + '&text=' + text)
                $('.whatsapp').attr('href', 'https://wa.me/?text=' + text + '' + link)
                $('.pinterest').attr('href', 'https://pinterest.com/pin/create/button/?url=' + link + '&media=&description=' + text)
                $('.linkedin').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&url=' + link + '&title=&summary=' + text + '&source=')
                $('.signal').attr('href', 'signal://send?text=' + text + link)
                $('.mail').attr('href', 'mailto:info@example.com?&subject=' + text + '&body=' + link)
                // 
              })
              $(f + ' .visibility').on('click', (e) => { console.log('soon'); })
            });
          } catch (error) {
            $('.posts').append('Upload post error, Please refresh the page err:<br>' + error)
          }
        }
      }
      else if (res.status === 3) {
        $('.posts').append(res.message)
        // $(window).scrollTop(y + 50);
      }
      else if (res.status === 5) {
        message = `This account has been suspended for a while. <a href="/faq/questionid" style="color: inherit">Why?</a>`
        $('.posts').append('<div style="margin-top:30px; padding: 10px 7px; font-size: 19px" class="warning">' + message + '</div>')
        // popup(message, 'popup', 'warning')
      }
      else {
        console.log('somethins broked. res => \n', res);
      }

      // $(window).scrollTop(y + 150);
      l.hide()
    })
  }
}