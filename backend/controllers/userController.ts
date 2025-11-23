import { Request, Response } from "express";
import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: {
        id: string;
    }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_SPIRES = "24h";

const createToken = (userId: string) => jwt.sign({id: userId}, JWT_SECRET, {expiresIn: TOKEN_SPIRES});

// REGISTER FUNCTION
export async function registerUser(req: Request, res: Response): Promise<void> {
    const {name, email, password } = req.body as {
        name: string,
        email: string,
        password: string
    };

    if(!name || !email || !password) {
        res.status(400).json({sucess: false, message: "All fields are required."});
        return;
    }

    if(!validator.isEmail(email)) {
        res.status(400).json({success: false, message: "Invalid Email."});
        return;
    }

    if(password.length < 8 ) {
        res.status(400).json({success: false, message: "Password must be atleast 8 characters."});
        return;
    }

    try{
        if( await User.findOne({email})) {
            res.status(409).json({success: false, message: "User already exists."})
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashed});
        const token = createToken(user._id);

        res.status(201).json({success: true, token, user: {id: user._id, name: user.name, email: user.email }});

    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Server error."});
    }
}

// LOGIN FUNCTION
export async function loginUser(req: Request, res: Response): Promise<void> {
    const {email, password} = req.body;

    if(!email || !password) {
        res.status(400).json({success: false, message: "Email and password required."});
        return;
    }

    try {
        const user = await User.findOne({email});
        if(!user) {
            res.status(401).json({success: false, message:"Invalid credentials."});
            return;
        }

        const match = await bcrypt.compare(password, user.password);

        if(!match) {
            res.status(401).json({success: false, message: "Invalid credentials."})
        }

        const token = createToken(user._id);
        res.json({success: true, token, user: {id: user._id, name: user.name, email: user.email}});
    }

    catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Server error."})
    }
}

// GET CURRENT USER
export async function getCurrentUser(req: AuthRequest, res: Response):Promise<void> {
    try {
        const user = await User.findById(req.user?.id).select("name email.");
        if(!user) {
            res.status(400).json({success: false, message: "User not found."});
            return;
        }
        res.json({success: true, user})
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Server Error."})
    }
}

// UPDATE USER PROFILE
export async function updateProfile (req: AuthRequest, res: Response):Promise<void> {
    const {name, email} = req.body;

    if(!name || !email || !validator.isEmail(email)) {
        res.status(400).json({success: false, message: "Valid name and email required."});
    }

    try {
        const exists = await User.findOne({email, _id: {$ne: req.user?.id}});

        if(exists) {
            res.status(409).json({success: false, message: "Email already in use by another account."});
            return;
        }
        const user = User.findByIdAndUpdate(req.user?.id,
                                            {name, email},
                                            {new: true, runValidators:true, select: "name email."}

        );
        res.json({success: true, user});
    } catch (err) {
        console.log(err);
        res.status(400).json({success: false, message: "Server Error."});        
    }
}

// CHANGE PASSWORD FUNCTION
export async function updatePassword(req: AuthRequest, res: Response) {
    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword || newPassword.length < 8) {
        res.status(400).json({success: false, message: "Password invalid or too short."});
        return;
    }

    try {
        const user = await User.findById(req.user?.id).select("password");
        if(!user) {
            res.status(404).json({success: false, message: "User not found."});
            return;
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if(!match) {
            res.status(401).json({success: false, message: "CurrentPassword is invalid."});
            return;
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({success: true, message: "Password changed."});

    } catch(err) {
        console.log(err);
        res.status(500).json({success: false, message: "Server error."})
    }
}