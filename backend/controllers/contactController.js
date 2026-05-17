import prisma from '../prisma/db.js';

export const submitContactForm = async (req, res) => {
  const { name, email, phoneNumber, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  try {
    const contact = await prisma.contact.create({
      data: { 
        name, 
        email, 
        phoneNumber, 
        subject, 
        message 
      }
    });

    res.status(201).json({ 
      message: 'Thank you! Your message has been received. We will get back to you shortly.', 
      contact 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to save message. Please try again later.' });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
