import express from 'express';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking admin privileges'
    });
  }
};

// Get all settings
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
});

// Update company settings
router.put('/company', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { company } = req.body;
    
    // Validate required fields
    if (!company.name || !company.domain) {
      return res.status(400).json({
        success: false,
        message: 'Company name and domain are required'
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.company = { ...settings.company, ...company };
    settings.modifiedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'Company settings updated successfully',
      data: settings.company
    });
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company settings'
    });
  }
});

// Update user management settings
router.put('/user-management', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userManagement } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.userManagement = { ...settings.userManagement, ...userManagement };
    settings.modifiedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'User management settings updated successfully',
      data: settings.userManagement
    });
  } catch (error) {
    console.error('Error updating user management settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user management settings'
    });
  }
});

// Update system settings
router.put('/system', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { system } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.system = { ...settings.system, ...system };
    settings.modifiedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: settings.system
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings'
    });
  }
});

// Update notification settings
router.put('/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { notifications } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.notifications = { ...settings.notifications, ...notifications };
    settings.modifiedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings.notifications
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings'
    });
  }
});

// Update security settings
router.put('/security', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { security } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.security = { ...settings.security, ...security };
    settings.modifiedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings.security
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating security settings'
    });
  }
});

// Update backup settings
router.put('/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { backup } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.backup = { ...settings.backup, ...backup };
    settings.modifiedBy = req.user.id;
    
    await settings.save();

    res.json({
      success: true,
      message: 'Backup settings updated successfully',
      data: settings.backup
    });
  } catch (error) {
    console.error('Error updating backup settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating backup settings'
    });
  }
});

// Export system data
router.post('/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dataType } = req.body; // 'employees', 'settings', 'all'
    
    let exportData = {};
    
    if (dataType === 'all' || dataType === 'settings') {
      const settings = await Settings.findOne();
      exportData.settings = settings;
    }
    
    if (dataType === 'all' || dataType === 'employees') {
      const employees = await User.find({ role: { $ne: 'admin' } }).select('-password');
      exportData.employees = employees;
    }

    res.json({
      success: true,
      message: 'Data exported successfully',
      data: exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

// Generate system report
router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const settings = await Settings.findOne();
    
    const report = {
      systemInfo: {
        totalUsers,
        totalEmployees,
        totalAdmins,
        systemUptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      },
      settings: settings,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
});

// Reset system to default settings
router.post('/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { confirmReset } = req.body;
    
    if (!confirmReset) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm the reset operation'
      });
    }

    // Delete existing settings and create new default ones
    await Settings.deleteMany();
    const defaultSettings = new Settings();
    await defaultSettings.save();

    res.json({
      success: true,
      message: 'System settings reset to defaults successfully',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings'
    });
  }
});

export default router;
