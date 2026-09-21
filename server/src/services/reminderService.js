const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const Document = require('../models/Document');
const logger = require('../utils/logger');

class ReminderService {
  /**
   * Run background check for due reminders and document expiration warnings
   */
  async checkDueReminders() {
    try {
      const now = new Date();

      // 1. Process custom scheduled reminders that are pending and due
      const dueReminders = await Reminder.find({
        status: 'pending',
        reminderDate: { $lte: now }
      }).populate('documentId', 'title originalFileName expiryDate category');

      for (const reminder of dueReminders) {
        if (!reminder.documentId) continue;

        const docTitle = reminder.documentId.title || reminder.documentId.originalFileName;
        await Notification.create({
          userId: reminder.userId,
          documentId: reminder.documentId._id,
          title: `Reminder: ${docTitle}`,
          message: reminder.notes || `Scheduled alert for "${docTitle}". Please check expiration or required actions.`,
          type: 'expiry',
          actionUrl: `/app/documents/${reminder.documentId._id}`
        });

        reminder.status = 'triggered';
        reminder.sentAt = now;
        await reminder.save();
      }

      // 2. Scan for documents expiring within 7 days that haven't been notified yet today
      const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expiringSoonDocs = await Document.find({
        expiryDate: { $gte: now, $lte: sevenDaysAhead },
        isArchived: false
      });

      for (const doc of expiringSoonDocs) {
        // Prevent spam: check if a notification for this document was created within the past 24 hours
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const existingNotif = await Notification.findOne({
          userId: doc.userId,
          documentId: doc._id,
          type: 'expiry',
          createdAt: { $gte: oneDayAgo }
        });

        if (!existingNotif) {
          const daysLeft = Math.max(0, Math.ceil((new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24)));
          await Notification.create({
            userId: doc.userId,
            documentId: doc._id,
            title: `Document Expiring in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`,
            message: `"${doc.title}" is set to expire on ${new Date(doc.expiryDate).toLocaleDateString()}. Renew or update it soon.`,
            type: 'warning',
            actionUrl: `/app/documents/${doc._id}`
          });
        }
      }
    } catch (err) {
      logger.error('Error during reminder check sweep:', err.message);
    }
  }

  startScheduler(intervalMs = 60 * 60 * 1000) { // Default every 1 hour
    logger.info('Starting automated reminder background scheduler...');
    // Run an initial sweep 10 seconds after server boot
    setTimeout(() => {
      this.checkDueReminders();
    }, 10000);

    // Then run on interval
    this.intervalHandle = setInterval(() => {
      this.checkDueReminders();
    }, intervalMs);
  }

  stopScheduler() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }
}

module.exports = new ReminderService();
