var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');
    Course = require('./models/courses.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(express.static(__dirname + '/public'));
app.set('views', './public');
app.set('view engine', 'ejs');

// mongoose.connect("mongodb://localhost/yotei-1",{useFindAndModify: false});

mongoose.connect("mongodb+srv://karan:karanaman123@yotei-1.twybd.azure.mongodb.net/yotei-1-1?retryWrites=true&w=majority",{dbName: 'yotei-1-1', useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then( () => {
  console.log('Connection to the Atlas Cluster is successful!')
})
.catch( (err) => console.error(err));


// Homepage
app.get('/',async (req,res)=>{
  Course.find({all_deadlines: {$not: {$size: 0}}},function(err,data){
    if(err) {console.log(err);}
    if(data==undefined || data==[]){res.render('index.ejs',{data: {}, tasks: {}});}
    else {
      all_tasks = []
      for(var i=0;i<data.length;i++){
        for(var j=0;j<data[i].all_deadlines.length;j++){
          all_tasks.push(data[i].all_deadlines[j]);
        }
      }
      
      all_tasks = all_tasks.sort(function(a,b){
        return (new Date(a.deadline)-new Date(b.deadline));
      });

      recent_deadlines = []
      for(var i=0;i<all_tasks.length;i++){
        if(all_tasks[i].completed==false)
          recent_deadlines.push(all_tasks[i])
        if(recent_deadlines.length==3)
          break
      }

      all_tasks = all_tasks.sort(function(a,b){
        return (new Date(b.completedOn)-new Date(a.completedOn));
      });

      recent_completed = []
      for(var i=0;i<all_tasks.length;i++){
        if(all_tasks[i].completed==true)
            recent_completed.push(all_tasks[i]);
        if(recent_completed.length==3)
            break;
      }
      
      // recent_completed = recent_completed.sort(function(a,b){
      //   return (new Date(b.completedOn)-new Date(a.completedOn));
      // });

      // console.log(recent_completed)

      // all_tasks = all_tasks.sort(function(a,b){
      //   return (new Date(a.deadline)-new Date(b.deadline));
      // });
      res.render('index.ejs',{data: data, tasks: all_tasks/*, recent_deadlines: recent_deadlines*/, recent_completed: recent_completed});
    }
  });
});

// Add a task
app.post('/',(req,res)=>{
  // console.log(req.body)

  var date = new Date(req.body.date.split('-').reverse().join('-'));
  date = date.toDateString();

  var type = 'Homework';
  if(req.body.options=='assn'){type='Assignment';}
  else if (req.body.options=='project') {
    type="Project";
  }
  else if(req.body.options=='tut'){
    type="Tutorial";
  }

  Course.findOne({coursename: req.body.coursename},function(err,data){
    // console.log(data);
    if(data){
      Course.updateOne({coursename: req.body.coursename},{ $push: { all_deadlines: {"createdOn": (new Date()).toDateString(), "deadline": date, "type": type, "description": req.body.descr, "coursename": req.body.coursename, "completed": false} } },function(err,data_1){
        if(err)
          console.log(err);
        res.redirect('/');
      });
    }
    else {
      Course.create({coursename: req.body.coursename, all_deadlines:[{"createdOn": (new Date()).toDateString(), "deadline": date, "type": type, "description": req.body.descr, "coursename": req.body.coursename, "completed": false}]},(err,data_2)=>{
        if(err){
          console.log(err);
        }
        res.redirect('/');
      });
    }
  });

});

// Mark the task complete
app.post('/task/completed/:courseid/:taskid',function(req,res){
  Course.findOneAndUpdate({_id: req.params.courseid},{},(err,data)=>{
    if(err)
      console.log(err);
    console.log(data)
    for(var i=0;i<data.all_deadlines.length;i++){
      if(data.all_deadlines[i]._id==req.params.taskid){
        data.all_deadlines[i].completed = true;
        console.log('Status changed');
        data.all_deadlines[i].completedOn = (new Date()).toDateString();
        break;
      }
    }
    data.save();
    res.redirect('/');
  })
})

// Delete the task
app.post('/task/delete/:courseid/:taskid',function(req,res){
  // console.log('courseid:'+req.params.courseid);
  // console.log('taskid: '+req.params.taskid);
  Course.findOneAndUpdate({_id: req.params.courseid},{/*$pullAll: {all_deadlines: [req.params.taskid]}*/},function(err,data){
    if(err)
      console.log(err);
    for(var i=0;i<data.all_deadlines.length;i++){
      if(data.all_deadlines[i]._id==req.params.taskid){
        data.all_deadlines.splice(i,1);
        break;
      }
    }
    data.save();
    res.redirect('/');
  });
});

port = process.env.PORT || 3000
app.listen(port,()=>{console.log('Server started at '+port)});
