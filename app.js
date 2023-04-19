import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()

import user from './routers/user.js';

import './userDetails.js'
import './imageDetails.js'

const app = express();
// const PORT = process.env.PORT || 5000;
// const mongoUrl = "mongodb+srv://thunguyen:thulogin@cluster0.ayjzxf5.mongodb.net/?retryWrites=true&w=majority";
// const process.env.JWT_SECRET = "hihdoiwef546ud84ijbr437[djscjs|bjdcb";

app.use(express.json());
app.use(bodyParser.json({limit: '200mb', extended: true}));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.set("view engine", "ejs");

app.use('/user', user)

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true})
.then(() => {
    console.log("Connected to database");
    app.listen(process.env.PORT, function () {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((e) => console.log(e));



const User = mongoose.model("UserInfo");
const Images = mongoose.model("ImageDetails")


app.post("/register", async (req, res) => {
    const {username, email, password, role} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);

    try {
        const oldUser = await User.findOne({email});
        if (oldUser) {
            return res.send({error: "User Exists"});
        }
        await User.create({username, email, password: encryptedPassword, role});
        res.send({status: "ok"});
    } catch (error) {
        res.status({status: "error"});
    }
});

app.post("/login-user", async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (!user) 
        return res.json({error: "User not found"});
    
    // console.log(password, user.password);
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({
            email: user.email
        }, process.env.JWT_SECRET, {expiresIn: '1d'});

        if (res.status(201)) {
            console.log(token, '--token');
            return res.json({status: "ok", accessToken: token, userId: user._id, user});
        } else {
            return res.json({error: "error"});
        }
    }
    res.json({status: "error", error: "Invalid password"});
});

app.post("/userData", async (req, res) => {
    const accessToken = req.headers.token.split(' ')[1];
    try {
        const user = jwt.verify(accessToken, process.env.JWT_SECRET
            , (err, res) => {
                if (err) {
                    console.log(err);
                    return "token expired";
                }
                return res;
            }
        );
        if (user === "token expired") {
            return res.send({status: "error", data: "token expired"});
        }

        const email = user.email;
        User.findOne({email: email}).then((data) => {
            res.send({status: "ok", data: data});
        }).catch((error) => {
            res.send({status: "error", data: error});
        });
    } catch (err) {}
});

app.put("/update-userData/:userId", async (req, res) => {
    const accessToken = req.headers.token.split(' ')[1];
    const { userId } = req.params;
    const { username, email, avatar } = req.body;
    console.log(req.body, 'body---');

    const oldUser = await User.findOne({_id: userId});
    if (!oldUser) {
        return res.json({status: "User Not Exists!!"});
    }

    try {
        const user = jwt.verify(accessToken, process.env.JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired";
            }
            return res;
        });

        if (user === "token expired") {
            return res.send({status: "error", data: "token expired"});
        }

        await User.updateOne(
            {
                _id: userId
            },
            {
                $set: {
                    username,
                    email,
                    avatar
                },
            }
        )
        const updatedUser = await User.findOne({_id: userId})

        res.send({ status: "Update successful", data: updatedUser})
        // res.render("index", {email: verify.email, status: "verified"})
    } catch (error) {
        res.send("Something went wrong");
    }
});



app.post("/forgot-password", async (req, res) => {
    const {email} = req.body;
    try {
        const oldUser = await User.findOne({email});
        if (!oldUser) {
            return res.json({status: "User Not Exists"});
        }
        const secret = process.env.JWT_SECRET + oldUser.password;
        const token = jwt.sign({
            email: oldUser.email,
            id: oldUser._id
        }, secret, {expiresIn: "5m"});
        const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
              user: 'thunguyenthiminh192@gmail.com',
              pass: ''
            }
          });
          
          var mailOptions = {
            from: 'thunguyenthiminh192@gmail.com',
            to: oldUser.email,
            subject: 'Password Reset',
            text: link
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    } catch (err) {}
});

app.get("/reset-password/:id/:token", async (req, res) => {
    const {id, token} = req.params;
    console.log(req.params);
    const oldUser = await User.findOne({_id: id});
    if (!oldUser) {
        return res.json({status: "User Not Exists!!"});
    }
    const secret = process.env.JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        // console.log(verify);
        res.render("index", {email: verify.email, status: "Not Verified"});
    } catch (error) {
        console.log(error);
        res.send("Not Verified");
    }
});

app.post("/reset-password/:id/:token", async (req, res) => {
    const {id, token} = req.params;
    const {password} = req.body

    const oldUser = await User.findOne({_id: id});
    if (!oldUser) {
        return res.json({status: "User Not Exists!!"});
    }
    const secret = process.env.JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.updateOne(
            {
            _id: id
            },
            {
                $set: {
                    password: encryptedPassword
                },
            }
        )
        // res.json({ status: "Password updated"})
        res.render("index", {email: verify.email, status: "verified"})
    } catch (error) {
        console.log(error);
        res.send("Something went wrong");
    }
});

app.get("/getAllUser", async (req, res) => {
    try {
        const allUser = await User.find({});
        res.send({status: "ok", data: allUser});
    } catch (error) {
        console.log(error);
    }
})

app.post("/deleteUser", async (req, res) => {
    const {userId} = req.body
    try {
        await User.deleteOne(
            {_id: userId}
        )
        res.send({ status: "ok"})
    } catch (error) {
        console.log(error);
    }
})

app.post("/upload-image", async (req, res) => {
    const {base64} = req.body;
    try {
        await Images.create({image: base64})
        res.send({status: "ok"})
    } catch (error) {
        res.send({status: "error", data: error})
    }
})

app.get("/get-image", async (req, res) => {
    try {
        await Images.find({}).then(data => {
            res.send({status: "ok", data: data})
        })
    } catch (error) {

    }
})

app.get("/paginatedUsers", async (req, res) => {
    const allUser = await User.find({})
    const page = req.query.page
    const limit = req.query.limit
    const startIndex = (page - 1) * 1 
    const lastIndex = page*limit

    const results = {}
    results.totalUser = allUser.length;
    results.pageCount=Math.ceil(allUser.length/limit);

    if(lastIndex < allUser.length) {
        results.next = {
            page: parseInt(page) + 1,
        }
    }

    if(startIndex > 0){
        results.prev = {
            page: parseInt(page) - 1,
        }
    }

    results.result = allUser.slice(startIndex, lastIndex)
    res.json(results)
})