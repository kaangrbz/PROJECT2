$(window).on('load', (e) => {
  body = $('body')
  addpostbtn = `<div class="addpost" style="display: none">
  <i class="fas fa-plus-square"></i>
</div>`
  sendposttag = $('.sendpost')
  body.append(addpostbtn)
  isrotated = false
  $('.addpost').show(500)
  $('.addpost').on('click', () => {
    if (isrotated) {
      $('.addpost').css('transform', 'translateX(-50%) rotate(0deg) '); isrotated = false
    } else {
      $('.addpost').css('transform', 'translateX(-50%) rotate(135deg) '); isrotated = true
    }
    sendposttag.toggleClass('active')
  })
  // $('.addpost').trigger('click')
})

$("#article").on('keyup', function () {
  let limit = 300
  $("#count").text(($(this).val().length) + "/" + limit);
});