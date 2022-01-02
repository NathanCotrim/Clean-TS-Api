import { HttpRequest } from '../protocols/http';
import { AccessDeniedError } from '../errors/access-denied-error';
import { forbidden, ok, serverError } from '../helpers/http/http-helper';
import { AuthMiddleware } from './auth-middleware';
import { LoadAccountByToken } from './auth-middleware-protocols';
import { throwError } from '@/domain/test';
import { mockLoadAccountByTokenRepository } from '@/data/test';

type SutTypes = {
    sut: AuthMiddleware;
    loadAccountByTokenStub: LoadAccountByToken;
};

const makeSut = (role?: string): SutTypes => {
    const loadAccountByTokenStub = mockLoadAccountByTokenRepository();
    const sut = new AuthMiddleware(loadAccountByTokenStub, role);

    return {
        sut,
        loadAccountByTokenStub
    };
};

const mockRequest = (): HttpRequest => ({
    headers: {
        'x-access-token': 'any_token'
    }
});

describe('Auth Middleware', () => {
    it('should return 403 if no x-access-token exists in headers', async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.handle({});

        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()));
    });

    it('should call LoadAccountByToken with correct accessToken', async () => {
        const role = 'any_role';
        const { sut, loadAccountByTokenStub } = makeSut(role);

        const loadSpy = jest.spyOn(loadAccountByTokenStub, 'loadByToken');

        await sut.handle(mockRequest());

        expect(loadSpy).toHaveBeenCalledWith('any_token', 'any_role');
    });

    it('should return 403 if LoadAccountByToken returns null', async () => {
        const { sut, loadAccountByTokenStub } = makeSut();

        jest.spyOn(loadAccountByTokenStub, 'loadByToken').mockReturnValueOnce(
            Promise.resolve(null)
        );

        const httpResponse = await sut.handle(mockRequest());

        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()));
    });

    it('should return 200 if LoadAccountByToken returns an account', async () => {
        const { sut } = makeSut();

        const httpResponse = await sut.handle(mockRequest());

        expect(httpResponse).toEqual(ok({ accountId: 'any_id' }));
    });

    it('should return 500 if LoadAccountByToken throws', async () => {
        const { sut, loadAccountByTokenStub } = makeSut();

        jest.spyOn(
            loadAccountByTokenStub,
            'loadByToken'
        ).mockImplementationOnce(throwError);

        const httpResponse = await sut.handle(mockRequest());

        expect(httpResponse).toEqual(serverError(new Error()));
    });
});
