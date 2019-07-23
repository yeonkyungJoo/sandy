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