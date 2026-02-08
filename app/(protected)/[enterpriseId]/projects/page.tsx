import {
  DashboardSquare03Icon,
  Home03Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import { Icon } from '@/app/components/HugeIcons';
import { AIInitialChat } from '@/app/components/shared/ai/ai-initial-chat';
import Clock from '@/app/components/shared/clock';
import { UserQuickLinks } from '@/app/components/shared/company/user/user-quick-link';
import { UserQuickStart } from '@/app/components/shared/company/user/user-quick-start';
import { UserStickies } from '@/app/components/shared/company/user/user-stickies';
import { BreadCrumb, NavBar } from '@/app/components/shared/navigation/navBar';
import { H4 } from '@/app/components/typography/heading/h4';
import { Button } from '@/components/ui/button';
import type { BreadCrumbItem } from '@/lib/@types/breadcrumb';
import { helloForUser } from '@/lib/helloForUser';
import { requireAuth } from '@/src/lib/helpers/auth-helper';

const breadCrumbTree: BreadCrumbItem[] = [
  {
    name: 'Início',
    icon: Home03Icon,
  },
];

export default async function ProjectsPage() {
  const { fullName } = await requireAuth();

  return (
    <div className='h-full w-full flex flex-col'>
      <NavBar>
        <BreadCrumb items={breadCrumbTree} />
        <Button variant='outline' size='sm'>
          <Icon icon={DashboardSquare03Icon} size={16} />
          Gerenciar widgets
        </Button>
      </NavBar>
      <div className='flex-1 w-full overflow-x-hidden overflow-y-auto'>
        <div className='max-w-200 mx-auto w-full flex flex-col items-center justify-center gap-7 p-8'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <H4>{helloForUser()}, {fullName}</H4>
            <Clock />
          </div>
          <AIInitialChat />
          <UserQuickStart />
          <UserQuickLinks />
          <UserStickies />
        </div>
      </div>
    </div>
  );
}
