import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Company Settings
  company: {
    name: { type: String, required: true, default: 'Worley Ventures' },
    domain: { type: String, required: true, default: 'worleyventures.com' },
    address: { type: String, default: '123 Business Street, City, State 12345' },
    phone: { type: String, default: '+1 (555) 123-4567' },
    email: { type: String, default: 'hr@worleyventures.com' },
    website: { type: String, default: 'https://www.worleyventures.com' },
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: 'USD' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' }
  },

  // User Management Settings
  userManagement: {
    allowSelfRegistration: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: true },
    passwordMinLength: { type: Number, default: 8, min: 6, max: 20 },
    passwordRequireSpecial: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 30, min: 5, max: 480 },
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 }
  },

  // System Settings
  system: {
    maintenanceMode: { type: Boolean, default: false },
    debugMode: { type: Boolean, default: false },
    logLevel: { 
      type: String, 
      enum: ['error', 'warn', 'info', 'debug'], 
      default: 'info' 
    },
    backupFrequency: { 
      type: String, 
      enum: ['hourly', 'daily', 'weekly', 'monthly'], 
      default: 'daily' 
    },
    dataRetention: { type: Number, default: 365, min: 30, max: 2555 },
    maxFileSize: { type: Number, default: 10, min: 1, max: 100 }
  },

  // Notification Settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    newEmployeeAlert: { type: Boolean, default: true },
    leaveRequestAlert: { type: Boolean, default: true },
    documentExpiryAlert: { type: Boolean, default: true },
    systemMaintenanceAlert: { type: Boolean, default: true }
  },

  // Security Settings
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    ipWhitelist: { type: [String], default: [] },
    sessionTimeout: { type: Number, default: 30 },
    passwordExpiry: { type: Number, default: 90 }, // days
    accountLockoutDuration: { type: Number, default: 15 } // minutes
  },

  // Backup and Data Settings
  backup: {
    autoBackup: { type: Boolean, default: true },
    backupLocation: { type: String, default: 'local' },
    cloudBackup: { type: Boolean, default: false },
    backupRetention: { type: Number, default: 30 }, // days
    lastBackup: { type: Date },
    nextBackup: { type: Date }
  },

  // Audit trail
  lastModified: { type: Date, default: Date.now },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Pre-save middleware to update lastModified
settingsSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

export default mongoose.model('Settings', settingsSchema);
