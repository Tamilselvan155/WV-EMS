import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Employee } from '../types';


// Export employees to Excel
export const exportToExcel = (employees: Employee[], filename: string = 'employees.xlsx') => {
  // Prepare data for Excel export - single row per employee with structured education/experience
  const excelData: any[] = [];
  
  employees.forEach(employee => {
    // Format education data as simple readable string
    const educationData = employee.education?.map(edu => 
      `${edu.level} - ${edu.institution} (${edu.year}) - ${edu.percentage}%`
    ).join(' | ') || '';

    // Format experience data as simple readable string
    const experienceData = employee.experience?.map(exp => 
      `${exp.designation} at ${exp.company} (${exp.department}) - ${exp.from} to ${exp.to || 'Present'}`
    ).join(' | ') || '';

    const rowData = {
      'Employee ID': employee.personal?.employeeId || '',
      'Access Card Number': employee.personal?.accessCardNumber || '',
      'First Name': employee.firstName || employee.personal?.firstName || '',
      'Last Name': employee.lastName || employee.personal?.lastName || '',
      'Email': employee.email || employee.contact?.email || '',
      'Phone': employee.contact?.phone || '',
      'Alternate Phone': employee.contact?.alternatePhone || '',
      'Date of Birth': employee.personal?.dob ? (typeof employee.personal.dob === 'string' ? employee.personal.dob.split('T')[0] : new Date(employee.personal.dob).toISOString().split('T')[0]) : '',
      'Gender': employee.personal?.gender || '',
      'Blood Group': employee.personal?.bloodGroup || '',
      'Marital Status': employee.personal?.maritalStatus || '',
      'Current Address': employee.contact?.address?.current || '',
      'Permanent Address': employee.contact?.address?.permanent || '',
      'Emergency Contact Name': employee.contact?.emergencyContact?.name || '',
      'Emergency Contact Relation': employee.contact?.emergencyContact?.relation || '',
      'Emergency Contact Phone': employee.contact?.emergencyContact?.phone || '',
      'Department': employee.employment?.department || '',
      'Designation': employee.employment?.designation || '',
      'Joining Date': employee.employment?.joiningDate ? (typeof employee.employment.joiningDate === 'string' ? employee.employment.joiningDate.split('T')[0] : new Date(employee.employment.joiningDate).toISOString().split('T')[0]) : '',
      'Employment Type': employee.employment?.employmentType || '',
      'Status': employee.employment?.status || '',
      'PAN': employee.statutory?.pan || '',
      'Aadhaar': employee.statutory?.aadhaar || '',
      'PF Number': employee.statutory?.pfNumber || '',
      'UAN': employee.statutory?.uan || '',
      'ESIC': employee.statutory?.esic || '',
      'Bank Account Number': employee.bank?.accountNumber || '',
      'IFSC': employee.bank?.ifsc || '',
      'Bank Name': employee.bank?.bankName || '',
      'Branch': employee.bank?.branch || '',
      'Account Type': employee.bank?.accountType || '',
      'Account Holder Name': employee.bank?.accountHolderName || '',
      'Document Link': employee.documents?.driveLink || '',
      'Education Details': educationData,
      'Work Experience': experienceData,
      'Created At': employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : '',
      'Updated At': employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : ''
    };

      excelData.push(rowData);
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Employee ID
    { wch: 18 }, // Access Card Number
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 15 }, // Alternate Phone
    { wch: 12 }, // Date of Birth
    { wch: 10 }, // Gender
    { wch: 12 }, // Blood Group
    { wch: 15 }, // Marital Status
    { wch: 30 }, // Current Address
    { wch: 30 }, // Permanent Address
    { wch: 20 }, // Emergency Contact Name
    { wch: 15 }, // Emergency Contact Relation
    { wch: 15 }, // Emergency Contact Phone
    { wch: 15 }, // Department
    { wch: 20 }, // Designation
    { wch: 12 }, // Joining Date
    { wch: 15 }, // Employment Type
    { wch: 10 }, // Status
    { wch: 15 }, // PAN
    { wch: 15 }, // Aadhaar
    { wch: 15 }, // UAN
    { wch: 15 }, // ESIC
    { wch: 20 }, // Bank Account Number
    { wch: 15 }, // IFSC
    { wch: 20 }, // Bank Name
    { wch: 20 }, // Branch
    { wch: 15 }, // Account Type
    { wch: 30 }, // Document Link
    { wch: 50 }, // Education Details (JSON)
    { wch: 50 }, // Work Experience (JSON)
    { wch: 12 }, // Created At
    { wch: 12 }  // Updated At
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(data, filename);
};

// Import employees from Excel
export const importFromExcel = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process each row as a complete employee record
        const employees: Employee[] = jsonData.map((row: any) => {
          // Parse education details from simple string format
          let education: any[] = [];
          if (row['Education Details']) {
            const educationEntries = row['Education Details'].split(' | ').filter((entry: string) => entry.trim());
            education = educationEntries.map((entry: string) => {
              // Parse format: "level - institution (year) - percentage%"
              const match = entry.match(/^(.+?)\s*-\s*(.+?)\s*\((\d+)\)\s*-\s*(\d+(?:\.\d+)?)%$/);
              if (match) {
                return {
                  level: match[1].trim(),
                  institution: match[2].trim(),
                  year: parseInt(match[3]),
                  percentage: parseFloat(match[4])
                };
              }
              return null;
            }).filter(Boolean);
          }

          // Parse work experience from simple string format
          let experience: any[] = [];
          if (row['Work Experience']) {
            const experienceEntries = row['Work Experience'].split(' | ').filter((entry: string) => entry.trim());
            experience = experienceEntries.map((entry: string) => {
              // Parse format: "designation at company (department) - from to to"
              const match = entry.match(/^(.+?)\s+at\s+(.+?)\s+\((.+?)\)\s*-\s*(.+?)\s+to\s+(.+)$/);
              if (match) {
                return {
                  designation: match[1].trim(),
                  company: match[2].trim(),
                  department: match[3].trim(),
                  from: match[4].trim(),
                  to: match[5].trim() === 'Present' ? '' : match[5].trim(),
                  current: match[5].trim() === 'Present'
                };
              }
              return null;
            }).filter(Boolean);
          }

          return {
              personal: {
                firstName: String(row['First Name'] || '').trim(),
                lastName: String(row['Last Name'] || '').trim(),
                employeeId: String(row['Employee ID'] || '').trim(),
                accessCardNumber: String(row['Access Card Number'] || '').trim(),
                dob: row['Date of Birth'] || '',
                gender: row['Gender'] || 'male',
                bloodGroup: String(row['Blood Group'] || '').trim(),
                maritalStatus: row['Marital Status'] || 'single'
              },
              contact: {
                email: String(row['Email'] || '').trim(),
                phone: String(row['Phone'] || '').trim(),
                alternatePhone: String(row['Alternate Phone'] || '').trim(),
                address: {
                  current: String(row['Current Address'] || '').trim(),
                  permanent: String(row['Permanent Address'] || '').trim()
                },
                emergencyContact: {
                  name: String(row['Emergency Contact Name'] || '').trim(),
                  relation: String(row['Emergency Contact Relation'] || '').trim(),
                  phone: String(row['Emergency Contact Phone'] || '').trim()
                }
              },
              employment: {
                department: String(row['Department'] || '').trim(),
                designation: String(row['Designation'] || '').trim(),
                joiningDate: row['Joining Date'] || '',
                employmentType: row['Employment Type'] || 'fulltime',
                status: row['Status'] || 'active'
              },
              statutory: {
                pan: String(row['PAN'] || '').trim(),
                aadhaar: String(row['Aadhaar'] || '').trim(),
                pfNumber: String(row['PF Number'] || '').trim(),
                uan: String(row['UAN'] || '').trim(),
                esic: String(row['ESIC'] || '').trim()
              },
              bank: {
                accountHolderName: String(row['Account Holder Name'] || '').trim(),
                accountNumber: String(row['Bank Account Number'] || '').trim(),
                ifsc: String(row['IFSC'] || '').trim(),
                bankName: String(row['Bank Name'] || '').trim(),
                branch: String(row['Branch'] || '').trim(),
                accountType: row['Account Type'] || 'savings'
              },
              documents: {
                driveLink: row['Document Link'] || ''
              },
            education: education,
            experience: experience
          };
        });

        resolve(employees);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Failed to parse Excel file. Please check the file format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Download Excel template
export const downloadTemplate = () => {
  const templateData = [
    // Header row with instructions
    {
      'Employee ID': 'REQUIRED - Format: EMP001, EMP002, etc.',
      'Access Card Number': 'REQUIRED - Format: AC123456, AC789012, etc.',
      'First Name': 'REQUIRED - Employee first name',
      'Last Name': 'REQUIRED - Employee last name',
      'Email': 'REQUIRED - Valid email address',
      'Phone': 'REQUIRED - 10+ digits with country code',
      'Alternate Phone': 'OPTIONAL - 10+ digits with country code',
      'Date of Birth': 'REQUIRED - Format: YYYY-MM-DD (must be 18+ years)',
      'Gender': 'REQUIRED - Options: male, female, other',
      'Blood Group': 'OPTIONAL - Options: A+, A-, B+, B-, AB+, AB-, O+, O-',
      'Marital Status': 'REQUIRED - Options: single, married, divorced, widowed, separated',
      'Current Address': 'REQUIRED - Complete current address (min 10 chars)',
      'Permanent Address': 'OPTIONAL - Complete permanent address (min 10 chars)',
      'Emergency Contact Name': 'REQUIRED - Full name of emergency contact',
      'Emergency Contact Relation': 'REQUIRED - Relationship to employee',
      'Emergency Contact Phone': 'REQUIRED - 10+ digits with country code',
      'Department': 'REQUIRED - Employee department',
      'Designation': 'REQUIRED - Employee job title',
      'Joining Date': 'REQUIRED - Format: YYYY-MM-DD',
      'Employment Type': 'REQUIRED - Options: fulltime, parttime, contract, intern',
      'Status': 'REQUIRED - Options: active, inactive',
      'PAN': 'REQUIRED - Format: AAAAA9999A (5 letters, 4 numbers, 1 letter)',
      'Aadhaar': 'REQUIRED - Exactly 12 digits',
      'PF Number': 'OPTIONAL - 6-25 characters, letters/numbers/-/',
      'UAN': 'OPTIONAL - Exactly 12 digits',
      'ESIC': 'OPTIONAL - Exactly 10 digits',
      'Bank Account Number': 'REQUIRED - 9-18 digits',
      'IFSC': 'REQUIRED - Format: AAAA0XXXXXX (4 letters, 0, 6 alphanumeric)',
      'Bank Name': 'REQUIRED - Bank name',
      'Branch': 'REQUIRED - Branch name',
      'Account Type': 'REQUIRED - Options: savings, current, salary',
      'Account Holder Name': 'OPTIONAL - Name as per bank account',
      'Document Link': 'OPTIONAL - Google Drive or any document link',
      'Education Details': 'OPTIONAL - Format: level - institution (year) - percentage% | level - institution (year) - percentage%',
      'Work Experience': 'OPTIONAL - Format: designation at company (department) - from_date to to_date | designation at company (department) - from_date to Present'
    },
    // Example employee 1 with education and experience
    {
      'Employee ID': 'EMP001',
      'Access Card Number': 'AC123456',
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john.doe@example.com',
      'Phone': '+91-9876543210',
      'Alternate Phone': '+91-9876543211',
      'Date of Birth': '1990-01-01',
      'Gender': 'male',
      'Blood Group': 'O+',
      'Marital Status': 'single',
      'Current Address': '123 Main Street, Koramangala, Bangalore, Karnataka 560034',
      'Permanent Address': '123 Main Street, Koramangala, Bangalore, Karnataka 560034',
      'Emergency Contact Name': 'Jane Doe',
      'Emergency Contact Relation': 'Sister',
      'Emergency Contact Phone': '+91-9876543212',
      'Department': 'IT',
      'Designation': 'Software Developer',
      'Joining Date': '2024-01-01',
      'Employment Type': 'fulltime',
      'Status': 'active',
      'PAN': 'ABCDE1234F',
      'Aadhaar': '123456789012',
      'PF Number': 'PF123456789',
      'UAN': '123456789012',
      'ESIC': '1234567890',
      'Bank Account Number': '1234567890123456',
      'IFSC': 'SBIN0001234',
      'Bank Name': 'State Bank of India',
      'Branch': 'Koramangala Branch',
      'Account Type': 'savings',
      'Account Holder Name': 'John Doe',
      'Document Link': 'https://drive.google.com/drive/folders/1ABC123DEF456GHI789JKL',
      'Education Details': 'undergraduate - Indian Institute of Technology (2020) - 85% | postgraduate - Indian Institute of Science (2022) - 90%',
      'Work Experience': 'Software Developer at Tech Corp (Engineering) - 2022-01-01 to 2024-01-01 | Senior Developer at Startup Inc (Engineering) - 2024-01-01 to Present'
    },
    // Example employee 2 with different education and experience
    {
      'Employee ID': 'EMP002',
      'Access Card Number': 'AC789012',
      'First Name': 'Jane',
      'Last Name': 'Smith',
      'Email': 'jane.smith@example.com',
      'Phone': '+91-9876543213',
      'Alternate Phone': '+91-9876543214',
      'Date of Birth': '1988-05-15',
      'Gender': 'female',
      'Blood Group': 'A+',
      'Marital Status': 'married',
      'Current Address': '456 Oak Avenue, Whitefield, Bangalore, Karnataka 560066',
      'Permanent Address': '456 Oak Avenue, Whitefield, Bangalore, Karnataka 560066',
      'Emergency Contact Name': 'Bob Smith',
      'Emergency Contact Relation': 'Husband',
      'Emergency Contact Phone': '+91-9876543215',
      'Department': 'HR',
      'Designation': 'HR Manager',
      'Joining Date': '2023-06-01',
      'Employment Type': 'fulltime',
      'Status': 'active',
      'PAN': 'FGHIJ5678K',
      'Aadhaar': '987654321098',
      'PF Number': 'PF987654321',
      'UAN': '987654321098',
      'ESIC': '9876543210',
      'Bank Account Number': '9876543210987654',
      'IFSC': 'HDFC0001234',
      'Bank Name': 'HDFC Bank',
      'Branch': 'Whitefield Branch',
      'Account Type': 'savings',
      'Account Holder Name': 'Jane Smith',
      'Document Link': 'https://drive.google.com/drive/folders/2XYZ789ABC123DEF456GHI',
      'Education Details': '12th - Central High School (2006) - 92% | undergraduate - Delhi University (2010) - 88% | postgraduate - IIM Bangalore (2012) - 85%',
      'Work Experience': 'HR Executive at ABC Corp (Human Resources) - 2012-07-01 to 2018-12-31 | HR Manager at XYZ Ltd (Human Resources) - 2019-01-01 to Present'
    },
    // Empty row for user to add their data
    {
      'Employee ID': '',
      'Access Card Number': '',
      'First Name': '',
      'Last Name': '',
      'Email': '',
      'Phone': '',
      'Alternate Phone': '',
      'Date of Birth': '',
      'Gender': '',
      'Blood Group': '',
      'Marital Status': '',
      'Current Address': '',
      'Permanent Address': '',
      'Emergency Contact Name': '',
      'Emergency Contact Relation': '',
      'Emergency Contact Phone': '',
      'Department': '',
      'Designation': '',
      'Joining Date': '',
      'Employment Type': '',
      'Status': '',
      'PAN': '',
      'Aadhaar': '',
      'PF Number': '',
      'UAN': '',
      'ESIC': '',
      'Bank Account Number': '',
      'IFSC': '',
      'Bank Name': '',
      'Branch': '',
      'Account Type': '',
      'Account Holder Name': '',
      'Document Link': '',
      'Education Details': '',
      'Work Experience': ''
    }
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Employee ID
    { wch: 25 }, // Access Card Number
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 30 }, // Email
    { wch: 18 }, // Phone
    { wch: 18 }, // Alternate Phone
    { wch: 15 }, // Date of Birth
    { wch: 12 }, // Gender
    { wch: 15 }, // Blood Group
    { wch: 18 }, // Marital Status
    { wch: 40 }, // Current Address
    { wch: 40 }, // Permanent Address
    { wch: 25 }, // Emergency Contact Name
    { wch: 20 }, // Emergency Contact Relation
    { wch: 20 }, // Emergency Contact Phone
    { wch: 18 }, // Department
    { wch: 25 }, // Designation
    { wch: 15 }, // Joining Date
    { wch: 18 }, // Employment Type
    { wch: 12 }, // Status
    { wch: 18 }, // PAN
    { wch: 18 }, // Aadhaar
    { wch: 18 }, // UAN
    { wch: 15 }, // ESIC
    { wch: 25 }, // Bank Account Number
    { wch: 18 }, // IFSC
    { wch: 25 }, // Bank Name
    { wch: 25 }, // Branch
    { wch: 18 }, // Account Type
    { wch: 40 }, // Document Link
    { wch: 60 }, // Education Details
    { wch: 60 }  // Work Experience
  ];
  worksheet['!cols'] = columnWidths;

  // Add instructions sheet
  const instructionsData = [
    ['EMPLOYEE IMPORT TEMPLATE - INSTRUCTIONS'],
    [''],
    ['This template contains all required fields for importing employees into the Worley Ventures EMS system.'],
    [''],
    ['IMPORTANT NOTES:'],
    ['1. REQUIRED fields must be filled for each employee'],
    ['2. OPTIONAL fields can be left empty'],
    ['3. Follow the exact format specified for each field'],
    ['4. Use the examples provided as a guide'],
    ['5. Delete the instruction row (Row 1) before importing'],
    ['6. Do not modify column headers'],
    [''],
    ['FIELD SPECIFICATIONS:'],
    [''],
    ['PERSONAL INFORMATION:'],
    ['• Employee ID: Format EMP001, EMP002, etc. (auto-generated if empty)'],
    ['• Access Card Number: Format AC123456, AC789012, etc.'],
    ['• First Name: 2-50 characters, letters and spaces only'],
    ['• Last Name: 1-50 characters, letters and spaces only'],
    ['• Date of Birth: YYYY-MM-DD format, must be 18+ years old'],
    ['• Gender: male, female, or other'],
    ['• Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O- (optional)'],
    ['• Marital Status: single, married, divorced, widowed, separated'],
    [''],
    ['CONTACT INFORMATION:'],
    ['• Email: Valid email address format'],
    ['• Phone: 10+ digits with country code (e.g., +91-9876543210)'],
    ['• Current Address: Complete address, minimum 10 characters'],
    ['• Emergency Contact: Name, relation, and phone number required'],
    [''],
    ['EMPLOYMENT INFORMATION:'],
    ['• Department: Employee department name'],
    ['• Designation: Job title'],
    ['• Joining Date: YYYY-MM-DD format'],
    ['• Employment Type: fulltime, parttime, contract, intern'],
    ['• Status: active or inactive'],
    [''],
    ['STATUTORY INFORMATION:'],
    ['• PAN: Format AAAAA9999A (5 letters, 4 numbers, 1 letter)'],
    ['• Aadhaar: Exactly 12 digits'],
    ['• UAN: Exactly 12 digits (optional)'],
    ['• ESIC: Exactly 10 digits (optional)'],
    [''],
    ['BANKING DETAILS:'],
    ['• Account Number: 9-18 digits'],
    ['• IFSC: Format AAAA0XXXXXX (4 letters, 0, 6 alphanumeric)'],
    ['• Bank Name: Full bank name'],
    ['• Branch: Branch name'],
    ['• Account Type: savings, current, or salary'],
    [''],
    ['EDUCATION & EXPERIENCE:'],
    ['• Education Details: Format: level - institution (year) - percentage%'],
    ['  Example: undergraduate - IIT Delhi (2020) - 85% | postgraduate - IIM Bangalore (2022) - 90%'],
    ['• Work Experience: Format: designation at company (department) - from_date to to_date'],
    ['  Example: Software Developer at Tech Corp (Engineering) - 2022-01-01 to 2024-01-01'],
    [''],
    ['DOCUMENTS:'],
    ['• Document Link: Google Drive folder link or any document URL (optional)'],
    [''],
    ['VALIDATION RULES:'],
    ['• All REQUIRED fields must be filled'],
    ['• Email addresses must be unique'],
    ['• Employee IDs must be unique'],
    ['• Access Card Numbers must be unique'],
    ['• Phone numbers must have at least 10 digits'],
    ['• Dates must be in YYYY-MM-DD format'],
    ['• Numeric fields (Aadhaar, UAN, ESIC) must contain only digits'],
    [''],
    ['TROUBLESHOOTING:'],
    ['• If import fails, check the error messages for specific field issues'],
    ['• Ensure all required fields are filled'],
    ['• Verify data formats match the examples'],
    ['• Check for duplicate email addresses, employee IDs, or access card numbers'],
    [''],
    ['For support, contact the IT department or system administrator.']
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  
  // Set column width for instructions sheet
  instructionsSheet['!cols'] = [{ wch: 80 }];
  
  // Add both sheets to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, 'Worley_Ventures_Employee_Import_Template.xlsx');
};
