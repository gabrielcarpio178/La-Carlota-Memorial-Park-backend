import Joi from "joi";
import { connectToDatabase } from "../lib/db.js";
import { hasUpdateAccount, hasGroup, hasValidPassword, hasSlotName } from "./checkData.js";
import bcrypt from 'bcrypt'
import { unlink } from 'node:fs';
import moment from "moment";

export const updateUser = async (req, res) =>{

    const schema = Joi.object({
        id: Joi.number().required(),
        firstname: Joi.string().min(3).required(),
        lastname: Joi.string().min(3).required(),
        role: Joi.string().min(3).required(),
        username: Joi.string().min(3).required(),
        old_password: Joi.string().min(3).required(),
        new_password:  Joi.string().min(3).required()
    })

    const {error} = schema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const {id, firstname, lastname, role, username, old_password, new_password} = req.body;
    const isInAccount = await hasUpdateAccount(id, username, new_password);
    if(isInAccount) return res.status(401).json({message: "account is already used"})
    const isValidPass = await hasValidPassword(id, old_password);
    if(!isValidPass) return res.status(401).json({message: "invalid password"})

    try {
        const db = await connectToDatabase();
        const hashPassword = await bcrypt.hash(new_password, 10)
        await db.promise().query("UPDATE `user_tb` SET `firstname`= ?,`lastname`= ?,`role`= ?,`username`= ?,`password`= ? WHERE `id`= ?", [firstname.toLowerCase(), lastname.toLowerCase(), role, username, hashPassword, id])
        return res.status(200).json({message: "update success", new_password: hashPassword})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const updateUserData = async (req, res)=>{
    const schema = Joi.object({
        id: Joi.number().required(),
        firstname: Joi.string().min(3).required(),
        lastname: Joi.string().required(),
        role: Joi.string().required()
    })

    const {error} = schema.validate(req.body);
    if(error) return res.status(400).json({message: "Validation error", details: error.details})
    const {id, firstname, lastname, role} = req.body;

    try {
        const db = await connectToDatabase();
        await db.promise().query("UPDATE `user_tb` SET `firstname`=?,`lastname`=?,`role`= ? WHERE `id` = ?", [firstname, lastname, role, id])
        return res.status(200).json({message: "update success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const updateGroup = async (req, res) => {
    const schema = Joi.object({
        id: Joi.number().required(),
        group: Joi.string().required()
    })
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).json({message: "Validation error", details: error.details});

    const {id, group} = req.body
    const isValidGroup = await hasGroup(group.toLowerCase())
    if(!isValidGroup) return res.status(401).json({ message: '"group" already used' });
    try {
        const db = await connectToDatabase()
        await db.promise().query("UPDATE `group_tb` SET `group_name`= ? WHERE `id` = ?", [group.toLowerCase(), id])
        return res.status(200).json({message: "update success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const updateSlot= async (req, res)=>{
    const schema = Joi.object({
        slot_id: Joi.number().positive().required(),
        group_id: Joi.number().positive().required(),
        slot_name: Joi.string().required(),
    })
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).json({message: "Validation error", details: error.details});

    const {slot_id, group_id, slot_name} = req.body
    const isValidSlotName = await hasSlotName(slot_name.toLowerCase(), group_id);
    if(!isValidSlotName) return res.status(401).json({ message: '"Slot name" already used' });
    
    try {
        
        const db = await connectToDatabase()
        await db.promise().query("UPDATE `slot` SET `slot_name`= ? WHERE id = ?",[slot_name, slot_id])
        return res.status(200).json({message: "update success"})

    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const editRecords = async (req, res)=>{
    
    const schema = Joi.object({
        id: Joi.number().positive().required(),
        slot_id: Joi.string().required(),
        group_id: Joi.number().positive().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        suffix: Joi.string().min(1).max(3).required(),
        middlename: Joi.string().min(1).max(1).required(),
        born: Joi.date().custom((value) => moment(value).format('YYYY-MM-DD')).required(),
        died: Joi.date().custom((value) => moment(value).format('YYYY-MM-DD')).required(),
        file_name: Joi.string().required()
    });

    const {error} = schema.validate({
        id: req.body.id,
        slot_id: req.body.slot_id,
        group_id: req.body.group_id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        born: req.body.born,
        died: req.body.died,
        suffix: req.body.suffix,
        middlename: req.body.middlename,
        file_name: req.body.file_name
    });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded", details: [{message: 'No file uploaded', path: ['image']}] });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Only image files are allowed", details: [{message: 'Only image files are allowed', path: ['image']}] });
    }

    const {id, group_id, slot_id ,firstname, lastname, born, died, suffix, middlename, file_name} = req.body
    
    const familyRoleSuffixes = ["JR", "SR", "II", "III", "IV","V", "N/A"];
    if(!familyRoleSuffixes.includes(suffix.toUpperCase())) return res.status(400).json({ message: "Invalid suffix", details: [{message: '"suffix" is not available', path: ['suffix']}] });
    unlink(`uploads/${file_name}`, (err) => {
        if (err) return res.status(500).json({message: "no old image"});
    });
    const image_name = req.file.filename
    try {
        const db = await connectToDatabase()
        await db.promise().query("UPDATE `records_tb` SET `group_id`=?,`slot_id`=?,`firstname`=?,`lastname`=?,`suffix`=?,`middlename`=?,`born`=?,`died`=?,`image_name`=? WHERE `id` = ?", [group_id, slot_id, firstname, lastname, suffix, middlename, born, died, image_name, id])
        return res.status(200).json({message: "update success"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "server error"})
    }
}