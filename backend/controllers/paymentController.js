import prisma from '../prisma/db.js';

export const processPayment = async (req, res) => {
  const { plan, amount, method } = req.body;
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!plan || amount === undefined || !method) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // In a real application, you would integrate with Stripe/Razorpay/etc here.
    // For this simulation, we'll assume the payment intent was captured successfully.
    
    // Calculate new end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Update or create the subscription for the user's college
    await prisma.subscription.upsert({
      where: { collegeId: user.collegeId },
      update: {
        plan: plan.toUpperCase(),
        status: 'active',
        amount: parseFloat(amount),
        endDate
      },
      create: {
        collegeId: user.collegeId,
        plan: plan.toUpperCase(),
        status: 'active',
        amount: parseFloat(amount),
        endDate
      }
    });

    // Log the transaction
    await prisma.auditLog.create({
      data: {
        action: `Payment of ₹${amount} received via ${method} for ${plan.toUpperCase()} plan.`,
        userId: user.userId
      }
    });

    res.json({ message: 'Payment processed successfully, plan activated.' });
  } catch (error) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};
