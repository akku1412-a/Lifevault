const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  async getAll(req, res, next) {
    try {
      const [notifications, unreadCount] = await Promise.all([
        Notification.find({ userId: req.user._id })
          .sort({ createdAt: -1 })
          .limit(50),
        Notification.countDocuments({ userId: req.user._id, isRead: false })
      ]);

      return ApiResponse.success(res, {
        notifications,
        unreadCount
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
      }

      return ApiResponse.success(res, { notification }, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
      }

      return ApiResponse.success(res, null, 'Notification removed');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
