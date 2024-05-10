const { Router } = require('express');
const Transport = require('../models/Transport');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const config = require('config');
const stripe = require('stripe')(config.get('stripeSecretKey'));
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new Transport
// /api/transports
router.post('/', auth, async (req, res) => {
    try {
        const { carrier, number, brand, model, yearOfBuild, capacity, seatsLayout, conditioners, wifi, power } = req.body;
        const candidate = await Transport.findOne({ number });
        if (candidate) {
            return res.status(400).json({ message: `Transport ` + number + ` already exists` });
        }
        const transport = new Transport({ carrier, number, brand, model, yearOfBuild, capacity, seatsLayout, conditioners, wifi, power });
        await transport.save();
        res.status(201).json({ message: `Transport ` + number + ` added successfully`});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all carriers's Transports and routes
router.get('/users/:id', auth, async (req, res) => {
    try {
        const transports = await Transport.find({ carrier: req.params.id}).sort({ number: 1 })
        const routes = await Route.find().populate('transport').where('transport').in(transports);
        res.json({ transports, routes });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a Transport by id
router.get('/:id', auth, async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id);
        res.json(transport);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
})

// check if a Transport is available
router.post('/check', auth, async (req, res) => {
    try {
        const { transport, departureDate, departureTime, destinationDate, destinationTime } = req.body;
        const destinationDateTime = new Date(`${destinationDate}T${destinationTime}`);
        const departureDateTime = new Date(`${departureDate}T${departureTime}`);
        const routes = await Route.find({
            transport,
            $or: [
                {
                    departureDateTime: {
                        $gte: departureDateTime,
                        $lt: destinationDateTime
                    }
                },
                {
                    destinationDateTime: {
                        $gt: departureDateTime,
                        $lte: destinationDateTime
                    }
                }
            ]
        })
        if (routes.length > 0) {
            return res.status(404).json({ message: 'Transport is not available' });
        }
        res.json({ message: 'Transport is available' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Update a Transport
router.put('/:id', auth, async (req, res) => {
    try {
        const { number, brand, model, yearOfBuild, capacity, seatsLayout, wifi, power, conditioners } = req.body;
        const candidate = await Transport.findOne({ number, _id: { $ne: req.params.id }});
        if (candidate) {
            return res.status(400).json({ message: `Transport ` + number + ` already exists` });
        }
        const transport = await Transport.findByIdAndUpdate(req.params.id, { number, brand, model, yearOfBuild, capacity, seatsLayout, wifi, power, conditioners }, { new: true });
        res.json(transport);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a Transport
router.delete('/:id', auth, async (req, res) => {
    try {
        // Find all routes associated with the transport
        const routes = await Route.find({ transport: req.params.id });

        // Find all tickets associated with these routes and initiate refunds
        for (const route of routes) {
            const tickets = await Ticket.find({ route: route._id });

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
        }

        // With tickets handled, delete routes
        await Route.deleteMany({ transport: req.params.id });

        // Finally, delete the transport
        await Transport.findByIdAndRemove(req.params.id);

        res.json({ message: 'Transport and associated data deleted successfully, refunds issued where applicable' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

module.exports = router;
