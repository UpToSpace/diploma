const { Router } = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth.middleware');
const router = Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new Ticket
// router.post('/', auth, async (req, res) => {
//     try {
//         const { route, purchaseDate, cost, seat } = req.body;
//         const ticket = new Ticket({ route, purchaseDate, cost, seat });
//         await ticket.save();
//         res.status(201).json(ticket);
//     } catch (e) {
//         res.status(500).json({ message: 'Something went wrong' });
//     }
// });

// Get all user's Tickets
router.get('/user/:id', auth, async (req, res) => {
    try {
        // Populate 'route' and within it, also populate 'transport'
        const tickets = await Ticket.find({ user: req.params.id })
            .populate({
                path: 'route',
                populate: {
                    path: 'transport',  // Assuming 'transport' is a reference in the 'route' document
                    model: 'Transport' // Replace 'Transport' with the actual model name if different
                }
            });

        res.json(tickets);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a Ticket by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('route');
        res.json(ticket);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Update a Ticket
router.put('/:id', auth, async (req, res) => {
    try {
        const { cost, seat } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { cost, seat }, { new: true });
        res.json(ticket);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a Ticket
router.delete('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        const chargeId = ticket.chargeId;
        try {
            await stripe.refunds.create({ charge: chargeId });
        } catch (refundError) {
            console.error(`Refund failed for charge ${chargeId}:`, refundError);
        }
        await Ticket.findByIdAndRemove(req.params.id);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(e);
    }
});

module.exports = router;
