import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Employee } from '../types';

// Export employees to Excel
export const exportToExcel = (employees: Employee[], filename: string = 'employees.xlsx') => {
  // Prepare data for Excel export
  const excelData = employees.map(employee => ({
    'Employee ID': employee.personal?.employeeId || '',
    'First Name': employee.firstName || employee.personal?.firstName || '',
    'Last Name': employee.lastName || employee.personal?.lastName || '',
    'Email': employee.email || employee.contact?.email || '',
    'Phone': employee.contact?.phone || '',
    'Alternate Phone': employee.contact?.alternatePhone || '',
    'Date of Birth': employee.personal?.dob || '',
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
    'Joining Date': employee.employment?.joiningDate || '',
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
    'Aadhaar URL': employee.documents?.aadhaarUrl || '',
    'PAN URL': employee.documents?.panUrl || '',
    'Passport URL': employee.documents?.passportUrl || '',
    'Resume URL': employee.documents?.resumeUrl || '',
    'Offer Letter URL': employee.documents?.offerLetterUrl || '',
    'Education Documents Count': employee.documents?.educationDocs?.length || 0,
    'Other Documents Count': employee.documents?.otherDocs?.length || 0,
    'Education Documents': employee.documents?.educationDocs?.join('; ') || '',
    'Other Documents': employee.documents?.otherDocs?.join('; ') || '',
    'Education Count': employee.education?.length || 0,
    'Experience Count': employee.experience?.length || 0,
    'Created At': employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : '',
    'Updated At': employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : ''
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Employee ID
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
    { wch: 10 }, // Salary
    { wch: 20 }, // Reporting Manager
    { wch: 10 }, // Status
    { wch: 15 }, // PAN
    { wch: 15 }, // Aadhaar
    { wch: 15 }, // Passport
    { wch: 15 }, // UAN
    { wch: 15 }, // ESIC
    { wch: 20 }, // Bank Account Number
    { wch: 15 }, // IFSC
    { wch: 20 }, // Bank Name
    { wch: 20 }, // Branch
    { wch: 15 }, // Account Type
    { wch: 30 }, // Aadhaar URL
    { wch: 30 }, // PAN URL
    { wch: 30 }, // Passport URL
    { wch: 30 }, // Resume URL
    { wch: 30 }, // Offer Letter URL
    { wch: 10 }, // Education Documents Count
    { wch: 10 }, // Other Documents Count
    { wch: 50 }, // Education Documents
    { wch: 50 }, // Other Documents
    { wch: 10 }, // Education Count
    { wch: 10 }, // Experience Count
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

        // Convert Excel data to Employee format
        const employees: Employee[] = jsonData.map((row: any) => ({
          personal: {
            firstName: row['First Name'] || '',
            lastName: row['Last Name'] || '',
            employeeId: row['Employee ID'] || '',
            dob: row['Date of Birth'] || '',
            gender: row['Gender'] || 'male',
            bloodGroup: row['Blood Group'] || '',
            maritalStatus: row['Marital Status'] || 'single'
          },
          contact: {
            email: row['Email'] || '',
            phone: row['Phone'] || '',
            alternatePhone: row['Alternate Phone'] || '',
            address: {
              current: row['Current Address'] || '',
              permanent: row['Permanent Address'] || ''
            },
            emergencyContact: {
              name: row['Emergency Contact Name'] || '',
              relation: row['Emergency Contact Relation'] || '',
              phone: row['Emergency Contact Phone'] || ''
            }
          },
          employment: {
            department: row['Department'] || '',
            designation: row['Designation'] || '',
            joiningDate: row['Joining Date'] || '',
            employmentType: row['Employment Type'] || 'fulltime',
            status: row['Status'] || 'active'
          },
          statutory: {
            pan: row['PAN'] || '',
            aadhaar: row['Aadhaar'] || '',
            uan: row['UAN'] || '',
            esic: row['ESIC'] || ''
          },
          bank: {
            accountNumber: row['Bank Account Number'] || '',
            ifsc: row['IFSC'] || '',
            bankName: row['Bank Name'] || '',
            branch: row['Branch'] || '',
            accountType: row['Account Type'] || 'savings'
          },
          documents: {
            aadhaarUrl: row['Aadhaar URL'] || '',
            panUrl: row['PAN URL'] || '',
            passportUrl: row['Passport URL'] || '',
            resumeUrl: row['Resume URL'] || '',
            offerLetterUrl: row['Offer Letter URL'] || '',
            educationDocs: row['Education Documents'] ? row['Education Documents'].split('; ').filter((doc: string) => doc.trim()) : [],
            otherDocs: row['Other Documents'] ? row['Other Documents'].split('; ').filter((doc: string) => doc.trim()) : []
          },
          education: [],
          experience: []
        }));

        resolve(employees);
      } catch (error) {
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
  const templateData = [{
    'Employee ID': 'EMP001',
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
    'Salary': '50000',
    'Reporting Manager': 'Manager Name',
    'Status': 'active',
    'PAN': 'ABCDE1234F',
    'Aadhaar': '123456789012',
    'Passport': 'A1234567',
    'UAN': '123456789012',
    'ESIC': '123456789012',
    'Bank Account Number': '1234567890',
    'IFSC': 'SBIN0001234',
    'Bank Name': 'State Bank of India',
    'Branch': 'Main Branch',
    'Account Type': 'savings',
    'Aadhaar URL': 'https://example.com/aadhaar.pdf',
    'PAN URL': 'https://example.com/pan.pdf',
    'Passport URL': 'https://example.com/passport.pdf',
    'Resume URL': 'https://example.com/resume.pdf',
    'Offer Letter URL': 'https://example.com/offer-letter.pdf',
    'Education Documents': 'https://example.com/degree1.pdf; https://example.com/degree2.pdf',
    'Other Documents': 'https://example.com/cert1.pdf; https://example.com/cert2.pdf'
  }];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 30 },
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
    { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
    { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 30 }, { wch: 50 }, { wch: 50 }
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, 'employee_template.xlsx');
};
