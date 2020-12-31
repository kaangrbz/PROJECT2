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
require('dotenv').config() //process.env.
const { format, render, cancel, register } = require('timeago.js');
const {
  User,
  Post,
} = require('./models/blogs')
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

app.route('/')
  .get((req, res) => {

    if (req.session.username) {
      username = req.session.username
      Post.find().limit(6).sort({
        createdAt: -1
      })
        .then(result => {
          if (result.length > 0) {
            date = []
            isme = []
            likencomm = []
            try {
              for (let i = 0; i < result.length; i++) {
                mdate = result[i].updatedAt
                date.push(t.formatDate(mdate, 'timeago'))
                if (result[i].username == req.session.username)
                  isme.push(true)
                else
                  isme.push(false)
                fullpathname = 'src/posts/' + 'post_' + result[i].postid + '.json'
                // fullpathname = 'src/posts/' + 'post_' + result[0].postid + '.json'
                fs.readFile(fullpathname, (err, data) => {
                  if (err) {
                    res.end('read file error\n' + err)
                  }
                  else {
                    data = JSON.parse(data)
                    like = data.likes.count
                    comment = data.comment.count
                    likencomm.push([like, comment])
                    if (i == result.length - 1) {
                      res.render('index', { data: result, username, date, likencomm, isme })
                    }
                  }
                })
              }
            } catch (err) {
              if (err) res.render('index', { data: null, username })
            }
          }
          else {
            res.render('index', {
              data: null,
              username
            })
          }
        })
        .catch(err => {
          if (err) throw err
        })
    }
    else {
      res.redirect('/login')
    }
  })

app.route('/login')
  .get((req, res) => {
    if (req.session.username) {
      res.end('logged in')
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
          req.session.userid = result._id;
          req.session.authority = result.authority;
          req.session.username = result.username;
          req.session.email = result.email;
          req.session.fullname = result.fullname;
          res.redirect('/' + username)
        }
      })
    }
  })

