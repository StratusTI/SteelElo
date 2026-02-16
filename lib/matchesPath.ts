import { usePathname } from 'next/navigation';
import { useEnterprise } from '@/app/providers/enterprise-provider';

export function useMatchesPath() {
  const { enterpriseId } = useEnterprise();
  const pathname = usePathname();

  const matchesPath = (path: string) => {
    const basePath = `/${enterpriseId}${path}`;
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  const buildPath = (path: string) => {
    return `/${enterpriseId}${path}`;
  };

  return { matchesPath, buildPath, pathname, enterpriseId };
}
