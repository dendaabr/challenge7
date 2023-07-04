const express = require('express');
const session = require('express-session');
const { readFileSync, writeFileSync } = require('fs');
const bodyParser = require('body-parser');
const { get } = require('lodash');
const User = require('./models/user');
const GameHistory = require('./models/game-history');
const app = express();
const mongoose = require('mongoose');

// middlewares
app.use(express.json()) // for parsing application/json
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.static('static')) // serve static files

app.set('view engine', 'ejs')

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  name: `challenge5`,
  secret: 'secret1234',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // This will only work if you have https enabled!
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

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
  console.log('profile', get(req, 'session.profile'));
  res.render('index', {
    username: get(req, 'session.profile.username')
  })
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.get('/signup', (req, res) => {
  res.render('signup')
});

app.get('/rock-paper-scissor', sessionChecker, (req, res) => {
  res.render('rock-paper-scissor', {
    username: get(req, 'session.profile.username'),
    user_id: get(req, 'session.profile.user_id'),
  })
});

app.put('/users-history', (req, res) => {
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

app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  User.findOne({ username, password }, (err, result) => {
    if (result) {
      req.session.profile = {
        username,
        user_id: result.user_id,
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

app.post('/register', (req, res) => {

  const { username, password } = req.body;

  // check if username already taken
  User.findOne({ username }, async (err, exist) => {
    if (!exist) {
      // save new user to db

      setTimeout(() => {
        new User({
          user_id: Math.random().toString(36).substr(2, 9),
          username,
          password,
          role: 'player'
        }).save((result) => {
          console.log(result)
        });
      }, 1000);

      res.render('signup-success');
    } else {
      res.render('signup',
        {
          errMsg: 'Username already taken, create another one'
        });
    }
  });
});

app.get('/admin', (req, res) => {
   User.find({}, (err, result) => {
    res.render('admin', { data: result })
  })
})


app.delete('/users/:id', (req, res) => {
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

app.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    console.log('Destroyed session')
  })
  res.redirect('/');
});



app.listen(3000);
