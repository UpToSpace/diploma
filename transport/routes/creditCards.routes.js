const { Router } = require('express');
const CreditCard = require('../models/CreditCard');
const auth = require('../middleware/auth.middleware');
const config = require('config');
const router = Router();
const stripe = require('stripe')(config.get('stripeSecretKey'));
const Ticket = require('../models/Ticket');

// Make payment and Create a new CreditCard
router.post('/charge', auth, async (req, res) => {
    try {
        const { token, saveCard, amount, userId, routeId, seat } = req.body;
        // Process payment
        const charge = await stripe.charges.create({
            amount: Math.round(amount * 100), 
            currency: 'byn',
            source: token,
            description: 'Test Charge',
        });

        if (saveCard) {
            const candidate = await CreditCard.findOne({ user: userId, cardNumber: charge.source.last4 });
            if (candidate) {
                return res.status(400).json({ message: 'Card already exists' });
            }
            const userCard = new CreditCard({
                // Assuming you have a way to associate it with a user
                user: userId,
                cardToken: token,
                cardNumber: charge.source.last4,
            });
            await userCard.save();
        }

        const creditCard = await CreditCard.findOne({ user: userId, cardNumber: charge.source.last4 });

        const ticket = new Ticket({
            creditCard: creditCard._id,
            route: routeId,
            purchaseDate: Date.now(),
            cost: amount,
            seat,
            chargeId: charge.id
        });
        await ticket.save();

        res.json(charge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all user's CreditCards
router.get('/', auth, async (req, res) => {
    try {
        const user = req.query.userId;
        const creditCards = await CreditCard.find({ user });
        res.json(creditCards);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(e);
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
