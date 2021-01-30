e = $('.random')
for (i = 0; i < 1024; i++) {
  randomcolor = '#' + Math.floor(Math.random() * 16777215).toString(16)
  console.log((i + 1) + '. renk ' + randomcolor);
  e.append('<div style="background-color: ' + randomcolor + ';">&nbsp;</div>')
}