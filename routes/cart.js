const { Router } = require('express');
const router = Router();

const auth = require('../middleware/auth');

const Course = require('../models/Course');


function mapCartItems(cart) {
  return cart.items.map((item) => ({
    ...item.courseId._doc,
    id: item.courseId.id,
    count: item.count
  }));
}


function computePrice(courses) {
  return courses.reduce((total, { price, count }) => {
    return total += price * count;
  }, 0);
}


router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user
      .populate('cart.items.courseId')
      .execPopulate('');

    const courses = mapCartItems(user.cart);

    res.render('cart', {
      title: 'Cart',
      isCart: true,
      courses,
      price: computePrice(courses)
    });
  } catch (err) {
    console.error(err);
  }
});


router.post('/add', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.id);

    await req.user.addToCart(course);

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
  }
});


router.delete('/remove/:id', auth, async (req, res) => {
  try {
    await req.user.removeFromCart(req.params.id);

    const user = await req.user
      .populate('cart.items.courseId')
      .execPopulate();

    const courses = mapCartItems(user.cart);

    const cart = {
      courses,
      price: computePrice(courses)
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
  }
});


module.exports = router;
