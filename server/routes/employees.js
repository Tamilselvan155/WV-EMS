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
        { 'personal.employeeId': { $regex: search, $options: 'i' } },
        { 'personal.accessCardNumber': { $regex: search, $options: 'i' } },
        { 'statutory.esic': { $regex: search, $options: 'i' } }
      ];
    }
    // Always constrain to employees list
    query.role = 'employee';
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

// Comprehensive validation function
const validateEmployeeData = (data) => {
  const errors = [];

  // Personal Information Validation
  if (!data.personal?.firstName?.trim()) {
    errors.push('First Name is required');
  } else if (data.personal.firstName.trim().length < 2) {
    errors.push('First Name must be at least 2 characters long');
  } else if (data.personal.firstName.trim().length > 50) {
    errors.push('First Name cannot exceed 50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(data.personal.firstName.trim())) {
    errors.push('First Name can only contain letters and spaces');
  }

  if (!data.personal?.lastName?.trim()) {
    errors.push('Last Name is required');
  } else if (data.personal.lastName.trim().length < 1) {
    errors.push('Last Name cannot be empty');
  } else if (data.personal.lastName.trim().length > 50) {
    errors.push('Last Name cannot exceed 50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(data.personal.lastName.trim())) {
    errors.push('Last Name can only contain letters and spaces');
  }

  if (!data.personal?.employeeId?.trim()) {
    errors.push('Employee ID is required');
  } else if (data.personal.employeeId.trim().length < 3) {
    errors.push('Employee ID must be at least 3 characters long');
  } else if (data.personal.employeeId.trim().length > 20) {
    errors.push('Employee ID cannot exceed 20 characters');
  } else if (!/^[A-Z0-9]+$/.test(data.personal.employeeId.trim())) {
    errors.push('Employee ID can only contain uppercase letters and numbers');
  }

  if (!data.personal?.accessCardNumber?.trim()) {
    errors.push('Access Card Number is required');
  } else if (data.personal.accessCardNumber.trim().length < 3) {
    errors.push('Access Card Number must be at least 3 characters long');
  } else if (data.personal.accessCardNumber.trim().length > 20) {
    errors.push('Access Card Number cannot exceed 20 characters');
  } else if (!/^[A-Z0-9]+$/.test(data.personal.accessCardNumber.trim())) {
    errors.push('Access Card Number can only contain uppercase letters and numbers');
  }

  if (data.personal?.dob) {
    const dob = new Date(data.personal.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (dob > today) {
      errors.push('Date of Birth cannot be in the future');
    } else if (age < 18) {
      errors.push('Employee must be at least 18 years old');
    } else if (age > 100) {
      errors.push('Please enter a valid Date of Birth');
    }
  }

  // Contact Information Validation
  if (!data.contact?.email?.trim()) {
    errors.push('Email Address is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email.trim())) {
    errors.push('Please enter a valid email address');
  } else if (data.contact.email.trim().length > 100) {
    errors.push('Email address cannot exceed 100 characters');
  }

  if (!data.contact?.phone?.trim()) {
    errors.push('Phone Number is required');
  } else if (!/^[0-9+\-\s()]+$/.test(data.contact.phone.trim())) {
    errors.push('Phone Number can only contain numbers, spaces, +, -, and parentheses');
  } else if (data.contact.phone.replace(/[^0-9]/g, '').length < 10) {
    errors.push('Phone Number must have at least 10 digits');
  } else if (data.contact.phone.replace(/[^0-9]/g, '').length > 15) {
    errors.push('Phone Number cannot exceed 15 digits');
  }

  if (data.contact?.alternatePhone?.trim()) {
    if (!/^[0-9+\-\s()]+$/.test(data.contact.alternatePhone.trim())) {
      errors.push('Alternate Phone Number can only contain numbers, spaces, +, -, and parentheses');
    } else if (data.contact.alternatePhone.replace(/[^0-9]/g, '').length < 10) {
      errors.push('Alternate Phone Number must have at least 10 digits');
    } else if (data.contact.alternatePhone.replace(/[^0-9]/g, '').length > 15) {
      errors.push('Alternate Phone Number cannot exceed 15 digits');
    }
  }

  if (!data.contact?.address?.current?.trim()) {
    errors.push('Current Address is required');
  } else if (data.contact.address.current.trim().length < 10) {
    errors.push('Current Address must be at least 10 characters long');
  } else if (data.contact.address.current.trim().length > 500) {
    errors.push('Current Address cannot exceed 500 characters');
  }

  if (data.contact?.address?.permanent?.trim()) {
    if (data.contact.address.permanent.trim().length < 10) {
      errors.push('Permanent Address must be at least 10 characters long');
    } else if (data.contact.address.permanent.trim().length > 500) {
      errors.push('Permanent Address cannot exceed 500 characters');
    }
  }

  // Emergency Contact Validation
  if (!data.contact?.emergencyContact?.name?.trim()) {
    errors.push('Emergency Contact Name is required');
  } else if (data.contact.emergencyContact.name.trim().length < 2) {
    errors.push('Emergency Contact Name must be at least 2 characters long');
  } else if (data.contact.emergencyContact.name.trim().length > 100) {
    errors.push('Emergency Contact Name cannot exceed 100 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(data.contact.emergencyContact.name.trim())) {
    errors.push('Emergency Contact Name can only contain letters and spaces');
  }

  if (!data.contact?.emergencyContact?.relation?.trim()) {
    errors.push('Emergency Contact Relation is required');
  } else if (data.contact.emergencyContact.relation.trim().length < 2) {
    errors.push('Emergency Contact Relation must be at least 2 characters long');
  } else if (data.contact.emergencyContact.relation.trim().length > 50) {
    errors.push('Emergency Contact Relation cannot exceed 50 characters');
  }

  if (!data.contact?.emergencyContact?.phone?.trim()) {
    errors.push('Emergency Contact Phone Number is required');
  } else if (!/^[0-9+\-\s()]+$/.test(data.contact.emergencyContact.phone.trim())) {
    errors.push('Emergency Contact Phone Number can only contain numbers, spaces, +, -, and parentheses');
  } else if (data.contact.emergencyContact.phone.replace(/[^0-9]/g, '').length < 10) {
    errors.push('Emergency Contact Phone Number must have at least 10 digits');
  } else if (data.contact.emergencyContact.phone.replace(/[^0-9]/g, '').length > 15) {
    errors.push('Emergency Contact Phone Number cannot exceed 15 digits');
  }

  // Employment Information Validation
  if (!data.employment?.department?.trim()) {
    errors.push('Department is required');
  } else if (data.employment.department.trim().length < 2) {
    errors.push('Department must be at least 2 characters long');
  } else if (data.employment.department.trim().length > 100) {
    errors.push('Department cannot exceed 100 characters');
  }

  if (!data.employment?.designation?.trim()) {
    errors.push('Designation is required');
  } else if (data.employment.designation.trim().length < 2) {
    errors.push('Designation must be at least 2 characters long');
  } else if (data.employment.designation.trim().length > 100) {
    errors.push('Designation cannot exceed 100 characters');
  }

  if (!data.employment?.joiningDate) {
    errors.push('Joining Date is required');
  } else {
    const joiningDate = new Date(data.employment.joiningDate);
    const today = new Date();
    
    if (joiningDate > today) {
      errors.push('Joining Date cannot be in the future');
    } else if (joiningDate < new Date('1900-01-01')) {
      errors.push('Please enter a valid Joining Date');
    }
  }

  // Statutory Information Validation
  const panNumber = data.statutory?.pan ? String(data.statutory.pan).trim() : '';
  if (!panNumber) {
    errors.push('PAN Number is required');
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    errors.push(`PAN Number must be in format: AAAAA9999A (5 letters, 4 numbers, 1 letter) (received: "${panNumber}")`);
  }

  const aadhaarNumber = data.statutory?.aadhaar ? String(data.statutory.aadhaar).trim() : '';
  if (!aadhaarNumber) {
    errors.push('Aadhaar Number is required');
  } else if (!/^[0-9]{12}$/.test(aadhaarNumber)) {
    errors.push(`Aadhaar Number must be exactly 12 digits (received: "${aadhaarNumber}")`);
  }

  const uanNumber = data.statutory?.uan ? String(data.statutory.uan).trim() : '';
  if (uanNumber) {
    if (!/^[0-9]{12}$/.test(uanNumber)) {
      errors.push('UAN Number must be exactly 12 digits');
    }
  }

  const esicNumber = data.statutory?.esic ? String(data.statutory.esic).trim() : '';
  if (esicNumber) {
    if (!/^[0-9]{10}$/.test(esicNumber)) {
      errors.push('ESIC Number must be exactly 10 digits');
    }
  }

  // Banking Details Validation
  const accountNumber = data.bank?.accountNumber ? String(data.bank.accountNumber).trim() : '';
  if (!accountNumber) {
    errors.push('Account Number is required');
  } else if (!/^[0-9]{9,18}$/.test(accountNumber)) {
    errors.push(`Account Number must be between 9 and 18 digits (received: "${accountNumber}")`);
  }

  const ifscCode = data.bank?.ifsc ? String(data.bank.ifsc).trim() : '';
  if (!ifscCode) {
    errors.push('IFSC Code is required');
  } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    errors.push(`IFSC Code must be in format: AAAA0XXXXXX (4 letters, 0, 6 alphanumeric) (received: "${ifscCode}")`);
  }

  if (!data.bank?.bankName?.trim()) {
    errors.push('Bank Name is required');
  } else if (data.bank.bankName.trim().length < 2) {
    errors.push('Bank Name must be at least 2 characters long');
  } else if (data.bank.bankName.trim().length > 100) {
    errors.push('Bank Name cannot exceed 100 characters');
  }

  if (!data.bank?.branch?.trim()) {
    errors.push('Branch is required');
  } else if (data.bank.branch.trim().length < 2) {
    errors.push('Branch must be at least 2 characters long');
  } else if (data.bank.branch.trim().length > 100) {
    errors.push('Branch cannot exceed 100 characters');
  }

  // Education Validation
  if (data.education && data.education.length > 0) {
    data.education.forEach((edu, index) => {
      if (!edu.institution?.trim()) {
        errors.push(`Education ${index + 1}: Institution is required`);
      } else if (edu.institution.trim().length < 2) {
        errors.push(`Education ${index + 1}: Institution must be at least 2 characters long`);
      }

      if (!edu.year || edu.year < 1950 || edu.year > new Date().getFullYear()) {
        errors.push(`Education ${index + 1}: Please enter a valid year`);
      }

      if (edu.percentage < 0 || edu.percentage > 100) {
        errors.push(`Education ${index + 1}: Percentage must be between 0 and 100`);
      }
    });
  }

  // Experience Validation
  if (data.experience && data.experience.length > 0) {
    data.experience.forEach((exp, index) => {
      if (!exp.company?.trim()) {
        errors.push(`Experience ${index + 1}: Company is required`);
      } else if (exp.company.trim().length < 2) {
        errors.push(`Experience ${index + 1}: Company must be at least 2 characters long`);
      }

      if (!exp.designation?.trim()) {
        errors.push(`Experience ${index + 1}: Designation is required`);
      } else if (exp.designation.trim().length < 2) {
        errors.push(`Experience ${index + 1}: Designation must be at least 2 characters long`);
      }

      if (!exp.department?.trim()) {
        errors.push(`Experience ${index + 1}: Department is required`);
      } else if (exp.department.trim().length < 2) {
        errors.push(`Experience ${index + 1}: Department must be at least 2 characters long`);
      }

      if (!exp.from) {
        errors.push(`Experience ${index + 1}: From Date is required`);
      } else {
        const fromDate = new Date(exp.from);
        const today = new Date();
        
        if (fromDate > today) {
          errors.push(`Experience ${index + 1}: From Date cannot be in the future`);
        }
      }

      if (!exp.current && exp.to) {
        const fromDate = new Date(exp.from);
        const toDate = new Date(exp.to);
        
        if (toDate <= fromDate) {
          errors.push(`Experience ${index + 1}: To Date must be after From Date`);
        }
        if (toDate > new Date()) {
          errors.push(`Experience ${index + 1}: To Date cannot be in the future`);
        }
      }
    });
  }

  // Document Validation - Document Link is optional
  if (data.documents?.driveLink?.trim() && !/^https?:\/\/.+/.test(data.documents.driveLink.trim())) {
    errors.push('Please enter a valid URL');
  }

  return errors;
};

// Create new employee
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
    console.log('Received employee data:', JSON.stringify(employeeData, null, 2));
    
    // Comprehensive validation
    const validationErrors = validateEmployeeData(employeeData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }
    
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
      documents: employeeData.documents || { driveLink: '' },
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

    // Check if Employee ID already exists
    if (userData.personal?.employeeId) {
      const existingEmployeeId = await User.findOne({ 'personal.employeeId': userData.personal.employeeId });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Check if Access Card Number already exists
    if (userData.personal?.accessCardNumber) {
      const existingAccessCard = await User.findOne({ 'personal.accessCardNumber': userData.personal.accessCardNumber });
      if (existingAccessCard) {
        return res.status(400).json({
          success: false,
          message: 'Access Card Number already exists'
        });
      }
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
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = `${field} already exists`;
      
      // Provide more specific error messages for nested fields
      if (field === 'personal.employeeId') {
        message = 'Employee ID already exists';
      } else if (field === 'personal.accessCardNumber') {
        message = 'Access Card Number already exists';
      } else if (field === 'email') {
        message = 'Email already exists';
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern
    });
    
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

    // Comprehensive validation
    const validationErrors = validateEmployeeData(employeeData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
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

    // Check if Employee ID is being changed and if it already exists
    if (userData.personal?.employeeId && userData.personal.employeeId !== employee.personal?.employeeId) {
      const existingEmployeeId = await User.findOne({ 
        'personal.employeeId': userData.personal.employeeId, 
        _id: { $ne: req.params.id } 
      });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Check if Access Card Number is being changed and if it already exists
    if (userData.personal?.accessCardNumber && userData.personal.accessCardNumber !== employee.personal?.accessCardNumber) {
      const existingAccessCard = await User.findOne({ 
        'personal.accessCardNumber': userData.personal.accessCardNumber, 
        _id: { $ne: req.params.id } 
      });
      if (existingAccessCard) {
        return res.status(400).json({
          success: false,
          message: 'Access Card Number already exists'
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = `${field} already exists`;
      
      // Provide more specific error messages for nested fields
      if (field === 'personal.employeeId') {
        message = 'Employee ID already exists';
      } else if (field === 'personal.accessCardNumber') {
        message = 'Access Card Number already exists';
      } else if (field === 'email') {
        message = 'Email already exists';
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Bulk import employees
router.post('/bulk', async (req, res) => {
  try {
    const { employees } = req.body;
    
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employees array is required and cannot be empty'
      });
    }

    const results = {
      total: employees.length,
      success: 0,
      failed: 0,
      errors: []
    };

    const successfulEmployees = [];
    const failedEmployees = [];

    // Process each employee
    for (let i = 0; i < employees.length; i++) {
      const employeeData = employees[i];
      const employeeName = `${employeeData.personal?.firstName || ''} ${employeeData.personal?.lastName || ''}`.trim() || `Employee ${i + 1}`;
      
      try {
        // Validate employee data
        const validationErrors = validateEmployeeData(employeeData);
        if (validationErrors.length > 0) {
          failedEmployees.push({
            index: i + 1,
            employee: employeeName,
            error: validationErrors.join(', ')
          });
          results.failed++;
          continue;
        }

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
          documents: employeeData.documents || { driveLink: '' },
          role: 'employee'
        };

        // Check for duplicates
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          failedEmployees.push({
            index: i + 1,
            employee: employeeName,
            error: 'Email already exists'
          });
          results.failed++;
          continue;
        }

        if (userData.personal?.employeeId) {
          const existingEmployeeId = await User.findOne({ 'personal.employeeId': userData.personal.employeeId });
          if (existingEmployeeId) {
            failedEmployees.push({
              index: i + 1,
              employee: employeeName,
              error: 'Employee ID already exists'
            });
            results.failed++;
            continue;
          }
        }

        if (userData.personal?.accessCardNumber) {
          const existingAccessCard = await User.findOne({ 'personal.accessCardNumber': userData.personal.accessCardNumber });
          if (existingAccessCard) {
            failedEmployees.push({
              index: i + 1,
              employee: employeeName,
              error: 'Access Card Number already exists'
            });
            results.failed++;
            continue;
          }
        }

        // Generate employee ID if not provided
        if (!userData.personal?.employeeId) {
          const lastEmployee = await User.findOne({}, {}, { sort: { 'personal.employeeId': -1 } });
          const lastId = lastEmployee?.personal?.employeeId ? parseInt(lastEmployee.personal.employeeId.replace('EMP', '')) : 0;
          userData.personal = {
            ...userData.personal,
            employeeId: `EMP${String(lastId + 1 + i).padStart(3, '0')}`
          };
        }

        // Generate default password
        if (!userData.password) {
          const defaultPassword = userData.personal?.employeeId || 'password123';
          userData.password = await bcrypt.hash(defaultPassword, 12);
        }

        // Create employee
        const employee = new User(userData);
        await employee.save();
        
        successfulEmployees.push(employee);
        results.success++;

      } catch (error) {
        console.error(`Error creating employee ${i + 1} (${employeeName}):`, error);
        
        let errorMessage = 'Unknown error';
        if (error.name === 'ValidationError') {
          errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
        } else if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          if (field === 'personal.employeeId') {
            errorMessage = 'Employee ID already exists';
          } else if (field === 'personal.accessCardNumber') {
            errorMessage = 'Access Card Number already exists';
          } else if (field === 'email') {
            errorMessage = 'Email already exists';
          } else {
            errorMessage = `${field} already exists`;
          }
        } else {
          errorMessage = error.message;
        }

        failedEmployees.push({
          index: i + 1,
          employee: employeeName,
          error: errorMessage
        });
        results.failed++;
      }
    }

    results.errors = failedEmployees;

    res.status(200).json({
      success: true,
      message: `Bulk import completed. ${results.success} employees created successfully, ${results.failed} failed.`,
      data: {
        results,
        successfulEmployees: successfulEmployees.map(emp => ({
          _id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          personal: emp.personal
        }))
      }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk import'
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
