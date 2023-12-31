import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BaseAbstractRepository } from '@repositories/base/base.abstract.repository';
import { UsersRepositoryInterface } from './users-repository.interface';
import { FilterUserDto, SortUserDto } from '@modules/users/dtos/query-user.dto';
import { IPaginationOptions } from '../../../shared/types/pagination-options';
import { User } from '../domain/user';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UsersRepository
  extends BaseAbstractRepository<UserEntity>
  implements UsersRepositoryInterface
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<UserEntity[]> {
    const where: FindOptionsWhere<UserEntity> = {};
    if (filterOptions?.roles?.length) {
      where.role = filterOptions.roles.map((role) => ({
        id: role.id,
      }));
    }

    return await this.repository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const entity = await this.repository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('User not found');
    }

    const updatedEntity = await this.repository.save(
      this.repository.create(
        UserMapper.toPersistence({
          ...UserMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return UserMapper.toDomain(updatedEntity);
  }
}
