
$(window).on('scroll', function () {
  // console.log($(window).scrollTop(),$(window).height(),$(window).scrollTop()+$(window).height(),'=>',$(document).height());
  if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
    url = $(location).attr('pathname') + '/getpost/'
    console.log('bottom');
    var sj = true
    console.log(sj);
    if (sj) {
      console.log('sj if =>', sj);
      $.post(url, res => {
        if (res.status == 2) {
          sj = false
        }
      })
    } else {
      console.log('sj else =>', sj);
    }
  }
});