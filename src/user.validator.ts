import { BadRequest } from './errors';
import { CreateUser } from './user.model';

type RequiredProps = keyof CreateUser;

const validStr = /^([a-z]{3,}\s?)*/i;

const validationModel: Record<RequiredProps, (a: any) => string | undefined> = {
  username: (name: string): string | undefined => {
    if (!name || typeof name !== 'string' || !validStr.test(name)) {
      return 'name is invalid';
    }
  },
  age: (age: number): string | undefined => {
    if (typeof age !== 'number' || age < 1) {
      return 'age is invalid';
    }
  },
  hobbies: (hobbies: string[]): string | undefined => {
    const invalidItem = hobbies.find((i) => !validStr.test(i));
    if (invalidItem) {
      return `"${invalidItem}" is invalid hobby`;
    }
  },
};

export const canCreate = (user: CreateUser): void => {
  const requiredProps = Object.keys(validationModel) as Array<RequiredProps>;

  for (const prop of requiredProps) {
    const value = user?.[prop];

    const validationResult = value
      ? validationModel[prop](value)
      : prop + ' is required';

    if (validationResult) {
      throw new BadRequest(prop + ' is required');
    }
  }
};
