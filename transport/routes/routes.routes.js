const { Router } = require('express');
const Route = require('../models/Route');
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new Route
router.post('/', auth, async (req, res) => {
    try {
        const { transport, price, departure, destination } = req.body;
        const route = new Route({ transport, price, departure, destination });
        await route.save();
        res.status(201).json(route);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Routes with params
router.get('/all', auth, async (req, res) => { // TODO number of seats!!
    try {
        const { departure, destination, startDate, numberOfSeats } = req.query;
        console.log(departure, destination, startDate, numberOfSeats);
        const departureCity = departure.split(',')[0];
        const destinationCity = destination.split(',')[0];
        const departureCountry = departure.split(',')[1];
        const destinationCountry = destination.split(',')[1];
        //console.log(departureCity);
        if (new Date(startDate) < new Date()) {
            return res.status(400).json({ message: 'Invalid date' });
        }
        const routes = await Route.find({ 
            "departure.city": departureCity,
            "departure.country": departureCountry,
            "destination.city": destinationCity,
            "destination.country": destinationCountry, 
            "departure.date": startDate
        });
        res.json(routes);
        //console.log(routes);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get route by id
router.get('/:id', auth, async (req, res) => {
    try {
        const route = await Route.findById(req.params.id)
        .populate(
            {
                path: 'transport',
                model: 'Transport'
            }
        );
        res.json(route);
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
