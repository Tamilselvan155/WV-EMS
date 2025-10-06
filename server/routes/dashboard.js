import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalManagers = await User.countDocuments({ role: 'manager' });
    const totalRegularEmployees = await User.countDocuments({ role: 'employee' });
    const totalInactiveEmployees = await User.countDocuments({ 
      role: 'employee',
      $or: [
        { 'employment.status': 'inactive' },
        { isActive: false }
      ]
    });

    // Get recent employees (last 30 days) - only count actual employees, not users from User Management
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEmployees = await User.countDocuments({
      role: 'employee',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get employees by department (if department field exists) - only actual employees
    const employeesByDepartment = await User.aggregate([
      { $match: { 
        role: 'employee',
        'employment.department': { $exists: true, $ne: null } 
      } },
      { $group: { _id: '$employment.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity (last 10 employees created) with detailed information - only actual employees
    const recentActivity = await User.find({ role: 'employee' })
      .select('firstName lastName email role createdAt personal employment contact')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEmployees,
          totalAdmins,
          totalManagers,
          totalRegularEmployees,
          totalInactiveEmployees,
          recentEmployees
        },
        employeesByDepartment,
        recentActivity: recentActivity.map(emp => ({
          id: emp._id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
          email: emp.email,
          role: emp.role,
          employeeId: emp.personal?.employeeId || 'N/A',
          department: emp.employment?.department || 'Unassigned',
          designation: emp.employment?.designation || 'N/A',
          phone: emp.contact?.phone || 'N/A',
          joiningDate: emp.employment?.joiningDate || emp.createdAt,
          createdAt: emp.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get employee performance metrics (placeholder)
router.get('/performance', async (req, res) => {
  try {
    // This is a placeholder for performance metrics
    // In a real application, you would have performance data
    const performanceData = {
      averageRating: 4.2,
      topPerformers: [],
      improvementAreas: [],
      monthlyTrends: []
    };

    res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get department-wise statistics
router.get('/departments', async (req, res) => {
  try {
    const departmentStats = await User.aggregate([
      { $match: { role: 'employee' } }, // Only count employees, not users from User Management
      {
        $group: {
          _id: '$employment.department',
          count: { $sum: 1 },
          roles: { $addToSet: '$role' }
        }
      },
      {
        $project: {
          department: '$_id',
          employeeCount: '$count',
          roles: 1,
          _id: 0
        }
      },
      { $sort: { employeeCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { departments: departmentStats }
    });
  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
