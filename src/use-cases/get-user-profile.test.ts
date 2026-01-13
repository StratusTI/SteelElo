import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { GetUserProfileUseCase } from "./get-user-profile";

let usersRepository: InMemoryUsersRepository;
let sut: GetUserProfileUseCase;

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new GetUserProfileUseCase(usersRepository);
  })

  it('should be able to get user profile', async () => {
    const createdUser = {
      id: 1,
      nome: 'John',
      sobrenome: 'Doe',
      email: 'johndoe@example.com',
      foto: '',
      telefone: '',
      admin: false,
      superadmin: false,
      role: 'member' as const,
      idempresa: null,
      departamento: null,
      time: '',
      online: true
    }

    usersRepository.items.push(createdUser)

    const { user } = await sut.execute({
      userId: 1
    })

    expect(user.id).toEqual(expect.any(Number))
    expect(user.email).toEqual('johndoe@example.com')
  })

  it('should not be able to get user profile with invalid id', async () => {
    await expect(() => sut.execute({
      userId: 999
    })).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
