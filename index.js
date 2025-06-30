import express from 'express'
import dotenv from 'dotenv';
import authRouter from './router/authRouter.js'
import moment from 'moment/moment.js';
import cors from 'cors'
dotenv.config();

const app = express()
app.use('/uploads', express.static("uploads"));

const logger = (req, res, next) =>{
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl} : ${moment().format("YYYY-MM-DD h:mm:ss a")}`);
    next();
}

app.use(cors({
    origin: [process.env.FRONTEND_LINK],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}), express.static("/uploads"));


app.use(logger)
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use('/auth', authRouter)

app.get('/', (req, res) => {
    return res.json({msg: "test api"})
})
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});