const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        //console.log('hello');
        //console.log("middleware " + token);
        if (!token) {
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }
        jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        next();
    } catch (e) {
        //console.log("middlware " + e);
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: e.message });
        }
        res.status(401).json({ message: 'Пользователь не авторизован' });
    }
}