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
    signup: async (req, res, next) => {
        try {
            // Check email exists
            const user = await User.find({ email: req.body.email });
            if (user.length > 0) {
                return res.status(409).json({ message: "Email already exists"});
            }
            // Store new user
            const hash = bcrypt.hashSync(req.body.password, config.saltRound);
            const newUser = new User({
                _id: mongoose.Types.ObjectId(),
                email: req.body.email,
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
            res.status(500).json(error);
        }
    },
    // GET
    show: async (req, res, next) => {
        try {
            const id = req.params.id;
            const user = await User.findById(id).select('_id email');

            if(user) {
                res.status(200).json({
                    data: user
                });
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            res.status(500).json({error});
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
            // Genarate token
            const token = await jwt.sign(
                { email: user[0].email, id: user[0]._id, isAdmin: user[0].isAdmin }, 
                process.env.JWT_KEY, 
                { expiresIn: "1h" }
            );
            res.status(200).json({
                message: "Auth successful",
                token: token
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({error});
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