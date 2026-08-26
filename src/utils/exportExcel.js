import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

/**
 * Exports complete date-wise attendance records and employee summary as an Excel (.xlsx) file
 * 
 * @param {Array} employees - List of registered employees
 * @param {Array} attendanceRecords - Full attendance logs across all dates
 * @param {Function} getAttendedDaysCount - Helper function to count attended days
 * @param {Function} getTodayAttendanceForUser - Helper function to get today's attendance
 */
export const exportAttendanceToExcel = (
  employees,
  attendanceRecords,
  getAttendedDaysCount,
  getTodayAttendanceForUser
) => {
  const todayFormatted = dayjs().format('YYYY-MM-DD');

  // 1. Prepare SHEET 1: All Date-wise Attendance Logs (sorted by date descending)
  const sortedRecords = [...attendanceRecords].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  );

  const detailedLogsRows = sortedRecords.map((rec, index) => {
    const employee = employees.find((e) => e.id === rec.userId) || {
      name: rec.userName || 'Employee',
      department: '--',
      email: '--'
    };

    const statusText = rec.outTime
      ? 'Completed'
      : rec.inTime
      ? 'In Progress'
      : 'Absent';

    return {
      'S.No': index + 1,
      'Date': rec.date,
      'Day': dayjs(rec.date).format('dddd'),
      'Employee ID': rec.userId,
      'Employee Name': employee.name,
      'Department': employee.department,
      'In-Time': rec.inTime || '--',
      'Out-Time': rec.outTime || '--',
      'Status': statusText
    };
  });

  // If no detailed records exist yet, show clean placeholder
  if (detailedLogsRows.length === 0) {
    detailedLogsRows.push({
      'S.No': 1,
      'Date': todayFormatted,
      'Day': dayjs().format('dddd'),
      'Employee ID': employees[0]?.id || 'N/A',
      'Employee Name': employees[0]?.name || 'N/A',
      'Department': employees[0]?.department || '--',
      'In-Time': '--',
      'Out-Time': '--',
      'Status': 'No records logged'
    });
  }

  // 2. Prepare SHEET 2: Employee Summary (Roster & Attended Days Count)
  const summaryRows = employees.map((emp, index) => {
    const todayRec = getTodayAttendanceForUser(emp.id);
    const attendedDays = getAttendedDaysCount(emp.id);
    const scheduledDays = emp.scheduledDays || 30;
    const rate = Math.round((attendedDays / scheduledDays) * 100) + '%';
    const todayStatus = todayRec?.outTime
      ? 'Completed'
      : todayRec?.inTime
      ? 'In Progress'
      : 'Not Checked In';

    return {
      'S.No': index + 1,
      'Employee ID': emp.id,
      'Employee Name': emp.name,
      'Department': emp.department,
      'Email Address': emp.email,
      "Today's In-Time": todayRec?.inTime || '--',
      "Today's Out-Time": todayRec?.outTime || '--',
      'Total Scheduled Days': scheduledDays,
      'Attended Working Days': attendedDays,
      'Attendance Rate': rate,
      'Today Status': todayStatus
    };
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create Sheet 1: Detailed Logs
  const logsWorksheet = XLSX.utils.json_to_sheet(detailedLogsRows);
  logsWorksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Date
    { wch: 14 }, // Day
    { wch: 15 }, // Employee ID
    { wch: 24 }, // Employee Name
    { wch: 20 }, // Department
    { wch: 18 }, // In-Time
    { wch: 18 }, // Out-Time
    { wch: 16 }  // Status
  ];
  XLSX.utils.book_append_sheet(workbook, logsWorksheet, 'Daily Attendance Logs');

  // Create Sheet 2: Employee Summary
  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
  summaryWorksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 15 }, // Employee ID
    { wch: 24 }, // Employee Name
    { wch: 20 }, // Department
    { wch: 28 }, // Email Address
    { wch: 18 }, // Today's In-Time
    { wch: 18 }, // Today's Out-Time
    { wch: 22 }, // Total Scheduled Days
    { wch: 22 }, // Attended Working Days
    { wch: 16 }, // Attendance Rate
    { wch: 16 }  // Today Status
  ];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Employee Summary');

  const fileName = `Attendance_Records_${todayFormatted}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return { success: true, fileName, totalLogs: sortedRecords.length };
};
