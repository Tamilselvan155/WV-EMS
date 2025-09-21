const testEmployee = {
  personal: {
    firstName: "John",
    lastName: "Doe",
    employeeId: "EMP001",
    dob: "1990-01-01",
    gender: "male",
    bloodGroup: "A+",
    maritalStatus: "single"
  },
  contact: {
    email: "john.doe@test.com",
    phone: "1234567890",
    address: {
      current: "123 Test Street",
      permanent: "123 Test Street"
    },
    emergencyContact: {
      name: "Jane Doe",
      relation: "Spouse",
      phone: "0987654321"
    }
  },
  employment: {
    department: "IT",
    designation: "Developer",
    joiningDate: "2024-01-01",
    employmentType: "fulltime",
    salary: 50000,
    status: "active"
  },
  statutory: {
    pan: "ABCDE1234F",
    aadhaar: "123456789012"
  },
  bank: {
    accountNumber: "1234567890",
    ifsc: "SBIN0001234",
    bankName: "State Bank",
    branch: "Main Branch",
    accountType: "savings"
  },
  education: [],
  experience: [],
  documents: {
    educationDocs: [],
    otherDocs: []
  }
};

fetch('http://localhost:5000/api/employees/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testEmployee)
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});
