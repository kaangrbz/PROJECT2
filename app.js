const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyparser = require('body-parser')
const md5 = require('md5')
const session = require('express-session')
const mongoose = require('mongoose')
const slugify = require('@sindresorhus/slugify');
const path = require('path')
const fs = require('fs')
const t = require('./lib/tools.js')
const multer = require('multer')
const morgan = require('morgan')
require('dotenv').config() //process.env.
const { format, render, cancel, register } = require('timeago.js');
const {
   User,
   Post,
   Count,
} = require('./models/blogs')
const { get } = require('http')
app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/timeago', express.static(__dirname + '/node_modules/timeago.js/dist'));
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'src/css')));

// Set The Storage Engine
const storage = multer.diskStorage({
   destination: './inc/uploads/posts/',
   filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
   }
});

// Init Upload
const upload = multer({
   storage: storage,
   limits: { fileSize: 2621440 },
   fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
   }
}).single('media');


// Check File Type
function checkFileType(file, cb) {
   // Allowed ext
   const filetypes = /jpeg|jpg|png|gif|mp4/;
   // Check ext
   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
   // Check mime
   const mimetype = filetypes.test(file.mimetype);

   if (mimetype && extname) {
      return cb(null, true);
   } else {
      cb('Error: Allowed extensions .jpeg .jpg .png .gif .mp4!');
   }
}
const countObj = { users: 10000000, posts: 10000000 }
const userpath = 'forbidden/users/u'
const postpath = 'forbidden/posts/p'

const getJSON = (fullpathname) => {
   return new Promise((resolve, reject) => {
      fs.readFile(fullpathname, (err, data) => {
         if (err) {
            reject('err1')  // calling `reject` will cause the promise to fail with or without the error passed as an argument
            return        // and we don't want to go any further
         }
         resolve(JSON.parse(data))
      })
   })
}
const dbURL = "mongodb+srv://" + process.env.DBUSERNAME + ":" + process.env.DBUSERPASS + "@cluster0.k4rvg.mongodb.net/" + process.env.DBNAME + "?retryWrites=true&w=majority"

var db = mongoose.connect(dbURL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
   useCreateIndex: true
})
   .then((result) => {
      console.log('connected to db');
   })
   .catch((err) => {
      console.log('db error')
   })

app.use(bodyparser.urlencoded({ extended: false }));

// 25.12.2020 19:04

app.use(session({
   secret: 'secret key',
   resave: false,
   saveUninitialized: true
}));

// ## ROUTES ##
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.get('/posts/*', function (req, res, next) {
   res.redirect('/')
});
app.get('/users/*', function (req, res, next) {
   res.redirect('/')
});

app.get('/explore', function (req, res, next) {
   res.end('/explore will soon be here')
});

pindex = 5
app.route('/')
   .get((req, res) => {
      if (req.session.userid) {
         try {
            username = req.session.username

            userid = req.session.userid
            fpn = userpath + userid + '/notifications.json'
            getJSON(fpn).then(notif => {
               res.render('index', { username, notif })
            }).catch(err => { console.log('121 err => ', err) })
         } catch (e) {
            res.render('index', { notif: [] })
         }
      }
      else {
         res.redirect('/login')
      }
   })

app.route('/login')
   .get((req, res) => {
      if (req.session.username) {
         res.redirect('/')
      }
      else {
         res.render('login')
      }
   })
   .post((req, res) => {
      var username = req.body.username
      var userpass = md5(req.body.userpass)
      if (username == '') {
         res.render('signin', {
            message: 'you should write your username',
            status: undefined
         })
      } else if (userpass == '') {
         res.render('signin', {
            message: 'you should write your password too',
            status: undefined
         })
      } else {
         User.findOne({
            username,
            userpass: userpass
         }, (error, result) => {
            if (result === null) {
               res.render('login', {
                  message: 'username or password is wrong',
                  status: 'danger'
               })
            } else {
               req.session.id = result._id;
               req.session.userid = result.userid
               req.session.verified = result.verified
               req.session.username = result.username;
               req.session.email = result.email;
               req.session.fullname = result.fullname;
               res.redirect('/')
            }
         })
      }
   })
