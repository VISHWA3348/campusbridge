const placementService = require('../services/placementService');

class PlacementController {
  async create(req, res, next) {
    try {
      const { studentId, company, role, referralId } = req.body;
      const placement = await placementService.recordPlacement(studentId, company, role, referralId);
      res.status(201).json(placement);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const placements = await placementService.getCollegePlacements(req.user.collegeId);
      res.json(placements);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlacementController();
