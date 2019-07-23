var express = require('express');
var router = express.Router();
var db = require('./db');

// ~/users
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 회원가입 처리 ------------------------------------------
// ~/users/join (get 방식)으로 들어온 요청 처리
router.get('/join', (req, res, next)=>{
  res.render('join')
})

// ~/users/join (post 방식)으로 들어온 요청 처리
router.post('/join', (req, res, next)=> {
  // 닉네임 중복 확인
  let nickName = req.body.nickName
  db.checkExistNickname({nickName:nickName}, (err, rows)=>{
    if(err) {
      res.render('error')
    } else {
        if(rows.length==0) {  // 없는 닉네임 → 회원가입 진행
          console.log('회원가입 가능')
          console.log(rows)
          let userName = req.body.userName
          let nickName = req.body.nickName
          let upw = req.body.upw
          db.registerUser({userName:userName, nickName:nickName, upw:upw}, (err,rows)=>{
            if(err) {
              res.render('error')
            } else {
              console.log(rows)
              res.redirect('login')
            }
          })
        } else {  // 있는 닉네임
          console.log('회원가입 불가능')
          console.log(rows)
        }
    }
  })
})

// 로그인 처리 ------------------------------------------
// ~/users/login (get 방식)으로 들어온 요청 처리
router.get('/login', (req, res, next)=>{
  res.render('login')
})

// ~/users/login (post 방식)으로 들어온 요청 처리
router.post('/login', (req, res, next)=> {
  let nickName = req.body.nickName
  let upw = req.body.upw
  console.log(nickName, upw)
  db.checkLoginInfo({nickName:nickName, upw:upw}, (err, rows)=>{
      if(err) {
        res.render('error')
      }
      else {
        if(rows.length==0) {
          // console.log('로그인 실패')
          res.render('loginFail')
        } else { 
          // 회원이다
           console.log('로그인 성공')
          // 세션 생성
          req.session.nickName = nickName

          console.log(req.session.nickName)
          res.redirect('/board')
        }
      }
  })
})

  // 로그아웃 처리 -----------------------------------
  router.get('/logout', (req, res, next)=>{
  
    // 세션 제거
    req.session.nickName = null  
    // 홈페이지로 이동
    res.redirect('/users/login')
})


// ~/users/check
router.get('/check', (req, res, next)=>{
  let nickName = req.query.nickName
  // console.log(checkNickName)
  db.checkExistNickname({nickName : nickName}, (err, rows)=>{
      console.log(rows)
      res.json(rows)
  })
})

module.exports = router;