app.route('/signup')
   .get((req, res) => {
      res.render('signup')
   })

   .post((req, res) => {
      username = req.body.username || null;
      userpass = md5(req.body.userpass) || null;
      fullname = req.body.fullname.trim() || null;
      email = req.body.email.trim() || null;

      var patt = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      var t_email = patt.test(email)
      if (!t_email) res.render('signup', { message: 'email', status: 'danger', username, fullname, email })
      else if (!fullname) res.render('signup', { message: 'fullname', status: 'danger', username, fullname, email })
      else if (!username) res.render('signup', { message: 'username', status: 'danger', username, fullname, email })
      // create function for forbidden usernames: ataturk etc...
      else if (username === 'index') res.render('signup', { message: 'forbidden username', status: 'danger', username, fullname, email })
      else if (!userpass) res.render('signup', { message: 'userpass', status: 'danger', username, fullname, email })
      else {
         userObj = {
            email,
            fullname,
            username,
            userpass,
            biography: '',
            visibility: true,
            suspend: false,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date()
         }

         Count.findOneAndUpdate({}, { $inc: { users: 1 } })
            .then(ucount => {
               if (ucount === null) {
                  const count = new Count(countObj).save()
                  userObj.userid = 10000000
               }
               else {
                  userObj.userid = ucount.users + 1
               }
               const user = new User(userObj)
                  .save()
                  .then(result => {
                     if (!result) {
                        res.render('signup', {
                           message: 'user could not added, try again',
                           status: 'danger'
                        })
                     }
                     else {
                        res.render('login', {
                           message: 'user added successfuly, let\'s login',
                           status: 'success'
                        })
                     }

                     pathname = 'forbidden/'
                     if (!fs.existsSync(pathname)) {
                        fs.mkdir(pathname, (err) => {
                           if (err) throw err
                        })
                     }
                     pathname = 'forbidden/users/'
                     if (!fs.existsSync(pathname)) {
                        fs.mkdir(pathname, (err) => {
                           if (err) throw err
                        })
                     }
                     pathname = userpath + result.userid
                     if (!fs.existsSync(pathname)) {
                        fs.mkdir(pathname, (err) => {
                           if (err) throw err
                        })
                        files = ['profile', 'notifications', 'liked', 'saved']
                        userObjs = [
                           {
                              userid: result.userid,
                              followers: {
                                 c: 0,
                                 who: []
                              },
                              following: {
                                 c: 0,
                                 who: []
                              },
                              createdAt: new Date(),
                              updatedAt: new Date()
                           },
                           [],
                           [],
                           []
                        ]
                        files.forEach((file, index) => {
                           fullpathname = pathname + '/' + file + ".json"
                           fs.writeFile(fullpathname, JSON.stringify(userObjs[index]), (err) => {
                              if (err) throw err;
                           })
                        });
                     }
                  })
                  .catch((error) => {
                     if (error.code == 11000) {
                        // error codes page should need
                        res.render('signup', {
                           message: 'username is exist try another one',
                           status: 'danger',
                           username, fullname, email
                        })
                     }
                     else {
                        res.render('signup', {
                           message: 'there is an error\n' + error,
                           status: 'danger'
                        })
                     }
                  })
            })
            .catch(err => {
               if (err) throw err
            })
      }
   })

