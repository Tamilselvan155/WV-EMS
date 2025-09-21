import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@company.com',
    password: 'password',
    role: 'admin',
    personal: {
      employeeId: 'EMP001',
      dob: new Date('1990-05-15'),
      gender: 'male',
      bloodGroup: 'O+',
      maritalStatus: 'single'
    },
    contact: {
      phone: '+1-555-0123',
      address: {
        current: '123 Main St, New York, NY 10001',
        permanent: '456 Oak Ave, Boston, MA 02101'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relation: 'Sister',
        phone: '+1-555-0124'
      }
    },
    statutory: {
      pan: 'ABCDE1234F',
      aadhaar: '1234-5678-9012',
      passport: 'A12345678'
    },
    bank: {
      accountNumber: '1234567890',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      branch: 'Main Branch',
      accountType: 'Savings'
    },
    education: [
      {
        level: 'undergraduate',
        institution: 'MIT',
        year: 2012,
        percentage: 85,
        documentUrl: '/docs/degree.pdf'
      }
    ],
    experience: [
      {
        company: 'Tech Corp',
        designation: 'Software Engineer',
        department: 'Engineering',
        from: new Date('2020-01-01'),
        to: new Date('2023-12-31'),
        salary: 75000,
        reference: 'manager@techcorp.com',
        current: false
      }
    ],
    employment: {
      department: 'Engineering',
      designation: 'Senior Developer',
      joiningDate: new Date('2023-01-15'),
      employmentType: 'fulltime',
      reportingManager: 'Jane Smith',
      salary: 85000,
      status: 'active'
    },
    documents: {
      aadhaarUrl: '/docs/aadhaar.pdf',
      panUrl: '/docs/pan.pdf',
      resumeUrl: '/docs/resume.pdf',
      educationDocs: ['/docs/degree.pdf'],
      otherDocs: []
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'hr@company.com',
    password: 'password',
    role: 'hr',
    personal: {
      employeeId: 'EMP002',
      dob: new Date('1988-08-22'),
      gender: 'female',
      bloodGroup: 'A+',
      maritalStatus: 'married'
    },
    contact: {
      phone: '+1-555-0125',
      address: {
        current: '789 Pine St, San Francisco, CA 94102',
        permanent: '321 Elm St, Portland, OR 97201'
      },
      emergencyContact: {
        name: 'Mike Johnson',
        relation: 'Spouse',
        phone: '+1-555-0126'
      }
    },
    statutory: {
      pan: 'FGHIJ5678K',
      aadhaar: '9876-5432-1098',
      passport: 'B87654321'
    },
    bank: {
      accountNumber: '0987654321',
      ifsc: 'ICICI0005678',
      bankName: 'ICICI Bank',
      branch: 'Downtown Branch',
      accountType: 'Savings'
    },
    education: [
      {
        level: 'postgraduate',
        institution: 'Stanford University',
        year: 2014,
        percentage: 92,
        documentUrl: '/docs/masters.pdf'
      }
    ],
    experience: [
      {
        company: 'Design Studio',
        designation: 'UX Designer',
        department: 'Design',
        from: new Date('2019-03-01'),
        to: new Date('2023-11-30'),
        salary: 65000,
        reference: 'lead@designstudio.com',
        current: false
      }
    ],
    employment: {
      department: 'Human Resources',
      designation: 'HR Manager',
      joiningDate: new Date('2023-02-20'),
      employmentType: 'fulltime',
      reportingManager: 'John Doe',
      salary: 75000,
      status: 'active'
    },
    documents: {
      aadhaarUrl: '/docs/aadhaar2.pdf',
      panUrl: '/docs/pan2.pdf',
      resumeUrl: '/docs/resume2.pdf',
      educationDocs: ['/docs/masters.pdf'],
      otherDocs: []
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'employee@company.com',
    password: 'password',
    role: 'employee',
    personal: {
      employeeId: 'EMP003',
      dob: new Date('1995-03-10'),
      gender: 'male',
      bloodGroup: 'B+',
      maritalStatus: 'single'
    },
    contact: {
      phone: '+1-555-0127',
      address: {
        current: '456 Oak St, Chicago, IL 60601',
        permanent: '789 Maple Ave, Detroit, MI 48201'
      },
      emergencyContact: {
        name: 'Lisa Wilson',
        relation: 'Sister',
        phone: '+1-555-0128'
      }
    },
    statutory: {
      pan: 'KLMNO9012P',
      aadhaar: '5555-6666-7777',
      passport: 'C98765432'
    },
    bank: {
      accountNumber: '1122334455',
      ifsc: 'SBI0009999',
      bankName: 'State Bank of India',
      branch: 'Central Branch',
      accountType: 'Savings'
    },
    education: [
      {
        level: 'undergraduate',
        institution: 'University of Chicago',
        year: 2017,
        percentage: 78,
        documentUrl: '/docs/bachelor.pdf'
      }
    ],
    experience: [
      {
        company: 'Startup Inc',
        designation: 'Junior Developer',
        department: 'Engineering',
        from: new Date('2021-06-01'),
        to: new Date('2023-08-31'),
        salary: 45000,
        reference: 'cto@startup.com',
        current: false
      }
    ],
    employment: {
      department: 'Engineering',
      designation: 'Software Developer',
      joiningDate: new Date('2023-09-01'),
      employmentType: 'fulltime',
      reportingManager: 'John Doe',
      salary: 60000,
      status: 'active'
    },
    documents: {
      aadhaarUrl: '/docs/aadhaar3.pdf',
      panUrl: '/docs/pan3.pdf',
      resumeUrl: '/docs/resume3.pdf',
      educationDocs: ['/docs/bachelor.pdf'],
      otherDocs: []
    }
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create users (password will be hashed by User model's pre-save hook)
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log('🎉 Successfully seeded test users!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@company.com / password');
    console.log('HR: hr@company.com / password');
    console.log('Employee: employee@company.com / password');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedUsers();
