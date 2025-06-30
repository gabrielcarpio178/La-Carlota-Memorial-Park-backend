import {connectToDatabase} from './../lib/db.js'
import { hasAccount, hasGroup, hasSlotName } from './checkData.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import moment from 'moment/moment.js';


export const addUser = async (req, res)=>{

    const dataSchema = Joi.object({
        firstname: Joi.string().min(3).required(),
        lastname: Joi.string().min(3).required(),
        role: Joi.string().min(3).required(),
        username: Joi.string().min(3).required(),
        password: Joi.string().min(3).required()
    })

    const {error}= dataSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const {firstname, lastname, role, username, password} = req.body;
    const isInAccount = await hasAccount(username, password);
    if(isInAccount) return res.status(401).json({message: "account is already used"})
    try {
        const db = await connectToDatabase();
        const hashPassword = await bcrypt.hash(password, 10)
        await db.promise().query("INSERT INTO `user_tb`(`firstname`, `lastname`, `role`, `username`, `password`) VALUES (?,?,?,?,?)", [firstname.toLowerCase(), lastname.toLowerCase(), role, username, hashPassword])
        return res.status(200).json({message: "add success"})
    } catch (error) {
        
        return res.status(500).json({message: "server error"})
    }

}

export const login = async (req, res) =>{

    const dataSchema = Joi.object({
        username: Joi.string().min(3).required(),
        password: Joi.string().min(3).required()
    })
    const {error}= dataSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const {username, password} = req.body;
    try {
        const db = await connectToDatabase();
        const [userData] = await db.promise().query("SELECT * FROM user_tb WHERE username = ?", [username]);
        const isValidPassword = await bcrypt.compare(password, userData[0].password)
        if(userData.length===0){
            return res.status(401).json({message: "user not find"});
        }
        if(!isValidPassword){
            return res.status(401).json({message: "username or password not match"});
        }
        else{
            await db.promise().query("UPDATE `user_tb` SET `isActive`='1' WHERE id = ?", [userData[0].id])
            const token = jwt.sign({ id: userData[0].id }, process.env.JWT_KEY, { expiresIn: '24h' });
            return res.status(200).json({message: "logined", user: userData[0], token})
        }
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
    
}

export const addGroup = async (req, res) =>{
    const schema = Joi.object({group: Joi.string().required()});
    const {error} = schema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const {group} = req.body;
    const isInGroup =  await hasGroup(group.toLowerCase());
    if(!isInGroup) return res.status(401).json({ message: '"group" already used' });
    try {
        const db = await connectToDatabase();
        await db.promise().query("INSERT INTO `group_tb`(`group_name`) VALUES (?)",[group.toLowerCase()])
        return res.status(200).json({message: "send success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const addSlot = async (req, res) => {
    const schema = Joi.object({
        group_id: Joi.string().required(),
        slot_name: Joi.string().required(),
    })
    const {error} = schema.validate(req.body)
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const {group_id, slot_name} = req.body;

    const isValidSlotName = await hasSlotName(slot_name.toLowerCase(), group_id);
    if(!isValidSlotName) return res.status(401).json({ message: '"Slot name" already used' });

    try {
        
        const db = await connectToDatabase();
        await db.promise().query("INSERT INTO `slot`(`group_id`, `slot_name`) VALUES (?,?)", [group_id, slot_name.toLowerCase()])
        return res.status(200).json({message: "add success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const addRecords = async (req, res) =>{

    const schema = Joi.object({
        slot_id: Joi.string().required(),
        group_id: Joi.number().positive().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        suffix: Joi.string().min(1).max(3).required(),
        middlename: Joi.string().min(1).max(1).required(),
        born: Joi.date().custom((value) => moment(value).format('YYYY-MM-DD')).required(),
        died: Joi.date().custom((value) => moment(value).format('YYYY-MM-DD')).required(),
    });
    const {error} = schema.validate({
        slot_id: req.body.slot_id,
        group_id: req.body.group_id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        born: req.body.born,
        died: req.body.died,
        suffix: req.body.suffix,
        middlename: req.body.middlename,
    });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    
    
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded", details: [{message: 'No file uploaded', path: ['image']}] });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Only image files are allowed", details: [{message: 'Only image files are allowed', path: ['image']}] });
    }

    const {group_id, slot_id ,firstname, lastname, born, died, suffix, middlename} = req.body
    const familyRoleSuffixes = ["JR", "SR", "II", "III", "IV","V", "N/A"];
    
    if(!familyRoleSuffixes.includes(suffix.toUpperCase())) return res.status(400).json({ message: "Invalid suffix", details: [{message: '"suffix" is not available', path: ['suffix']}] })
    
    const image_name = req.file.filename

    try {
        const db = await connectToDatabase()
        await db.promise().query("INSERT INTO `records_tb`(`group_id`, `slot_id`, `firstname`, `lastname`, `born`, `died`, `suffix`,`middlename`, `image_name`) VALUES (?,?,?,?,?,?,?,?,?)", [group_id, slot_id, firstname, lastname, born, died, suffix.toUpperCase(),middlename.toUpperCase(),image_name])
        return res.status(200).json({message: "add success"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "server error"})
    }
}