app.get('/logout', (req, res) => {
   req.session.destroy()
   res.redirect('/')
})
app.route('/edit')
   .get((req, res) => {
      if (req.session.username) {
         username = req.session.username
         email = req.session.email
         fullname = req.session.fullname
         User.findOne({ username }).select('biography userid -_id').then(b => {
            if (b) {
               fpn = userpath + b.userid + '/profile.json'
               getJSON(fpn).then(data => {
                  res.render('editprofile', { username, email, fullname, bio: b.biography, data })
               })
            }
            else
               res.render('editprofile', { username, email, fullname, bio: '' })
         })
      }
      else {
         res.redirect('/login')
      }
   })
   .post((req, res) => {

      if (req.session.userid) {
         userid = req.session.userid
         unameReg = /^\w+$/
         fnameReg = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ]+$/
         bioReg = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ!@#$₺€%^&*()_+"'-]+$/
         emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

         username = req.body.username
         email = req.body.email || null
         fullname = req.body.fullname || null
         biography = req.body.biography || ''

         if (!username) {
            res.json({ message: 'Please enter a username', status: 2 })
         }
         else if (username.length < 4) {
            res.json({ message: 'Username must be minimum 4 character', status: 2 })
         }
         else if (!unameReg.test(username)) {
            res.json({ message: 'Allowed characters for username: A-Z a-z 0-9 _', status: 2 })
         }
         else {
            if (username !== req.session.username) {
               User.findOne({ username }).then(u => {
                  var alternatives = []
                  if (u) {
                     var min = 10;
                     var max = 100;
                     // and the formula is:
                     var r = Math.floor(Math.random() * (max - min + 1)) + min;
                     alt = username + r
                     User.findOne({ username: alt }).then(a => {
                        alternatives.push(alt)
                        r = Math.random().toString(36).replace(/[^a-zA-Z0-9_]+/g, '').substr(0, 3);
                        alt = username + r
                        User.findOne({ username: alt }).then(a => {
                           alternatives.push(alt)
                           r = Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 4);
                           alt = username + r
                           User.findOne({ username: alt }).then(a => {
                              alternatives.push(alt)
                              console.log('alter => ', alternatives);
                              res.json({ message: 'Username is exist try something else', status: 3, alternatives })
                           })
                        })
                     })
                  }
               })
            } else {
               if (!emailReg.test(String(email).toLowerCase())) res.json({ message: 'Please enter a valid email, for example: abc@xyz.klm', status: 2 })
               else if (!fullname) res.json({ message: 'Please write a name', status: 2 })
               else if (fullname.length < 5) res.json({ message: 'Fullname must be minimum 5 character', status: 2 })
               else if (!fnameReg.test(fullname)) res.json({ message: 'Allowed characters for fullname: A-Z a-z 0-9 _ ç ı ü ğ ö ş İ Ğ Ü Ö Ş Ç', status: 2 })
               else if (!bioReg.test(biography)) res.json({ message: 'Allowed characters for biography: A-Z a-z 0-9 _ ç ı ü ğ ö ş İ Ğ Ü Ö Ş Ç ! @ # $ ₺ € % ^ & * ( ) _ + " \' - ', status: 2 })
               else if (biography.length > 500) res.json({ message: 'Biography can\'t more than 500 letters', status: 2 })
               else {
                  //update db
                  filter = { userid }
                  update = { username, email, fullname, biography, updatedAt: new Date(), }
                  User.findOneAndUpdate(filter, update)
                     .then(result => {
                        if (result) {
                           req.session.username = result.username;
                           req.session.email = result.email;
                           req.session.fullname = result.fullname;
                           res.json({ message: 'Successfuly updated', status: 1 })
                        }
                        else {
                           res.json({ message: 'There is a problem with update', status: 2 })
                        }
                     })
                     .catch(err => {
                        if (err) res.json({ message: 'There is a problem with update', status: 2 })
                     })
               }
            }
         }


      }
      else {
         res.json({ status: 0 })
      }
   })

app.route('/:username')
   .get((req, res) => {
      if (req.session.username) {
         if (req.params.username !== 'favicon.ico') {
            userid = req.session.userid
            u1 = req.session.username
            u2 = req.params.username
            req.session.nowuser = null

            fpn3 = userpath + userid + '/notifications.json'
            isfollowed = false
            isme = false
            if (u1 === u2)
               isme = true
            try {
               User.findOne({ username: u2 }).select('username userid biography verified fullname -_id').then(u => {
                  if (u) {
                     try {
                        fpn2 = userpath + u.userid + '/profile.json'
                        fs.readFile(fpn2, (err, data) => {
                           data = JSON.parse(data)
                           console.log('data => ', data);
                           i1 = data.followers.who.indexOf(userid)
                           if (i1 > -1)
                              isfollowed = true
                           console.log('is => ', isfollowed);
                           getJSON(fpn3).then(notif => {
                              res.render('profile', { data, u1, u2, isme, notif, isfollowed, u })
                           }).catch(nerr => console.log(nerr))
                        })
                     } catch (error) {
                        console.log('err => 338 ');
                     }
                  }
                  else {

                  }
               })
            } catch (error) {
               console.log('err => 328');
            }
         }
      }
      else {
         res.redirect('/login')
      }
   })

