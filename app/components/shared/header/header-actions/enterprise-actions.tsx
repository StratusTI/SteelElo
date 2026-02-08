'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Small } from '@/app/components/typography/text/small';
import { Smaller } from '@/app/components/typography/text/smaller';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/src/@types/user';

interface EnterpriseActionsProps {
  user: User;
  enterprises: Array<{
    id: number;
    name: string;
  }>;
  currentEnterpriseId?: number;
}

export function EnterpriseActions({
  user,
  enterprises,
  currentEnterpriseId,
}: EnterpriseActionsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [position, setPosition] = useState<string>(
    currentEnterpriseId?.toString() || enterprises?.[0]?.id?.toString() || '',
  );

  useEffect(() => {
    if (currentEnterpriseId) {
      setPosition(currentEnterpriseId.toString());
    } else if (enterprises?.[0]?.id) {
      setPosition(enterprises[0].id.toString());
    }
  }, [enterprises, currentEnterpriseId]);

  const handlePositionChange = (value: string) => {
    setPosition(value);
    const pathParts = pathname.split('/');
    const remainingPath = pathParts.slice(2).join('/');
    const newPath = remainingPath ? `/${value}/${remainingPath}` : `/${value}`;
    router.push(newPath);
  };

  if (!enterprises || enterprises.length === 0) {
    return null;
  }

  const currentEnterprise =
    enterprises.find((e) => e.id.toString() === position) || enterprises[0];

  return (
    <DropdownMenu highlightItemOnHover={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='lg'
            className='p-2 gap-3 rounded-sm justify-between'
          >
            <div className='size-7 bg-branding rounded-md flex items-center justify-center'>
              <Small>{currentEnterprise.name.charAt(0).toUpperCase()}</Small>
            </div>
            <Small>{currentEnterprise.name}</Small>
          </Button>
        }
      />
      <DropdownMenuContent
        className='w-76 my-1 p-3 flex flex-col gap-y-3'
        align='start'
      >
        <DropdownMenuGroup className='h-auto max-h-96 w-full rounded-xl'>
          <DropdownMenuLabel className='mb-1'>
            <Smaller>{user.email}</Smaller>
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={position}
            onValueChange={handlePositionChange}
          >
            {enterprises.map((enterprise) => (
              <DropdownMenuRadioItem
                key={enterprise.id}
                value={enterprise.id.toString()}
                className='aria-checked:bg-sidebar-accent'
              >
                <div className='flex items-center justify-between gap-1 rounded-sm p-1 text-13 text-primary'>
                  <div className='flex items-center justify-start gap-2.5 w-[80%] relative flex-1'>
                    <div className='size-8 bg-branding rounded-md flex items-center justify-center'>
                      <Small>{enterprise.name.charAt(0).toUpperCase()}</Small>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <Small>{enterprise.name}</Small>
                    </div>
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
