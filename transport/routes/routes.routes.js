const { Router } = require('express');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const config = require('config');
const stripe = require('stripe')(config.get('stripeSecretKey'));
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
router.get('/all', auth, async (req, res) => {
    try {
        const { departure, destination, startDate, numberOfSeats, conditioners, wifi, power } = req.query;
        console.log(departure, destination, startDate, numberOfSeats);

        const departureCity = departure.split(',')[0];
        const destinationCity = destination.split(',')[0];
        const departureCountry = departure.split(',')[1];
        const destinationCountry = destination.split(',')[1];

        if (new Date(startDate) < new Date()) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // Build the query object dynamically based on conditioners parameter
        let query = {
            "departure.city": departureCity,
            "departure.country": departureCountry,
            "destination.city": destinationCity,
            "destination.country": destinationCountry,
            "departure.date": startDate
        };

        // Only add conditioners to the query if the conditioners parameter is true
        if (conditioners === 'true') {
            query["transport.conditioners"] = conditioners === 'true';  // Assuming conditioners is a string 'true' or 'false'
        }

        // Add wifi and power conditions only if they are specified
        if (wifi === 'true') {
            query["transport.wifi"] = wifi === 'true';
        }

        if (power === 'true') {
            query["transport.power"] = power === 'true';
        }

        const routes = await Route.find(query);
        res.json(routes);
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

// Get all booked Seats for a Route
router.get('/:id/seats', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ route: req.params.id });
        const bookedSeats = tickets.map(ticket => ticket.seat);
        res.json(bookedSeats);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// get all routes by city
router.get('/city/:city', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000

        const now = new Date(); // Current date and time
        const departures = await Route.find({
            "departure.city": req.params.city,
            // "destination.date": today,
            // "destination.time": { $gt: now.toISOString().substr(11, 5) } // compare as "HH:MM"
        }).populate(
            {
                path: 'transport',
                model: 'Transport'
            });
        const destinations = await Route.find({
            "destination.city": req.params.city,
            // "departure.date": today,
            // "departure.time": { $lt: now.toISOString().substr(11, 5) } // compare as "HH:MM"
        }).populate(
            {
                path: 'transport',
                model: 'Transport'
            });;
        res.json(departures.concat(destinations));
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// get all locations
router.get('/locations', auth, async (req, res) => {
    try {
        const locations = await Route.find({})
        res.json(locations);
    } catch (e) {
        console.log(e);
        console.log('Something went wrong');
        res.status(404).json({ message: e });
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
        const route = Route.findById(req.params.id);
        const tickets = await Ticket.find({ route: req.params.id });

        for (const ticket of tickets) {
            // Assuming `chargeId` is stored in your Ticket model
            const chargeId = ticket.chargeId;
            try {
                await stripe.refunds.create({ charge: chargeId });
            } catch (refundError) {
                console.error(`Refund failed for charge ${chargeId}:`, refundError);
                // Consider how you want to handle failed refunds
                // Maybe log them for manual review or try again
            }
        }

        // After processing refunds, you can safely delete the tickets
        await Ticket.deleteMany({ route: route._id });
        await Route.findByIdAndRemove(req.params.id);
        res.json({ message: 'Route deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;
