'use client'

import {
  AiMagicIcon,
  AlignBoxTopLeftIcon,
  Home03Icon,
  Settings02Icon,
} from "@hugeicons-pro/core-solid-rounded";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEnterprise } from "@/app/providers/enterprise-provider";
import { Icon } from "../../HugeIcons";
import { Smaller } from "../../typography/text/smaller";

const navItems = [
  { path: 'projects', label: 'Projetos', icon: Home03Icon },
  { path: 'wiki', label: 'Wiki', icon: AlignBoxTopLeftIcon },
  { path: 'ai', label: 'AI', icon: AiMagicIcon },
  { path: 'settings', label: 'Config.', icon: Settings02Icon, separated: true },
];

export function GlobalSideBar() {
  const { enterpriseId } = useEnterprise();
  const pathname = usePathname();

  const isRouteActive = (path: string) => {
    const basePath = `/${enterpriseId}/${path}`;
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  return (
    <nav className="shrink-0 transition-all ease-in-out duration-300 w-auto flex flex-col gap-4 px-2 py-3">
      {navItems.map(({ path, label, icon, separated }) => (
        <div key={path}>
          {separated && <div className="border-t border-border mx-2 mb-4" />}
          <Link
            href={`/${enterpriseId}/${path}`}
            className="group flex flex-col gap-1 items-center justify-center text-primary"
          >
            <div
              className={`flex items-center justify-center size-8 rounded-md text-secondary-foreground/90 group-hover:bg-accent group-hover:text-accent-foreground ${
                isRouteActive(path) ? 'bg-accent text-secondary-foreground' : ''
              }`}
            >
              <Icon icon={icon} size={20} />
            </div>
            <Smaller>{label}</Smaller>
          </Link>
        </div>
      ))}
    </nav>
  );
}
