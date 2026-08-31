// SchedulePage.jsx
import React from 'react';
import { ScheduleHeader } from '../components/schedule/ScheduleHeader';
import { ScheduleTable } from '../components/schedule/ScheduleTable';
import { ScheduleModal } from '../components/schedule/ScheduleModal';
import { UploadPdfModal } from '../components/schedule/UploadPdfModal';
import { ScheduleUploads } from '../components/schedule/ScheduleUploads';
import { useSchedulePage } from '../../admin/hooks/schedule/useSchedulePage';

/**
 * Página de Horarios Semanales.
 * Solo orquesta componentes — toda la lógica vive en useSchedulePage.
 */
export const SchedulePage = () => {
  const userRole = localStorage.getItem('userRole') || 'supervisor';

  const {
    shifts, uploads, loading, isPublished,
    editableSchedules, selectedEmployee, isUploadModalOpen,
    formattedStart, formattedEnd,
    setSelectedEmployee, setIsUploadModalOpen,
    handlePrevWeek, handleNextWeek,
    handleSaveDraft, handlePublish,
    handleUploadFile, handleExportExcel,
    handleChangeShift, handleSaveModal
  } = useSchedulePage();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ScheduleHeader
        startDate={formattedStart}
        endDate={formattedEnd}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        isPublished={isPublished}
        userRole={userRole}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onOpenSwapModal={() => setIsUploadModalOpen(true)}
        onExportExcel={handleExportExcel}
        loading={loading}
      />

      <ScheduleTable
        schedules={editableSchedules}
        userRole={userRole}
        isPublished={isPublished}
        onEditEmployee={setSelectedEmployee}
      />

      <ScheduleModal
        employee={selectedEmployee}
        shifts={shifts}
        onClose={() => setSelectedEmployee(null)}
        onChangeShift={handleChangeShift}
        onSave={handleSaveModal}
      />

      <UploadPdfModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFile}
        loading={loading}
      />

      <ScheduleUploads
        uploads={uploads}
        userRole={userRole}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />
    </div>
  );
};

export default SchedulePage;