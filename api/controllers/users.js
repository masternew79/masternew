const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
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
    register: async (req, res, next) => {
        try {
            const postData = req.body;
            // Check email exists
            const user = await User.find({ email: postData.email });
            // If email exist
            if (user.length > 0) {
                return res.status(409).json({ message: "Email already exists"});
            }
            // password, passwordConfirm not match
            if (postData.password !== postData.passwordConfirm) {
                res.status(500).json({message: "Password and password confirm not match"});    
            }
            // Store new user
            const hash = bcrypt.hashSync(postData.password, config.saltRound);
            const newUser = new User({
                _id: mongoose.Types.ObjectId(),
                email: postData.email,
                password: hash
            });
            const userCreated = await newUser.save();

            res.status(201).json({
                message: "User created",
                data: {
                    userId: userCreated._id
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Something wrong"});
        }
    },
    // GET
    show: async (req, res, next) => {
        try {
            // req.userData from check-auth
            if (req.userData.id == req.params.id) {
                const user = await User.findById(req.userData.id).select('-password');
    
                if(user) {
                    res.status(200).json({
                        data: user
                    });
                } else {
                    res.status(500).json({error: "No valid entry found for provide ID"});
                }
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Some thing wrong"});
        }
    },
    // PUT, PATCH
    update: async (req, res, next) => {
        
    },
    
    login: async (req, res, next) => {
        try {
            const user = await User.find({email: req.body.email});
            // Attemp email
            if (user.length < 1) {
                return res.status(401).json({ message: "Auth failed" });
            }
            // Check password
            const match = bcrypt.compare(req.body.password, user[0].password)
            if (!match) {
                return res.status(401).json({ message: "Auth failed" });
            }
            const userData = { 
                email: user[0].email, 
                id: user[0]._id 
            };
            // Genarate token
            const token = await jwt.sign(userData, process.env.JWT_KEY, { expiresIn: config.tokenLife });
            // Genarate refresh token
            const refreshToken = await jwt.sign(userData, process.env.JWT_KEY, { expiresIn: config.refreshTokenLife });
            // Response sent to client
            const response = {
                message: "Auth successful",
                token: token,
                refreshToken: refreshToken
            };

            res.status(200).json(response);
        } catch (error) {
            console.log(error);
            res.status(500).json({error});
        }
    },

    token: async (req, res, next) => {
        try {
            const refreshToken = req.body.refreshToken || '';
            if (refreshToken) {
                // Data from token
                const userData = await jwt.verify(refreshToken, process.env.JWT_KEY);
                // Check in DB
                const user = await User.findById(userData.id);
                if (user) {
                    // Create new token
                    let data = {
                        id: user._id,
                        email: user.email
                    }
                    const token = await jwt.sign(data, process.env.JWT_KEY, { expiresIn: config.tokenLife });
                    res.status(200).json({token})
                } else {
                    res.status(404).json({message: 'Auth fail 1'})
                }
            } else {
                res.status(404).json({message: 'Auth fail 2'})
            }
        } catch (error) {
            console.log(error);
            res.status(404).json({message: 'Invalid request'})
        }
    },
    // DELETE
    destroy: async (req, res, next) => {
        try {
            const result = await User.findByIdAndRemove({_id: req.params.id});
            if (result) {
                res.status(200).json({ message: "User removed.", result: result});
            } else {
                res.status(500).json({message: "User not found"});
            }
        } catch (error) {
            res.status(500).json({error});
        }
    },
}