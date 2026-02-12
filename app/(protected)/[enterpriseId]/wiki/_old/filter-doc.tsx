'use client'

import { FilterMailIcon, Search01Icon } from "@hugeicons-pro/core-solid-rounded";
import { useState } from "react";
import { Icon } from "@/app/components/HugeIcons";
import { Smaller } from "@/app/components/typography/text/smaller";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";

interface FilterDocProps {
  onSearchChange?: (search: string) => void;
  onFavoritesToggle?: (favOnly: boolean) => void;
}

export function FilterDoc({ onSearchChange, onFavoritesToggle }: FilterDocProps) {
  const [search, setSearch] = useState('');
  const [favOnly, setFavOnly] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleFavoritesToggle = () => {
    const next = !favOnly;
    setFavOnly(next);
    onFavoritesToggle?.(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='outline' size='sm'>
            <Icon icon={FilterMailIcon} size={16} />
            Filter
          </Button>
        }
      />
      <DropdownMenuContent className='min-w-75 p-2.5' align='end'>
        <DropdownMenuGroup className='dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center'>
          <Icon icon={Search01Icon} size={14} />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder='Pesquisar'
            className='text-xs placeholder:text-xs text-muted-foreground h-7 bg-transparent! border-transparent rounded-none border-0 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent flex-1'
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-transparent border-transparent' />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem checked={favOnly} onClick={handleFavoritesToggle}>
            <Smaller>Favoritos</Smaller>
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Data de criação
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem>
            <Smaller>1 semana atrás</Smaller>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            <Smaller>2 semanas atrás</Smaller>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            <Smaller>1 mês atrás</Smaller>
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
