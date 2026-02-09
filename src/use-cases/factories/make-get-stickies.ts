import { PrismaStickyRepository } from "@/src/repositories/prisma/prisma-sticky-repository";
import { GetStickiesUseCase } from "../get-stickies";

export function makeGetStickiesUseCase(): GetStickiesUseCase {
  const stickyRepository = new PrismaStickyRepository();

  return new GetStickiesUseCase(stickyRepository);
}
