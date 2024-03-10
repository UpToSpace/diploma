const { Router } = require('express');
const CreditCard = require('../models/CreditCard');
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new CreditCard
router.post('/', auth, async (req, res) => {
    try {
        const { user, name, cartNumber, expirationDate, cvv } = req.body;
        const creditCard = new CreditCard({ user, name, cartNumber, expirationDate, cvv });
        await creditCard.save();
        res.status(201).json(creditCard);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get all CreditCards
router.get('/', auth, async (req, res) => {
    try {
        const creditCards = await CreditCard.find();
        res.json(creditCards);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a single CreditCard by id
router.get('/:id', auth, async (req, res) => {
    try {
        const creditCard = await CreditCard.findById(req.params.id);
        res.json(creditCard);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Update a CreditCard
router.put('/:id', auth, async (req, res) => {
    try {
        const { user, name, cartNumber, expirationDate, cvv } = req.body;
        const creditCard = await CreditCard.findByIdAndUpdate(req.params.id, { user, name, cartNumber, expirationDate, cvv }, { new: true });
        res.json(creditCard);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a CreditCard
router.delete('/:id', auth, async (req, res) => {
    try {
        await CreditCard.findByIdAndRemove(req.params.id);
        res.json({ message: 'CreditCard deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;
