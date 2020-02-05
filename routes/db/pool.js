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