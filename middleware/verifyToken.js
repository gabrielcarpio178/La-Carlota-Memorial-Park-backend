import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    try {
        if(!token) {
            return res.status(403).json({message: "No Token Provided"})
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.userId = decoded.id;
        next();
    }  catch(err) {
        return res.status(500).json({message: "server error"})
    }
}