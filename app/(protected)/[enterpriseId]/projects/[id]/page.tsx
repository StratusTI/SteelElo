'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ValidateRoutePage } from '@/app/components/pages/validateRoute';
import { useEnterprise } from '@/app/providers/enterprise-provider';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';

export default function ProjectPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ValidateRoutePage />
    </div>
  )
}
