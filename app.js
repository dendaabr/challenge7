const express = require('express');
const { readFileSync, writeFileSync } = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const { get } = require('lodash');
const User = require('./models/user');
const GameHistory = require('./models/game-history');
const app = express();
const passport = require("./middlewares/passport-jwt");
const jwt = require("jsonwebtoken");

// middlewares
app.use(express.json()) // for parsing application/json
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.static('static')) // serve static files

app.set('view engine', 'ejs')

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  name: `challenge7`,
  secret: 'secret1234',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // This will only work if you have https enabled!
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}))
app.use(passport.initialize());

const sessionChecker = (req, res, next) => {
  console.log(`Session Checker: ${req.session.id}`.green);
  console.log(req.session);
  if (req.session.profile) {
    console.log(`Found User Session`.green);
    next();
  } else {
    console.log(`No User Session Found`.red);
    res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  res.render('index', {
    username: get(req, 'session.profile.username')
  })
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  User.findOne({ username, password }, (err, result) => {
    if (result) {
      const token = jwt.sign({username}, "DENDA");
      req.session.profile = {
        username,
        user_id: result.user_id,
        token: token,
      };

      if (result.role === 'admin') {
        res.redirect('/admin');
      } else {
        res.redirect('/');
      }
    } else {
      res.render('login', {
        errMsg: 'Invalid username or password',
      });
    }
  });
});



app.get('/rock-paper-scissor', sessionChecker, (req, res) => {
  res.render('rock-paper-scissor', {
    username: get(req, 'session.profile.username'),
    user_id: get(req, 'session.profile.user_id'),
    token: get(req, 'session.profile.token'),
  })
});

app.put('/users-history', passport.authenticate("jwt", {
  session: false,
}), (req, res) => {
  const { user_id, score } = req.body
  GameHistory({
    user_id: user_id,
    score
  }).save((err) => {
    res.json({
      success: true
    })
  });
})

app.get('/users-history',  passport.authenticate("jwt", {
  session: false,
}), (req, res) => {
  GameHistory.find({user_id: req.user.user_id}, (err, result) => {
    res.json({ data: result })
  })
})


app.get('/admin', sessionChecker, (req, res) => {
   User.find({}, (err, result) => {
    res.render('admin', { data: result, token: get(req, 'session.profile.token'), })
  })
})


app.delete('/users/:id', passport.authenticate("jwt", {
  session: false,
}), (req, res) => {

  if (req.user.role === 'admin' ) {
   
    const { id } = req.params;

    User.deleteOne({ user_id: id }, (err) => {
      console.log('err', err)
      if (!err) {
          res.json({
          success: true
        })
      } else {
        res.json({
          success: false,
        })
      }
    })
  } else {
    res.status(401).json({
      success: false,
    });
  }
})

app.get('/leaderboard', (req, res) => {
  GameHistory.aggregate([
    {
      '$group': {
        '_id': '$user_id',
        'total_score': {
          '$sum': '$score'
        }
      }
    }, {
      '$lookup': {
        'from': 'users-game',
        'localField': '_id',
        'foreignField': 'user_id',
        'as': 'user'
      }
    }, {
      '$set': {
        'username': {
          '$arrayElemAt': [
            '$user.username', 0
          ]
        }
      }
    }, {
      '$project': {
        'user': 0
      }
    }, {
      '$sort': {
        'total_score': -1
      }
    }
  ], (err, result) => {
    res.json({ data: result })
  })
})

app.get('/signup', (req, res) => {
  res.render('signup')
});

app.post('/register', (req, res) => {

  const { username, password } = req.body;

  // check if username already taken
  User.findOne({ username }, async (err, exist) => {
    if (!exist) {
      // save new user to db
        new User({
          user_id: Math.random().toString(36).substr(2, 9),
          username,
          password,
          role: 'player'
        }).save((result) => {
          console.log(result)
        });

      res.render('signup-success');
    } else {
      res.render('signup',
        {
          errMsg: 'Username already taken, create another one'
        });
    }
  });
});

app.get('/logout', sessionChecker, (req, res) => {
  req.session.destroy(function (err) {
    console.log('Destroyed session')
  })
  res.redirect('/');
});



app.listen(3000);
