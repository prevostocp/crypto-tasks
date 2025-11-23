import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel.js";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
    user?: {
        id: string;
    }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export default async function authMiddleware(req:AuthRequest, res:Response, next:NextFunction) {
    // GRAB THE BEARER TOKEN FROM AUTHORIZATION HEADER
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({success: false, message: "Not Authorized, token missing"});
        return;
    }

    const token = authHeader.split(" ")[1];

    // VERIFY & ATTACH USER OBJECT
    try {
        const payload = jwt.verify(token, JWT_SECRET)as JwtPayload & { id: string };;
        const user = await User.findById(payload.id).select("-password");

        if(!user) {
            res.status(401).json({success: false, message: "User not found"});
        }
        req.user = user;
        next();

    } catch (err) {
        console.log("JWT token verification failed.", err);
        res.status(401).json({success: false, message: "Token invalid or spired."});
    }

}