app.route('/signup')
  .get((req, res) => {
    res.render('signup')
  })

  .post((req, res) => {
    authority = 1;
    username = req.body.username || null;
    userpass = md5(req.body.userpass) || null;
    fullname = req.body.fullname.trim() || null;
    email = req.body.email.trim() || null;

    var patt = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    var t_email = patt.test(email)
    console.log(t_email);
    if (!t_email) res.render('signup', { message: 'email', status: 'danger', username, fullname, email })
    else if (!fullname) res.render('signup', { message: 'fullname', status: 'danger', username, fullname, email })
    else if (!username) res.render('signup', { message: 'username', status: 'danger', username, fullname, email })
    else if (!userpass) res.render('signup', { message: 'userpass', status: 'danger', username, fullname, email })
    else {
      const user = new User({
        authority: authority,
        email: email,
        fullname: fullname,
        username,
        userpass: userpass,
        biography: '',
        visibility: true,
        suspend: false,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
        .save()
        .then(result => {
          if (!result) {
            res.render('signup', {
              message: 'user could not added, try again',
              status: 'danger'
            })
          }
          else {
            pathname = 'src/users/' + username + '/'
            var postFolder = fs.existsSync(pathname)
            if (!postFolder) {
              fs.mkdir(pathname, (err) => {
                if (err) throw err
              })
            }
            files = ['profile', 'likes', 'saved']
            userObjs = [
              {
                email: email,
                fullname: fullname,
                username,
                followers: {
                  count: 0,
                  followers: []
                },
                following: {
                  count: 0,
                  following: []
                },
                roles: [],
                createdAt: new Date(),
                updatedAt: new Date()
              },
              [],
              []
            ]
            files.forEach((file, index) => {
              fullpathname = pathname + file + ".json"
              console.log(file);
              fs.writeFile(fullpathname, JSON.stringify(userObjs[index]), (err) => {
                if (err) throw err;
                console.log('saved');
              })
            });
            res.redirect('/')
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
    }
  })

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
app.route('/:username')
  .get((req, res) => {
    if (req.session.username) {
      username = req.params.username
      User.findOne({
        username
      })
        .then(result => {
          if (result) {
            fullpathname = 'src/users/' + req.params.username + '/profile.json'
            isfileexist = fs.existsSync(fullpathname);
            isme = false
            if (req.params.username === req.session.username && req.params.username !== 'favicon.ico')
              isme = true

            if (isfileexist) {
              fs.readFile(fullpathname, (err, data) => {
                if (err) throw err;
                res.render('profile', { data: JSON.parse(data), username, isme })
              })
            }
            else {
              res.render('profile', { data: null, username, isme })
            }
          }
          else {
            res.end('no user')
          }
        })
        .catch(err => {
          if (err) throw err
        })
    }
    else {
      res.redirect('/login')
    }
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
      username
      media = null
      article = req.body.article.trim() || null
      tags = req.body.tags.trim() || null
      if (!article) {
        res.render('index', { message: 'Write something' })
      }
      else {
        Post.find()
          .then(c => {
            c = c.length + 100000

            // save to json
            pathname = 'src/posts/'
            fullpathname = pathname + 'post_' + c + ".json"

            if (!fs.existsSync(pathname)) {
              fs.mkdir(pathname, (err) => {
                if (err) res.send('create folder error')
              })
            }
            postObj = {
              postid: c,
              likes: {
                count: 0,
                wholiked: []
              },
              comment: {
                count: 0,
                comments: []
              }
            }
            fs.writeFile(fullpathname, JSON.stringify(postObj), (err) => {
              if (err) throw err;
            })

            // save to db
            const post = new Post({
              postid: c,
              username: req.session.username,
              fullname: req.session.fullname,
              media: [],
              article: article,
              visibility: true,
              createdAt: new Date(),
              updatedAt: new Date()
            })
              .save()
              .then(result => {
                if (result) {
                  res.render('index', { message: 'successfuly added' })
                }
                else {
                  res.render('index', { message: 'there is a problem' })
                }
              })
              .catch(err => {
                if (err) throw err
              })
          })
      }
      // // upload photo with compress and crop
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
      res.render('login', { data: null, message: 'You should log in for this', status: 'danger' })
    }
  })

app.route('/like/:postid')
  .get((req, res) => {
    res.end('/like wrong method')
  })
  .post((req, res) => {
    if (!req.session.username) {
      res.json({
        status: 0
      })
    }
    else {
      pathname = 'src/posts/'
      fullpathname = pathname + 'post_' + req.params.postid + ".json"
      var postFolder = fs.existsSync(pathname)
      if (!postFolder) {
        // posts folder is not exist and will create
        fs.mkdir(pathname, (err) => {
          if (err) res.send('create folder error')
        })
      }

      // posts folder is exist
      if (fs.existsSync(fullpathname)) {
        fs.readFile(fullpathname, (err, data) => {
          if (err) throw err;
          mdata = JSON.parse(data)
          likes = mdata.likes.count
          try {
            wholiked = mdata.likes.wholiked
            if (wholiked.length > 0) {
              const index = wholiked.indexOf(req.session.username);
              console.log(req.session.username);
              console.log(index);
              if (index > -1) {
                // already liked
                mdata.likes.count = mdata.likes.count - 1
                mdata.likes.wholiked.splice(index, 1);
                fs.writeFile(fullpathname, JSON.stringify(mdata), err => {
                  if (err) throw err;
                  res.json({
                    status: 2,
                    postid: req.params.postid
                  })
                })
              }
              else {
                // not liked
                mdata.likes.count = mdata.likes.count + 1
                mdata.likes.wholiked.push(req.session.username)
                fs.writeFile(fullpathname, JSON.stringify(mdata), err => {
                  if (err) throw err;
                  res.json({
                    status: 1,
                    postid: req.params.postid
                  })
                })
              }

            }
            else {
              // first like
              mdata.likes.count = mdata.likes.count + 1
              mdata.likes.wholiked.push(req.session.username)
              fs.writeFile(fullpathname, JSON.stringify(mdata), err => {
                if (err) throw err;
                res.json({
                  status: 1,
                  postid: req.params.postid
                })
              })
            }

          } catch (likeerror) {
            if (likeerror) throw likeerror
            console.log('likeerror');
          }
        })
      }
      else {
        res.render('posts', {
          data: [],
          date: null,
          isLogged: t.checkAuthority(req.session.authority)
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
//             isLogged: t.checkAuthority(req.session.authority)
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

app.route('/edit/:username')
  .get((req, res) => {
    if (req.session.username && (req.session.username === req.params.username)) {
      username = req.session.username
      email = req.session.email
      fullname = req.session.fullname
      User.findOne({ username })
        .select('biography -_id')
        .then(result => {
          if (result) {
            biography = result.biography
            console.log(biography);
            fullpathname = 'src/users/' + req.params.username + '/profile.json'
            isfileexist = fs.existsSync(fullpathname);
            isme = true
            if (isfileexist) {
              fs.readFile(fullpathname, (err, data) => {
                if (err) throw err;
                res.render('editprofile', { data: JSON.parse(data), isme, username, email, fullname, biography })
              })
            }
            else {
              res.render('editprofile', { data: null, isme, username, email, fullname, biography })
            }
          }
        })
        .catch(err => {
          if (err) res.send('bio error')
        })

    }
    else {
      res.redirect('/')
    }
  })
  .post((req, res) => {
    if (req.session.username && (req.session.username === req.params.username)) {
      username = req.params.username
      m_username = req.body.username
      email = req.body.email.trim() || null
      fullname = req.body.fullname.trim() || null
      biography = req.body.biography.trim() || ''

      try {
        var patt = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        var email = patt.exec(email)[0];
        console.log(email);
      } catch (error) {
        console.log(error);
        res.render('editprofile', { message: 'not valid email', status: 'danger', username })
      }
      if (!fullname) res.render('editprofile', { message: 'fullname', status: 'danger', username, fullname, email })
      else if (!username) res.render('editprofile', { message: 'username', status: 'danger', username, fullname, email })
      else if (biography.length > 1000) res.render('editprofile', { message: 'limit is 1000', status: 'danger', username, fullname, email })
      else {
        filter = {
          username
        }

        if (username !== m_username) {
          // update db & json
          fullpathname = 'src/users/' + req.params.username + '/profile.json'
          // fullpathname = 'src/posts/' + 'post_' + result[0].postid + '.json'
          fs.readFile(fullpathname, (err, data) => {
            if (err) {
              res.end('read file error\n' + err)
            }
            else {
              data = JSON.parse(data)
              console.log(data);
              data.username = m_username
              data.updatedAt = new Date()
              fs.writeFile(fullpathname, JSON.stringify(data), (err) => {
                if (err) throw err;

                // rename user's own folder
                oldpath = 'src/users/' + req.params.username
                newpath = 'src/users/' + m_username
                fs.rename(oldpath, newpath, err => {
                  if (err) throw err
                  console.log('renamed');
                })
              })
            }
          })
          update = { username: m_username, email, fullname, biography, updatedAt: new Date(), }
          User.findOneAndUpdate(filter, update)
            .then(result => {
              if (result) {
                req.session.userid = result._id;
                req.session.username = m_username;
                console.log('\n\n\t'+m_username+'\n\n');
                req.session.email = result.email;
                req.session.fullname = result.fullname;
                res.redirect('/' + m_username + '?status=ok')
              }
              else {
                res.render('editprofile', { message: 'There is a problem with update', status: 'danger', username })
              }
            })
            .catch(err => {
              if (err) throw err
            })
        } else {
          //update db
          update = { email, fullname, biography, updatedAt: new Date(), }
          User.findOneAndUpdate(filter, update)
            .then(result => {
              if (result) {
                req.session.username = result.username;
                req.session.email = result.email;
                req.session.fullname = result.fullname;
                res.redirect('/' + username + '?status=ok')
              }
              else {
                res.render('editprofile', { message: 'There is a problem with update', status: 'danger', username })
              }
            })
            .catch(err => {
              if (err) throw err
            })
        }
      }
    }
    else {
      res.redirect('/')
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