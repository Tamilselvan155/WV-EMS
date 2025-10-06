import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee'],
    default: 'employee',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  profileImage: {
    type: String,
  },
  
  // Employee-specific fields
  personal: {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    accessCardNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
    },
  },
  
  contact: {
    phone: {
      type: String,
    },
    alternatePhone: {
      type: String,
    },
    address: {
      current: {
        type: String,
      },
      permanent: {
        type: String,
      },
    },
    emergencyContact: {
      name: {
        type: String,
      },
      relation: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
  },
  
  statutory: {
    pan: {
      type: String,
    },
    aadhaar: {
      type: String,
    },
    passport: {
      type: String,
    },
    pfNumber: {
      type: String,
    },
    uan: {
      type: String,
    },
    esic: {
      type: String,
    },
  },
  
  bank: {
    accountHolderName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    ifsc: {
      type: String,
    },
    bankName: {
      type: String,
    },
    branch: {
      type: String,
    },
    accountType: {
      type: String,
    },
  },
  
  education: [{
    level: {
      type: String,
      enum: ['10th', '12th', 'diploma', 'undergraduate', 'postgraduate', 'other'],
    },
    institution: {
      type: String,
    },
    year: {
      type: Number,
    },
    percentage: {
      type: Number,
    },
    documentUrl: {
      type: String,
    },
  }],
  
  experience: [{
    company: {
      type: String,
    },
    designation: {
      type: String,
    },
    department: {
      type: String,
    },
    from: {
      type: Date,
    },
    to: {
      type: Date,
    },
    salary: {
      type: Number,
    },
    reference: {
      type: String,
    },
    current: {
      type: Boolean,
      default: false,
    },
  }],
  
  employment: {
    department: {
      type: String,
    },
    designation: {
      type: String,
    },
    joiningDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ['fulltime', 'parttime', 'contract', 'intern'],
    },
    reportingManager: {
      type: String,
    },
    salary: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  
  documents: {
    driveLink: {
      type: String,
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);