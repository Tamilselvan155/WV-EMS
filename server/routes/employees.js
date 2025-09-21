import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', department = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'personal.employeeId': { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (department) {
      query['employment.department'] = department;
    }
    if (status) {
      query['employment.status'] = status;
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEmployees: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
    console.log('Received employee data:', JSON.stringify(employeeData, null, 2));
    
    // Map nested data to root level for User model
    const userData = {
      firstName: employeeData.personal?.firstName,
      lastName: employeeData.personal?.lastName,
      email: employeeData.contact?.email,
      personal: employeeData.personal,
      contact: employeeData.contact,
      statutory: employeeData.statutory,
      bank: employeeData.bank,
      education: employeeData.education || [],
      experience: employeeData.experience || [],
      employment: employeeData.employment,
      documents: employeeData.documents || { educationDocs: [], otherDocs: [] },
      role: 'employee' // Set default role
    };
    
    console.log('Mapped user data:', JSON.stringify(userData, null, 2));
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Generate employee ID if not provided
    if (!userData.personal?.employeeId) {
      const lastEmployee = await User.findOne({}, {}, { sort: { 'personal.employeeId': -1 } });
      const lastId = lastEmployee?.personal?.employeeId ? parseInt(lastEmployee.personal.employeeId.replace('EMP', '')) : 0;
      userData.personal = {
        ...userData.personal,
        employeeId: `EMP${String(lastId + 1).padStart(3, '0')}`
      };
    }

    // Generate default password for new employee
    if (!userData.password) {
      const defaultPassword = userData.personal?.employeeId || 'password123';
      userData.password = await bcrypt.hash(defaultPassword, 12);
    }

    const employee = new User(userData);
    await employee.save();

    console.log('Employee created successfully:', employee._id);
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employeeData = req.body;
    console.log('Update employee - Received data:', JSON.stringify(employeeData, null, 2));
    
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    console.log('Update employee - Current employee data:', {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      personal: employee.personal
    });

    // Map nested data to root level for User model
    const userData = {
      firstName: employeeData.personal?.firstName || employee.firstName,
      lastName: employeeData.personal?.lastName || employee.lastName,
      email: employeeData.contact?.email || employee.email,
      personal: {
        ...(employee.personal || {}),
        ...(employeeData.personal || {})
      },
      contact: {
        ...(employee.contact || {}),
        ...(employeeData.contact || {})
      },
      statutory: {
        ...(employee.statutory || {}),
        ...(employeeData.statutory || {})
      },
      bank: {
        ...(employee.bank || {}),
        ...(employeeData.bank || {})
      },
      education: employeeData.education || employee.education || [],
      experience: employeeData.experience || employee.experience || [],
      employment: {
        ...(employee.employment || {}),
        ...(employeeData.employment || {})
      },
      documents: {
        ...(employee.documents || {}),
        ...(employeeData.documents || {})
      }
    };
    
    console.log('Update employee - Mapped user data:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      personal: userData.personal
    });

    // Check if email is being changed and if it already exists
    if (userData.email && userData.email !== employee.email) {
      const existingUser = await User.findOne({ email: userData.email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      req.params.id,
      userData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log('Update employee - Final updated employee:', {
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      email: updatedEmployee.email,
      personal: updatedEmployee.personal
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee: updatedEmployee }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
