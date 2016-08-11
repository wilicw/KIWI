var express = require('express');
var router = express.Router();
var db = require('../model/db');

/* index */
router.get('/', function(req, res) {
  console.log('\n'+'GET /course');
  /*  設定要的欄位 */
  var columns = ['id','課程名稱','系所名稱','老師','時間', 'get_post'];
  if(req.query.hasOwnProperty("queryw")){
    db.query_course(courses, req.query.queryw,"query",function(courses,teachers,course_name){
      check_Login(courses);
    });
  }
  else if(req.query.hasOwnProperty("teacher")){
    db.FindbyColumn('course', columns,{"老師": req.query.teacher} ,function(courses){
      check_Login(courses);
    });
  }
  else if(req.query.hasOwnProperty("course_name")){
    db.FindbyColumn('course', columns,{"課程名稱": req.query.course_name} ,function(courses){
      check_Login(courses);
    });
  }
  else if(req.query.hasOwnProperty("catalog")){
    db.FindbyColumn('course', columns,{"系號": req.query.catalog} ,function(courses){
      check_Login(courses);
    });
  }
  else{
    db.GetColumn('course',columns,{'column':'id','order':'DESC'},function(courses){
      check_Login(courses);
    });
  }
  function check_Login(courses){
    if(req.user == undefined){
      res.render('course/index',{
        'courses': courses,
        'user': req.user,
        'carts':null   //沒登入 選課清單為null
      });
    }
    else{
      var userid = parseInt(req.user.id);
      var colmuns = ['course_id'];
      /* 有登入 抓取用戶的選課清單 */
      db.FindbyColumn('cart',['course_id'],{'user_id':userid},function(carts){
        res.render('course/index',{
          'courses':courses,
          'user': req.user,
          'carts':carts
        });
      });
    }
  }
});

/* show */
router.get('/:id', function(req, res) {
  var id = req.params.id;
  console.log('\n'+'GET /course/'+id);
  if(id.match(/\D/g)){
    res.redirect('/course');
  }
  else{
    /* 尋找課程的資訊 */
    db.query_post2(id, function(courseInfo, comment){
      courseInfo = courseInfo[0];
      courseInfo.comment = 0;
      courseInfo.course_style = 0;
      courseInfo.report_hw = 0;
      courseInfo.score_style = 0;

      for(var i in comment){
        for(var j in comment[i]){
          var buf = comment[i];
          if(buf[j] == "無" || buf[j] == ""){
            delete buf[j];
            continue;
          }
          courseInfo[j]++;
        }
      }
      db.FindbyColumn('course_rate',["*"],{course_id:parseInt(id)},function(datas){
        var sweet=0;
        var hard=0;
        var recommand=0;
        var rate_count=0;
        if(datas.length>0){
          for(var i in datas ){
            sweet+=datas[i].sweet;
            hard+=datas[i].hard;
            recommand+=datas[i].recommand;
          }
          sweet/=datas.length;
          hard/=datas.length;
          recommand/=datas.length;
          rate_count=datas.length;
        }
        if(req.user == undefined){
          res.render('course/show', {
            'recommand':recommand,
            'hard':hard,
            'sweet':sweet,
            'rate_count':rate_count,
            'courseInfo': courseInfo,
            'comment': comment,
            'courserate_id':0,
            'user': req.user,
            'check':null
          })
        }
        else{
          var userid = parseInt(req.user.id);
          var courserateid=0;
          if(datas.length>0){
            for(var i in datas ){
              if(datas[i].user_id == userid){
                courserateid=datas[i].id;
              }
            }
          }
          /* 有登入 抓取用戶的選課清單 */
          db.FindbyColumn('cart',['id'],{'course_id':parseInt(id)},function(check){
            res.render('course/show',{
              'recommand':recommand,
              'hard':hard,
              'sweet':sweet,
              'rate_count':rate_count,
              'courseInfo': courseInfo,
              'comment': comment,
              'courserate_id':courserateid,
              'user': req.user,
              'check':check
            });
          });
        }
      });
    });
  }
});

/* add course */
router.post('/addcourse/:id', function(req, res) {
  var courseid =parseInt(req.params.id);
  console.log('\n'+'POST /course/addcourse/'+courseid);
  if(req.user == undefined){
    console.log('No login');
    res.send('No login');
  }
  else{
    var userid = parseInt(req.user.id);
    var name = req.user.name;
    console.log("選課者: "+name);
    /* 確認是否選過課了 */
    db.FindbyColumn('cart',["id"],{'user_id':userid,'course_id':courseid},function(carts){
      if(carts.length > 0 ){
        console.log('Already choose');
        res.send('Already choose');
      }
      else{
        /* 新增選課紀錄 */
        var cart ={
          user_id:userid,
          course_id:courseid
        }
        db.Insert('cart',cart,function(err,results){
          if(err) throw err;
          console.log('Choose course ' + courseid + ' success');
          res.send('success');
        });
      }
    });
  }
});

/* del course*/
router.post('/delcourse/:id', function(req,res) {
  var courseid = parseInt(req.params.id);
  var userid = parseInt(req.user.id);
  var name = req.user.name;
  console.log('\n'+'DELETE /course/delcourse/'+courseid);
  console.log("退課者: "+name);
  db.DeleteByColumn('cart',{'course_id':courseid,'user_id':userid},function(err){
    res.send('Success');
  });
});

/* input add course */
router.post('/inputaddcourse/:courseid', function(req, res) {
  var courseserial = req.params.courseid.toUpperCase();
  console.log('\n'+'POST /course/inputaddcourse/'+courseserial);
  var column=["id","課程名稱","時間"];
  /* 透過輸入的選課序號 查找課程 */
  db.FindbyColumn('course',column,{'選課序號':courseserial},function(course){
    /* 若該選課序號無對應的課程 回傳not found */
    if(course.length==0){
      console.log("Course "+courseserial+" not found");
      res.send("Not found");
    }
    /* 有找到課程 則傳送課程資訊 */
    else{
      var courseid = course[0].id
      /* 若用戶非登入 則直接傳送課程資訊 */
      if(req.user == undefined){
        res.send(course);
      }
      else{
        var userid = parseInt(req.user.id);
        var name = req.user.name;
        console.log("選課者: "+name);
        /* 確認是否選過課了 */
        db.FindbyColumn('cart',["id"],{'user_id':userid,'course_id':courseid},function(carts){
          /* 用戶清單中有該課程 */
          if(carts.length > 0 ){
            console.log('Already choose');
            res.send('Already choose');
          }
          else{
            /* 新增選課紀錄 */
            var cart ={
              user_id:userid,
              course_id:courseid
            }
            db.Insert('cart',cart,function(err,results){
              res.send(course);
            });
          }
        });
      }
    }
  });
});

module.exports = router;
