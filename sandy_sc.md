### <routes/db/pool.js>
``` javascript
// routes/db/pool.js
// Pool 생성

// 1. 모듈 가져오기 (이 코드는 서버가 가동되면 1회만 수행) -> 설치
const genericPool = require('generic-pool')
const mysql = require('mysql')

// 2. 풀링 생성
const factory = {
    create : () => {
        var connection = mysql.createConnection({
            host : 'localhost',
            user : 'root',
            password : '12341234',
            database : 'sandydb'
        })
        // DB와 연결
        connection.connect()
        // 연결객체 리턴
        return connection
    },
    destroy : ( db_session ) => {
        // db_session : 연결 커넥션
        db_session.end() // 연결 종료
    }
}

const opts = {
    // 서버가 가동되면 최소 50개의 커넥션을 준비
    // 요청이 증가하면 계속 커넥션을 증가시킨다 -> 최대 100까지
    max : 100,
    min : 50
}

const myPool = genericPool.createPool(factory, opts)

// 3. 풀링 해제
// 노드 서버가 종료되기 직전의 이벤트를 잡아서
// 풀링이 가지고 있는 DB 연결 세션을 다 반납한다(끊어준다)
process.on('beforeExit', ()=>{
    myPool.drain().then(()=>{
        // 풀링 해제 수행
        myPool.clear()
    })
})

// 예외 상황이 발생되면 try~catch, 이벤트로 캐치
process.on('uncaughtException', (err)=>{
    // 로그 처리를 하던, 관리자에게 통보
    console.log(new Date(), err)
})

// 4. 대표 모듈화
module.exports = myPool
```

### <routes/db/index.js>
``` javascript
// routes/db/index.js
// db 모듈

// mysql 모듈을 이용하여 노드에서 mysql 엑세스, 쿼리 수행
// 모듈 가져오기
const mysql = require('mysql')
const pool = require('./pool')

// 풀 객체 가져오기
// 풀 적용하여 쿼리 수행
// 1. 커넥션 획득  2. 쿼리  3. 커넥션 반납

// 닉네임 중복 여부 조회
exports.checkExistNickname = ({nickName}, cb) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql = `select * from users where nickName =?`

      connection.query(sql, [nickName], (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// 사용자(user) 추가
exports.registerUser = ( {userName, nickName, upw}, cb ) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql = `insert into users (userName, nickName, upw) values (?, ?, ?);`

      connection.query(sql, [userName, nickName, upw], (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// 로그인 정보 조회
exports.checkLoginInfo = ( {nickName, upw}, cb ) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql = `select * from users where nickName =? and upw =?;`

      connection.query(sql, [nickName, upw], (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// 전체 할일 조회
exports.checkTodo = (cb) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql =   `select * from tasks;`

      connection.query(sql, (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// (select-option 목록을 위한) 전체 사용자 조회
exports.checkAllUser = (cb) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql =   `select nickName from users;`

      connection.query(sql, (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// 할일 등록
exports.registerTodo = ({title, name, sequence}, cb ) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql = `insert into tasks (title, name, sequence) values(?, ?, ?);`

      connection.query(sql, [title, name, sequence], (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// id(고유값)으로 타입 값 확인
exports.checkTodoType = ({id}, cb) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql = `select type from tasks where id=?`

      connection.query(sql, [id], (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })
}

// ex) update tasks set type='DOING' where id=9;
exports.updateTodoType = ( {type, id}, cb ) => {

  const db_session = pool.acquire()

  db_session
  .then((connection) => {
      let sql = `update tasks set type=? where id=?`

      connection.query(sql, [type, id], (error, rows)=> {
          pool.release(connection)
          cb(error, rows)
      })
  })
  .catch((error)=>{
      cb(error)
  })  
}

// 사용자(User) 조회
exports.selectUser=(cb)=>{

    const db_session = pool.acquire()

    db_session
    .then((connection)=>{
      let sql = `select * from users where uid = ? and upw = ?;`
      connection.query(sql, [uid, upw], (error, rows)=>{                      
        connection.end()
        cb(error, rows)
        // console.log(rows)  
      })
    })
    .catch((err)=>{   
      cb(err)
    })

}

exports.selectTypes=(cb)=>{

    const db_session = pool.acquire()

    db_session
    .then((connection)=>{
      let sql = `select * from tasks`
      connection.query(sql, (error, rows)=>{                      
        connection.end()
        cb(error, rows)
        // console.log(rows)  
      })
    })
    .catch((err)=>{   
      cb(err)
    })

}

// 'ARCHIVE' 상태 조회
exports.selectArchieveTypes=(cb)=>{

    const db_session = pool.acquire()

    db_session
    .then((connection)=>{
      let sql = `select * from tasks where type = 'ARCHIVE'`
      connection.query(sql, (error, rows)=>{                      
        connection.end()
        cb(error, rows)
        // console.log(rows)  
      })
    })
    .catch((err)=>{   
      cb(err)
    })
}

// 할일 삭제
exports.deleteArchieveTypes = ({id}, cb) => {

    const db_session = pool.acquire()

    db_session
    .then((connection) => {
        let sql = `delete from tasks where id=?`

        connection.query(sql, [id], (error, rows)=> {
            pool.release(connection)
            cb(error, rows)
        })
    })
    .catch((error)=>{
        cb(error)
    })
}

```

