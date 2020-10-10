const mongoose = require('mongoose');
const { Schema } = mongoose;

var taskSchema = new mongoose.Schema({
  deadline: String,
  coursename: String,
  type: String,
  description: String,
  createdOn: String,
  completed: Boolean,
  completedOn: String,
  // deleteOn: String,
  _taskid: Schema.Types.ObjectId
})

var CourseSchema = new mongoose.Schema({
  coursename: String,
  all_deadlines: [taskSchema]
});

const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
