const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        //console.log(decoded)
        const user = await User.findOne({ _id: decoded.id });
        //console.log(user)
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Нет доступа' });
        }
        next();
    } catch (e) {
        //console.log("middlware " + e);
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: e.message });
        }
        res.status(401).json({ message: 'Пользователь не авторизован' });
    }
}