### <routes/db/test.js>
``` javascript
// routes/db/test.js
// DB 연결 테스트

const mysql = require('mysql')

exports.testDB = (cb) => {
  var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '12341234',
    database : 'sandydb'
  })

  connection.connect((err)=>{
    if(err) {
        console.log('접속 오류', err)
    } else {
        console.log('접속 성공')
        connection.end((e)=>{
            console.log('접속 종료?', e)
        })
    }
  });
}  
```

### <routes/index.js>
``` javascript
// routes/index.js

var express = require('express');
// 라우터 생성
var router = express.Router();
let db = require('./db');

// http://localhost:3000
router.get('/', function(req, res, next) {
   // views/index.ejs
   res.render('index')
});

// http://localhost:3000/board
// ~/board
router.get('/board', function(req, res, next) {

    // 전체 사용자 조회
    db.checkAllUser((err, names)=> {

        // 전체 할일 조회
        db.checkTodo((err, rows)=> {

            let userName =[]    
            for(i in rows){
              userName.push(rows[i].name)
            }

            userName = userName.filter(function(item, pos, self) {
                              return self.indexOf(item) == pos;
            })
            res.render('board', {names: names, rows:rows, userName: userName})
        })
    })    
});

router.post('/boardData', function(req, res, next) {

    db.checkAllUser((err, names)=> {
        db.checkTodo((err, rows)=> {
            res.json(rows)
        })
    })    
});

// ~/register
router.get('/register', (req, res, next)=>{

    db.checkAllUser((err, rows)=>{

        if(err) {
            res.render('error')
        } else {
            console.log(rows)
            res.render('register', {rows:rows})
        }
    })

})

// ~/register
router.post('/register', (req, res, next)=>{

    let title = req.body.title
    let name = req.body.name
    let sequence = req.body.sequence
    console.log(title, name, sequence)

    db.registerTodo({title, name, sequence}, (err, rows)=>{

        if(err) {
            res.render('error')
        } else {
            console.log(rows)
            res.redirect('board')
        }
    })
})

// ~/update
router.post('/update', (req, res, next)=>{

    let id = req.body.updateData
    console.log('id : ', id)

    db.checkTodoType({id : id}, (err, rows)=>{
        console.log(rows)

        if(err) {
            res.render('error')
        } else {
            if(rows[0].type == 'TODO') {
                db.updateTodoType({type:'DOING', id:id}, (err, rows)=>{
                    db.selectTypes( (err, rows)=>{
                        res.json(rows)
                    } )
                })
            } else if(rows[0].type == 'DOING') {
                db.updateTodoType({type:'DONE', id:id}, (err, rows)=>{
                    db.selectTypes( (err, rows)=>{
                        res.json(rows)
                    } )
                })
            } else if(rows[0].type == 'DONE') {
                db.updateTodoType({type:'ARCHIVE', id:id}, (err, rows)=>{
                    db.selectTypes( (err, rows)=>{
                        res.json(rows)
                    } )
                })
            }
        }
    })
})

router.get('/updateArchieve', (req, res, next)=>{

    let id = req.query.archiveData
    console.log(id)

    db.checkTodoType({id:id}, (err, rows)=>{
        if(err) {
            res.render('error')
        } else {
            db.updateTodoType({type:'ARCHIVE', id:id}, (err, rows)=>{
                db.selectTypes( (err, rows)=>{
                    res.json(rows)
                } )
            })
        }
    })
})


router.get('/search', (req, res, next)=>{

    let userData= req.query.userName
    // console.log(userData)

    db.selectTypes( (err, rows)=>{
      res.json(rows)
    } )

});

router.get('/list', (req, res, next)=>{

    db.selectTypes( (err, rows)=>{
        res.json(rows)
        console.log(rows)
    } )

});

router.get('/archive', (req, res, next)=>{

    db.selectArchieveTypes((err,rows)=>{
        res.render('ARCHIVE', {rows:rows})
        console.log(rows)
    })
});

router.get('/remove', (req, res, next)=>{

    let id = req.query.updateData
    console.log(id)

    db.deleteArchieveTypes({id:id}, (err, rows)=>{
        if(err) {
            res.render('error')
        } else {
            db.selectArchieveTypes( (err, rows)=>{
                res.json(rows)
            } )
        }
    })

})

module.exports = router;
```

