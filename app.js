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
   UTM,
   Report,
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
const unameReg = /^\w+$/
const fnameReg = /^[a-zA-Z0-9 ğüşöçİĞÜŞÖÇ]+$/ // with spaace
const bioReg = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ!@#$₺€%^&*() _+"'-]+$/ // with space
const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


const getJSON = (fullpathname) => {
   return new Promise((resolve, reject) => {
      fs.readFile(fullpathname, (err, data) => {
         if (err) {
            reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
            return        // and we don't want to go any further
         }
         resolve(JSON.parse(data))
      })
   })
}
const dbURL = "mongodb+srv://" + process.env.DBUSERNAME + ":" + process.env.DBUSERPASS + "@cluster0.k4rvg.mongodb.net/" + process.env.DBNAME + "?retryWrites=true&w=majority"

// setInterval(()=>{
//    console.log('im the interval on server side')
// },1000)

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
   saveUninitialized: true,
   cookie: { ///
      httpOnly: false, // minimize risk of XSS attacks by restricting the client from reading the cookie
      secure: false, // only send cookie over https
      maxAge: 2629800000 // set cookie expiry length in ms // 2629800000 = 1 month
   }
}));

// ## ROUTES ##
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.route('/search')
   .get((req, res) => {
      res.redirect('/')
   })
   .post(async (req, res) => {
      if (req.session.userid) {
         console.log(req.body.searchData);
         let posts = await Post.find({ article: "/${req.body.searchData}/i", visibility: true }).limit(4).sort({ createdAt: -1 })
         let users = await User.find({ username: "/${req.body.searchData}/i", visibility: true }).limit(4).sort({ createdAt: -1 })


         console.log('127 posts =>', posts);
      }
      else {
         res.json({
            status: 0
         })
      }
   })


app.get('/posts/*', function (req, res, next) {
   res.redirect('/')
});
app.get('/users/*', function (req, res, next) {
   res.redirect('/')
});

app.get('/explore', function (req, res, next) {
   res.end('/explore will soon be here')
});

var sitename = 'devkaan test social media site'
app.route('/from/:adress')
   .get((req, res) => {
      res.redirect('/')
   })
   .post((req, res) => {
      try {
         adress = req.params.adress
      } catch (error) {
         adress = null
         console.log(error);
      }
      console.log(adress);
      if (adress) {
         let utm = new UTM({
            fromwhere: adress,
            whoadded: (req.session.userid) ? req.session.userid : 'visitor',
            whichsite: sitename
         }).save(result => {
            console.log('145 =>', result);
            if (result) {
               res.json({ status: 1 })
            }
            else { res.json({ status: 2, message: 'utm_source could not added' }) }
         })
      }
   })

