'use client';

import AttendanceView from '@/views/admin/AttendanceView';

export default function StaffAttendanceView() {
    // Staff view works exactly the same as Admin for now, 
    // but we wrap it in case we need staff-specific restrictions later.
    return <AttendanceView />;
}