### <routes/users.js>
``` javascript
// routes/users.js

var express = require('express');
var router = express.Router();
var db = require('./db');

// ~/users
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 회원가입 처리
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

// 로그인 처리
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

          // 로그인 성공
           console.log('로그인 성공')

          // 세션 생성
          req.session.nickName = nickName
          console.log(req.session.nickName)

          res.redirect('/board')
        }
      }
  })
})

  // 로그아웃 처리
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
```

### <views/index.ejs>
``` html
<!-- views/index.ejs -->
<!-- 시작 화면 -->

<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport"
    content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width" />
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="">
  <meta name="author" content="">
  <script src="//developers.kakao.com/sdk/js/kakao.min.js"></script>
  <title>SandyIndex</title>
  <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link
    href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
    rel="stylesheet">
  <link href="/css/sb-admin-2.min.css" rel="stylesheet">
</head>

<body class="bg-gradient-primary">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-xl-10 col-lg-12 col-md-9">
        <div class="card o-hidden border-0 shadow-lg my-5">
          <div class="card-body p-0">
            <div class="row">
              <div class="col-lg-6 d-none d-lg-block">
                <img src="logo.png" width="100%">
              </div>
              <div class="col-lg-6">
                <div class="p-5" style="margin-top: 90px">
                  <div class="text-center">
                    <h1 class="h4 text-gray-900 mb-4">Welcome To Sandy!</h1>
                  </div>
                  <form class="user">
                    <div>
                        <a input class="btn btn-primary btn-user btn-block" href ='http://localhost:3000/users/login'>로그인</a>
                    </div>
                    <div style="margin-top: 10px">
                        <a input class="btn btn-primary btn-user btn-block" href ='http://localhost:3000/users/join'>회원가입</a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap core JavaScript-->
  <script src="/vendor/jquery/jquery.min.js"></script>
  <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

  <!-- Core plugin JavaScript-->
  <script src="/vendor/jquery-easing/jquery.easing.min.js"></script>
  <script src="/js/sb-admin-2.min.js"></script>

</body>
</html>
```

### <views/login.ejs>
``` html
<!-- views/login.ejs -->
<!-- 로그인 화면 -->
<!DOCTYPE html>
<html lang="en">

<head>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">

  <title>Login</title>

  <!-- Custom fonts for this template-->
  <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->
  <link href="/css/sb-admin-2.min.css" rel="stylesheet">
</head>

<body class="bg-gradient-primary">

  <div class="container">

    <!-- Outer Row -->
    <div class="row justify-content-center">

      <div class="col-xl-10 col-lg-12 col-md-9">

        <div class="card o-hidden border-0 shadow-lg my-5">
          <div class="card-body p-0">
            <!-- Nested Row within Card Body -->
            <div class="row">
                <div class="col-lg-6 d-none d-lg-block">
                    <img src="/logo.png" width="100%">
                </div>
              <div class="col-lg-6">
                <div class="p-5">
                  <div class="text-center">
                    <h1 class="h4 text-gray-900 mb-4">Welcome Back!</h1>
                  </div>
                  <form method='post' class="user" action="/users/login">
                    <div class="form-group">
                      <input type="text" class="form-control form-control-user" name="nickName" placeholder="Nickname" autofocus required >
                    </div>
                    <div class="form-group">
                      <input type="password" class="form-control form-control-user" name="upw" placeholder="Password" required >
                    </div>
                    <div class="form-group">

                    </div>
                    <input type="submit" class="btn btn-primary btn-user btn-block" value="Login" />
                    <hr>
                    <a href="index.html" class="btn btn-google btn-user btn-block" style="background-color: rgb(254, 225, 1); color: black">
                      Login with KaKao
                    </a>
                  </form>
                  <hr>
                  <div class="text-center">
                    <a class="small" href="join">Create an Account!</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap core JavaScript-->
  <script src="/vendor/jquery/jquery.min.js"></script>
  <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

  <!-- Core plugin JavaScript-->
  <script src="/vendor/jquery-easing/jquery.easing.min.js"></script>

  <!-- Custom scripts for all pages-->
  <script src="/js/sb-admin-2.min.js"></script>

</body>
</html>
```

