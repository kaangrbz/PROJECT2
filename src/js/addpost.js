$(window).on('ready', (e) => {
  body = $('body')
  addpostbtn = `<div class="addpost" style="display:none">
  <i class="fas fa-plus-square"></i>
</div>`
  body.append(addpostbtn)
  addpostbtn.show(300)
  $(addpostbtn).on('click', () => {
    console.log('wawd');
  })
})

function toggleAddpost() {
  
}