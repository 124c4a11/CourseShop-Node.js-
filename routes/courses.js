const { Router } = require('express');
const router = Router();

const Course = require('../models/Course');


router.get('/', async (req, res) => {
  const courses = await Course.getAll();

  res.render('courses', {
    title: 'Courses',
    courses,
    isCourses: true
  });
});


router.get('/:id', async (req, res) => {
  const course = await Course.getById(req.params.id);

  res.render('course', {
    title: course.title,
    course
  });
});


router.get('/:id/edit', async (req, res) => {
  if (!req.query.allow) return res.redirect('/');

  const course = await Course.getById(req.params.id);

  res.render('course-edit', {
    title: 'Course edit',
    course
  });
});


router.post('/edit', async (req, res) => {
  await Course.update(req.body);

  res.redirect('/courses');
});


module.exports = router;
