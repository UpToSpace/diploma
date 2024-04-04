const { Router } = require('express');
const Transport = require('../models/Transport');
const Route = require('../models/Route');
const auth = require('../middleware/auth.middleware');
const router = Router();

// Create a new Transport
// /api/transports
router.post('/', auth, async (req, res) => {
    try {
        const { carrier, number, brand, model, yearOfBuild, capacity, seatsLayout } = req.body;
        const candidate = await Transport.findOne({ number });
        if (candidate) {
            return res.status(400).json({ message: `Transport ` + number + ` already exists` });
        }
        const transport = new Transport({ carrier, number, brand, model, yearOfBuild, capacity, seatsLayout });
        await transport.save();
        res.status(201).json({ message: `Transport ` + number + ` added successfully`});
    } catch (e) {
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

// Update a Transport
router.put('/:id', auth, async (req, res) => {
    try {
        const { number, brand, model, yearOfBuild, capacity, seatsLayout } = req.body;
        const transport = await Transport.findByIdAndUpdate(req.params.id, { number, brand, model, yearOfBuild, capacity, seatsLayout }, { new: true });
        res.json(transport);
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a Transport
router.delete('/:id', auth, async (req, res) => {
    try {
        await Transport.findByIdAndRemove(req.params.id);
        res.json({ message: 'Transport deleted successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;
