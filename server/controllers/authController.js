const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email.endsWith('.edu')) {
            return res.status(400).json({ status: 'fail', message: 'Email must end in .edu' });
        }

        const newUser = await User.create({
            name,
            email,
            password
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
