export * from './lib/guards/restricted-access.guard';

export {
  ACCESS_TOKEN,
  ALLOW_ANONYMOUS,
  AUTH_SERVICE,
  CLAIMS_TO_USER,
  CURRENT_USER,
  type Claims,
  type ClaimsToUserFn,
  type IAuthService
} from './lib/interfaces/auth.interface';

export * from './lib/providers/auth.providers';

export * from './lib/providers/fake-auth.providers';
