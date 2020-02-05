// 써드 파트 패키지 모듈 가져오기
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var bodyParser = require('body-parser')

// 세션 추가
const session = require('express-session')

// 특정 요청에 대한 응답을 누가 할 것인지
// 어떤 url로 할 것인지 정의하고 가져온다
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// 웹 서비스의 핵심 객체(앱) → express 객체
var app = express();

app.set('trust proxy', 1)
app.use(session({
  secret : 'sandysecret',
  resave : false,
  saveUninitialized : true
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// 렌더링 템플릿 엔진으로 ejs 사용
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 정적 데이터 위치 설정
app.use(express.static(path.join(__dirname, 'public')));

// 세션이 없어도 진입할 수 있는 사이트
app.use('/users', usersRouter);

app.use((req, res, next)=>{
  
  console.log('세션 체크 지점')
  
  if(req.session.nickName == null || typeof(req.session.nickName) === 'undefined') {
    console.log("세션 없음 : "+ req.session.nickName)
    res.redirect('/users/login')
  } else { // 세션이 존재
    console.log("세션 있음 : "+ req.session.nickName)
    next()
  }
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 대표 모듈
// 외부에서는 app을 통해서만 접근 가능
module.exports = app;
