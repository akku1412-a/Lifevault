const Reminder = require('../models/Reminder');
const Document = require('../models/Document');
const ApiResponse = require('../utils/apiResponse');

class ReminderController {
  async getAll(req, res, next) {
    try {
      const reminders = await Reminder.find({ userId: req.user._id })
        .populate('documentId', 'title originalFileName category expiryDate')
        .sort({ reminderDate: 1 });

      return ApiResponse.success(res, { reminders });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { documentId, reminderDate, type, daysBefore, notes, title } = req.body;

      if (!documentId || !reminderDate) {
        return ApiResponse.badRequest(res, 'Document ID and reminder date are required');
      }

      // Verify document belongs to user
      const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
      if (!doc) {
        return ApiResponse.notFound(res, 'Document not found or access denied');
      }

      const reminder = await Reminder.create({
        userId: req.user._id,
        documentId,
        reminderDate: new Date(reminderDate),
        type: type || 'expiry_warning',
        daysBefore: daysBefore || 30,
        title: title || `Reminder for ${doc.title}`,
        notes: notes || '',
        status: 'pending'
      });

      return ApiResponse.created(res, { reminder }, 'Reminder scheduled successfully');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
      if (!reminder) {
        return ApiResponse.notFound(res, 'Reminder not found');
      }

      if (req.body.status) reminder.status = req.body.status;
      if (req.body.notes !== undefined) reminder.notes = req.body.notes;
      if (req.body.reminderDate) reminder.reminderDate = new Date(req.body.reminderDate);

      await reminder.save();

      return ApiResponse.success(res, { reminder }, 'Reminder updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!reminder) {
        return ApiResponse.notFound(res, 'Reminder not found');
      }

      return ApiResponse.success(res, null, 'Reminder removed successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReminderController();