plimit = 5
app.route('/:username/getpost')
   .get((req, res) => {
      res.redirect('/')
   })
   .post((req, res) => {
      if (req.session.userid) {
         if (req.params.username !== 'favicon.ico') {
            username = req.params.username
            userid = req.params.userid
         }
         if (req.session.nowuser !== username) {
            pcount = 0;
            pid = 100000
            lnd = []
            counts = []
            req.session.nowuser = username
         }
         User.findOne({ username }).select('userid username -_id').then(u => {
            if (u) {
               Post.find({ userid: u.userid, postid: { $gt: pid }, visibility: true }).limit(plimit).sort({
                  createdAt: -1
               })
                  .then(result => {
                     rl = result.length
                     result.forEach((e, i) => {
                        fpn = postpath + e.postid + '.json'
                        fs.readFile(fpn, (err, data) => {
                           if (err) throw err;
                           data = JSON.parse(data)
                           likes = data.likes
                           dislikes = data.dislikes
                           comment = data.comments
                           i1 = likes.who.indexOf(req.session.username)
                           i2 = dislikes.who.indexOf(req.session.username)
                           if (i1 > -1) lnd.push([1, 0])
                           else if (i2 > -1) lnd.push([0, 1])
                           else lnd.push([0, 0])
                           counts.push([likes.c, dislikes.c, comment.c])

                        })
                     })
                     verified = false
                     if (username === req.session.username && req.session.verified) {
                        verified = req.session.verified
                     }
                     if (rl >= plimit) {
                        pid = result[rl - 1].postid
                        res.json({ status: 1, result, lnd, counts, verified, username })
                     }
                     else if (rl > 0 && rl < plimit) {
                        result[0].limit = 'test'
                        console.log(result[0].limit);
                        res.json({ status: 2, result, lnd, counts, verified, username })
                     }
                     else {
                        res.json({ status: 2, result: null })
                     }
                  })
                  .catch(err => {
                     console.log(err);
                     res.json({ status: 3, result: String(err) })
                  })
            }
            else if (username === 'index') {
               try {
                  let fpn = userpath + req.session.userid + '/profile.json'
                  fs.readFile(fpn, (err, data) => {
                     if (err) throw err
                     data = JSON.parse(data)
                     fc = data.following.c
                     if (fc > 0) {
                        ulimit = 5

                        // res.json({
                        //    status: 1,
                        //    result: []
                        // })
                     }
                     else {
                        res.json({
                           status: 3,
                           result: null,
                           message: "You don't follow anyone. You can explore the world <a href='/explore'>Let's go</a> "
                        })
                     }
                  })
               } catch (error) {
                  console.log('err => 474');
               }
            }
            else res.json({ status: 3, result: [] })
         })

      }
      else res.json({ status: 0, result: 'not login' })
   })


