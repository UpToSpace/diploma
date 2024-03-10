const { Router } = require('express');
const Route = require('../models/Route');
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new Route
router.post('/', auth, async (req, res) => {
    try {
        const { transport, departure, destination, departureTime, arrivalTime, price } = req.body;
        const route = new Route({ transport, departure, destination, departureTime, arrivalTime, price });
        await route.save();
        res.status(201).json(route);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Routes
router.get('/', auth, async (req, res) => {
    try {
        const { transports } = req.query;
        const routes = await Route.find().populate('transport').where('transport').in(transports);
        res.json(routes);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Update a Route
router.put('/:id', auth, async (req, res) => {
    try {
        const { departure, destination, departureTime, arrivalTime, price } = req.body;
        const route = await Route.findByIdAndUpdate(req.params.id, { departure, destination, departureTime, arrivalTime, price }, { new: true });
        res.json(route);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a Route
router.delete('/:id', auth, async (req, res) => {
    try {
        await Route.findByIdAndRemove(req.params.id);
        res.json({ message: 'Route deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;
