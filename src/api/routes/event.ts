import { Router, Request, Response } from 'express';
import { validateBody, validateQuery } from '../middleware/validation';
import { 
  createEventSchema, 
  updateEventSchema, 
  getUserEventsSchema 
} from '../../utils/validators';
import { eventService } from '../../services/eventService';

const router = Router();

// POST /api/events - Create event
router.post('/', validateBody(createEventSchema), async (req: Request, res: Response) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// GET /api/events?userId= - List upcoming events for user
router.get('/', validateQuery(getUserEventsSchema), async (req: Request, res: Response) => {
  try {
    const { userId } = req.query as { userId: string };
    const events = await eventService.getUpcomingEvents(userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// PATCH /api/events/:id - Edit event title or time
router.patch('/:id', validateBody(updateEventSchema), async (req: Request, res: Response) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Cancel event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await eventService.deleteEvent(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;