app.route('/post')
   .get((req, res) => {
      if (req.session.username) {
         res.redirect('/')
      }
      else {
         res.render('login', { data: null })
      }
   })
   .post((req, res) => {
      if (req.session.username) {
         // if (true) {
         username = req.session.username
         userid = req.session.userid
         media = null
         article = req.body.article.trim() || ''
         tags = req.body.tags.trim() || ''
         if (!article && !media) {
            res.json({ status: 2, message: 'Write something or select a picture -not avaliable now-' })
         }
         else {
            console.log('userid => ', userid);
            postObj = {
               userid,
               likes: {
                  c: 0,
                  who: []
               },
               dislikes: {
                  c: 0,
                  who: []
               },
               comments: {
                  c: 0,
                  who: []
               }
            }
            Count.findOneAndUpdate({}, { $inc: { posts: 1 } })
               .then(pcount => {
                  if (pcount === null) {
                     const count = new Count(countObj)
                        .save()
                        .then(r => {
                           console.log(r, ' => 633');
                        })
                     postObj.postid = 1000000
                  }
                  else {
                     postObj.postid = pcount.posts
                  }

                  // save to json
                  fullpathname = postpath + postObj.postid + ".json"

                  pathname = 'forbidden/posts/'
                  if (!fs.existsSync(pathname)) {
                     fs.mkdir(pathname, (err) => {
                        if (err) res.send('create folder error')
                     })
                  }
                  fs.writeFile(fullpathname, JSON.stringify(postObj), (err) => {
                     if (err) throw err;
                  })

                  // save to db
                  const post = new Post({
                     userid,
                     postid: postObj.postid,
                     attacments: [],
                     article,
                     visibility: true,
                     createdAt: new Date(),
                     updatedAt: new Date()
                  })
                     .save()
                     .then(result => {
                        if (result) {
                           res.json({ status: 1 })
                        }
                        else {
                           res.json({ status: 2, message: 'There is an error while posting. Please try again later.' })
                        }
                     })
                     .catch(err => {
                        res.json({ status: 3, message: String(err) })
                     })
               })
         }
         // upload photo with compress and crop
         // upload(req, res, (err) => {
         //    if (err) {
         //       res.render('index', {
         //          message:err
         //       });
         //    } else {
         //       if (req.file == undefined) {
         //          res.render('index', {
         //             message:'Error: No File Selected!'
         //          });
         //       } else {
         //          res.render('index', {
         //             message:'File Uploaded!',
         //             file: `uploads/${req.file.filename}`,
         //             ext: req.file.mimetype
         //          });
         //       }
         //    }
         // });
      }
      else {
         res.json({ status: 0 })
      }
   })

