var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');
const { Schema } = mongoose;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(express.static(__dirname + '/public'));
app.set('views', './public');
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/yotei-1",{useFindAndModify: false});

var taskSchema = new mongoose.Schema({
  deadline: String,
  coursename: String,
  type: String,
  description: String,
  _taskid: Schema.Types.ObjectId
})

var CourseSchema = new mongoose.Schema({
  coursename: String,
  all_deadlines: [taskSchema]
});
var Course = mongoose.model("Course", CourseSchema);

app.get('/',(req,res)=>{
  recentTasks = [];
  // Course.find({all_deadlines: })
  Course.find({all_deadlines: {$not: {$size: 0}}},function(err,data){
    if(err) {console.log(err);}
    if(data==undefined){res.render('index.ejs',{data: {}});}
    else {res.render('index.ejs',{data: data});}
  });
});

app.post('/',(req,res)=>{
  console.log(req.body)

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
    console.log(data);
    if(data){
      Course.updateOne({coursename: req.body.coursename},{ $push: { all_deadlines: {"deadline": date, "type": type, "description": req.body.descr, "coursename": req.body.coursename} } },function(err,data_1){
        if(err)
          console.log(err);
        res.redirect('/');
      });
    }
    else {
      Course.create({coursename: req.body.coursename, all_deadlines:[{"deadline": date, "type": type, "description": req.body.descr, "coursename": req.body.coursename}]},(err,data_2)=>{
        if(err){
          console.log(err);
        }
        res.redirect('/');
      });
    }
  });

});

app.post('/task/delete/:courseid/:taskid',function(req,res){
  console.log('courseid:'+req.params.courseid);
  console.log('taskid: '+req.params.taskid);
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

app.listen(3000,()=>{console.log('Server started at 3000')});
