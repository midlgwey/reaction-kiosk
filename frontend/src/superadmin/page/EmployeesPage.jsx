import React from 'react';
import EmployeesTable from '../components/EmployeesTable';

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <EmployeesTable />
      </div>
    </div>
  );
}