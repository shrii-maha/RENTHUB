const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Rental = require('../models/Rental');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @desc    Create checkout session
// @route   POST /api/payments/checkout/:rentalId
// @access  Private
router.post('/checkout/:rentalId', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId).populate('item');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    if (rental.renter.toString() !== req.user.id || rental.status !== 'Approved') {
      return res.status(401).json({ success: false, error: 'Not authorized or rental not approved' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Rental Checkout: ${rental.item.name}`,
              description: `Rent: ₹${rental.totalPrice} + Security Deposit: ₹${rental.depositAmount}`
            },
            unit_amount: (rental.totalPrice + rental.depositAmount) * 100 // Stripe expects amount in cents/paise
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/#/payment-success/${rental._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/#/my-rentals`
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Verify payment success via API (Polling instead of webhook for simplicity and match to Flask)
// @route   POST /api/payments/success/:rentalId
// @access  Private
router.post('/success/:rentalId', protect, async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'Session ID required' });
    }

    const rental = await Rental.findById(req.params.rentalId).populate('item');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    if (rental.renter.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Payment not completed' });
    }

    // Activate rental
    rental.status = 'Active';
    await rental.save();

    // Mark item as not available
    rental.item.isAvailable = false;
    await rental.item.save();

    // Re-populate for email details
    const populatedRental = await Rental.findById(rental._id)
      .populate('renter', 'fullName email')
      .populate({
        path: 'item',
        populate: { path: 'owner', select: 'fullName email' }
      });

    // Send emails in the background (Non-blocking) so the user doesn't wait
    const sendNotificationEmails = async () => {
      try {
        console.log(`Starting background email notifications for rental ${rental._id}...`);
        
        // Email to Renter (Buyer)
        await sendEmail({
          email: populatedRental.renter.email,
          subject: `Payment Successful! Your rental for ${populatedRental.item.name} is now active.`,
          html: `
            <h1>Payment Confirmed!</h1>
            <p>Hi ${populatedRental.renter.fullName},</p>
            <p>Your payment for <strong>${populatedRental.item.name}</strong> was successful. Your rental is now active.</p>
            <p>You can view and print your invoice here: <a href="${process.env.CLIENT_URL}/#/invoice/${populatedRental._id}">${process.env.CLIENT_URL}/#/invoice/${populatedRental._id}</a></p>
            <p>Thank you for using RentHub!</p>
          `
        }).catch(err => console.error('Buyer email failed:', err.message));

        // Email to Owner (Seller)
        await sendEmail({
          email: populatedRental.item.owner.email,
          subject: `Success! Your item "${populatedRental.item.name}" has been rented out.`,
          html: `
            <h1>Rental Alert!</h1>
            <p>Hi ${populatedRental.item.owner.fullName},</p>
            <p>Great news! Your item <strong>${populatedRental.item.name}</strong> has been successfully rented out to ${populatedRental.renter.fullName}.</p>
            <p>The deal is successful, and the rental is now active. You can check your dashboard for details.</p>
          `
        }).catch(err => console.error('Seller email failed:', err.message));
        
        // Email to Admin
        const adminEmail = process.env.FROM_EMAIL || 'admin@renthub.com';
        await sendEmail({
          email: adminEmail,
          subject: `ALERT: New Booking on RentHub! - Dealer: ${populatedRental.item.owner.fullName}`,
          html: `
            <h1>New Transaction!</h1>
            <p>A new booking has been completed on the platform.</p>
            <p><strong>Item:</strong> ${populatedRental.item.name}</p>
            <p><strong>Renter:</strong> ${populatedRental.renter.fullName} (${populatedRental.renter.email})</p>
            <p><strong>Owner:</strong> ${populatedRental.item.owner.fullName} (${populatedRental.item.owner.email})</p>
            <p><strong>Total Price:</strong> ₹${populatedRental.totalPrice}</p>
            <p><strong>Deposit:</strong> ₹${populatedRental.depositAmount}</p>
            <p><a href="${process.env.CLIENT_URL}/#/admin/rentals">Review in Admin Panel</a></p>
          `
        }).catch(err => console.error('Admin email failed:', err.message));
        
        console.log('Background email notifications completed successfully');
      } catch (err) {
        console.error('Critical background email error:', err.message);
      }
    };

    // Fire and forget! (Don't await it here)
    sendNotificationEmails();

    // Instantly return success to the frontend so the Invoice loads immediately
    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get invoice data
// @route   GET /api/payments/invoice/:rentalId
// @access  Private
router.get('/invoice/:rentalId', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId)
      .populate('renter', 'fullName email phoneNumber address')
      .populate({
        path: 'item',
        populate: { path: 'owner', select: 'fullName email phoneNumber address' }
      });

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    // Check if user is authorized to see this invoice (must be renter or owner)
    if (rental.renter._id.toString() !== req.user.id && rental.item.owner._id.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to view this invoice' });
    }

    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
