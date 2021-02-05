isclickedLogin = false
$('#loginbtn').on('click', () => {
  if (!isclickedLogin) {
    isclickedLogin = true
    url = '/login'
    data = $('#loginform').serialize()
    $.post(url, data, res => {
      if (res.status === 1) {
        message = "Login is successfuly."
        popup(message, 'auto', 'success', 1000)
        setTimeout(() => {
          window.location.href = "/"
        }, 1000);
      }
      else if (res.status === 2) {
        message = res.message
        popup(message, 'auto', 'warning', 3000)
      }
    })
    isclickedLogin = false
  }
})

isclickedSignup = false
$('#signupbtn').on('click', (e) => {
  e = e.currentTarget
  if (!isclickedSignup) {
    isclickedSignup = true
    url = '/signup'
    data = $('#signupform').serialize()
    $(e).attr('disabled', 'disabled')
    input = $('input[type=text][name=username]')
    let counter = 5;
    $.post(url, data, res => {
      if (res.status === 1) {
        message = "Signup is successfuly."
        popup(message, 'auto', 'success', 1000)
        setTimeout(() => {
          window.location.href = "/"
        }, 1000);
      }
      else if (res.status === 2) {
        $(e).addClass('disabled')
        message = res.message
        popup(message, 'auto', 'warning', 3000)
        let interval = setInterval(function () {
          $(e).html('Sign up again in (' + counter + 's)')
          if (counter == 0) {
            $(e).removeClass('disabled')
            $(e).removeAttr('disabled')
            $(e).html('Sign up')
            clearInterval(interval);
          }
          counter--;
        }, 1000);
      }
      else if (res.status === 3) {
        $(e).addClass('disabled')
        let alts = res.alternatives
        f = true
        message = res.message
        popup(message, 'auto', 'warning', 4500)
        adiv = $('.alts')
        let interval = setInterval(function () {
          $(e).html('Sign up again in (' + counter + 's)')
          if (counter == 0) {
            $(e).removeClass('disabled')
            $(e).removeAttr('disabled')
            $(e).html('Sign up')
            clearInterval(interval);
          }
          counter--;
        }, 1000);
        alts.forEach(alt => {
          if (alt !== null) {
            if (f) {
              f = false
              adiv.append('Some alternatives: ')
            }
            a = '<span class="alt" style="margin-right:8px">' + alt + '</span>'
            adiv.append(a)
          }
        })
        $('.alt').on('click', (ee) => {
          input.val(ee.currentTarget.textContent) // i => input 
        })
      }
      else {
        message = 'hey'
        popup(message, 'auto', 'warning', 3000)
      }
    })
    isclickedSignup = false
  }
})