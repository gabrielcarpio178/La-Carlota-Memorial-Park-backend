import {connectToDatabase} from "./../lib/db.js"
import bcrypt from 'bcrypt';


export const hasAccount = async (username, password) => {
    try {
        const db = await connectToDatabase();
        const [accounts] = await db.promise().query("SELECT username, password FROM user_tb");

        for (const account of accounts) {
            const passwordMatches = await bcrypt.compare(password, account.password);
            if (passwordMatches || account.username === username) {
                return true;
            }
        }

        return false;
    } catch (error) {
        return false;
    }
}

export const hasUpdateAccount = async (id, username, password) => {
    try {
        const db = await connectToDatabase();
        const [accounts] = await db.promise().query("SELECT username, password FROM user_tb WHERE id != ?", [id]);

        for (const account of accounts) {
            const passwordMatches = await bcrypt.compare(password, account.password);
            if (passwordMatches || account.username === username) {
                return true;
            }
        }

        return false;
    } catch (error) {
        return false;
    }
}

export const hasGroup = async (group) => {
    try {
        const db = await connectToDatabase();
        const [groups] = await db.promise().query("SELECT COUNT(`group_name`) AS groub_count FROM `group_tb` WHERE `group_name` = ?", [group])
        return groups[0].groub_count===0
    } catch (error) {
        return false
    }
}


export const hasValidPassword = async (id, password) => {
    try {
        const db = await connectToDatabase();
        const [account] = await db.promise().query("SELECT username, password FROM user_tb WHERE id = ?", [id]);
        const result =  await bcrypt.compare(password, account[0].password);
        return result;
    } catch (error) {
        return false
    }
}

export const hasSlotName = async (slot_name, group_id) => {
    try {
        const db = await connectToDatabase();
        const [slots] = await db.promise().query("SELECT COUNT(*) AS slotCount FROM `slot` WHERE `slot_name` = ? AND `group_id` = ?",[slot_name, group_id])
        return slots[0].slotCount===0
    } catch (error) {
        return false
    }
}

