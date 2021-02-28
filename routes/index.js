var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');

const conn = mysql.createPool({
  host: "localhost",
  user: "wissenaire_sudheer",
  password: "sudheer@wissenaire",
  database: "wissenaire_wissenaire21"
});

const caconn = mysql.createPool({
  host: "localhost",
  user: "wissenaire_sudheer",
  password: "sudheer@wissenaire",
  database: "wissenaire_ca21"
});

function ensureNotFilled (req, res, next){
  var check = ("SELECT * FROM hackbuzz WHERE email = '"+req.body.email+"' ;");
  conn.query(check, (err, rows)=>{
    if(err) throw err;
    if(rows[0]) res.send('Already registered using this email');
    else next();
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/submit', ensureNotFilled, function(req,res,next) {
  var hackbuzzid; 
  if(req.body.refca){
    const qr = ("INSERT INTO hackbuzz (name, email, phone, year, college, state, ref) VALUES ('"+req.body.fullname+"', '"+req.body.email+"', '"+req.body.phone+"', '"+req.body.year+"', '"+req.body.college+"', '"+req.body.state+"', '"+req.body.refca+"') ;");
    conn.query(qr, (err, result)=>{
      if(err) throw err;
      console.log(result);
      const id = ("SELECT id FROM `hackbuzz` WHERE email = '"+ req.body.email+"'");
      conn.query(id, (err, rows)=>{
        if (err) throw err; 
        if (rows[0].id < 10) hackbuzzid = 'W21HB000' + rows[0].id;
        else if (rows[0].id < 100) hackbuzzid = 'W21HB00' + rows[0].id;
        else if(rows[0].id < 1000) hackbuzzid = 'W21HB0' + rows[0].id;
        else hackbuzzid = 'W21HB' + rows[0].id;
      
        const part = ("SELECT points from users WHERE wissid = '"+req.body.refca+"' ;");
        caconn.query(part, (err,data) =>{
          if(err) throw err;
          if(data) {
            console.log(data[0].points);
            var points = data[0].points + 10;
            const update = ("UPDATE `users` SET points = '"+points+"' WHERE wissid = '"+req.body.refca+"';");
            caconn.query(update, (err,result)=>{
              if (err) throw err;
              console.log(result);
            })
          }
          else {
            console.log('no ca found')
          }
        })
      })
    })
  }
  else {
    const qr = ("INSERT INTO hackbuzz (name, email, phone, year, college, state, ref) VALUES ('"+req.body.fullname+"', '"+req.body.email+"', '"+req.body.phone+"', '"+req.body.year+"', '"+req.body.college+"', '"+req.body.state+"', '"+req.body.refca+"') ;");
    conn.query(qr, (err, rows)=>{
      if(err) throw err;
      const id = ("SELECT id FROM `hackbuzz` WHERE email = '"+ req.body.email+"'");
      conn.query(id, (err, rows)=>{
        if(err) throw err;
        if (rows[0].id < 10) hackbuzzid = 'W21HB000' + rows[0].id;
        else if (rows[0].id < 100) hackbuzzid = 'W21HB00' + rows[0].id;
        else if(rows[0].id < 1000) hackbuzzid = 'W21HB0' + rows[0].id;
        else hackbuzzid = 'W21HB' + rows[0].id;
      })
    })
  }
  
  request.get("https://fundraiser.wissenaire.org/hackbuzzmail.php?name='"+req.body.fullname+"'&phone='"+req.body.phone+"'&hackbuzzid='"+hackbuzzid+"'")
  .on('response', function(response) {
    console.log(response.statusCode) ;
    
  })

  res.send('Successfully registered ');

})

module.exports = router;
