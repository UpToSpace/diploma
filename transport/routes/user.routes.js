const { Router } = require('express');
const config = require('config');
const User = require('../models/User');
const Favourite = require('../models/Favourite');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const Transport = require('../models/Transport');
const router = Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const mongoose = require('mongoose');

// /api/user
router.get('/', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const user = await User.findOne({ _id: decoded.id });
        res.json(user.email);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user/admin/statistics
const aggregateByMonth = async (role) => {
    return User.aggregate([
        { $match: { role: { $eq: role } } },
        { $group: { _id: { $month: "$dateOfRegistration" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
};

router.get('/admin/statistics', auth, async (req, res) => {
    try {
        const usersCount = await User.countDocuments({ role: 'user' });
        const carriersCount = await User.countDocuments({ role: 'carrier' });
        const routesCount = await Route.countDocuments();

        const carriersByMonth = await aggregateByMonth('carrier');
        const usersByMonth = await aggregateByMonth('user');

        res.json({ usersCount, carriersCount, carriersByMonth, usersByMonth, routesCount });
    } catch (e) {
        console.error(e);  // More specific error handling can be done based on error types
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user/admin/carriers
router.get('/admin/carriers', auth, async (req, res) => {
    try {
        const carriers = await User.find({ role: 'carrier', activatedAsCarrier: false }, { password: 0 });
        res.json(carriers);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user/:id/statistics
router.get('/:id/statistics', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Ticket.find({ user: id }).populate('route');
        res.json(data);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user/carrier/:id/statistics
router.get('/carrier/:id/statistics', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const transports = await Transport.find({ carrier: id }, { _id: 1 });
        console.log("Transports found:", transports.length, transports);

        const routes = await Route.find({ transport: { $in: transports.map(t => t._id) } }, { _id: 1 });
        console.log("Routes found:", routes.length, routes);

        if (routes.length === 0) {
            return res.status(404).json({ message: 'No routes found for the given carrier' });
        }

        const ticketsNumber = await Ticket.find({ route: { $in: routes.map(r => r._id) } }).countDocuments();
        const cash = await Ticket.find({ route: { $in: routes.map(r => r._id) } }).select('cost').lean();

        const ticketsByMonth = await Ticket.aggregate([
            {
                $match: {
                    route: { $in: routes.map(r => r._id) }
                }
            },
            {
                $group: {
                    _id: { $month: "$purchaseDate" },
                    count: { $sum: 1 },
                    totalCost: { $sum: "$cost" }
                }
            }
        ]).sort({ _id: 1 });

        res.json({ ticketsNumber, routesNumber: routes.length, cash, ticketsByMonth });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});



// /api/carriers/:id
router.get('/carriers/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: id }, { password: 0 });
        res.json(user);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});


// /api/user/all
router.get('/all', admin, async (req, res) => {
    try {
        const { email } = req.query;
        const users = await User.find({ email: { $regex: email, $options: 'i' } }, { password: 0 }).limit(20);
        res.json(users);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user
router.post('/', auth,
    async (req, res) => {
        try {
            const { token, newPassword, oldPassword } = req.body;
            const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
            const user = await User.findOne({ _id: decoded.id })
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            //console.log(isMatch)
            if (!isMatch) {
                return res.status(400).json({ message: 'Няправiльны пароль, паспрабуйце зноў' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            const data = await User.updateOne({ _id: decoded.id }, {
                $set: {
                    password: hashedPassword
                }
            })
            res.json({ message: "Пароль паспяхова зменены" });
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'Что-то пошло не так' });
        }
    })

// /api/user/admin/carriers/:id/activate
router.put('/admin/carriers/:id/activate', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        user.activatedAsCarrier = true;
        await user.save();
        res.json({ message: 'Carrier activated' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
})

// /api/user
router.delete('/:id', admin, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();  // Start the transaction at the beginning after session starts

    try {
        const { id } = req.params;
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const user = await User.findOne({ _id: decoded.id }).session(session); // Use the session

        if (decoded.id === id) {
            throw new Error('Нельга выдалiць самога сябе'); // Throw error to handle in catch block
        }

        if (user.role === 'admin') {
            await User.deleteOne({ _id: id }).session(session);
        } else if (user.role === 'user') {
            await User.deleteOne({ _id: id }).session(session);
            await Favourite.deleteMany({ userId: id }).session(session);
            await Review.deleteMany({ user: id }).session(session);
            await CreditCard.deleteMany({ user: id }).session(session);
            const tickets = await Ticket.find({ user: id }).session(session);
            for (const ticket of tickets) {
                try {
                    await stripe.refunds.create({ charge: ticket.chargeId });
                } catch (refundError) {
                    console.error(`Refund failed for charge ${ticket.chargeId}:`, refundError);
                    throw refundError; // Throw to handle in catch block
                }
            }
            await Ticket.deleteMany({ user: id }).session(session);
        } else if (user.role === 'carrier') {
            await User.deleteOne({ _id: id }).session(session);
            const transports = await Transport.find({ carrier: id }).session(session);
            for (const transport of transports) {
                const routes = await Route.find({ transport: transport._id }).session(session);
                for (const route of routes) {
                    const tickets = await Ticket.find({ route: route._id }).session(session);
                    for (const ticket of tickets) {
                        try {
                            await stripe.refunds.create({ charge: ticket.chargeId });
                        } catch (refundError) {
                            console.error(`Refund failed for charge ${ticket.chargeId}:`, refundError);
                            throw refundError; // Throw to handle in catch block
                        }
                    }
                    await Ticket.deleteMany({ route: route._id }).session(session);
                }
                await Route.deleteMany({ transport: transport._id }).session(session);
                await Transport.findByIdAndRemove(transport._id).session(session);
            }
        }

        await session.commitTransaction(); // Commit the transaction after all operations are successful
        res.json({ message: "Карыстальнiк выдалены паспяхова" });
    } catch (e) {
        await session.abortTransaction(); // Abort the transaction on error
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так', error: e.toString() });
    } finally {
        session.endSession(); // End session in finally to ensure it always executes
    }
});


module.exports = router;