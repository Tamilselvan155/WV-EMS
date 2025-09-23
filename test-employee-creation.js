// Test script to verify employee creation
const testEmployeeData = {
  personal: {
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'EMP001',
    dob: new Date('1990-01-15'),
    gender: 'male',
    bloodGroup: 'O+',
    maritalStatus: 'single'
  },
  contact: {
    email: 'john.doe@example.com',
    phone: '+1234567890',
    alternatePhone: '+0987654321',
    address: {
      current: '123 Main St, City, State 12345',
      permanent: '123 Main St, City, State 12345'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Spouse',
      phone: '+1111111111'
    }
  },
  statutory: {
    pan: 'ABCDE1234F',
    aadhaar: '123456789012',
    passport: 'A1234567',
    uan: '123456789012',
    esic: '1234567890123456'
  },
  bank: {
    accountNumber: '1234567890',
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    branch: 'Main Branch',
    accountType: 'savings'
  },
  education: [
    {
      level: 'undergraduate',
      institution: 'University of Technology',
      year: 2012,
      percentage: 85.5
    }
  ],
  experience: [
    {
      company: 'Previous Company',
      designation: 'Software Developer',
      department: 'IT',
      from: new Date('2012-06-01'),
      to: new Date('2023-12-31'),
      current: false
    }
  ],
  employment: {
    department: 'Engineering',
    designation: 'Senior Software Developer',
    joiningDate: new Date('2024-01-01'),
    employmentType: 'fulltime',
    salary: 75000,
    reportingManager: 'Manager Name',
    status: 'active'
  },
  documents: {
    aadhaarUrl: 'https://example.com/aadhaar.pdf',
    panUrl: 'https://example.com/pan.pdf',
    passportUrl: 'https://example.com/passport.pdf',
    resumeUrl: 'https://example.com/resume.pdf',
    offerLetterUrl: 'https://example.com/offer-letter.pdf',
    educationDocs: ['https://example.com/degree.pdf'],
    otherDocs: []
  }
};

console.log('Test employee data structure:');
console.log(JSON.stringify(testEmployeeData, null, 2));

// Test the API endpoint
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
      },
      body: JSON.stringify(testEmployeeData)
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Employee creation test passed!');
    } else {
      console.log('❌ Employee creation test failed:', result.message);
    }
  } catch (error) {
    console.error('❌ API test error:', error);
  }
};

// Uncomment to run the test
// testAPI();

module.exports = { testEmployeeData, testAPI };
