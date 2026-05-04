import express from "express";
import { 
    register,
    login,
    getUsersByRole,
    updateUserRole,
    updateUser,
    deleteUser,
    verifyEmail
} from "../controllers/authController.js";
import { protect,staff, admin} from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post("/register", register);           
router.post("/login", login); 
router.post("/verify-email", verifyEmail);

// lấy danh sách user theo role
router.get("/", protect, getUsersByRole);
router.patch("/update-role/:id", protect, admin, updateUserRole);

//cập nhật thông tin user
router.patch("/:id",protect,admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);
export default router;