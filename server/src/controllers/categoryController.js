const Category = require('../models/Category');
const Document = require('../models/Document');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
  async getAll(req, res, next) {
    try {
      // Ensure system categories exist in database
      const existingSystemCount = await Category.countDocuments({ isSystem: true });
      if (existingSystemCount === 0) {
        const systemCategories = Category.SYSTEM_CATEGORIES.map(c => ({
          ...c,
          isSystem: true,
          userId: null
        }));
        await Category.insertMany(systemCategories);
      }

      // Fetch system categories + user's custom categories
      const categories = await Category.find({
        $or: [{ isSystem: true }, { userId: req.user._id }]
      }).sort({ isSystem: -1, name: 1 });

      // Aggregate document counts per category for the current user
      const docCounts = await Document.aggregate([
        { $match: { userId: req.user._id, isArchived: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      const countMap = {};
      docCounts.forEach((item) => {
        countMap[item._id] = item.count;
      });

      const enrichedCategories = categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        isSystem: cat.isSystem,
        documentCount: countMap[cat.slug] || 0
      }));

      return ApiResponse.success(res, { categories: enrichedCategories });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, icon, color } = req.body;
      if (!name || name.trim().length === 0) {
        return ApiResponse.badRequest(res, 'Category name is required');
      }

      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Check if already exists for this user or as system
      const existing = await Category.findOne({
        slug,
        $or: [{ isSystem: true }, { userId: req.user._id }]
      });

      if (existing) {
        return ApiResponse.conflict(res, 'A category with this name already exists');
      }

      const category = await Category.create({
        name: name.trim(),
        slug,
        icon: icon || 'Folder',
        color: color || '#22c55e',
        isSystem: false,
        userId: req.user._id
      });

      return ApiResponse.created(res, { category }, 'Category created successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isSystem: false
      });

      if (!category) {
        return ApiResponse.notFound(res, 'Custom category not found or cannot be deleted');
      }

      // Check if any documents use this category
      const inUseCount = await Document.countDocuments({
        userId: req.user._id,
        category: category.slug
      });

      if (inUseCount > 0) {
        return ApiResponse.badRequest(
          res,
          `Cannot delete category "${category.name}". It is assigned to ${inUseCount} document(s). Reassign them first.`
        );
      }

      await Category.deleteOne({ _id: category._id });

      return ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
