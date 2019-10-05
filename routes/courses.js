const { Router } = require('express');
const router = Router();

const auth = require('../middleware/auth');

const Course = require('../models/Course');


function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}


router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('price title img');

    res.render('courses', {
      title: 'Courses',
      courses,
      userId: req.user ? req.user._id.toString() : null,
      isCourses: true
    });
  } catch (err) {
    console.error(err);
  }
});


router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    res.render('course', {
      title: course.title,
      course
    });
  } catch (err) {
    console.error(err);
  }
});


router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) return res.redirect('/');

  try {
    const course = await Course.findById(req.params.id);

    if (!isOwner(course, req)) return res.redirect('/courses');

    res.render('course-edit', {
      title: 'Course edit',
      course
    });
  } catch (err) {
    console.error(err);
  }
});


router.post('/edit', auth, async (req, res) => {
  const { id } = req.body;

  delete req.body.id;

  try {
    const course = await Course.findById(id);

    if (!isOwner(course, req)) return res.redirect('/courses');

    Object.assign(course, req.body);

    await course.save();

    res.redirect('/courses');
  } catch (err) {
    console.error(err);
  }
});


router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id
    });

    res.redirect('/courses');
  } catch (err) {
    console.error(err);
  }
});


module.exports = router;
