const express = require('express');
const referralController = require('../controllers/referralController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');
const checkFeature = require('../middleware/feature');

const router = express.Router();

router.post(
  '/', 
  authenticateUser, 
  authorizeRole('STUDENT'), 
  checkFeature('Referral System'),
  referralController.create
);

router.patch(
  '/:id', 
  authenticateUser, 
  authorizeRole('ALUMNI'), 
  checkFeature('Referral System'),
  referralController.update
);

module.exports = router;
