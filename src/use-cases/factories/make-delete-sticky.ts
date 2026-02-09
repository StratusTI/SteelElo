import { PrismaStickyRepository } from "@/src/repositories/prisma/prisma-sticky-repository";
import { DeleteStickyUseCase } from "../delete-sticky";

export function makeDeleteStickyUseCase(): DeleteStickyUseCase {
  const stickyRepository = new PrismaStickyRepository();

  return new DeleteStickyUseCase(stickyRepository);
}