### <views/board.ejs>
``` html
<!-- views/board.ejs -->
<!-- 메인 화면-->

<!DOCTYPE html>
<html>

<head>
    <title>board page</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">

  <!-- Custom fonts for this template-->
  <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->
  <link href="css/sb-admin-2.min.css" rel="stylesheet">

  <style>
    .card{
        margin: 20px;
        padding-top: 20px;
        padding-bottom: 10px;
    }
    .card-header{
        color: white;
        text-align: center;
        margin-left: 25px;
        margin-right: 25px;
        margin-bottom: 25px;
        width: 100%;
    }
    .btn-mine {
        width: 30px;
        height: 30px;
        float: right;
        margin-right: 10px;
    }
    #todoDiv, #doingDiv, #doneDiv{
        overflow:auto; width:100%; height:500px; margin-right: 30px;
    }

    html {
        scrollbar-arrow-color: #efefef;
        scrollbar-Track-Color: #efefef;
        scrollbar-base-color: #dfdfdf;
        scrollbar-Face-Color: #dfdfdf;
        scrollbar-3dLight-Color: #dfdfdf;         
        scrollbar-DarkShadow-Color: #dfdfdf;
        scrollbar-Highlight-Color: #dfdfdf;
        scrollbar-Shadow-Color: #dfdfdf
    }
    /* Chrome, Safari용 스크롤 바 */
    ::-webkit-scrollbar {width: 12px; height: 12px;  }
    ::-webkit-scrollbar-button:start:decrement,
    ::-webkit-scrollbar-button:end:increment {display: block; width: 12px;height: 12px; background: url() rgba(0,0,0,.05);}
    ::-webkit-scrollbar-track {     background: rgba(0,0,0,.05); }
    ::-webkit-scrollbar-thumb {  background: rgba(0,0,0,.1);  }
  </style>
</head>

<body>
    <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" style="height: 60px">
        <div class="container-fluid">
            <div class="navbar-header">
            <a class="navbar-brand" href="/board">
                <img alt="Brand" src="logo.png" style="margin-top: -30px;width:110px">
            </a>
            </div>
        </div>
    </nav>
    <div class="container" >
        <div style='float:right'>
        <%  for( user of userName){ %>
            <a class="btn btn-info btn-icon-split ">
                <span class="text text-white text-lg"  onclick='showUsers("<%=user %>")'> <%=user %></span>
            </a>
        <% }  %>
        <a class="btn btn-light btn-icon-split">
          <span id='showAll' class='text text-lg' >모두 보기</span>  
        </a>
            <a href='/register' class="btn btn-light btn-icon-split">
                <span id='registerBtn' class='text text-lg' >할일 등록</span>  
            </a>
            <a href='/users/logout' class="btn btn-light btn-icon-split">
                <span id='logoutBtn' class='text text-lg' >로그아웃</span>  
            </a>
            <a href='/archive'  class='btn btn-danger btn-circle'><i class="fas fa-trash"></i></a>  
        </div>
    </div>

    <div class='content' style="margin: 5em">
        <div class="row col-md-4">
            <h1 class="card-header">To do</h1>
            <div id='todoDiv'>
                <% for(row of rows) {
                if (row.type=='TODO') {%>
                    <div class="card border-left-primary shadow">
                        <ul>
                            <li>제목 : <%=row.title %></li>
                            <li>등록날짜 : <%=row.regdate %></li>
                            <li>담당자 : <%=row.name %></li>
                            <li>우선순위 : <%=row.sequence %></li>
                            <input type="hidden" name='updateData' value='<%=row.id %>'/>
                        </ul>
                        <div>
                            <button class="btn btn-light btn-icon-split btn-mine" onclick='todoArchive("<%=row.id %>")'><i class="fas fa-trash"></i></button>
                            <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn("<%=row.id %>")'><i class="fas fa-arrow-right"></i></button>                            
                        </div>
                    </div>  
                <% }
             } %>
            </div>
        </div>

        <div class="row col-md-4">
            <h1 class="card-header">Doing</h1>
            <div id='doingDiv'>
                <% for(row of rows) {
                    if (row.type=='DOING') {%>
                <div class="card border-left-primary shadow" >
                    <ul>
                        <li>제목 : <%=row.title %></li>
                        <li>등록날짜 : <%=row.regdate %></li>
                        <li>담당자 : <%=row.name %></li>
                        <li>우선순위 : <%=row.sequence %></li>
                    </ul>
                    <div>
                        <button class="btn btn-light btn-icon-split btn-mine" onclick='doingArchive("<%=row.id %>")'><i class="fas fa-trash"></i></button>
                        <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn("<%=row.id %>")'><i class="fas fa-arrow-right"></i></button>                         
                    </div>
                </div>
                <% }
                 } %>
            </div>
        </div>

        <div class="row col-md-4">
            <h1 class="card-header">Done</h1>
            <div id='doneDiv'>
                <% for(row of rows) {
                if (row.type=='DONE') {%>
                <div class="card border-left-primary shadow">
                    <ul>
                        <li>제목 : <%=row.title %></li>
                        <li>등록날짜 : <%=row.regdate %></li>
                        <li>담당자 : <%=row.name %></li>
                        <li>우선순위 : <%=row.sequence %></li>
                    </ul>
                    <div>
                        <button class="btn btn-light btn-icon-split btn-mine" onclick='doneArchive("<%=row.id %>")'><i class="fas fa-trash"></i></button>
                        <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn("<%=row.id %>")'><i class="fas fa-arrow-right"></i></button>                         
                    </div>
                </div>
                <% }
                } %>
            </div>
        </div>

    </div>

    <script>

    let id = 0;
    let user = 0;

    function todoArchive(id) {
        console.log('id', id);

        $.ajax({
            url: '/updateArchieve',
            data: {
                archiveData: id
            },
            type: 'get',
            dataType: 'json',

            success: (data) => {
                console.log('성공', data)

                $('#todoDiv').empty()

                //화면 조작: dom 조작
                $.each(data, (index, item) => {
                    if (item.type === 'TODO'){
                        $('#todoDiv').append(`
                        <div class="card border-left-primary shadow">
                            <ul>
                                <li>제목 : ${item.title}</li>
                                <li>등록날짜 :  ${item.regdate}</li>
                                <li>담당자 : ${item.name}</li>
                                <li>우선순위 : ${item.sequence}</li>
                            </ul>
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='todoArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)                        
                    }
                }) //each문 end
            },
            error: (err) => {
                console.log('실패', err)
            }
        });
    }

    function doingArchive(id) {
        console.log('id', id);

        $.ajax({
            url: '/updateArchieve',
            data: {
                archiveData: id
            },
            type: 'get',
            dataType: 'json',

            success: (data) => {
                console.log('성공', data)

                $('#doingDiv').empty()

                //화면 조작: dom 조작
                $.each(data, (index, item) => {
                    if (item.type === 'DOING'){
                        $('#doingDiv').append(`
                        <div class="card border-left-primary shadow">
                            <ul>
                                <li>제목 :      ${item.title}</li>
                                <li>등록날짜 :  ${item.regdate}</li>
                                <li>담당자 :    ${item.name}</li>
                                <li>우선순위 :  ${item.sequence}</li>
                            </ul>
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='doingArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)                        
                    }
                }) //each문 end
            },
            error: (err) => {
                console.log('실패', err)
            }
        });
    }

    function doneArchive(id) {
        console.log('id', id);

        $.ajax({
            url: '/updateArchieve',
            data: {
                archiveData: id
            },
            type: 'get',
            dataType: 'json',

            success: (data) => {
                console.log('성공', data)

                $('#doneDiv').empty()

                //화면 조작: dom 조작
                $.each(data, (index, item) => {
                    if (item.type === 'DONE'){
                        $('#doneDiv').append(`
                        <div class="card border-left-primary shadow">
                        <ul>
                            <li>제목 :      ${item.title}</li>
                            <li>등록날짜 :  ${item.regdate}</li>
                            <li>담당자 :    ${item.name}</li>
                            <li>우선순위 :  ${item.sequence}</li>
                        </ul>
                        <div>
                            <button class="btn btn-light btn-icon-split btn-mine" onclick='doneArchive(${item.id})'><i class="fas fa-trash"></i></button>
                            <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                        </div>
                    </div>`)                        
                    }
                }) //each문 end
            },
            error: (err) => {
                console.log('실패', err)
            }
        });
    }

    function moveBtn(id){
        $.ajax({
            url: '/update',
            data: {
                updateData: id
            },
            type: 'post',
            dataType: 'json',
            success: (data) => {
                // 기존 데이터 삭제
                $('#todoDiv').empty()
                $('#doingDiv').empty()
                $('#doneDiv').empty()
                // 신규 데이터 추가
                $.each(data, (idx, row)=>{
                    let html = `
                        <div class="card border-left-primary shadow">
                            <ul>
                                <li>제목 : ${row.title}</li>
                                <li>등록날짜 :  ${row.regdate}</li>
                                <li>담당자 : ${row.name}</li>
                                <li>우선순위 : ${row.sequence}</li>
                            </ul>`

                        if( row.type == 'TODO' ) {
                            $('#todoDiv').append(html+`
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='todoArchive(${row.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${row.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)
                        } else if( row.type == 'DOING' ) {
                            $('#doingDiv').append(html+`
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='doingArchive(${row.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${row.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)
                        } else if( row.type == 'DONE' ) {
                            $('#doneDiv').append(html+`
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='doneArchive(${row.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${row.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)
                        }
                })   
            },
            error: (err) => {
                console.log('실패', err)
            }
        });
    }

    $('#showAll').on('click', (evt) => {
        evt.preventDefault()

        $.ajax({
            url: '/list',
            data: $('form').serialize(),
            type: 'get',
            dataType: 'json',
            success: (data) => {
                console.log('성공', data)

                $('#todoDiv').empty()
                $('#doingDiv').empty()
                $('#doneDiv').empty()

                //화면 조작: dom 조작
                $.each(data, (index, item) => {
                    if (item.type === 'TODO') {
                        $('#todoDiv').append(`
                        <div class="card border-left-primary shadow">
                            <ul>
                                <li>제목 :      ${item.title}</li>
                                <li>등록날짜 :  ${item.regdate}</li>
                                <li>담당자 :    ${item.name}</li>
                                <li>우선순위 :  ${item.sequence}</li>
                            </ul>
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='todoArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)  
                    } else if (item.type === 'DOING') {
                        $('#doingDiv').append(`
                        <div class="card border-left-primary shadow">
                            <ul>
                                <li>제목 :      ${item.title}</li>
                                <li>등록날짜 :  ${item.regdate}</li>
                                <li>담당자 :    ${item.name}</li>
                                <li>우선순위 :  ${item.sequence}</li>
                            </ul>
                            <div>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='doingArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                            </div>
                        </div>`)
                    } else if (item.type === 'DONE') {
                        $('#doneDiv').append(`
                        <div class="card border-left-primary shadow">
                        <ul>
                            <li>제목 :      ${item.title}</li>
                            <li>등록날짜 :  ${item.regdate}</li>
                            <li>담당자 :    ${item.name}</li>
                            <li>우선순위 :  ${item.sequence}</li>
                        </ul>
                        <div>
                            <button class="btn btn-light btn-icon-split btn-mine" onclick='doneArchive(${item.id})'><i class="fas fa-trash"></i></button>
                            <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                        </div>
                    </div>`)
                    }
                }) //each문 end
            },
            error: (err) => {
                console.log('실패', err)
            }
        });
        return false
    })

    function showUsers(user){

        $.ajax({
            url: '/search',
            data: {
                userName: user
            },
            type: 'get',
            dataType: 'json',

            success: (data) => {
                console.log('성공', data)

                $('#todoDiv').empty()
                $('#doingDiv').empty()
                $('#doneDiv').empty()

                //화면 조작: dom 조작
                $.each(data, (index, item) => {

                    if (item.name === user) {
                        console.log(item.name, user)
                        if (item.type === 'TODO') {
                            $('#todoDiv').append(`
                                <div class="card border-left-primary shadow">
                                    <ul>
                                        <li>제목 :      ${item.title}</li>
                                        <li>등록날짜 :  ${item.regdate}</li>
                                        <li>담당자 :    ${item.name}</li>
                                        <li>우선순위 :  ${item.sequence}</li>
                                    </ul>
                                    <div>
                                        <button class="btn btn-light btn-icon-split btn-mine" onclick='todoArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                        <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                                    </div>
                                </div>`)  
                        } else if (item.type === 'DOING') {
                            $('#doingDiv').append(`
                                <div class="card border-left-primary shadow">
                                    <ul>
                                        <li>제목 :      ${item.title}</li>
                                        <li>등록날짜 :  ${item.regdate}</li>
                                        <li>담당자 :    ${item.name}</li>
                                        <li>우선순위 :  ${item.sequence}</li>
                                    </ul>
                                    <div>
                                        <button class="btn btn-light btn-icon-split btn-mine" onclick='doingArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                        <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                                    </div>
                                </div>`)
                        } else if (item.type === 'DONE') {
                            $('#doneDiv').append(`
                            <div class="card border-left-primary shadow">
                                <ul>
                                    <li>제목 :      ${item.title}</li>
                                    <li>등록날짜 :  ${item.regdate}</li>
                                    <li>담당자 :    ${item.name}</li>
                                    <li>우선순위 :  ${item.sequence}</li>
                                </ul>
                                <div>
                                    <button class="btn btn-light btn-icon-split btn-mine" onclick='doneArchive(${item.id})'><i class="fas fa-trash"></i></button>
                                    <button class="btn btn-light btn-icon-split btn-mine" onclick='moveBtn(${item.id})'><i class="fas fa-arrow-right"></i></button>                            
                                </div>
                            </div>`)
                        }
                    }
                }) //each문 end
            },
            error: (err) => {
                console.log('실패', err)
            }
        });
    }
    </script>
</body>
</html>
```

### <views/join.ejs>
``` html
<!-- views/join.ejs -->
<!-- 회원가입 화면-->

<!DOCTYPE html>
<html lang="en">

<head>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <title>Create an Account!</title>

  <!-- Custom fonts for this template-->
  <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->
  <link href="/css/sb-admin-2.min.css" rel="stylesheet">

</head>

<body class="bg-gradient-primary">

  <div class="container">

    <!-- Outer Row -->
    <div class="row justify-content-center">

      <div class="col-md-6">

        <div class="card o-hidden border-0 shadow-lg my-5">
          <div class="card-body p-0">
            <!-- Nested Row within Card Body -->
            <div class="row">
              <div class="col-lg-12">
                <div class="p-5">
                  <div class="text-center">
                    <h1 class="h4 text-gray-900 mb-4">Create an Account!</h1>
                  </div>
                  <br/>
                  <form method='post' class="user" action="/users/join">
                    <div class="form-group">
                      <input type="text" class="form-control form-control-user"  name="nickName" id="checkExistNickName" aria-describedby="emailHelp" placeholder="Nickname" required />
                    </div>
                    <p class="text-center small" id ="checkNickNameMsg"></p>
                    <div class="form-group">
                      <input type="password" class="form-control form-control-user" name="upw" id="password" onchange="checkSamePassword()" placeholder="Password" required />
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control form-control-user" name="checkUpw" id="checkPassword" onchange="checkSamePassword()" placeholder="Password check" required />
                    </div>
                    <p class="text-center small" id="checkMsg"></p>
                    <div class="form-group">
                        <input type="text" class="form-control form-control-user" name="userName" placeholder="Name" required />
                    </div>
                    <hr>
                    <input type="submit" class="btn btn-primary btn-user btn-block" id="join" value="join" />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap core JavaScript-->
  <script src="/vendor/jquery/jquery.min.js"></script>
  <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

  <!-- Core plugin JavaScript-->
  <script src="/vendor/jquery-easing/jquery.easing.min.js"></script>

  <!-- Custom scripts for all pages-->
  <script src="/js/sb-admin-2.min.js"></script>

  <script>

        var checkNickNameMsg = document.getElementById('checkNickNameMsg')

        $('#checkExistNickName').on('change', (evt)=> {
            console.log(evt)

            $.ajax({
                url : '/users/check',
                data : {
                   nickName : $('[name=nickName]').val()
                },
                type : 'get',
                dataType : 'json',
                success : (data) => {
                    console.log('성공', typeof data, data)
                    console.log(data.length)

                    if (data.length == 0) {
                       //$('#checkNickNameMsg').append('사용할 수 있는 닉네임입니다')
                        checkNickNameMsg.innerHTML = '사용할 수 있는 닉네임입니다'
                        checkNickNameMsg.style.color = 'green'
                        checkNickNameMsg.style.fontSize = '10px'
                        // join 버튼 활성화
                        $('#join').attr("disabled", false)
                    } else {
                        checkNickNameMsg.innerHTML = '이미 존재하는 닉네임입니다'
                        checkNickNameMsg.style.color = 'red'
                        checkNickNameMsg.style.fontSize = '10px'
                        // join 버튼 비활성화
                        $('#join').attr("disabled", true)
                    }
                },
                error : (err) => {
                    console.log('실패', err)
                }
            })
        })

        function checkSamePassword() {

            var password = document.getElementById('password')
            var checkPassword = document.getElementById('checkPassword')
            var checkMsg = document.getElementById('checkMsg')

            if(password.value !='' && checkPassword.value != '') {
                if(password.value == checkPassword.value) {
                    checkMsg.innerHTML = '비밀번호가 일치합니다'
                    checkMsg.style.color = 'green'
                    checkMsg.style.fontSize = '10px'
                    // join 버튼 활성화
                    $('#join').attr("disabled", false)
                } else {
                    checkMsg.innerHTML = '비밀번호가 일치하지 않습니다'
                    checkMsg.style.color = 'red'
                    checkMsg.style.fontSize = '10px'
                    // join 버튼 비활성화
                    $('#join').attr("disabled", true)  
                }
            }    
        }    
  </script>

</body>
</html>
```

### <views/register.ejs>
``` html
<!-- views/register.ejs -->
<!-- 할일 등록 화면-->

<!DOCTYPE html>
<html>

<head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>register</title>
    <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
        rel="stylesheet">
    <link href="css/sb-admin-2.min.css" rel="stylesheet">
</head>

<body class="bg-gradient-primary">

        <div class="container">

          <!-- Outer Row -->
          <div class="row justify-content-center">

            <div class="col-md-6">

              <div class="card o-hidden border-0 shadow-lg my-5">
                <div class="card-body p-0">
                  <!-- Nested Row within Card Body -->
                  <div class="row">
                    <div class="col-lg-12">
                      <div class="p-5">
                        <div class="text-center">
                          <h1 class="h4 text-gray-900 mb-4">할일 등록</h1>
                        </div>
                        <br/>
                        <form method='post' class="user" action="/register">
                            <div class="form-group">
                                <p>어떤 일인가요?</p>
                                <input type="text" class="form-control form-control-user" name="title" maxlength="24"
                                    placeholder="24자 이내로 입력하세요" required />
                            </div>
                            <div class="form-group">
                                <p>누가 할일인가요?</p>
                                <select class="form-control" name="name" required>
                                    <% for(row of rows) {%>
                                    <option><%=row.nickName %></option>
                                    <% } %>
                                </select>
                            </div>
                            <div class="form-group">
                                <p>우선순위를 선택하세요</p>
                                <input type="radio" name="sequence" value=1 required /> 1순위
                                <input type="radio" name="sequence" value=2 /> 2순위
                                <input type="radio" name="sequence" value=3 /> 3순위
                            </div>
                            <div class="form-group">
                                <input class="btn btn-primary btn-user btn-block" type="submit" value="등록하기" />                    
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

  <!-- Bootstrap core JavaScript-->
  <script src="/vendor/jquery/jquery.min.js"></script>
  <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

  <!-- Core plugin JavaScript-->
  <script src="/vendor/jquery-easing/jquery.easing.min.js"></script>

  <!-- Custom scripts for all pages-->
  <script src="/js/sb-admin-2.min.js"></script>

</body>
</html>
```

### <views/archive.ejs>
``` html
<!-- views/archive.ejs -->
<!-- 휴지통 화면 -->

<!DOCTYPE html>
<html>
<head>
    <title>archieve page</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <link rel='stylesheet' href='/stylesheets/style.css' />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
    <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

    <link href="css/sb-admin-2.min.css" rel="stylesheet">
    <style>
        .card{
            margin: 20px;
            padding-top: 20px;
            padding-bottom: 10px;
        }
        .card-header{
            color: white;
            text-align: center;
            margin-left: 25px;
            margin-right: 25px;
            margin-bottom: 25px;
        }
        .btn-mine {
            width: 30px;
            height: 30px;
            float: right;
            margin-right: 10px;
        }
        html {
            scrollbar-arrow-color: #efefef;
            scrollbar-Track-Color: #efefef;
            scrollbar-base-color: #dfdfdf;  
            scrollbar-Face-Color: #dfdfdf;
            scrollbar-3dLight-Color: #dfdfdf;         
            scrollbar-DarkShadow-Color: #dfdfdf;
            scrollbar-Highlight-Color: #dfdfdf;
            scrollbar-Shadow-Color: #dfdfdf
        }
        /* Chrome, Safari용 스크롤 바 */
        ::-webkit-scrollbar {width: 12px; height: 12px;  }
        ::-webkit-scrollbar-button:start:decrement,
        ::-webkit-scrollbar-button:end:increment {display: block; width: 12px;height: 12px; background: url() rgba(0,0,0,.05);}
        ::-webkit-scrollbar-track {     background: rgba(0,0,0,.05); }
        ::-webkit-scrollbar-thumb {  background: rgba(0,0,0,.1);  }

    </style>
</head>

<body style='padding: 0'>
    <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" style="height: 60px">
        <div class="container-fluid">
            <div class="navbar-header">
            <a class="navbar-brand" href="/board">
                <img alt="Brand" src="logo.png" style="margin-top: -30px;width:110px">
            </a>
            </div>
        </div>
    </nav>
    <div class="container">
        <h1 class="card-header" style='margin-top: 10px;width:300px;' >Archive</h1>
        <div id='removeDiv' style="overflow:auto; width:100%; height:550px">
            <% for(row of rows) { %>
            <div class="card border-left-primary shadow" style="float:left">
                <ul>
                    <li>제목 :      <%=row.title %></li>
                    <li>등록날짜 :  <%=row.regdate %></li>
                    <li>담당자 :    <%=row.name %></li>
                    <li>우선순위 :  <%=row.sequence %></li>
                    <li>타입 :      <%=row.type %></li>
                </ul>
                <div>
                    <button class="btn btn-light btn-icon-split btn-mine" onclick='clickRemove("<%=row.id %>")'><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <% } %>
        </div>
    </div>

    <script>
        let id = 0;
        function clickRemove(id) {
            var con_test = confirm("영구 삭제 하시겠습니까?");

            if (con_test) {
                console.log('id', id);

                $.ajax({
                    url: '/remove',
                    data: {
                        updateData: id
                    },
                    type: 'get',
                    dataType: 'json',

                    success: (data) => {
                        console.log('성공', data)

                        $('#removeDiv').empty()

                        //화면 조작: dom 조작
                        $.each(data, (index, item) => {

                            $('#removeDiv').append(`
                            <div class="card border-left-primary shadow" style="float:left">
                                <ul>
                                    <li>제목 :      ${item.title}</li>
                                    <li>등록날짜 :  ${item.regdate}</li>
                                    <li>담당자 :    ${item.name}</li>
                                    <li>우선순위 :  ${item.sequence}</li>
                                </ul>
                                <div>
                                    <button class="btn btn-light btn-icon-split btn-mine" onclick='clickRemove(${item.id})'><i class="fas fa-trash"></i></button>
                                </div>
                            </div>`)
                        }) // each문 end
                    },
                    error: (err) => {
                        console.log('실패', err)
                    }
                });
            }
        }
    </script>
</body>
</html>
```

### <views/error.ejs>
``` html
<!-- views/error.ejs -->
<!-- 에러 발생 시 -->

<script>
    alert('에러 페이지')
    history.back();
</script>
```

### <views/loginFail.ejs>
``` html
<!-- views/loginFail.ejs -->
<!-- 로그인 실패 시 -->

<script>
        alert('사용자 이름 또는 비밀번호를 잘못 입력하셨습니다')
        history.back();
</script>
```

### <app.js>
``` javascript
// app.js

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
```