app.route('/:ecode/:postid/event')
   .get((req, res) => {
      res.end('NOT ALLOWED METHOD')
   })
   .post((req, res) => {
      if (!req.session.userid) {
         res.json({
            status: 0
         })
      }
      else {
         // limit event count
         pathname = 'forbidden/posts/'
         fullpathname = postpath + req.params.postid + ".json"
         userid = req.session.userid
         pathname3 = userpath
         var postFolder = fs.existsSync(pathname)
         if (!postFolder) {
            // posts folder is not exist and will create
            fs.mkdir(pathname, (err) => {
               if (err) res.send('create folder error')
            })
         }

         postid = req.params.postid
         ecode = req.params.ecode
         console.log(postid, ecode);
         scode = 0
         // posts folder is exist
         if (fs.existsSync(fullpathname)) {
            fs.readFile(fullpathname, (err, data) => {
               data = JSON.parse(data)
               whoposted = data.userid
               i1 = data.likes.who.indexOf(userid)
               i2 = data.dislikes.who.indexOf(userid)
               if (ecode == 1) {
                  if (i1 == -1 && i2 == -1) {
                     scode = 1
                     data.likes.c++
                     data.likes.who.unshift(userid)
                     console.log('who posted => ', data.userid);

                     if (whoposted !== userid) {
                        fpn = userpath + whoposted + '/notifications.json'
                        getJSON(fpn).then(notif => {
                           notifObj = { nid: notif.length + 1, userid, postid, ncode: 1, ntime: new Date(), read: false }
                           notif.unshift(notifObj)
                           fs.writeFile(fpn, JSON.stringify(notif), err => {
                              if (err) throw err
                           })
                        }).catch(err => { console.log('728 err => ', err) })
                     }
                  }
                  else if (i1 > -1 && i2 == -1) {
                     scode = 2
                     data.likes.c--
                     data.likes.who.splice(i1, 1)

                     if (whoposted !== userid) {
                        // delete like
                        fpn = userpath + whoposted + '/notifications.json'
                        getJSON(fpn)
                           .then(notif => {
                              var index = -1;
                              var filteredObj = notif.find(function (item, i) {
                                 console.log('item =>',item);
                                 if (item.userid === userid && item.ncode == 1) { index = i; return i; }
                              });
                              notif.splice(index, 1)
                              fs.writeFile(fpn, JSON.stringify(notif), err => {
                                 if (err) throw err
                              })
                           }).catch(err => console.error('743 => ', err))
                     }
                  }
                  else if (i1 == -1 && i2 > -1) {
                     scode = 3
                     data.dislikes.c--
                     data.dislikes.who.splice(i2, 1)
                     data.likes.c++
                     data.likes.who.unshift(userid)
                     if (whoposted !== userid) {
                        fpn = userpath + whoposted + '/notifications.json'
                        getJSON(fpn).then(notif => {
                           notifObj = { nid: notif.length + 1, userid, postid, ncode: 1, ntime: new Date(), read: false }
                           notif.unshift(notifObj)
                           fs.writeFile(fpn, JSON.stringify(notif), err => {
                              if (err) throw err
                           })
                        }).catch(err => { console.log('728 err => ', err) })
                     }
                  }
                  console.log('scode => ', scode);
                  fs.writeFile(fullpathname, JSON.stringify(data), err => {
                     if (err) throw err
                  })
                  res.json({
                     status: scode
                  })
               }

               //-------------------------------------------------------------//
               else if (ecode == 2) {
                  if (i1 == -1 && i2 == -1) {
                     scode = 1
                     data.dislikes.c++
                     data.dislikes.who.unshift(req.session.userid)
                  }
                  else if (i1 == -1 && i2 > -1) {
                     scode = 2
                     data.dislikes.c--
                     data.dislikes.who.splice(i2, 1)
                  }
                  else if (i1 > -1 && i2 == -1) {
                     scode = 3
                     data.likes.c--
                     data.likes.who.splice(i1, 1)
                     data.dislikes.c++
                     data.dislikes.who.unshift(req.session.userid)
                  }
                  else {
                     scode = 10
                  }
                  console.log('scode => ', scode);
                  fs.writeFile(fullpathname, JSON.stringify(data), err => {
                     if (err) throw err
                     res.json({
                        status: scode
                     })
                  })
               }

               //-------------------------------------------------------------//
               else if (ecode == 3) {
                  msg = req.body.msg || ''
                  limit = 500
                  if (msg.length > limit) {
                     msg = msg.substring(0, limit)
                  }
                  data.comments.c++
                  data.comments.who.unshift({ userid, msg, createdAt: new Date(), updatedAt: new Date() })
                  scode = 1

                  if (whoposted !== userid) {
                     fpn = userpath + whoposted + '/notifications.json'
                     getJSON(fpn).then(notif => {
                        notifObj = { nid: notif.length + 1, userid, postid, ncode: 3, ntime: new Date(), read: false }
                        notif.unshift(notifObj)
                        fs.writeFile(fpn, JSON.stringify(notif), err => {
                           if (err) throw err
                        })
                     }).catch(err => { console.log('822 err => ', err) })
                  }
                  // // if delete the comment
                  // getJSON(fullpathname3)
                  // .then(notif => {
                  //    var index = -1;
                  //    var filteredObj = notif.find(function (item, i) {
                  //       if (item.nuser === req.session.username && item.ncode == 2) { index = i; return i; }
                  //    });

                  //    notif.splice(index, 1)
                  //    fs.writeFile(fullpathname3, JSON.stringify(notif), err => {
                  //       if (err) throw err
                  //    })
                  // }).catch(err => console.error('885 => ', err))

               }
            })
         }
         else {
            res.render('posts', {
               data: [],
               date: null,
            })
         }
      }
   })

