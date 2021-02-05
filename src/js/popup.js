
$('.closepopup').on('click', () => {
  $('.popup').removeClass('popupactive')
})
function popup(message, popuptype, type, time) {
  console.log('popup =>', $('.popup').css('display'));
  if ($('.popup').css('opacity') == '0') {
    $('.popup .message').html(message)
    if (!type) type = 'default'
    $('.popup').addClass('popupactive ' + type)
    if (popuptype == 'auto') {
      setTimeout(() => {
        $('.popup').removeClass('popupactive')
      }, time);
    }
  }
}