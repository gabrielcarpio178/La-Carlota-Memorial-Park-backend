import Joi from "joi"
import { connectToDatabase } from "../lib/db.js";
import { unlink } from 'node:fs';
import cloudinary from './../utils/cloudinary.js'

export const deleteUsers = async (req, res) =>{

    const schema = Joi.object({
        id: Joi.number().required()
    })
    const {error} = schema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const {id} = req.body
    try {
        const db = await connectToDatabase();
        await db.promise().query('DELETE FROM `user_tb` WHERE `id` = ?', [id])
        return res.status(200).json({message: "delete success"})
    } catch (error) {
        return res.status(500).json({message: 'server error'})
    }

}

export const deleteGroups = async (req, res) => {

    const schema = Joi.object({
        id: Joi.number().required()
    })

    const {error} = schema.validate(req.body)
    if(error) return res.status(400).json({message: 'Validation error', details: error.details});

    const {id} = req.body;
    try {
        const db = await connectToDatabase()
        await db.promise().query("DELETE FROM `group_tb` WHERE `id` = ?", [id])
        return res.status(200).json({message: "delete success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const deleteSlot = async (req, res) =>{
    const schema = Joi.object({
        id: Joi.number().required()
    })

    const {error} = schema.validate(req.body)
    if(error) return res.status(400).json({message: 'Validation error', details: error.details});

    const {id} = req.body;
    try {
        const db = await connectToDatabase()
        await db.promise().query("DELETE FROM `slot` WHERE `id` = ?", [id])
        return res.status(200).json({message: "delete success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const deleteRecord = async (req, res) =>{
    const schema = Joi.object({
        id: Joi.number().required(),
        image_name: Joi.string().required()
    })

    const {error} = schema.validate(req.body)
    if(error) return res.status(400).json({message: 'Validation error', details: error.details});

    const {id, image_name} = req.body;
    const cloud_image_name = image_name.replace(/\.[^/.]+$/, "");
    try {
        const db = await connectToDatabase()
        await db.promise().query("DELETE FROM `records_tb` WHERE `id` = ?", [id]);
        unlink(`uploads/${image_name}`, (err) => {
            if (err) return res.status(400).json({message: "no old image"});
            return res.status(200).json({message: "delete success"})
        });
        const cloudResult = await cloudinary.uploader.destroy("uploads/"+cloud_image_name);
        if (cloudResult.result !== 'ok') {
            return res.status(500).json({message: "server error"})
        }
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}
