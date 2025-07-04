import Joi from 'joi'
import {connectToDatabase} from './../lib/db.js'
import path from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

export const logout = async (req, res) => {
    const schema = Joi.object({id: Joi.number().positive().required()})
    const {error} = schema.validate(req.params)
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const {id} = req.params
    try {
        const db = await connectToDatabase();
        await db.promise().query("UPDATE `user_tb` SET `isActive`='0' WHERE `id` = ?", [id]);
        return res.status(200).json({message: "logout success"})
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const getGroups = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [result] = await db.promise().query("SELECT gt.id, gt.group_name, COUNT(st.slot_name) AS count_slot_name FROM group_tb AS gt LEFT JOIN slot AS st ON gt.id = st.group_id  GROUP BY gt.id ORDER BY gt.id DESC;");
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const getUserAccess = async (req, res) => {
    const id = req.params.id;
    try {
        const db = await connectToDatabase();
        const [result] = await db.promise().query("SELECT * FROM user_tb WHERE id != ? ORDER BY id DESC", [id]);
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const getUserEdit = async (req, res)=>{
    const id = req.params.id;
    try {
        const db = await connectToDatabase();
        const [result] = await db.promise().query("SELECT id, firstname, lastname, role FROM user_tb WHERE id = ?", [id]);
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}


export const groupSlot = async (req, res) => {
    const id = req.params.id;
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT s.`id`, s.`slot_name`, COUNT(r.`id`) AS record_count FROM `slot` s LEFT JOIN `records_tb` r ON r.`slot_id` = s.`id` WHERE s.`group_id` = ? GROUP BY s.`id` ORDER BY s.`id` DESC",[id])
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const getSlot = async (req, res) =>{
    
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT `id`, `group_id`, `slot_name` FROM `slot`")
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const getRecords = async (req, res) =>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT rt.slot_id, rt.group_id, rt.id, rt.firstname, rt.lastname, rt.suffix, rt.middlename, rt.born, rt.died, rt.image_name, st.slot_name, gt.group_name FROM records_tb AS rt INNER JOIN slot AS st ON st.id = rt.slot_id INNER JOIN group_tb AS gt ON gt.id = rt.group_id ORDER BY rt.id DESC;")
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const getImage = async (req, res)=>{
    const imagePath = path.join(__dirname, '../uploads', req.params.image);
    return res.sendFile(imagePath);
}

export const getAllSlot = async (req, res)=>{
    try {
        const db = await connectToDatabase();
        const [result] = await db.promise().query("SELECT s.`id` AS slot_id, s.`slot_name`, gt.`id` AS group_id, gt.`group_name`, r.`id` AS record_id, r.`firstname`, r.`lastname`, r.`middlename`, r.`suffix`, SUM(pt.`amount`) AS total_amount FROM `slot` s LEFT JOIN `records_tb` r ON r.`slot_id` = s.`id` INNER JOIN `group_tb` gt ON s.`group_id` = gt.`id` LEFT JOIN `payment_tb` pt ON pt.`slot_id` = s.`id` GROUP BY s.`id`, s.`slot_name`, gt.`id`, gt.`group_name`, r.`id`, r.`firstname`, r.`lastname`, r.`middlename`, r.`suffix` ORDER BY s.`id` DESC;")
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}

export const getpaymentbygroup = async (req, res) =>{

    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT gt.id, pt.slot_id ,st.slot_name, st.group_id ,gt.group_name, SUM(pt.amount) AS total_amount, pt.paymentDate FROM payment_tb pt INNER JOIN slot st ON pt.slot_id = st.id RIGHT JOIN group_tb gt ON st.group_id = gt.id GROUP BY gt.id;")
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }

}

export const getpaymentHistory = async (req, res)=>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT pt.id, pt.fullname, pt.amount, pt.paymentDate, pt.slot_id, st.slot_name, gt.group_name FROM payment_tb pt INNER JOIN slot st ON pt.slot_id = st.id INNER JOIN group_tb gt ON st.group_id = gt.id ORDER BY pt.id DESC;")
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "server error"})
    }
}


const barGraphData = async () =>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT DATE_FORMAT(paymentDate, '%Y-%m') AS month, SUM(amount) AS total_amount FROM payment_tb GROUP BY DATE_FORMAT(paymentDate, '%Y-%m') ORDER BY month;")
        return result
    } catch (error) {
        return error
    }
}

const pieGraphData = async ()=>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT gt.group_name, COUNT(rt.id) AS record_count FROM group_tb gt LEFT JOIN records_tb rt ON rt.group_id = gt.id GROUP BY gt.id, gt.group_name ORDER BY gt.id DESC;")
        return result
    } catch (error) {
        return error
    }
}

const lineGraphData = async () =>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT YEAR(died) AS death_year, COUNT(*) AS death_count FROM records_tb WHERE died IS NOT NULL GROUP BY YEAR(died) ORDER BY death_year;")
        return result
    } catch (error) {
        return error
    }
}

const doughnutGraphData = async () =>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT gt.group_name, COALESCE(SUM(pt.amount), 0) AS total_amount FROM group_tb gt LEFT JOIN slot st ON st.group_id = gt.id LEFT JOIN payment_tb pt ON pt.slot_id = st.id GROUP BY gt.id, gt.group_name ORDER BY gt.id DESC;")
        return result
    } catch (error) {
        return error
    }
}
const totalsData = async () =>{
    try {
        const db = await connectToDatabase()
        const [result] = await db.promise().query("SELECT (SELECT SUM(amount) FROM payment_tb) AS total_payment, (SELECT COUNT(*) FROM records_tb) AS total_burial;")
        return result[0]
    } catch (error) {
        return error
    }
}

export const getDashboard = async (req, res) =>{
    try {
        const barGraph = await barGraphData();
        const pieGraph = await pieGraphData();
        const lineGraph = await lineGraphData();
        const doughnutGraph = await doughnutGraphData();
        const totals = await totalsData();
        return res.status(200).json({ barGraph, pieGraph, lineGraph, doughnutGraph, totals });
    } catch (error) {
        return res.status(500).json({ message: "server error"});
    }
}