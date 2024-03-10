const { Router } = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new Ticket
router.post('/', auth, async (req, res) => {
    try {
        const { creditCard, route, purchaseDate, cost, seat } = req.body;
        const ticket = new Ticket({ creditCard, route, purchaseDate, cost, seat });
        await ticket.save();
        res.status(201).json(ticket);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all Tickets
router.get('/', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('creditCard').populate('route');
        res.json(tickets);
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
        await Ticket.findByIdAndRemove(req.params.id);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;
