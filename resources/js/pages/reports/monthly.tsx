import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { saveAs } from 'file-saver';
import { DownloadCloud } from 'lucide-react';
import React, { useState } from 'react';
import * as XLSX from 'xlsx-js-style'; // CHANGED TO xlsx-js-style

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Monthly Attendance Report', href: '/reports/monthly-attendance' },
];

interface Employee {
    id: string;
    name: string;
    department: {
        name: string;
        workdays?: Array<{
            day: string;
            is_working: boolean;
            start_time: string | null;
            end_time: string | null;
        }>;
    } | null;
}

interface AttendanceRecord {
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    leave_type?: string | null;
    late_minutes: number;
    late_deduction: number;
}

interface CalendarDay {
    date: string;
    date_string: string;
    day_name: string;
    english_day_name: string;
    is_weekend: boolean;
    is_sunday: boolean;
    holidays: string[];
}

interface Department {
    id: number;
    name: string;
}

interface HolidaySummary {
    name: string;
    dates: string;
    total: number;
}

interface PageProps {
    startDate: string;
    endDate: string;
    monthName: string;
    departments: Department[];
    employees: Employee[];
    attendanceMap: Record<string, Record<string, AttendanceRecord>>;
    calendar: CalendarDay[];
    holidaysSummary: HolidaySummary[];
    selectedDepartment: number | null;
}