pindex = 5
app.route('/') // home
   .get(async (req, res) => {
      req.session.nowuser = null
      if (req.session.userid) {
         u1 = req.session.username
         try {
            userid = req.session.userid
            ncount = 0
            notifpath = userpath + userid + '/notifications.json'
            let notifs = await getJSON(notifpath)
            if (notifs.length > 0) {
               notifs.forEach((notif, i) => {
                  if (!notif.read) ncount++
               })
            }
            console.log('ncount =>', ncount);
            res.render('index', { u1, ncount })
         } catch (e) {
            res.render('index')
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
   .post(async (req, res) => {
      var username = req.body.username
      var userpass = md5(req.body.userpass)
      if (username == '') {
         res.json({
            message: 'you should write your username',
            status: 2
         })
      } else if (userpass == '') {
         res.json({
            message: 'you should write your password too',
            status: 2
         })
      } else {
         let result = await User.findOne({ username, userpass })
         if (!result) {
            res.json({
               message: 'Username or password is wrong',
               status: 2
            })
         } else {
            req.session.id = result._id;
            req.session.userid = result.userid
            req.session.verified = result.verified
            req.session.username = result.username;
            req.session.email = result.email;
            req.session.fullname = result.fullname;
            res.json({
               status: 1
            })
         }
      }
   })


app.route('/signup')
   .get((req, res) => {
      res.render('signup')
   })
   .post(async (req, res) => {
      username = req.body.username.trim().toLowerCase() || null;
      userpass = req.body.userpass.trim() || null;
      fullname = req.body.fullname.trim() || null;
      email = req.body.email.trim().toLowerCase() || null;

      var patt = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

      if (!emailReg.test(String(email))) res.json({ message: 'Please enter a valid email, for example: email@example.com', status: 2 })
      else if (!fullname) res.json({ message: 'Please write a name', status: 2 })
      else if (fullname.length < 3) res.json({ message: 'Fullname must be minimum 3 character', status: 2 })
      else if (!fnameReg.test(fullname)) res.json({ message: 'Allowed characters for fullname: A-Za-z0-9_çıüğöşİĞÜÖŞÇ', status: 2 })
      else if (!username) res.json({ message: 'Please write an username.', status: 2 })
      else if (username.length < 4) res.json({ message: 'Username must be minimum 4 character.', status: 2 })
      else if (!unameReg.test(username)) res.json({ message: 'Allowed characters for username: A-Za-z0-9_', status: 2 })
      // create function for forbidden usernames: ataturk etc...
      let u = await User.findOne({ username })
      var alternatives = []
      if (u) {
         var min = 10;
         var max = 100;

         r = Math.floor(Math.random() * (max - min + 1)) + min;
         alt = username + r
         a = await User.findOne({ username: alt })
         alternatives.push(alt)

         r = Math.random().toString(36).replace(/[^a-zA-Z0-9_]+/g, '').substr(0, 3);
         alt = username + r
         a = await User.findOne({ username: alt })
         alternatives.push(alt)

         r = Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 4);
         alt = r + username
         a = await User.findOne({ username: alt })
         alternatives.push(alt)

         r = Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 2);
         alt = r + username + r
         a = await User.findOne({ username: alt })
         alternatives.push(alt)

         res.json({ message: 'Username is exist try something else.', status: 3, alternatives })
      }
      else if (t.isForbiddenUsername(username)) res.json({ message: 'You can not use this username.', status: 2 })
      else if (!userpass) res.json({ message: 'You should write a password', status: 2 })
      else if (userpass.length < 6) res.json({ message: 'Password must be minimum 6 character.', status: 2 })
      else {
         userObj = {
            email,
            fullname,
            username,
            userpass: md5(userpass),
            biography: '',
            visibility: true,
            suspend: false,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date()
         }

         Count.findOneAndUpdate({}, { $inc: { users: 1 } })
            .then(ucount => {
               if (!ucount) {
                  const count = new Count(countObj).save()
                  userObj.userid = countObj.userid // const
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
                        files = ['profile', 'blocked', 'notifications', 'liked', 'saved']
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
   .get(async (req, res) => {
      if (req.session.userid) {
         username = req.session.username
         email = req.session.email
         fullname = req.session.fullname
         userid = req.session.userid
         let b = await User.findOne({ username }).select('biography userid verified -_id')
         if (b) {
            fpn = userpath + b.userid + '/profile.json'
            let data = await getJSON(fpn)
            allposts = await Post.find({ userid }).select('postid -_id')
            pcount = allposts.length
            res.render('editprofile', { username, email, fullname, biography: b.biography, data, verified: b.verified, pcount })
         }
         else
            res.render('editprofile', { username, email, fullname, bio: '' })
      }
      else {
         res.redirect('/login')
      }
   })
   .post(async (req, res) => {
      if (req.session.userid) {
         userid = req.session.userid

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
            let u = await User.findOne({ username })
            if (username !== req.session.username) {
               var alternatives = []
               if (u) {
                  var min = 10;
                  var max = 100;

                  r = Math.floor(Math.random() * (max - min + 1)) + min;
                  a = await User.findOne({ username: username + r })
                  alternatives.push(username + r)

                  r = Math.random().toString(36).replace(/[^a-zA-Z0-9_]+/g, '').substr(0, 3);
                  a = await User.findOne({ username: username + r })
                  alternatives.push(username + r)

                  r = Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 4);
                  a = await User.findOne({ username: username + r })
                  alternatives.push(username + r)
                  console.log('alts => ', alternatives);
                  res.json({ message: 'Username is exist try something else.', status: 3, alternatives })
               }
            } else {
               console.log('419 else');
               if (u.suspend) res.json({ message: 'Your account is suspended. You can\'t change your infos. please send email to me at <a href="mailto:abdikaangrbz@gmail.com">here</a>', status: 3, alternatives: [] })
               else if (!emailReg.test(String(email).toLowerCase())) res.json({ message: 'Please enter a valid email, for example: email@example.com', status: 2 })
               else if (!fullname) res.json({ message: 'Please write a name', status: 2 })
               else if (fullname.length < 5) res.json({ message: 'Fullname must be minimum 5 character', status: 2 })
               else if (!fnameReg.test(fullname)) res.json({ message: 'Allowed characters for fullname: A-Z a-z 0-9 _ ç ı ü ğ ö ş İ Ğ Ü Ö Ş Ç', status: 2 })
               else if (!biography && biography !== '') {
                  console.log('426 ');
                  if (!bioReg.test(biography)) res.json({ message: 'Allowed characters for biography: A-Z a-z 0-9 _ ç ı ü ğ ö ş İ Ğ Ü Ö Ş Ç ! @ # $ ₺ € % ^ & * ( ) _ + " \' - ', status: 2 })
               }
               else if (biography.length > 500) res.json({ message: 'Biography can\'t more than 500 letters', status: 2 })
               else {
                  //update db
                  filter = { userid }
                  update = { username, email, fullname, biography, updatedAt: new Date(), }
                  User.findOneAndUpdate(filter, update)
                     .then(result => {
                        console.log('435 result =>', result);
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
app.route('/markasread')
   .get((req, res) => {
      res.redirect('/')
   })
   .post(async (req, res) => {
      if (req.session.userid) {
         userid = req.session.userid
         ncount = 0
         notifpath = userpath + userid + '/notifications.json'
         let notifs = await getJSON(notifpath)
         if (notifs.length > 0) {
            notifs.forEach((notif, i) => {

               console.log('--------------------------------------------- 734');
               if (!notif.read) notifs[i].read = true
            })
            fs.writeFile(notifpath, JSON.stringify(notifs), err => {
               if (err) res.json({ status: 2, message: 'There is an error. Please try again later' })
               res.json({ status: 1 })
            })
            // console.log(notifs);
         }
      } else {
         res.json({ status: 0 })
      }
   })
app.route('/notif/')
   .get((req, res) => {
      res.redirect('/')
   })
   .post(async (req, res) => {
      if (req.session.userid) {
         if (req.session.notifuser !== username) {
            req.session.notifuser = username
            lastnotif = 0
         }
         nlimit = 10
         users = []
         dates = []
         userid = req.session.userid
         fpn = userpath + userid + '/notifications.json'
         let notifs = await getJSON(fpn)
         nl = notifs.length
         if (nl > 0) {
            if (nl <= nlimit) {
               // lover than or equal to 'nlimit'
               for (let i = 0; i < nl; i++) {
                  const element = notifs[i];
                  let user = await User.findOne({ userid: element.userid })
                  users.push(user.username)
                  dates.push(t.formatDate(new Date(element.ntime), 'timeago'))
                  if (i === (nl - 1)) {
                     res.json({ status: 1, result: notifs, users, dates })
                  }
               }
            } else {
               // higher than 'nlimit'
               // console.log('notifs.splice(lastnotif, nlimit) =>', notifs.splice(lastnotif, nlimit));
               notifs.forEach(async (notif, i) => {
                  user = await User.findOne({ userid: notif.userid })
                  users.push(user.username)
                  dates.push(t.formatDate(new Date(notif.ntime), 'timeago'))
                  if (i == nl - 1) {
                     lastnotif += nlimit
                     res.json({ status: 2, result: notifs.splice(0, nlimit), users: users.splice(0, nlimit), dates: dates.splice(0, nlimit) })
                  }
               })
            }
         }
         else {
            //has not notif
            res.json({ status: 1, result: [] })
         }
      }
      else {
         res.json({ status: 0 })
      }
   })

app.route('/:username') // :profile ////
   .get(async (req, res) => {
      if (req.params.username !== 'favicon.ico') {
         userid = req.session.userid
         u1 = req.session.username
         u2 = req.params.username
         req.session.nowuser = null

         notifpath = userpath + userid + '/notifications.json'
         isme = false
         if (u1 === u2)
            isme = true
         try {
            // check user is not suspended and not private
            u = await User.findOne({ username: u2 }).select('username userid biography verified fullname -_id')
            if (u) {
               userid = u.userid
               allposts = await Post.find({ userid }).select('postid -_id')
               pcount = allposts.length
               // console.log('pcount =>', allposts); /// 
               try {
                  if (req.session.userid) { // if it is not visitor. logged in
                     userid = req.session.userid
                     ncount = 0
                     notifpath = userpath + userid + '/notifications.json'
                     let notifs = await getJSON(notifpath)
                     if (notifs.length > 0) {
                        notifs.forEach((notif, i) => {
                           if (!notif.read) ncount++
                        })
                     }
                  }
                  else {// if it is visitor
                     ncount = ''
                  }

                  fpn2 = userpath + u.userid + '/profile.json'
                  fs.readFile(fpn2, (err, data) => {
                     data = JSON.parse(data)
                     // console.log('data => ', data); /// 
                     i1 = data.followers.who.indexOf(userid)
                     isfollowed = false
                     if (i1 > -1) isfollowed = true;
                     res.render('profile', { data, u1, u2, isme, verified: u.verified, isfollowed, u, pcount, ncount })
                  })
               } catch (error) {
                  console.log('err => 581 \n', error);
               }
            }
            else {
               res.render('585')
            }
         } catch (error) {
            console.log('err => 588', error);
         }
      }
   })

app.route('/:username/getpost')
   .get((req, res) => {
      res.redirect('/')
   })
   .post(async (req, res) => {
      if (true) {
         if (req.params.username !== 'favicon.ico') {
            username = req.params.username
            userid = req.session.userid
         }
         if (req.session.nowuser !== username) {
            req.session.nowuser = username
            pcount = 0
            pid = 999999999999999
            isverified = []
            ismine = []
            usernames = []
            isfirst = true
         }

         // for index page
         if (username === 'index') {
            plimit = 5
            lnd = []
            counts = []
            ismine = []
            try {
               fpn = userpath + userid + '/profile.json'
               let profiledata = await getJSON(fpn)
               dl = profiledata.following.who.length // DataLength
               if (dl === 1) {
                  // following just one guy
                  followingid = profiledata.following.who[0]
                  let user = await User.findOne({ userid: followingid, visibility: true, suspend: false }).select('username userid verified -_id')
                  if (user) {
                     // user is not suspended and not private account
                     // check user is blocked or if blocks the user [delete from json file]
                     let posts = await Post.find({ userid: user.userid, postid: { $lt: pid }, visibility: true }).limit(plimit).sort({ createdAt: -1 })
                     let status = 3
                     if (posts.length > 0) {
                        // has post
                        status = 4
                        try {
                           pid = posts[posts.length - 1].postid // artirma olayini hallet

                           // console.log('517 pid =>', pid); /// 
                           for (let i = 0; i < posts.length; i++) {
                              const post = posts[i];
                              (user.verified) ? isverified.push(1) : isverified.push(0)
                              usernames.push(user.username)
                              postfilepath = postpath + post.postid + '.json'
                              let postfile = await getJSON(postfilepath)
                              // like/dislike control
                              if (postfile.likes.who.includes(userid)) lnd.push([1, 0])
                              else if (postfile.dislikes.who.includes(userid)) lnd.push([0, 1])
                              else lnd.push([0, 0])

                              // is me control for delete button. [-]
                              if (postfile.userid === userid) ismine.push(1)
                              else ismine.push(0)



                              counts.push([postfile.likes.c, postfile.dislikes.c, postfile.comments.c])
                              if ((i + 1) === posts.length) { // if last item

                                 res.json({
                                    // ilerde bunlari tek degiskende gonderebilirsin belki
                                    status,
                                    result: posts,
                                    isverified,
                                    usernames,
                                    lnd,
                                    counts,
                                    ismine
                                 })
                              }
                           }
                        } catch (error) {
                           console.log('541 catch =>', error);
                        }
                     }
                     else {
                        // has not post
                        let message = 'The person you follow has no post or you\'ve reached to bottom.'
                        res.json({
                           status,
                           result: null,
                           message
                        })
                     }
                  }
                  else {
                     // user is suspended or private account
                     console.log('539 no user');
                     let message = 'The user is suspended or private account.'
                     res.json({
                        status: 3,
                        result: null,
                        message
                     })
                  }
               }
               else if (dl > 1) {
                  console.log('569');
                  let message = 'You are following more than 1 guy. this is soon'
                  res.json({
                     status: 3,
                     result: null,
                     message
                  })
               }
               else {
                  // console.log('544'); ///
                  let message = 'You don\'t follow anyone.'
                  res.json({
                     status: 3,
                     result: null,
                     message
                  })
               }
            } catch (error) {
               console.log('err => 494');
            }
         }
         // if unexpected username
         else if (!unameReg.test(username)) {
            let message = 'Wrongusername'
            res.json({
               status,
               result: null,
               message
            })
         }
         // for profile page
         else {
            plimit = 4
            lnd = []
            counts = []
            visibility = []
            let user = await User.findOne({ username, visibility: true })

            status = 3
            if (user) {
               if (!user.suspend) { // user is not suspended
                  if (user.userid === req.session.userid) {
                     // if is me => true because i will load visibility: false post like 'you set the visibility: false'
                     posts = await Post.find({ userid: user.userid, postid: { $lt: pid } }).limit(plimit).sort({ createdAt: -1 })
                  }
                  else {
                     // if is me => false do not load posts that visibility: false OK>
                     posts = await Post.find({ userid: user.userid, postid: { $lt: pid }, visibility: true }).limit(plimit).sort({ createdAt: -1 })
                  }
                  if (posts.length > 0) {
                     // has post
                     isfirst = false // for 'you have no post, share now' and 'you have no more post. let\'s share more'
                     status = 1
                     try {
                        pid = posts[posts.length - 1].postid; // artirma olayini hallet

                        // console.log('624 pid =>', pid); /// 
                        (user.verified) ? isverified = 1 : isverified = 0;
                        (user.userid === req.session.userid) ? ismine = 1 : ismine = 0
                        // posts.forEach((post, index) => {

                        // })
                        for (let index = 0; index < posts.length; index++) {
                           post = posts[index];
                           username = user.username
                           postfilepath = postpath + post.postid + '.json'
                           await getJSON(postfilepath).then(postfile => {
                              // console.log((index + 1) + '. post\'s file. postid: ' + post.postid);
                              (post.visibility) ? visibility.push(1) : visibility.push(0)
                              if (postfile.likes.who.includes(userid)) lnd.push([1, 0])
                              else if (postfile.dislikes.who.includes(userid)) lnd.push([0, 1])
                              else lnd.push([0, 0])
                              counts.push([postfile.likes.c, postfile.dislikes.c, postfile.comments.c])
                              if ((index + 1) === posts.length) { // if last item
                                 res.json({
                                    // ilerde bunlari tek degiskende gonderebilirsin belki
                                    status,
                                    result: posts,
                                    isverified,
                                    username,
                                    lnd,
                                    counts,
                                    ismine,
                                    visibility
                                 })
                              }
                           })
                        }
                     } catch (error) {
                        console.log('649 catch =>', error);
                     }
                  }
                  else {
                     // has not post
                     // let message

                     res.json({
                        status,
                        result: null
                     })
                  }
                  // let message = 'user'
                  // res.json({
                  //    status,
                  //    result: null,
                  //    message
                  // })
               }
               else {
                  // if user is suspended !!
                  let status = 5;
                  res.json({
                     status,
                     result: null,
                  })
               }
            }
            else {
               // if user is not exist
               let message = 'No user'
               res.json({
                  status,
                  result: null,
                  message
               })
            }
         }
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
                           notifObj = { nid: notif.length + 1, userid: userid, postid, ncode: 1, ntime: new Date(), read: false }
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
                                 console.log('item =>', item);
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
               else if (ecode == 3) { // comment to post
                  message = req.body.message || ''
                  limit = 500
                  if (message.length > limit) {
                     message = message.substring(0, limit)
                  }
                  data.comments.c++
                  data.comments.who.unshift({ userid, message, createdAt: new Date(), updatedAt: new Date() })
                  scode = 1
                  console.log('message =>', message);
                  console.log('963 whoposted id =>', whoposted);
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
                  fs.writeFile(fullpathname, JSON.stringify(data), err => {
                     if (err) throw err
                     res.json({
                        status: scode,
                        username: req.session.username,
                        message,
                        date: t.formatDate(new Date(), 'fulldate'),
                        isverified: req.session.verified
                     })
                  })

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
               notlogged_userid = u.userid

               logged_fpn = userpath + userid + "/profile.json"
               notlogged_fpn = userpath + notlogged_userid + "/profile.json"
               notlogged_notif = userpath + notlogged_userid + "/notifications.json"
               if (fs.existsSync(logged_fpn)) {
                  if (fs.existsSync(notlogged_fpn)) {
                     getJSON(logged_fpn).then(loggeduser => {
                        getJSON(notlogged_fpn).then(notloggeduser => {

                           // console.log(loggeduser, notloggeduser);

                           const index1 = notloggeduser.followers.who.indexOf(userid);
                           const index2 = loggeduser.following.who.indexOf(notlogged_userid);
                           // console.log(index1, ' and ', index2);
                           status = 0
                           if (index1 == -1) {
                              // not followed
                              notloggeduser.followers.who.unshift(userid)
                              notloggeduser.followers.c++
                              loggeduser.following.who.unshift(notlogged_userid)
                              loggeduser.following.c++
                              status = 1

                              // send notif
                              getJSON(notlogged_notif)
                                 .then(notif => {
                                    notifObj = { nid: notif.length + 1, userid, ncode: 2, ntime: new Date(), read: false }
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

app.route('/:postid/:reportNumber/report')
   .get((req, res) => {
      res.end('NOT_ALLOWED_METHOD')
   })
   .post((req, res) => {
      if (req.session.userid) {
         userid = req.session.userid
         if (req.params.postid) {
            postid = req.params.postid
            reportnumber = req.params.reportnumber
            Report.findOne()
         }
         else {
            res.json({ status: 3, message: 'There is no post.' })
         }
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
// 21.01.2021 03:16 1212 https://prnt.sc/xbovy6
// 22.01.2021 05:00 1277
// 23.01.2021 05:24 1322
// 02.02.2021 02:32 1437
// 03.02.2021 04:45 1406