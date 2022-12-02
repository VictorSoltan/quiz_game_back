const { Socket } = require("socket.io");

const express = require("express"),
  cors = require("cors"),
  cookieSession = require("cookie-session"),
  session = require("express-session"),
  // dbConfig = require("./app/config/db.config"),
  mongoose = require('mongoose'),
  app = express(),
  http = require('http'),
  server = require("http").createServer(app),
  io = require('socket.io')(server, { cors : { origin: "*" }})

var corsOptions = {
  origin: "*"
};

mongoose.connect("", (err) => {
  if(!err) console.log('db connected')
  else console.log(err)
})
  
const Users = new mongoose.Schema({
  username: String,
  name: String,
  role: String,
  password: String
}),

userModal = new mongoose.model('userSchema', Users)


app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 3600000
  }
});

app.use(sessionMiddleware);

const PORT = process.env.PORT || 8080;

let rooms = []

let themes = [
  { name: 'Історія України', value: 0, questions: [
      { question: '1.Історія  Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Історія 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'IT', value: 0, questions: [
      { question: 'IT 1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'IT 2 1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Цікаві факти', value: 0, questions: [
      { question: '1Цікаві . Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Цікаві 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Географія', value: 0, questions: [
      { question: '1. ОГеографія твет будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: '1. Ответ будГеографія 2т 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Тварини', value: 0, questions: [
      { question: '1.Тварини  Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Тварини 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Комахи', value: 0, questions: [
      { question: 'Комахи 1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Комахи 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Кіно', value: 0, questions: [
      { question: 'Кіно 1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Кіно 2 1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Історія', value: 0, questions: [
      { question: '1.Історія  Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Історія 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Музика', value: 0, questions: [
      { question: '1Музика . Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Музика 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Мультфільми', value: 0, questions: [
      { question: '1. ОтвМультфільми ет будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: '1. Ответ будеМультфільми 2 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Літуратура', value: 0, questions: [
      { question: '1. ОтЛітуратура вет будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: '1. Ответ будеЛітуратура 2 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Алкоголь', value: 0, questions: [
      { question: '1. Алкоголь Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: '1. ОтвАлкоголь 2т будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Архітектура', value: 0, questions: [
      { question: '1. ОтвАрхітектура ет будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: '1. Ответ будеАрхітектура 2 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Реклама', value: 0, questions: [
      { question: '1.Реклама  Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Реклама 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Футбол', value: 0, questions: [
      { question: '1Футбол . Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Футбол 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Космос', value: 0, questions: [
      { question: '1Космос . Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Космос 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Серіали', value: 0, questions: [
      { question: '1.Серіали  Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Серіали 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Спорт', value: 0, questions: [
      { question: 'Спорт 1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: 'Спорт 2. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  }  
  ] },
  { name: 'Наука', value: 0, questions: [
      { question: 'Наука 1. Ответ будет 2', answers: 
        [
          {text: 'Ответ 1.1', correct: false}, 
          {text: 'Ответ 2.1', correct: true}, 
          {text: 'Ответ 3.1', correct: false}, 
          {text: 'Ответ 4.1', correct: false}
        ] 
      },  
      { question: 'Наука 2. Ответ будет 2', answers: 
        [
          {text: 'Ответ 1.1', correct: false}, 
          {text: 'Ответ 2.1', correct: true}, 
          {text: 'Ответ 3.1', correct: false}, 
          {text: 'Ответ 4.1', correct: false}
        ] 
      }] 
  }
]

const que = { questions: [
  { question: '1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}, 
      {text: 'Ответ 3.1', correct: false}, 
      {text: 'Ответ 4.1', correct: false}
    ] 
  },
  { question: '2. Ответ будет 1', answers: 
    [
      {text: 'Ответ 1.2', correct: true}, 
      {text: 'Ответ 2.2', correct: false}, 
      {text: 'Ответ 3.2', correct: false}, 
      {text: 'Ответ 4.2', correct: false}
    ] 
  },
  { question: '3. Ответ будет 1', answers: 
    [
      {text: 'Ответ 1.3', correct: true}, 
      {text: 'Ответ 2.3', correct: false}, 
      {text: 'Ответ 3.3', correct: false}, 
      {text: 'Ответ 4.3', correct: false}
    ] 
  },
  { question: '4. Ответ будет 3', answers: 
    [
      {text: 'Ответ 1.4', correct: false}, 
      {text: 'Ответ 2.4', correct: false}, 
      {text: 'Ответ 3.4', correct: true}, 
      {text: 'Ответ 4.4', correct: false}
    ] 
  }
],

sorting_questions_first: [
  { question: '1. Ответ будет 2', answers: 
    [
      {text: 'Ответ 1.1', correct: false}, 
      {text: 'Ответ 2.1', correct: true}
    ] 
  },
  { question: '2. Ответ будет 1', answers: 
    [
      {text: 'Ответ 1.2', correct: true}, 
      {text: 'Ответ 2.2', correct: false}
    ] 
  },
],

sorting_questions: [
    { question: 'Кино 1. Ответ будет 2', answers: 
      [
        {text: 'Ответ 1.1', correct: false}, 
        {text: 'Ответ 2.1', correct: true}, 
        {text: 'Ответ 3.1', correct: false}, 
        {text: 'Ответ 4.1', correct: false}
      ] 
    },
    { question: 'Кино 2. Ответ будет 1', answers: 
      [
        {text: 'Ответ 1.2', correct: true}, 
        {text: 'Ответ 2.2', correct: false}, 
        {text: 'Ответ 3.2', correct: false}, 
        {text: 'Ответ 4.2', correct: false}
      ] 
    },
    { question: 'Сериал 1. Ответ будет 1', answers: 
      [
        {text: 'Ответ 1.1', correct: true}, 
        {text: 'Ответ 2.1', correct: false}, 
        {text: 'Ответ 3.1', correct: false}, 
        {text: 'Ответ 4.1', correct: false}
      ] 
    },
    { question: 'Сериал 2. Ответ будет 3', answers: 
      [
        {text: 'Ответ 1.2', correct: false}, 
        {text: 'Ответ 2.2', correct: false}, 
        {text: 'Ответ 3.2', correct: true}, 
        {text: 'Ответ 4.2', correct: false}
      ] 
    }    
]}

const connections_last = [
  'Аватар(фильм)',
  'Властелин Колец',
  'Гарри Поттер(фильм)',
  'Матрица',
  'Гаттака',
  'Симпсоны',
  'Пираты Карибсого моря'
],

connections_first = [
  'Гарри Поттер', 
  'Нэо', 
  'Аватар', 
  'Фродо', 
  'Джек Воробей', 
  'Гомер', 
  'Винсент'
],

connections_answers = [
  {hero: 'Аватар', movie: 'Аватар(фильм)'},
  {hero: 'Фродо', movie: 'Властелин Колец'},
  {hero: 'Гарри Поттер', movie: 'Гарри Поттер(фильм)'},
  {hero: 'Нэо', movie: 'Матрица'},
  {hero: 'Винсент', movie: 'Гаттака'},
  {hero: 'Гомер', movie: 'Симпсоны'},
  {hero: 'Джек Воробей', movie: 'Пираты Карибсого моря'}
],

final_rounds = [
  {question: 'В якому віці померла королева Англії, Єлизавета 2 ?', min: 1, max: 200, correct: 96},
  {question: '2 Ответ на вопрос 100', min: 1, max: 200, correct: 100},
  {question: '3. Ответ на вопрос 50', min: 1, max: 100, correct: 96},
  {question: '4 Ответ на вопрос 500', min: 1, max: 1000, correct: 500},
  {question: '5 Ответ на вопрос 25', min: 1, max: 50, correct: 25},
]


server.listen(PORT, () => {
  console.log('listening on *:3000');
});

let time;

// const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// io.use(wrap(sessionMiddleware));

function makeid(length) {
  var result           = '';
  var characters       = '0123456789abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


io.on('connection', async (socket) => {


  socket.on('registrations', async function(event, callbackFn){
    
    const user = await userModal.findOne({username: event.username})

    if(user) callbackFn('User with this username exist')
    else{
      if(6 < event.password.length < 18){
        const newUser = userModal({
          username: event.username,
          password: event.password,
          role: 'regular',
        })
        await newUser.save()
        console.log('user saved')
      }
    }
  })

  await socket.on('login', async function(event, callbackFn){

    if(event.cookie) event = event.cookie

    const user = await userModal.findOne({username: event.username})
    if(user) {
      if(user.password === event.password){
        const username = event.username
        callbackFn('Welcome')
            let activeLink,
            newThemes = themes,
            shuffled = [],
            round = 0,
            tour = 0,
            final_round = 0
          socket.on('create_room', function(event, callbackFn){
            shuffled = [...newThemes].sort(() => 0.5 - Math.random())
            activeLink = makeid(8);
            let creator;
            rooms.forEach(function (el, i)  {
              if(el.player === socket.id) creator = el.username
            })
            let room = {
              link: activeLink, creator: creator, creator_id: socket.id, 
              amount: event.amount, theme: [], room: [], answers: [], shuffled: shuffled, max: 0,
              question: {}, final_round_ansers: [[], [], [], [], [], []]
            }
            rooms.push(room)
            callbackFn(room)
          })



          
          socket.on('start_game', function(event, callbackFn){

            activeLink = event.link
            console.log('start_game ', activeLink)
            rooms.forEach(function (el, i)  {
              if(event.link === el.link) {
                el.room.map((item) => {
                  socket.to(item.player).emit('game_started');
                  callbackFn('start_game')
                })
              }
            })
          })

          socket.on('request_players', function(event, callbackFn){
            console.log('request_players ', event.link)
            rooms.forEach(function (el)  {
              if(event.link === el.link) {
                callbackFn({room: el.room, amount: el.amount})
              }
            })
          })

          
            socket.on('join_game', function(event){
              activeLink = event.link;
              rooms.forEach(function (el, i)  {
                  if(event.link === el.link) {
                    const player = el.room.find(o => o.username === username );
                    if(player) console.log('player exist') 
                    else{ 
                      el.room.push({player: socket.id, username: username, points: 0})
                      console.log(`waiting_players_${activeLink}`)
                      io.emit(`waiting_players_${activeLink}`, {room: el.room})
                    }
                  }
              });
            })
              socket.on('disconnect', () => {
                console.log('🔥: A user disconnected');
                console.log('leave_game ', activeLink, username)
                rooms.forEach(function (el, i)  {
                    if(activeLink === el.link&&el.creator_id !== socket.id) {
                      el.room = el.room.filter(function (el) {
                        return el.username !== username;
                      });
                      console.log(`waiting_players_${activeLink}`)
                      io.emit(`waiting_players_${activeLink}`, {room: el.room})
                    }
                });       
                
                // rooms.forEach(function (el, i)  {
                //   console.log('destroy room ', activeLink, el.link, el.creator_id, socket.id)
                //   if(activeLink === el.link&&el.creator_id === socket.id) {
                //     console.log('destroy room')
                //     rooms.splice(i, 1)
                //   }
                // })
              });

              const time = 15000
              socket.on('receive_themes', function(callbackFn){
                rooms.forEach(function (el, i)  {
                  if(activeLink === el.link) {
                    el.max = 0
                    callbackFn({themes: el.shuffled.slice(0, 4), time: 10000})
                  }
                })
                let arr = []
                setTimeout(() => {
                  rooms.forEach(function (el, i)  {
                    if(activeLink === el.link&&socket.id === el.creator_id) {
                      console.log('el.shuffled ', el.shuffled, socket.id, el.creator_id)
                      el.shuffled.forEach((item, i) => {
                        arr.push(item.value)
                        item.value = 0
                      })
                      el.max = arr.indexOf(Math.max(...arr))
                      console.log('el.max ', el.max)
                      if(el.shuffled[el.max].questions){
                        el.question = el.shuffled[el.max]?.questions[Math.floor(Math.random() * el.shuffled[el.max].questions.length)]
                      }
                      io.emit(`theme_chosen_${activeLink}`, {max: el.max})
                      newThemes = newThemes.filter(el => el !== el.shuffled?.[el.max]);
                      el.shuffled = [...newThemes].sort(() => 0.5 - Math.random());
                    }
                  })
                }, 15000)
              })

              socket.on('choose_theme', function(event, callbackFn){
                let allowChoose = true
                rooms.map(function (el, i)  {
                  if(activeLink === el.link) {
                    if(el.theme.find(o => o.username === username&&o.tour === tour&&o.round === round)){
                      allowChoose = false
                    }
                  }
                  if(allowChoose||el.theme.length===0){
                    el.theme.push({username: username, tour: tour, round: round})
                    el.shuffled[event.index].value = el.shuffled[event.index].value + 1 
                    callbackFn('theme chosen')
                    allowChoose = false
                  }else console.log(`${username} already choosed theme`)
                })
              })
              
              socket.on('get_questions', function(callbackFn){
                console.log('time ', time)
                rooms.map(function (el, i)  {
                  if(activeLink === el.link) callbackFn({questions: el.question, time: time})
                })
                
                setTimeout(() => {
                  round = round + 1
                  if(round === 3) {
                    tour = tour + 1
                    socket.emit('end_of_round', {tour: tour})
                    round = 0
                  }else socket.emit('end_sorting_questions')

                }, 15000)
              })  

              let theme = 0
              
              function setPoint(arr){

                let allowAnswer = true
                rooms.map(function (el, i)  {
                  if(activeLink === el.link) {
                    console.log('el.answers ', el.answers)
                    console.log('el.answers1 ', username, tour, round)
                    if(el.answers.find(o => o.username === username&&o.tour === tour&&o.round === round)){
                      allowAnswer = false
                    }
                  }
                  if(allowAnswer||el.answers.length===0){
                    console.log('setPoint ', activeLink)
                    if(el.link === activeLink) {
                      el.room.map((o, i) => {
                        if (o.player === socket.id){
                          o.points = o.points + 1 
                          console.log('setPoint socket.id ', socket.id, o.points)
                          io.to(o.player).emit('set_point', o.points)
                        } 
                      })
                    }
                    allowAnswer = false
                  }else console.log(`${username} already answered`)                  
                })
              }
              
              socket.on(`give_answer_quiz`, function(event, callbackFn){
                rooms.map(el => {
                  if(activeLink === el.link){
                    if(el.question.answers[event.index].correct){
                      console.log('give answer', socket.id)
                      setPoint(rooms)
                    }
                    let allowAnswer = true

                    if(el.answers.find(o => o.username === username&&o.tour === tour&&o.round === round)){
                      allowAnswer = false
                    }
                    if(allowAnswer||el.answers.length===0){
                      el.answers.push({username: username, tour: tour, round: round})  
                      callbackFn(el.question.answers[event.index].correct)
                    }
                  }
                })              
              })

              socket.on(`give answer`, function(event, callbackFn){
                  if(que[event.questions][event.numb].answers[event.index].correct){
                    console.log('give answer', socket.id)
                    setPoint(rooms)
                  }
                  callbackFn(que[event.questions][event.numb].answers[event.index].correct)
              })
          
              socket.on('get_questions_sorting', function(callbackFn){
                console.log('time ', time)                
                callbackFn({questions: que['sorting_questions_first'], time: time})

                setTimeout(() => {
                  socket.emit('end_sorting_sorting')
                }, 15000)    
              })
          
              socket.on('choose_theme_sorting', function(callbackFn){
                console.log('time ', time)                
                callbackFn({questions: que['sorting_questions'], time: time})
          
                setTimeout(() => {
                  socket.emit('end_sorting_theme_sorting')
                }, 15000)    
          
              })
          
              socket.on('get_connections', function(callbackFn){
                console.log('time ', time)                
                callbackFn({connections_first: connections_first, connections_last: connections_last, time: time})
              
                setTimeout(() => {
                  socket.emit('end_sorting_connections')
                }, 15000) 
          
              })
          
              socket.on('connect_values', function(event, callbackFn){
                connections_answers.forEach(function (el, i){
                  if(el.hero === event.value){
                    callbackFn(connections_answers[i].movie === event.value1)
                    if(connections_answers[i].movie === event.value1){
                      setPoint(rooms)      
                    }
                  }
                }) 
              })
              
              function sortByKey(array, key) {
                return array.sort(function(a, b) {
                    let x = a[key]; let y = b[key];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
              }

              function sortByKeyClosestValue(array, key, value) {
                return array.sort(function(a, b) {
                    let x = a[key]; let y = b[key];
                    return Math.abs(1 - value) - Math.abs(1 - value);
                });
              }

              socket.on('request_results', function(event, callbackFn){
                rooms.forEach( el => {
                  if(activeLink === el.link){
                    console.log('el.final_round_ansers ', el.final_round_ansers)
                    el.final_round_ansers[final_round] = sortByKeyClosestValue(el.final_round_ansers[final_round], ['answer'], final_rounds[final_round])
                    console.log('el.final_round_ansers ', el.final_round_ansers)
                    el.final_round_ansers[final_round].forEach((o, i) => {
                      el.room.forEach(roomate => {
                        if(roomate.player === o.player){
                          roomate.points = roomate.points + el.room.length - i 
                        }
                      })
                    })
                    
                    callbackFn(el.room)
                  }
                })
              })

              socket.on('final_round_question', function(callbackFn){
                rooms.forEach( el => {
                  if(activeLink === el.link){
                    console.log('el.room ', el.room)
                    el.room = sortByKey(el.room, ['points'])
                    console.log('el.room ', el.room)
                  }
                  el.room.forEach((el, i) => {
                    el.points = i+1
                  })
                  console.log('el.room ', el.room)
                })

                console.log('time ', time)
                callbackFn({question: final_rounds[final_round], time: time, final_round: final_round})
                final_round = final_round + 1
                setTimeout(() => {
                  socket.emit('final_round_results')
                }, 15000) 
              })
          
          
              socket.on('send_answer', function(event){
                console.log('rooms.forEach')
                rooms.forEach((o, i) => {
                  if(o.link === activeLink) {
                    o.final_round_ansers[final_round].push({player: socket.id, answer: event.answer})
                  }
                })
              })
      }else callbackFn('Wrong password')
    }else callbackFn('User does not exit')
  })
})


