const { Router } = require('express');
const Review = require('../models/Review');
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new Review
router.post('/', auth, async (req, res) => {
    try {
        const { user, text, date, rating } = req.body;
        const review = new Review({ user, text, date, rating });
        await review.save();
        res.status(201).json(review);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Reviews
router.get('/', auth, async (req, res) => {
    try {
        const reviews = await Review.find().populate('user');
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Update a Review
router.put('/:id', auth, async (req, res) => {
    try {
        const { text, rating } = req.body;
        const review = await Review.findByIdAndUpdate(req.params.id, { text, rating }, { new: true });
        res.json(review);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a Review
router.delete('/:id', auth, async (req, res) => {
    try {
        await Review.findByIdAndRemove(req.params.id);
        res.json({ message: 'Review deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;
