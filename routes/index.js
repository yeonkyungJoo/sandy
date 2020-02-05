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