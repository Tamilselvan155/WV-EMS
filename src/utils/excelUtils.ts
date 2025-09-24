import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Employee } from '../types';


// Export employees to Excel
export const exportToExcel = (employees: Employee[], filename: string = 'employees.xlsx') => {
  // Prepare data for Excel export - each education/experience gets its own row
  const excelData: any[] = [];
  
  employees.forEach(employee => {
    const baseData = {
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
      'Created At': employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : '',
      'Updated At': employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : ''
    };

    // If employee has education or experience, create separate rows for each
    const maxEntries = Math.max(
      employee.education?.length || 0,
      employee.experience?.length || 0,
      1 // At least one row per employee
    );

    for (let i = 0; i < maxEntries; i++) {
      const rowData = {
        ...baseData,
        'Education Level': employee.education?.[i]?.level || '',
        'Education Institution': employee.education?.[i]?.institution || '',
        'Education Year': employee.education?.[i]?.year || '',
        'Education Percentage': employee.education?.[i]?.percentage || '',
        'Experience Company': employee.experience?.[i]?.company || '',
        'Experience Designation': employee.experience?.[i]?.designation || '',
        'Experience Department': employee.experience?.[i]?.department || '',
        'Experience From Date': employee.experience?.[i]?.from ? (typeof employee.experience[i].from === 'string' ? employee.experience[i].from.split('T')[0] : new Date(employee.experience[i].from).toISOString().split('T')[0]) : '',
        'Experience To Date': employee.experience?.[i]?.to ? (typeof employee.experience[i].to === 'string' ? employee.experience[i].to.split('T')[0] : new Date(employee.experience[i].to).toISOString().split('T')[0]) : '',
        'Experience Current': employee.experience?.[i]?.current ? 'Yes' : 'No'
      };
      excelData.push(rowData);
    }
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
    { wch: 15 }, // Education Level
    { wch: 25 }, // Education Institution
    { wch: 10 }, // Education Year
    { wch: 12 }, // Education Percentage
    { wch: 20 }, // Experience Company
    { wch: 20 }, // Experience Designation
    { wch: 15 }, // Experience Department
    { wch: 12 }, // Experience From Date
    { wch: 12 }, // Experience To Date
    { wch: 10 }, // Experience Current
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

        // Group rows by Employee ID to combine education/experience entries
        const employeeMap = new Map<string, any>();

        jsonData.forEach((row: any) => {
          const employeeId = row['Employee ID'];
          if (!employeeId) return;

          if (!employeeMap.has(employeeId)) {
            // Create base employee data
            employeeMap.set(employeeId, {
              personal: {
                firstName: row['First Name'] || '',
                lastName: row['Last Name'] || '',
                employeeId: row['Employee ID'] || '',
                accessCardNumber: row['Access Card Number'] || '',
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
                driveLink: row['Document Link'] || ''
              },
              education: [],
              experience: []
            });
          }

          const employee = employeeMap.get(employeeId);

          // Add education entry if present
          if (row['Education Level'] || row['Education Institution']) {
            employee.education.push({
              level: row['Education Level'] || 'undergraduate',
              institution: row['Education Institution'] || '',
              year: parseInt(row['Education Year']) || new Date().getFullYear(),
              percentage: parseFloat(row['Education Percentage']) || 0
            });
          }

          // Add experience entry if present
          if (row['Experience Company'] || row['Experience Designation']) {
            employee.experience.push({
              company: row['Experience Company'] || '',
              designation: row['Experience Designation'] || '',
              department: row['Experience Department'] || '',
              from: row['Experience From Date'] || '',
              to: row['Experience To Date'] || '',
              current: row['Experience Current'] === 'Yes' || row['Experience Current'] === 'yes' || row['Experience Current'] === 'true'
            });
          }
        });

        // Convert map to array
        const employees: Employee[] = Array.from(employeeMap.values());

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
    // First employee with education and experience
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
      'Education Level': 'undergraduate',
      'Education Institution': 'University of Technology',
      'Education Year': '2020',
      'Education Percentage': '85',
      'Experience Company': 'Tech Corp',
      'Experience Designation': 'Software Developer',
      'Experience Department': 'Engineering',
      'Experience From Date': '2022-01-01',
      'Experience To Date': '2024-01-01',
      'Experience Current': 'No'
    },
    // Second row for same employee - additional education
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
      'Education Level': 'postgraduate',
      'Education Institution': 'Advanced Institute',
      'Education Year': '2022',
      'Education Percentage': '90',
      'Experience Company': '',
      'Experience Designation': '',
      'Experience Department': '',
      'Experience From Date': '',
      'Experience To Date': '',
      'Experience Current': 'No'
    },
    // Third row for same employee - additional experience
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
      'Education Level': '',
      'Education Institution': '',
      'Education Year': '',
      'Education Percentage': '',
      'Experience Company': 'Startup Inc',
      'Experience Designation': 'Senior Developer',
      'Experience Department': 'Engineering',
      'Experience From Date': '2024-01-01',
      'Experience To Date': '',
      'Experience Current': 'Yes'
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
    { wch: 15 }, // Education Level
    { wch: 25 }, // Education Institution
    { wch: 10 }, // Education Year
    { wch: 12 }, // Education Percentage
    { wch: 20 }, // Experience Company
    { wch: 20 }, // Experience Designation
    { wch: 15 }, // Experience Department
    { wch: 12 }, // Experience From Date
    { wch: 12 }, // Experience To Date
    { wch: 10 }  // Experience Current
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, 'employee_template.xlsx');
};
