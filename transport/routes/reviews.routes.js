const { Router } = require('express');
const Review = require('../models/Review');
const auth = require('../middleware/auth.middleware');
const Transport = require('../models/Transport');
const router = Router();

// Create a new Review
router.post('/', auth, async (req, res) => {
    try {
        const { user, text, rating, route } = req.body;
        const date = new Date();
        const transport = await Transport.findById(route.transport);
        const carrier = transport.carrier;
        const review = new Review({ user, text, date, rating, carrier });
        await review.save();
        res.status(201).json({ message: 'Review created' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Reviews of user
router.get('/:user', auth, async (req, res) => {
    try {
        const user = req.params.user;
        const reviews = await Review.find({ user });
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Reviews of carrier
router.get('/carriers/:carrier', auth, async (req, res) => {
    try {
        const carrier = req.params.carrier;
        const reviews = await Review.find({ carrier }).populate({
            path: 'user',
            model: 'User',
        });
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
