const { Router } = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth.middleware');
const router = Router();
const config = require('config');
const stripe = require('stripe')(config.get('stripeSecretKey'));

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
router.get('/:id', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.params.id }).populate('route');
        res.json(tickets);
    } catch (e) {
        console.log(e);
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
    }
});

module.exports = router;
