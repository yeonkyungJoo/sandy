var express = require('express');
var router = express.Router();
let db = require('./db');

router.get('/', function(req, res, next) {
   res.render('index')
});


// // ~/board
router.get('/board', function(req, res, next) {
    db.checkAllUser((err, names)=> {
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


router.post('/update', (req, res, next)=>{
    let id = req.body.updateData
    console.log('the id is', id)
    db.checkTodoType({id:id}, (err, rows)=>{
        console.log("console "+ rows)
        
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
    console.log('got',id)
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
    console.log('ddddddddddddddddddddddddddddddddddd',userData)
    db.selectTypes( (err, rows)=>{
      res.json(rows) //3. 응답
    } )
  
});
  
router.get('/list', (req, res, next)=>{

    db.selectTypes( (err, rows)=>{
        res.json(rows) //3. 응답
        console.log(rows)
    } )

});


router.get('/archive', (req, res, next)=>{
    db.selectArchieveTypes((err,rows)=>{
        res.render('ARCHIVE', { rows:rows})
        console.log(rows)
    })
})

router.get('/remove', (req, res, next)=>{
    let id = req.query.updateData
    console.log('got',id)
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
