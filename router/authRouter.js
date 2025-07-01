import express from "express";
import { verifyToken } from '../middleware/verifyToken.js'
import { addGroup, addUser, login, addRecords, addSlot } from './../controller/postController.js'
import { getGroups, getUserAccess, logout, getUserEdit, getRecords, groupSlot, getSlot, getImage, getAllSlot } from "../controller/getController.js";
import { deleteGroups, deleteUsers, deleteSlot, deleteRecord } from '../controller/deleteController.js'
import { updateGroup, updateUser, updateUserData, updateSlot, editRecords } from "../controller/putController.js";
import upload from "./../lib/multer.js"

const router = express.Router();

router.post("/login", login);
router.post("/addUser", verifyToken, addUser);
router.delete("/deleteUser", verifyToken, deleteUsers);
router.put("/updateUser", verifyToken, updateUser);
router.get("/logout/:id", verifyToken, logout);
router.post("/addGroup", verifyToken, addGroup);
router.get("/getGroups", verifyToken, getGroups);
router.get("/getUserAccess/:id", verifyToken, getUserAccess);
router.get("/groupSlot/:id", verifyToken, groupSlot);
router.post("/addSlot", verifyToken, addSlot);
router.put("/updateGroup", verifyToken, updateGroup);
router.delete("/deleteGroups", verifyToken, deleteGroups);
router.get("/getUserEdit/:id", verifyToken, getUserEdit);
router.put("/updateUserData", verifyToken, updateUserData);
router.post("/addRecords", verifyToken , upload, addRecords);
router.delete("/deleteSlot", verifyToken, deleteSlot)
router.put("/updateSlot", verifyToken, updateSlot)
router.get("/getSlot", verifyToken, getSlot)
router.get("/getRecords", verifyToken, getRecords)
router.delete("/deleteRecord", verifyToken, deleteRecord)
router.get("/uploads/:image", verifyToken, getImage)
router.put("/editRecords", verifyToken, upload, editRecords)
router.get("/getAllSlot", verifyToken, getAllSlot)

export default router;