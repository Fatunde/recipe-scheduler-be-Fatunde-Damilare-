import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validation';
import { registerDeviceSchema } from '../../utils/validators';
import { deviceService } from '../../services/deviceService';

const router = Router();

// POST /api/devices - Register push token
router.post('/', validateBody(registerDeviceSchema), async (req: Request, res: Response) => {
  try {
    const device = await deviceService.registerDevice(req.body);
    res.status(201).json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

export default router;