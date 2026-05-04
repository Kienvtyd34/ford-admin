import express from 'express';
import { 
    sendRequest, 
    getContacts, 
    updateContactStatus,
    getDemoVehicles,
    createTestDrive,
    getTestDrives,
    updateTestDriveStatus
} from '../controllers/contactController.js';

import { protect, staff } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// ===== TEST DRIVE =====
router.get("/demo-vehicles", getDemoVehicles);
router.post("/book", createTestDrive);
router.get("/test-drives", protect, staff, getTestDrives);
router.put("/test-drive/:id", protect, staff, updateTestDriveStatus);

// ===== CONTACT =====
router.post('/send', sendRequest);
router.get('/contacts', protect, staff, getContacts);
router.put('/:id/status', protect, staff, updateContactStatus);


export default router;