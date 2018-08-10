const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi')

const {User, validate} = require('../models/user');
const config = require('../../config');

module.exports = {
    // GET
    index: async (req, res, next) => {
        const users = await User.find();
        res.status(200).json({
            data: users
        })
    },
    // POST
    register: async (req, res) => {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send('User already registered.');

        // password, passwordConfirm not match
        if (req.body.password !== req.body.passwordConfirm)
            return res.status(400).send("Password and password confirm not match");    

        // Hash password
        const hash = bcrypt.hashSync(req.body.password, config.saltRound);

        // Save new user
        user = new User({
            _id: mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash
        });
        await user.save();

        res.status(201).send("Register successfully");
    },
    login: async (req, res) => {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send('Invalid email or password.');

        // Check password
        const matchPassword = await bcrypt.compare(req.body.password, user.password)
        if (!matchPassword) return res.status(401).send('Invalid email or password.');

        // Generate token, refreshToken
        const payload = { email: user.email, _id: user._id, isAdmin: user.isAdmin };
        const token = await jwt.sign(payload, process.env.JWT_KEY, { expiresIn: config.tokenLife });
        const refreshToken = await jwt.sign(payload, process.env.JWT_KEY, { expiresIn: config.refreshTokenLife });

        // Response sent to client
        const response = {
            _id: user._id,
            message: "Auth successful",
            token: token,
            refreshToken: refreshToken,
            favorite: user.favorite
        };

        res.status(200).json(response);
    },
    // GET
    show: async (req, res) => {
        const user = await User.findById(req.userData.id).select('-password -isAdmin -__v');
        res.send(user);
    },
    // PUT, PATCH
    update: async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User with the given ID was not found.');

        if (user._id != req.userData._id) return res.status(403).send('Not accept.');

        if (req.body.password) {
            if (req.body.password !== req.body.passwordConfirm)
            return res.status(400).send("Password and password confirm not match");    

            // Hash password
            const hash = bcrypt.hashSync(req.body.password, config.saltRound);
            user.password = hash;
        }
        if (req.body.favorite) {
            user.favorite = req.body.favorite;
        }
        await user.save();

        res.send("Updated successfully");
    },
    // POST /token
    token: async (req, res) => {
        const refreshToken = req.body.refreshToken || '';
        if (!refreshToken) return res.status(400).send('Refresh token is required');
        
        // Data from token
        const userData = await jwt.verify(refreshToken, process.env.JWT_KEY);

        // Check in user exist
        const user = await User.findById(userData._id);
        if (!user) return res.status(401).send('Auth failed');
               
        // Create new token
        const token = await jwt.sign({ id: user._id, email: user.email }, process.env.JWT_KEY, { expiresIn: config.tokenLife });

        res.send({token});
    },
}