// app.route('/comment/:posturl')
//   .get((req, res) => {
//     res.redirect('/')
//   })
//   .post((req, res) => {
//     email = req.body.email.trim() || null;
//     try {
//       var patt = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
//       var email = patt.exec(email)[0];
//     } catch (error) {
//       res.render('adduser', { message: 'email', status: 'danger' })
//     }
//     if (req.session.username) {
//       url = req.params.posturl
//       email = req.body.email.trim() || req.session.email
//       article = req.body.article.trim() || ''
//       pathname = 'public/posts/'
//       fullpathname = pathname + req.params.posturl + ".json"
//       var postFolder = fs.existsSync('public/posts')
//       if (!postFolder) {
//         // posts folder is not exist and will create
//         fs.mkdir(pathname, (err) => {
//           if (err) res.send('create folder error')
//         })
//       }
//       else {
//         // posts folder is exist
//         isfileexist = fs.existsSync(fullpathname);
//         if (isfileexist) {
//           fs.readFile(fullpathname, (err, data) => {
//             if (err) throw err;
//             mdata = JSON.parse(data)
//             comm_obj = {
//               comm_username: req.session.username,
//               comm_name: req.session.fullname,
//               comm_email: email,
//               comm_article: article,
//               comm_createdAt: new Date(),
//               comm_updatedAt: new Date()
//             }
//             mdata.comments.push(comm_obj)
//             fs.writeFile(fullpathname, JSON.stringify(mdata), err => {
//               if (err) throw err;
//             })
//             res.json({
//               status: 1
//             })
//           })
//         }
//         else {
//           res.render('posts', {
//             data: [],
//             date: null,
//           })
//         }
//       }
//     }
//     else {
//       res.json({
//         status: 0
//       })
//     }
//   })



app.route('/:username/follow')
   .get((req, res) => {
      res.end('/')
   })
   .post((req, res) => {
      if (req.session.userid) {
         username = req.params.username
         userid = req.session.userid
         User.findOne({ username }).then(u => {
            if (u) {
               whofollowed = u.userid
               whofollower = req.params.username

               logged_fpn = userpath + userid + "/profile.json"
               notlogged_fpn = userpath + whofollowed + "/profile.json"
               notlogged_notif = userpath + whofollowed + "/notifications.json"
               console.log('fs.existsSync(logged_fpn) =>', fs.existsSync(logged_fpn));
               console.log('fs.existsSync(notlogged_fpn) =>', fs.existsSync(notlogged_fpn));
               if (fs.existsSync(logged_fpn)) {
                  if (fs.existsSync(notlogged_fpn)) {
                     getJSON(logged_fpn).then(loggeduser => {
                        getJSON(notlogged_fpn).then(notloggeduser => {

                           console.log(loggeduser, notloggeduser);

                           const index1 = notloggeduser.followers.who.indexOf(userid);
                           const index2 = loggeduser.following.who.indexOf(whofollowed);
                           console.log(index1, ' and ', index2);
                           status = 0
                           if (index1 == -1) {
                              // not followed
                              notloggeduser.followers.who.unshift(userid)
                              notloggeduser.followers.c++
                              loggeduser.following.who.unshift(whofollowed)
                              loggeduser.following.c++
                              status = 1

                              // send notif
                              getJSON(notlogged_notif)
                                 .then(notif => {
                                    notifObj = { nid: notif.length + 1, userid: whofollowed, ncode: 2, ntime: new Date(), read: false }
                                    notif.unshift(notifObj)
                                    fs.writeFile(notlogged_notif, JSON.stringify(notif), err => {
                                       if (err) throw err
                                    })
                                 }).catch(err => console.error('885 => ', err))
                           }
                           else {
                              // already followed
                              notloggeduser.followers.who.splice(index1, 1);
                              notloggeduser.followers.c--
                              loggeduser.following.who.splice(index2, 1);
                              loggeduser.following.c--
                              status = 2

                              // delete follow
                              getJSON(notlogged_notif)
                                 .then(notif => {
                                    var index = -1;
                                    var filteredObj = notif.find(function (item, i) {
                                       if (item.userid === userid && item.ncode == 2) { index = i; return i; }
                                    });
                                    notif.splice(index, 1)
                                    fs.writeFile(notlogged_notif, JSON.stringify(notif), err => {
                                       if (err) throw err
                                    })
                                 }).catch(err => console.error('885 => ', err))
                           }

                           fs.writeFile(notlogged_fpn, JSON.stringify(notloggeduser), err => {
                              if (err) throw err;
                              fs.writeFile(logged_fpn, JSON.stringify(loggeduser), err => {
                                 if (err) throw err;
                                 res.json({ status })
                              })
                           })
                        }).catch(err => {
                           if (err) throw err
                        })
                     }).catch(err => {
                        if (err) throw err
                     })
                  }
                  else {
                     res.json({
                        status: 3,
                        message: 'Something went wrong while following. errcode: 1002'
                     })
                  }
               }
               else {
                  res.json({
                     status: 3,
                     message: 'Something went wrong while following. errcode: 1001'
                  })
               }
            }
            else {
               res.json({
                  status: 3,
                  message: 'The user named ' + req.params.username + ' is not exist.'
               })
            }
         })


      }
      else {
         res.json({
            status: 0
         })
      }
   })

