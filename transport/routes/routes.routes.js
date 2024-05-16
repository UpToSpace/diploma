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
        const departureDate = new Date(`${departure.date}T${departure.time}`);
        const destinationDate = new Date(`${destination.date}T${destination.time}`);

        // Check for existing routes with the same transport and overlapping dates
        const existingRoute = await Route.findOne({
            transport: transport,
            $or: [
                {
                    "departure.date": {
                        $lte: destinationDate,
                        $gte: departureDate
                    }
                },
                {
                    "destination.date": {
                        $lte: destinationDate,
                        $gte: departureDate
                    }
                }
            ]
        });

        if (existingRoute) {
            return res.status(400).json({ message: 'Transport is already in use during the specified dates.' });
        }
        departure.date = departureDate;
        destination.date = destinationDate;
        delete departure.time;
        delete destination.time;
        const route = new Route({ transport, price, departure, destination });
        await route.save();
        res.status(201).json(route);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// get all locations
router.get('/locations', async (req, res) => {
    try {
        const locations = await Route.find({
            "departure.date": { $gt: new Date() }
        });
        res.json(locations);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Routes with params
router.get('/all', auth, async (req, res) => {
    try {
        const { departure, destination, numberOfSeats, conditioners, wifi, power, startDate } = req.query;
        console.log(departure, destination, startDate, numberOfSeats, wifi, power, conditioners);

        const departureCity = departure.split(',')[0];
        const destinationCity = destination.split(',')[0];
        const departureCountry = departure.split(',')[1];
        const destinationCountry = destination.split(',')[1];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000

        if (startDate && new Date(startDate) < today) {
            return res.status(400).json({ message: 'Invalid date: Start date cannot be in the past' });
        }

        // Build the query object dynamically based on conditioners parameter
        let query = {
            "departure.city": departureCity,
            "departure.country": departureCountry,
            "destination.city": destinationCity,
            "destination.country": destinationCountry
        };

        if (startDate === undefined) {
            query["departure.date"] = { $gt: today };
        }

        if (startDate) {
            const departureDate = new Date(startDate);
            departureDate.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000
            query["departure.date"] = { $gt: departureDate };
        }

        console.log(query)

        const allRoutes = await Route.find(query).populate({
            path: 'transport',
            model: 'Transport',
            match: {
                wifi: wifi === 'true' ? true : { $exists: true },
                power: power === 'true' ? true : { $exists: true },
                conditioners: conditioners === 'true' ? true : { $exists: true }
            }
        });

        const routes = await Promise.all(allRoutes.map(async (route) => {
            const ticketsSold = await Ticket.countDocuments({ route: route._id });
            const seatsAvailable = route.transport.capacity - ticketsSold;
            if (seatsAvailable >= numberOfSeats) {
                return route;
            }
        }));
        if (!routes || !routes[0]) {
            return res.status(404).json({ message: 'Routes not found' });
        }
        res.json(routes);
    } catch (e) {
        console.log(e);
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

// get 3 popular routes
router.get('/popular', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const routes = await Route.find({
            departure: { $gt: today }
        })
            .sort({ 'departure.date': 1 })
            .limit(3)
        res.json(routes);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});


// Update a Route
router.put('/:id', auth, async (req, res) => {
    try {
        const { departure, destination, departureTime, arrivalTime, price } = req.body;
        const departureDate = new Date(`${departure.date}T${departure.time}`);
        const destinationDate = new Date(`${destination.date}T${destination.time}`);
        departure.date = departureDate;
        destination.date = destinationDate;
        delete departure.time;
        delete destination.time;
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
