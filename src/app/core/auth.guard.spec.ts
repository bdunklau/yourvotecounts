import { AuthGuard } from './auth.guard';

class MockRouter {
  navigate(path) {}
}

describe('AuthGuard', () => {
  describe('canActivate', () => {
    let authGuard: AuthGuard;
    let authService;
    let router;
  });
});