app.route('/delete/:postid')
   .get((req, res) => {
      res.end('/delete wrong method')
   })
   .post((req, res) => {
      if (req.session.userid) {
         Post.findOne({ postid: req.params.postid })
            .then(result => {
               if (result) {
                  if (result.userid === req.session.userid) {
                     Post.deleteOne({ postid: req.params.postid })
                        .then(mresult => {
                           if (result) {
                              fullpathname = postpath + req.params.postid + '.json'
                              fs.unlink(fullpathname, err => {
                                 if (err) throw err
                                 res.json({ status: 1 })
                              })
                           }
                           else {
                              res.json({ status: 2 })
                           }
                        })
                  }
                  else {
                     res.json({ status: 2 })
                  }
               }
               else {
                  res.json({ status: 2 })
               }
            })
      }
      else {
         res.json({ status: 0 })
      }
   })

app.route('/post/:postid')
   .get((req, res) => {
      res.end('/post soon')
   })
   .post((req, res) => {
      res.end('/post soon')
   })

// ---------------------- FIRST THOUSAND LINE CODE ==========================

app.route('/save/:postid')
   .get((req, res) => {
      res.end('/save wrong method')
   })
   .post((req, res) => {
      if (!req.session.userid) {
         res.json({
            status: 0
         })
      }
      else {
         pathname = 'forbidden/users/'
         userid = req.session.userid
         postid = req.params.postid
         fpn = userpath + userid + "/saved.json"
         saveObj = { postid, userid, createdAt: new Date() }

         if (fs.existsSync(fpn) && fs.existsSync(pathname)) {
            fs.readFile(fpn, (err, savedata) => {
               savedata = JSON.parse(savedata)
               sdl = savedata.length
               if (sdl > 0) {
                  m_var = 1
                  var index = -1;
                  var val = postid
                  var filteredObj = savedata.find(function (item, i) {
                     if (item.postid === val) { index = i; return i; }
                  });
                  if (index > -1) {
                     savedata.splice(index, 1)
                     fs.writeFile(fpn, JSON.stringify(savedata), err => {
                        if (err) res.json({ status: 3, message: String(err) })
                        res.json({ status: 2 })
                     })
                  }
                  else {
                     fs.writeFile(fpn, JSON.stringify(savedata), err => {
                        if (err) res.json({ status: 3, message: String(err) })
                        res.json({ status: 1 })
                     })
                  }
               }
               else {
                  savedata.unshift(saveObj)
                  fs.writeFile(fpn, JSON.stringify(savedata), err => {
                     if (err) res.json({ status: 3, message: String(err) })
                     res.json({ status: 1 })
                  })
               }
            })
         }
         else {
            res.json({ status: 3, message: 'There is an error please try again later.' })
         }
      }
   })

app.use((req, res, next) => {
   res.status(404).send("Sorry can't find that or i'm working on it");
});

app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).send('Something broke!');
});

let port = process.env.PORT;
if (port == null || port == "") {
   port = 80;
}
app.listen(port, () => {
   console.log('Server working at http://localhost:' + port)
})

// 17.01.2021 00:00 1223
// 19.01.2021 02:59 1183
// 20.01.2021 02:16 1163