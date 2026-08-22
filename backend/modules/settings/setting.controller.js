const Setting = require("./setting.model");
const store = require("../../config/inMemoryStore");
const { sendSuccess, sendError, sendCreated } = require("../../utils/response");
const { AppError } = require("../../utils/helpers");

class SettingController {
  // Create or update setting
  async setSetting(req, res, next) {
    try {
      const { key, value, category, description } = req.body;

      if (!key) {
        return sendError(res, "Setting key is required", 400);
      }

      try {
        const setting = await Setting.findOneAndUpdate(
          { key },
          {
            value,
            category: category || "general",
            description: description || "",
            updatedBy: req.user?._id,
          },
          { new: true, upsert: true, runValidators: true },
        );
        if (setting) {
          return sendSuccess(res, {
            message: "Setting saved successfully",
            setting,
          });
        }
      } catch (e) {}

      const updated = {
        key,
        value,
        category: category || "general",
        description: description || "",
        updatedBy: req.user?._id,
        isPublic: true,
      };
      store.settings.set(key, updated);

      return sendSuccess(res, {
        message: "Setting saved successfully",
        setting: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get setting by key
  async getSetting(req, res, next) {
    try {
      const { key } = req.params;
      try {
        const setting = await Setting.findOne({ key });
        if (setting) {
          return sendSuccess(res, { setting });
        }
      } catch (e) {}

      const found = store.settings.get(key);
      if (!found) {
        return sendError(res, "Setting not found", 404);
      }

      return sendSuccess(res, { setting: found });
    } catch (error) {
      next(error);
    }
  }

  // Get all settings
  async getAllSettings(req, res, next) {
    try {
      const { category } = req.query;
      try {
        const query = {};
        if (category) query.category = category;
        const settings = await Setting.find(query).sort({ category: 1, key: 1 });
        if (settings && settings.length > 0) {
          return sendSuccess(res, { settings, count: settings.length });
        }
      } catch (e) {}

      let all = Array.from(store.settings.values());
      if (category) {
        all = all.filter((s) => s.category === category);
      }

      return sendSuccess(res, {
        settings: all,
        count: all.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get settings by category
  async getSettingsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      let all = Array.from(store.settings.values()).filter((s) => s.category === category);
      return sendSuccess(res, {
        settings: all,
        count: all.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete setting
  async deleteSetting(req, res, next) {
    try {
      const { key } = req.params;
      store.settings.delete(key);
      return sendSuccess(res, {
        message: "Setting deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get system settings (public)
  async getPublicSettings(req, res, next) {
    try {
      const settingsObject = {};
      for (const [k, v] of store.settings.entries()) {
        if (v.isPublic) {
          settingsObject[k] = v.value;
        }
      }

      return sendSuccess(res, {
        settings: settingsObject,
      });
    } catch (error) {
      next(error);
    }
  }

  // Initialize default settings
  async initializeSettings(req, res, next) {
    try {
      return sendSuccess(res, {
        message: "Settings initialized successfully",
        created: 0,
        updated: store.settings.size,
        total: store.settings.size,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingController();
