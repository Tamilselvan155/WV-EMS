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
      'UAN': employee.statutory?.uan || '',
      'ESIC': employee.statutory?.esic || '',
      'Bank Account Number': employee.bank?.accountNumber || '',
      'IFSC': employee.bank?.ifsc || '',
      'Bank Name': employee.bank?.bankName || '',
      'Branch': employee.bank?.branch || '',
      'Account Type': employee.bank?.accountType || '',
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
                uan: String(row['UAN'] || '').trim(),
                esic: String(row['ESIC'] || '').trim()
              },
              bank: {
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
    // Example employee 1 with education and experience
    {
      'Employee ID': 'EMP001',
      'Access Card Number': 'AC123456',
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john.doe@example.com',
      'Phone': '+1234567890',
      'Alternate Phone': '+0987654321',
      'Date of Birth': '1990-01-01',
      'Gender': 'male',
      'Blood Group': 'O+',
      'Marital Status': 'single',
      'Current Address': '123 Main St, City, State',
      'Permanent Address': '123 Main St, City, State',
      'Emergency Contact Name': 'Jane Doe',
      'Emergency Contact Relation': 'Sister',
      'Emergency Contact Phone': '+1122334455',
      'Department': 'IT',
      'Designation': 'Software Developer',
      'Joining Date': '2024-01-01',
      'Employment Type': 'fulltime',
      'Status': 'active',
      'PAN': 'ABCDE1234F',
      'Aadhaar': '123456789012',
      'UAN': '123456789012',
      'ESIC': '123456789012',
      'Bank Account Number': '1234567890',
      'IFSC': 'SBIN0001234',
      'Bank Name': 'State Bank of India',
      'Branch': 'Main Branch',
      'Account Type': 'savings',
      'Document Link': 'https://drive.google.com/drive/folders/...',
      'Education Details': 'undergraduate - University of Technology (2020) - 85% | postgraduate - Advanced Institute (2022) - 90%',
      'Work Experience': 'Software Developer at Tech Corp (Engineering) - 2022-01-01 to 2024-01-01 | Senior Developer at Startup Inc (Engineering) - 2024-01-01 to Present'
    },
    // Example employee 2 with different education and experience
    {
      'Employee ID': 'EMP002',
      'Access Card Number': 'AC789012',
      'First Name': 'Jane',
      'Last Name': 'Smith',
      'Email': 'jane.smith@example.com',
      'Phone': '+9876543210',
      'Alternate Phone': '+1122334455',
      'Date of Birth': '1988-05-15',
      'Gender': 'female',
      'Blood Group': 'A+',
      'Marital Status': 'married',
      'Current Address': '456 Oak Ave, City, State',
      'Permanent Address': '456 Oak Ave, City, State',
      'Emergency Contact Name': 'Bob Smith',
      'Emergency Contact Relation': 'Husband',
      'Emergency Contact Phone': '+9988776655',
      'Department': 'HR',
      'Designation': 'HR Manager',
      'Joining Date': '2023-06-01',
      'Employment Type': 'fulltime',
      'Status': 'active',
      'PAN': 'FGHIJ5678K',
      'Aadhaar': '987654321098',
      'UAN': '987654321098',
      'ESIC': '987654321098',
      'Bank Account Number': '9876543210',
      'IFSC': 'HDFC0001234',
      'Bank Name': 'HDFC Bank',
      'Branch': 'Central Branch',
      'Account Type': 'savings',
      'Document Link': 'https://drive.google.com/drive/folders/...',
      'Education Details': '12th - Central High School (2006) - 92% | undergraduate - Business University (2010) - 88% | postgraduate - Management Institute (2012) - 85%',
      'Work Experience': 'HR Executive at ABC Corp (Human Resources) - 2012-07-01 to 2018-12-31 | HR Manager at XYZ Ltd (Human Resources) - 2019-01-01 to Present'
    }
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
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
    { wch: 50 }  // Work Experience (JSON)
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, 'employee_template.xlsx');
};
