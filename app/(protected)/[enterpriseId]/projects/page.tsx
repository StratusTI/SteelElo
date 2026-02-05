'use client';

import { useSearchParams } from 'next/navigation';
import { ValidateRoutePage } from '@/app/components/pages/validateRoute';

export default function ProjectsHomePage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <ValidateRoutePage />
    </div>
  );
}
