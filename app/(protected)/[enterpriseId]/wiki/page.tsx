import {
  Home03Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import Clock from '@/app/components/shared/clock';
import { BreadCrumb, NavBar } from '@/app/components/shared/navigation/navBar';
import { H4 } from '@/app/components/typography/heading/h4';
import type { BreadCrumbItem } from '@/lib/@types/breadcrumb';
import { helloForUser } from '@/lib/helloForUser';
import { requireAuth } from '@/src/lib/helpers/auth-helper';
import { UserStickies } from '../projects/_components/user-stickies';

const breadCrumbTree: BreadCrumbItem[] = [
  {
    name: 'Início',
    icon: Home03Icon,
  },
];

export default async function WikiPage() {
  const { fullName } = await requireAuth();

  return (
    <div className='h-full w-full flex flex-col'>
      <NavBar>
        <BreadCrumb items={breadCrumbTree} />
      </NavBar>
      <div className='flex-1 w-full overflow-x-hidden overflow-y-auto'>
        <div className='max-w-200 mx-auto w-full flex flex-col items-center justify-center gap-7 p-8'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <H4>
              {helloForUser()}, {fullName}
            </H4>
            <Clock />
          </div>
          <UserStickies />
        </div>
      </div>
    </div>
  );
}
