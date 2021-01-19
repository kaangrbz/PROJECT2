// $(window).on('beforeunload', () => {
//   $('.posts').empty() // delete all posts before reload
// });

var sj = true
e = true
$(window).on('scroll', function () {
  if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
    getpost()
  }
});
$(window).on('load', () => {
  getpost()
})

function getpost() {
  if ($(location).attr('pathname') !== '/') {
    url = $(location).attr('pathname') + '/getpost/'
  }
  else {
    url = '/index/getpost/'
  }
  l = $('.loading')
  if (sj) {

    l.show(300)
    $.post(url, res => {
      if (res.result) {
        $('.posts').empty()
        if (res.status === 2) {
          sj = false
        }
        try {
          r = res.result
          lnd = res.lnd
          counts = res.counts
          console.log('lnd => ', lnd);
          console.log('counts => ', counts);
          r.forEach((e, abs) => {
            d = new Date(e.createdAt)
            dd = d.getDate() + '.' + d.getMonth() + '.' + String(d.getFullYear()).substring(2) + ' ' + d.getHours() + ':' + d.getMinutes()
            // `+ ((lnd[abs][0]) ? `<img class="like" src="/img/arrow2.svg" alt="">` : `<img class="like" src="/img/arrow.svg" alt="">`) + `
            // `+ ((lnd[abs][1]) ? `<img class="dislike" src="/img/arrow2.svg" alt="">` : `<img class="dislike" src="/img/arrow.svg" alt="">`) + `
            a = `<div class="post" data-post-id="` + e.postid + `"><div class="header">
          <div class="user">
            <img src="/img/80x80.jpg" alt="">
            <div class="u">
              <a href="/` + res.username + `">
                ` + res.username + `
                `+ ((res.verified) ? '<span class="verified"><i class="far fa-check-circle"></i></span>' : '') +`
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
          <img class="like" src="/img/arrow.svg" alt="button">
          <img class="dislike" src="/img/arrow.svg" alt="button">
        </div>
      
        <div class="buttons">
          +<span class="likes` + e.postid + `">
          `+ 0 + `
          </span>
          /
          -<span class="dislikes` + e.postid + `">
          `+ 0 + `
          </span>
        </div>
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
          sj = false
          $('.posts').append('<br><br>Upload post error: err:' + error + '<br><br>')
        }
      }
      else if (res.status === 3) {
        sj = false
        $('.posts').empty()
        $('.posts').append(res.message)
      }
      else if (res.result === null) {
        sj = false
      }
      else {
        console.log('somethins broked. res => \n', res);
      }

      // var y = $(window).scrollTop();
      // $(window).scrollTop(y + 150);
      l.hide()
    })
  }
}