export default function MonthlyReport() {
    const {
        startDate, endDate, monthName, departments, employees,
        attendanceMap, calendar, holidaysSummary, selectedDepartment,
    } = usePage<any>().props as PageProps;

    const [filterStartDate, setFilterStartDate] = useState(startDate);
    const [filterEndDate, setFilterEndDate] = useState(endDate);
    const [filterDepartment, setFilterDepartment] = useState<string>(
        selectedDepartment ? String(selectedDepartment) : '',
    );
    const [activeTab, setActiveTab] = useState<'REKAP' | string>('REKAP');

    const applyFilter = (startVal: string, endVal: string, deptVal: string) => {
        router.get('/reports/monthly-attendance', {
            start_date: startVal, end_date: endVal, department_id: deptVal || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFilterStartDate(val);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFilterEndDate(val);
    };

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFilterDepartment(val);
    };

    const applyFilters = () => {
        applyFilter(filterStartDate, filterEndDate, filterDepartment);
    };

    const clearFilters = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterDepartment('');
        router.get('/reports/monthly-attendance');
    };

    // Calculate Employee Summary
    const employeeSummaries = employees.map(emp => {
        let presensi = 0; let terlambat = 0; let sakit = 0; let izin = 0; let cuti = 0; let alpha = 0;
        
        calendar.forEach(cDay => {
            const isLibur = cDay.is_sunday || (cDay.holidays && cDay.holidays.length > 0);
            const record = attendanceMap[cDay.date]?.[emp.id];
            
            if (record) {
                if (record.status === 'present') { presensi++; }
                else if (record.status === 'absent') { if (!isLibur) alpha++; }
                else if (record.status === 'leave') {
                    const ltype = (record.leave_type || '').toLowerCase();
                    if (ltype === 'sick' || ltype === 'sakit') sakit++;
                    else if (ltype === 'cuti' || ltype === 'annual_leave') cuti++;
                    else izin++;
                }
                
                if (record.late_minutes > 0) {
                    terlambat += record.late_minutes;
                }
            } else {
                if (!isLibur) {
                    // Check if it's a workday for this employee's department
                    const workDays = emp.department?.workdays || [];
                    const dWork = workDays.find(w => w.day === cDay.english_day_name);
                    if (dWork && dWork.is_working) {
                        alpha++;
                    }
                }
            }
        });
        
        return { emp, presensi, terlambat, sakit, izin, cuti, alpha };
    });

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // 1. Defining Styles
        const createCell = (value: any, style: any = {}) => ({ v: value ?? '', t: typeof value === 'number' ? 'n' : 's', s: style });

        const titleStyle = { font: { bold: true, sz: 11 }, alignment: { horizontal: "center", vertical: "center" } };
        const hdrFill = { fgColor: { rgb: "041E66" } };
        const hdrFont = { color: { rgb: "FFFFFF" }, bold: true, sz: 10 };
        const borderThin = {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } }
        };

        const thStyle = { fill: hdrFill, font: hdrFont, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: borderThin };
        const tdCenter = { alignment: { horizontal: "center", vertical: "center" }, border: borderThin, font: { sz: 10 } };
        const tdLeft = { alignment: { horizontal: "left", vertical: "center" }, border: borderThin, font: { sz: 10 } };

        const holBg = { fgColor: { rgb: "FFCCCC" } };
        const holFont = { color: { rgb: "FF0000" }, sz: 10 };
        const tHolCenter = { fill: holBg, font: holFont, alignment: { horizontal: "center", vertical: "center" }, border: borderThin };
        const tHolLeft = { fill: holBg, font: holFont, alignment: { horizontal: "left", vertical: "center" }, border: borderThin };

        const summaryBoxThStyle = { fill: hdrFill, font: hdrFont, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: borderThin };
        const summaryBoxTdStyle = { alignment: { horizontal: "center", vertical: "center" }, font: { sz: 16 }, border: borderThin };

        // Parse YYYY-MM-DD to DD Month YYYY for display
        const parseIndonesianDate = (dString: string) => {
            if (!dString) return '';
            const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            const [y, m, d] = dString.split('-');
            return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
        };
        const periodStr = `PERIODE ${parseIndonesianDate(startDate)} - ${parseIndonesianDate(endDate)}`.toUpperCase();

        // REKAP SHEET
        const rekapAoa: any[][] = [];
        rekapAoa.push([createCell(`PRESENSI PT. SOLUSI MAKMUR SINERGI OPTIMA`, titleStyle)]);
        rekapAoa.push([createCell(periodStr, titleStyle)]);
        rekapAoa.push([]);
        rekapAoa.push([
            createCell('NO', thStyle), createCell('NAMA KARYAWAN', thStyle), createCell('POSISI', thStyle), 
            createCell('JUMLAH PRESENSI', thStyle), createCell('TOTAL TERLAMBAT', thStyle), 
            createCell('SAKIT', thStyle), createCell('IZIN', thStyle), createCell('CUTI', thStyle), createCell('ALPHA', thStyle)
        ]);
        
        employeeSummaries.forEach((s, idx) => {
            rekapAoa.push([
                createCell(idx + 1, tdCenter), 
                createCell(s.emp.name, tdLeft), 
                createCell(s.emp.department?.name || '-', tdLeft),
                createCell(s.presensi, tdCenter), createCell(s.terlambat, tdCenter), 
                createCell(s.sakit, tdCenter), createCell(s.izin, tdCenter), 
                createCell(s.cuti, tdCenter), createCell(s.alpha, tdCenter)
            ]);
        });
        
        rekapAoa.push([]); rekapAoa.push([]);
        
        // Tanggal Libur block
        rekapAoa.push([createCell('NO', thStyle), createCell('KETERANGAN', thStyle), createCell('TANGGAL LIBUR', thStyle)]);
        (holidaysSummary || []).forEach((hs, idx) => {
            rekapAoa.push([createCell(idx + 1, tdCenter), createCell(hs.name, tdLeft), createCell(hs.dates, tdLeft)]);
        });
        rekapAoa.push([createCell('', tdCenter), createCell('TOTAL', tdCenter), createCell(`${(holidaysSummary || []).reduce((a, b) => a + b.total, 0)} hari`, tdLeft)]);

        const wsRekap = XLSX.utils.aoa_to_sheet(rekapAoa);
        wsRekap['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
        ];
        
        // Define column widths for REKAP
        wsRekap['!cols'] = [
            { wpx: 40 },  { wpx: 180 }, { wpx: 160 },
            { wpx: 90 }, { wpx: 90 }, { wpx: 60 },
            { wpx: 60 }, { wpx: 60 }, { wpx: 60 }
        ];

        XLSX.utils.book_append_sheet(wb, wsRekap, 'REKAP');

        // INDIVIDUAL SHEETS
        employees.forEach(emp => {
            const empAoa: any[][] = [];
            empAoa.push([createCell(`PRESENSI PT. SOLUSI MAKMUR SINERGI OPTIMA`, titleStyle)]);
            empAoa.push([createCell(`${emp.name.toUpperCase()}`, titleStyle)]);
            empAoa.push([]);
            
            const tableHeaders = [
                'Tanggal Absen', 'Karyawan', 'Hari Absen', 'Jam Masuk Kantor', 'Jam Pulang Kantor',
                'Jam Masuk Absen', 'Jam Pulang Absen', 'Waktu Keterlambatan\n(Menit)', 'Status Absen\nMasuk',
                'Status Absen\nPulang', 'Keterangan'
            ];
            
            const headerRow = tableHeaders.map(h => createCell(h, thStyle));
            headerRow.push(createCell('')); // Empty Gap column (L)
            headerRow.push(createCell('Total Waktu Terlambat', summaryBoxThStyle)); // Column M
            headerRow.push(createCell('', summaryBoxThStyle)); // Merge M-N
            empAoa.push(headerRow);

            const summary = employeeSummaries.find(s => s.emp.id === emp.id);

            calendar.forEach((cDay, idx) => {
                const workDays = emp.department?.workdays || [];
                const dWork = workDays.find(w => w.day === cDay.english_day_name);
                const jamMasukKantor = dWork && dWork.is_working ? dWork.start_time?.substring(0,5) || '-' : '-';
                const jamPulangKantor = dWork && dWork.is_working ? dWork.end_time?.substring(0,5) || '-' : '-';
                
                const isLibur = cDay.is_sunday || (cDay.holidays && cDay.holidays.length > 0);
                const record = attendanceMap[cDay.date]?.[emp.id];
                
                let jamMasukAbsen = '-'; let jamPulangAbsen = '-'; let terlambat = 0; let statusM = ''; let statusP = ''; let note = '';

                if (isLibur && !record) {
                    statusM = 'LIBUR'; statusP = 'LIBUR';
                } else if (record) {
                    if (record.status === 'present') {
                        jamMasukAbsen = record.clock_in ? record.clock_in.substring(11, 16) : '-';
                        jamPulangAbsen = record.clock_out ? record.clock_out.substring(11, 16) : '-';
                        terlambat = record.late_minutes;
                    } else if (record.status === 'absent') {
                        statusM = 'ALPA'; statusP = 'ALPA';
                    } else if (record.status === 'leave') {
                        const ltype = (record.leave_type || 'IZIN').toUpperCase();
                        statusM = ltype; statusP = ltype;
                    }
                } else {
                    if (dWork && dWork.is_working) {
                        statusM = 'ALPA'; statusP = 'ALPA';
                    }
                }

                const [yr, mo, dy] = cDay.date.split('-');
                const formattedDateStr = `${dy}/${mo}/${yr.substring(2)}`;

                // Determine if we apply holiday styles to the entire row
                const isHolRow = isLibur && !record;
                const cCenter = isHolRow ? tHolCenter : tdCenter;
                const cLeft = isHolRow ? tHolLeft : tdLeft;

                const row = [
                    createCell(formattedDateStr, cCenter), 
                    createCell(emp.name, cLeft), 
                    createCell(cDay.day_name, cCenter), 
                    createCell(jamMasukKantor, cCenter), 
                    createCell(jamPulangKantor, cCenter),
                    createCell(jamMasukAbsen, cCenter), 
                    createCell(jamPulangAbsen, cCenter), 
                    createCell(terlambat, cCenter), 
                    createCell(statusM, cCenter), 
                    createCell(statusP, cCenter), 
                    createCell(note, cLeft)
                ];
                
                // Add the offset box on the first rows
                if (idx === 0) {
                    row.push(createCell('')); // Empty L
                    row.push(createCell(summary?.terlambat || 0, summaryBoxTdStyle)); // M
                    row.push(createCell('', summaryBoxTdStyle)); // N
                } else if (idx === 1 || idx === 2) {
                    // Empty blocks to fulfill merge requirement visually if necessary
                    // (merging handles this, so we just provide empty)
                }

                empAoa.push(row);
            });

            const wsEmp = XLSX.utils.aoa_to_sheet(empAoa);
            wsEmp['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
                { s: { r: 3, c: 12 }, e: { r: 3, c: 13 } }, // Header Total
                { s: { r: 4, c: 12 }, e: { r: 8, c: 13 } }  // Value Box (span 5 rows)
            ];

            // Define column widths for INDIVIDUAL map
            wsEmp['!cols'] = [
                { wpx: 80 }, { wpx: 150 }, { wpx: 80 }, { wpx: 80 }, { wpx: 80 }, 
                { wpx: 80 }, { wpx: 80 }, { wpx: 100 }, { wpx: 90 }, { wpx: 90 }, { wpx: 100 },
                { wpx: 30 }, { wpx: 60 }, { wpx: 60 } // L, M, N
            ];

            const shortName = emp.name.split(' ')[0].substring(0, 31).toUpperCase();
            XLSX.utils.book_append_sheet(wb, wsEmp, shortName);
        });

        // Write and Save
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Laporan_Absensi_${startDate}_to_${endDate}.xlsx`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Report ${monthName}`} />
            <div className="m-4 flex flex-col gap-4">
                <Card>
                    <CardHeader><CardTitle>Filter Report</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={filterStartDate} onChange={handleStartDateChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={filterEndDate} onChange={handleEndDateChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <NativeSelect value={filterDepartment} onChange={handleDepartmentChange}>
                                <NativeSelectOption value="">All Departments</NativeSelectOption>
                                {departments.map((dept) => (
                                    <NativeSelectOption key={dept.id} value={dept.id}>{dept.name}</NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-1">
                            <Button onClick={applyFilters}>Filter</Button>
                            <Button variant="outline" onClick={clearFilters}>Clear</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Daftar Absensi Karyawan - {monthName}</CardTitle>
                        <Button variant="default" className="bg-green-600 text-white hover:bg-green-700" onClick={exportToExcel}>
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                    </CardHeader>
                    <CardContent className="max-w-full overflow-x-auto">
                        
                        {/* Custom Tabs Navigation */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('REKAP')}
                                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'REKAP' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                REKAP
                            </button>
                            {employees.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => setActiveTab(emp.id)}
                                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === emp.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {emp.name.split(' ')[0].toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* REKAP View */}
                        {activeTab === 'REKAP' && (
                            <div className="space-y-8">
                                <Table className="min-w-max border dark:border-slate-800">
                                    <TableHeader>
                                        <TableRow className="bg-[#0b2866] hover:bg-[#0b2866] dark:bg-[#0b2866]">
                                            {['NO', 'NAMA KARYAWAN', 'POSISI', 'JUMLAH PRESENSI', 'TOTAL TERLAMBAT', 'SAKIT', 'IZIN', 'CUTI', 'ALPHA'].map((h) => (
                                                <TableHead key={h} className="border border-slate-400 px-4 py-2 text-center text-white font-bold">{h}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employeeSummaries.map((s, idx) => (
                                            <TableRow key={s.emp.id}>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{idx + 1}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2">{s.emp.name}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2">{s.emp.department?.name || '-'}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{s.presensi}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{s.terlambat}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{s.sakit}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{s.izin}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{s.cuti}</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{s.alpha}</TableCell>
                                            </TableRow>
                                        ))}
                                        {employeeSummaries.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={9} className="py-8 text-center text-slate-500">
                                                    No employee data.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Tanggal Libur */}
                                <div className="w-1/2 min-w-[400px]">
                                    <Table className="border dark:border-slate-800">
                                        <TableHeader>
                                            <TableRow className="bg-[#0b2866] hover:bg-[#0b2866] dark:bg-[#0b2866]">
                                                <TableHead className="w-12 border border-slate-400 px-4 py-2 text-center text-white font-bold">NO</TableHead>
                                                <TableHead className="border border-slate-400 px-4 py-2 text-center text-white font-bold">KETERANGAN</TableHead>
                                                <TableHead className="border border-slate-400 px-4 py-2 text-center text-white font-bold">TANGGAL LIBUR</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(holidaysSummary || []).map((hs, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center">{idx + 1}</TableCell>
                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2">{hs.name}</TableCell>
                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2">{hs.dates}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={2} className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-center font-bold">TOTAL</TableCell>
                                                <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold">
                                                    {(holidaysSummary || []).reduce((a, b) => a + b.total, 0)} hari
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Employee Tab View */}
                        {activeTab !== 'REKAP' && employees.find(e => e.id === activeTab) && (() => {
                            const emp = employees.find(e => e.id === activeTab)!;
                            const summary = employeeSummaries.find(s => s.emp.id === emp.id);

                            return (
                                <div className="flex gap-8">
                                    <div className="flex-1 overflow-x-auto">
                                        <Table className="min-w-max border dark:border-slate-800">
                                            <TableHeader>
                                                <TableRow className="bg-[#0b2866] hover:bg-[#0b2866] dark:bg-[#0b2866]">
                                                    {['Tanggal Absen', 'Karyawan', 'Hari Absen', 'Jam Masuk Kantor', 'Jam Pulang Kantor', 'Jam Masuk Absen', 'Jam Pulang Absen', 'Waktu Keterlambatan (Menit)', 'Status Absen Masuk', 'Status Absen Pulang', 'Keterangan'].map((h) => (
                                                        <TableHead key={h} className="border border-slate-400 px-4 py-2 text-center text-white font-bold text-xs max-w-[100px] whitespace-normal">
                                                            {h}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {calendar.map((cDay) => {
                                                    const workDays = emp.department?.workdays || [];
                                                    const dWork = workDays.find(w => w.day === cDay.english_day_name);
                                                    const jamMasukKantor = dWork && dWork.is_working ? dWork.start_time?.substring(0,5) || '-' : '-';
                                                    const jamPulangKantor = dWork && dWork.is_working ? dWork.end_time?.substring(0,5) || '-' : '-';
                                                    
                                                    const isLibur = cDay.is_sunday || (cDay.holidays && cDay.holidays.length > 0);
                                                    const record = attendanceMap[cDay.date]?.[emp.id];
                                                    
                                                    let jamMasukAbsen = '-'; let jamPulangAbsen = '-'; let terlambat = 0; let statusM = ''; let statusP = '';
                                                    const bgClass = isLibur && !record ? 'bg-red-100 dark:bg-red-950/30 text-red-700' : '';

                                                    // Parse YYYY-MM-DD to DD/MM/YY
                                                    const [yr, mo, dy] = cDay.date.split('-');
                                                    const formattedDateStr = `${dy}/${mo}/${yr.substring(2)}`;

                                                    if (isLibur && !record) {
                                                        statusM = 'LIBUR'; statusP = 'LIBUR';
                                                    } else if (record) {
                                                        if (record.status === 'present') {
                                                            jamMasukAbsen = record.clock_in ? record.clock_in.substring(11, 16) : '-';
                                                            jamPulangAbsen = record.clock_out ? record.clock_out.substring(11, 16) : '-';
                                                            terlambat = record.late_minutes;
                                                        } else if (record.status === 'absent') {
                                                            statusM = 'ALPA'; statusP = 'ALPA';
                                                        } else if (record.status === 'leave') {
                                                            const ltype = (record.leave_type || 'IZIN').toUpperCase();
                                                            statusM = ltype; statusP = ltype;
                                                            return (
                                                                <TableRow key={cDay.date} className="bg-yellow-100 dark:bg-yellow-900/30">
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{formattedDateStr}</TableCell>
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{emp.name}</TableCell>
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{cDay.day_name}</TableCell>
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center" colSpan={5}></TableCell>
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center font-bold text-red-600">{statusM}</TableCell>
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center font-bold text-red-600">{statusP}</TableCell>
                                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center"></TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                    } else {
                                                        if (dWork && dWork.is_working) {
                                                            statusM = 'ALPA'; statusP = 'ALPA';
                                                        }
                                                    }

                                                    return (
                                                        <TableRow key={cDay.date} className={bgClass}>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{formattedDateStr}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{emp.name}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{cDay.day_name}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{jamMasukKantor}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{jamPulangKantor}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{jamMasukAbsen}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{jamPulangAbsen}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center">{terlambat || 0}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center font-bold text-red-500">{statusM}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center font-bold text-red-500">{statusP}</TableCell>
                                                            <TableCell className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-center"></TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="w-48 max-w-sm shrink-0">
                                         <Table className="border dark:border-slate-800">
                                            <TableHeader>
                                                <TableRow className="bg-[#0b2866] hover:bg-[#0b2866] dark:bg-[#0b2866]">
                                                    <TableHead className="border border-slate-400 px-4 py-2 text-center text-white font-bold whitespace-nowrap">Total Waktu Terlambat</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="border border-slate-300 dark:border-slate-700 px-4 py-[3.25rem] text-center text-4xl">{summary?.terlambat || 0}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            );
                        })()}

                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
