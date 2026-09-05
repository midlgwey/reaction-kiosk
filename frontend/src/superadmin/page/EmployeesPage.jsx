import React from 'react';
import EmployeesTable from '../components/employees/EmployeesTable';

export default function EmployeesPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <EmployeesTable />
      </div>
    </div>
  );
}