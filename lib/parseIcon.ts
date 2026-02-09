import { IconSvgObject } from "@/src/@types/icon-svg-object";

export const parseIcon = (iconString: string | null | undefined): IconSvgObject => {
  if (!iconString) return undefined;

  try {
    return JSON.parse(iconString) as IconSvgObject;
  } catch {
    return undefined;
  }
};
