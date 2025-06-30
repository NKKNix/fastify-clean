// tests/services/userService.test.ts
import { UserService } from '../../src/services/userService';



describe('UserService - createUser', () => {
  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockEventRepo = {
    saveEvent: jest.fn(),
    getAllEvents: jest.fn(),
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  const userService = new UserService(
    mockUserRepository as any,
    mockCacheService as any,
    mockEventRepo as any,
    mockEventPublisher as any
  );

  beforeEach(() => {
    jest.clearAllMocks(); // reset mock calls and data
  });

  it('should create a new user successfully when no cache or DB entry exists', async () => {
    const name = 'Alice';
    const email = 'alice@example.com';

    mockCacheService.get.mockResolvedValue(null);           // No cache
    mockUserRepository.findByEmail.mockResolvedValue(null); // No DB entry
    mockUserRepository.create.mockResolvedValue(undefined);
    mockCacheService.set.mockResolvedValue(undefined);
    mockEventRepo.saveEvent.mockResolvedValue(undefined);
    mockEventPublisher.publish.mockResolvedValue(undefined);

    const result = await userService.createUser(name, email);

    expect(result).toMatchObject({ name, email });
    expect(result.id).toBeDefined();
    expect(mockCacheService.get).toHaveBeenCalledWith(email);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name, email }));
    expect(mockCacheService.set).toHaveBeenCalled();
    expect(mockEventRepo.saveEvent).toHaveBeenCalled();
    expect(mockEventPublisher.publish).toHaveBeenCalled();
  });

  it('should throw error if user already exists in cache', async () => {
    const email = 'cached@example.com';

    mockCacheService.get.mockResolvedValue('{"id":"123", "name":"Cached", "email":"cached@example.com"}');

    await expect(userService.createUser('Cached', email))
      .rejects
      .toThrow('User already exists (from cache)');

    expect(mockCacheService.get).toHaveBeenCalledWith(email);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should throw error if user already exists in DB (and not in cache)', async () => {
    const email = 'db@example.com';

    mockCacheService.get.mockResolvedValue(null); // No cache
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'u1', name: 'FromDB', email });

    await expect(userService.createUser('FromDB', email))
      .rejects
      .toThrow('User already exists');

    expect(mockCacheService.get).toHaveBeenCalledWith(email);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
  describe('findByEmail()', () => {
    it('should return user from cache if exists', async () => {
      // ...
    });

    it('should return user from DB if not in cache', async () => {
      // ...
    });
  });

  describe('getAllEventsLog()', () => {
    it('should return all user events', async () => {
      // ...
    });
  });
});

