import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server running'
    });
});

export default router;
