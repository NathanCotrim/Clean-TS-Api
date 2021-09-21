import { HttpRequest } from '../protocols/http';
import { AccessDeniedError } from '../errors/access-denied-error';
import { forbidden } from '../helpers/http/http-helper';
import { AuthMiddleware } from './auth-middleware';
import { LoadAccountByToken } from '../../domain/usecases/load-account-by-token';
import { AccountModel } from '../../domain/models/account';

describe('Auth Middleware', () => {
    interface SutTypes {
        sut: AuthMiddleware;
        loadAccountByTokenStub: LoadAccountByToken;
    }

    const makeSut = (): SutTypes => {
        const loadAccountByTokenStub = makeLoadAccountByTokenStub();
        const sut = new AuthMiddleware(loadAccountByTokenStub);

        return {
            sut,
            loadAccountByTokenStub
        };
    };

    const makeLoadAccountByTokenStub = (): LoadAccountByToken => {
        class LoadAccountByTokenStub implements LoadAccountByToken {
            async load(
                accessToken: string,
                role?: string
            ): Promise<AccountModel> {
                return new Promise((resolve) => resolve(makeFakeAccount()));
            }
        }

        return new LoadAccountByTokenStub();
    };

    const makeFakeRequest = (): HttpRequest => ({
        headers: {
            'x-access-token': 'any_token'
        }
    });

    const makeFakeAccount = (): AccountModel => ({
        id: 'any_id',
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
    });

    it('should return 403 if no x-access-token exists in headers', async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.handle({});

        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()));
    });

    it('should call LoadAccountByToken with correct accessToken', async () => {
        const { sut, loadAccountByTokenStub } = makeSut();

        const loadSpy = jest.spyOn(loadAccountByTokenStub, 'load');

        await sut.handle(makeFakeRequest());

        expect(loadSpy).toHaveBeenCalledWith('any_token');
    });
});
