'use client';

import { AdminAuthProvider } from './AdminAuthContext';
import { TimeoutWarning } from './TimeoutWarning';

export const AdminLayoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminAuthProvider>
      {children}
      <TimeoutWarning />
    </AdminAuthProvider>
  );
};
