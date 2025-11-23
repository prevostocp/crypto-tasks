import Task from "../models/taskModel.js";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: {
        id: string;
    }
}

// CREATE A NEW TASK
export const createTask = async (req: AuthRequest, res:Response) => {
    try {
        const {title, description, priority, dueDate, completed} = req.body as {
            title: string,
            description: string,
            priority: string,
            dueDate: Date,
            completed: boolean
        };

        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            completed: completed === true,
            owner: req.user?.id
        });
        const saved = await task.save();
        res.status(201).json({success: true, task: saved});
    } catch(err: any) {
        console.log(err);
        res.status(400).json({success: false, message: err.message});
    }
}

// GET ALL TASK FOR LOGGED - IN USER
export const getTasts = async (req:AuthRequest, res:Response) => {
    try {
        const tasks = await Task.find({owner: req.user?.id}).sort({createAt: -1});
        res.json({success: true, tasks});
    } catch (err: any) {
        console.log(err);
        res.status(400).json({success: false, message: err.message})
    }
}

// GET SINGLE TASK BY ID (MUST BELONG TO THAT USER)
export const getTaskById = async (req:AuthRequest, res:Response) => {
    try{
        const task = await Task.findById({_id: req.params.id, owner: req.user?.id});
        if(!task) {
            res.json(404).json({success: false, message: "Task not found."});
            return;
        }
        res.json({success: true, task});
    } catch(err:any){
        res.status(500).json({success: false, message: err.message})
    }
}

// UPDATE A TASK
export const updateTask = async (req:AuthRequest, res:Response) => {
    try{
        const data = {... req.body} as {completed?: boolean | string};
        if(data.completed !== undefined) {
            data.completed = data.completed === true || data.completed === "true";
        }

        const updated = await Task.findOneAndUpdate(
                              {_id: req.params.id, owner: req.user?.id},
                              data,
                              {new: true, runValidators:true}
        );

        if(!updated) {
            res.status(404).json({success: false, message: "Task not found or not yours."});
        }
        res.json({success: true, updated});
    } catch(err:any) {
        res.status(500).json({success: false, message: err.message});
    }
}

// DELETE A TASK
export const deleteTask = async (req:AuthRequest, res:Response) => {
    try{
        const deleted = await Task.findOneAndDelete({_id: req.params.id, owner: req.user?.id});
        if(!deleted){
            res.status(404).json({success: false, message: "Task not found or not yours."});            
        }
        res.json({success: true, message: "Task deleted"});
    } catch(err:any) {
        res.status(500).json({success: false, message: err.message});
    }
}