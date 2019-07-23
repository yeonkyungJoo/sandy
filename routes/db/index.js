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
      let sql = `select * from users 
          where nickName =?`
  
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
      let sql = `insert into users (userName, nickName, upw) 
                        values (?, ?, ?);`

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
      let sql = `select * from users 
          where nickName =? and upw =?;`
  
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

// update tasks set type='DOING' where id=9;
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

// 할일 삭제
exports.removeTodo = ({}, cb ) => {

}


// 1. 커넥션 획득 
exports.selectUser=(cb)=>{
    const db_session = pool.acquire()
  
    db_session
    .then((connection)=>{
      let sql = `select * from users where uid = '1' and upw = '1234';`
      connection.query(sql, [uid, upw], (error, rows)=>{                      
        connection.end() 
        cb(error, rows)
        console.log(rows)  
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
        console.log(rows)  
      })
    })
    .catch((err)=>{   
      cb(err)
    })
   
}

exports.selectArchieveTypes=(cb)=>{
    const db_session = pool.acquire()
  
    db_session
    .then((connection)=>{
      let sql = `select * from tasks where type = 'ARCHIVE'`
      connection.query(sql, (error, rows)=>{                      
        connection.end() 
        cb(error, rows)
        console.log(rows)  
      })
    })
    .catch((err)=>{   
      cb(err)
    })
   
}



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