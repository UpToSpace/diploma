const { Router } = require('express');
const CreditCard = require('../models/CreditCard');
const auth = require('../middleware/auth.middleware');
const config = require('config');
const router = Router();
const stripe = require('stripe')(config.get('stripeSecretKey'));
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// Make payment and optionally save the credit card
router.post('/charge', auth, async (req, res) => {
    try {
        let { token, saveCard, amount, userId, routeId, seats } = req.body;
        let customer = null;

        if (saveCard || seats.length > 1) {
            // Create a customer if the card needs to be saved or multiple charges need to be created
            customer = await stripe.customers.create({
                source: token
            });
        }

        // Process each seat as a separate charge and ticket using a for...of loop
        for (const seat of seats) {
            const charge = await stripe.charges.create({
                amount: Math.round(amount * 100),
                currency: 'byn',
                customer: customer ? customer.id : undefined, // Use customer ID instead of token if customer exists
                source: customer ? undefined : token, // Use token if customer does not exist
                description: `Charge for seat ${seat} on route ${routeId}`
            });

            if (saveCard) {
                const last4 = charge.payment_method_details.card.last4;
                const candidate = await CreditCard.findOne({ user: userId, last4 });
                if (!candidate) {
                    await new CreditCard({
                        user: userId,
                        last4,
                        stripeCustomerId: customer.id
                    }).save();
                }
                saveCard = false; // Save only the first card
            }

            const ticket = new Ticket({
                user: userId,
                route: routeId,
                purchaseDate: Date.now(),
                cost: amount,
                seat,
                chargeId: charge.id
            });
            await ticket.save();
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});



// Pay with a saved card
router.post('/charge/saved', auth, async (req, res) => {
    try {
        const { cardId, amount, routeId, seats, userId } = req.body;
        const creditCard = await CreditCard.findById(cardId);

        if (!creditCard) {
            return res.status(404).json({ message: 'Credit card not found' });
        }
        seats.forEach(async seat => {
            const charge = await stripe.charges.create({
                amount: Math.round(amount * 100),
                currency: 'byn',
                customer: creditCard.stripeCustomerId,
                description: `Charge for seat ${seat} on route ${routeId}`
            });

            const ticket = new Ticket({
                user: userId,
                route: routeId,
                purchaseDate: Date.now(),
                cost: amount,
                seat,
                chargeId: charge.id
            });
            await ticket.save();
        });

        res.json({ success: true });
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
