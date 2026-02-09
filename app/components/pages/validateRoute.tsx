'use client';

import { usePathname } from 'next/navigation';

export function ValidateRoutePage() {
  const pathname = usePathname();

  return (
    <div className='flex flex-col items-center justify-center h-screen text-center mx-auto'>
      {pathname}
    </div>
  );
}
