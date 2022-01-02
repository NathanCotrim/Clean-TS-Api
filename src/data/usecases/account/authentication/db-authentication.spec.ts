/* eslint-disable @typescript-eslint/brace-style */
import { DbAuthentication } from './db-authentication';
import {
    LoadAccountByEmailRepository,
    HashComparer,
    Encrypter,
    UpdateAccessTokenRepository
} from './db-authentication-protocols';

import { mockAuthentication, throwError } from '@/domain/test';
import {
    mockEncrypter,
    mockHashComparer,
    mockLoadAccountByEmailRepository,
    mockUpdateAccessTokenRepository
} from '@/data/test';

type SutTypes = {
    sut: DbAuthentication;
    loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository;
    hashComparerStub: HashComparer;
    encrypterStub: Encrypter;
    updateAccessTokenRepositoryStub: UpdateAccessTokenRepository;
};

const makeSut = (): SutTypes => {
    const loadAccountByEmailRepositoryStub = mockLoadAccountByEmailRepository();
    const hashComparerStub = mockHashComparer();
    const encrypterStub = mockEncrypter();
    const updateAccessTokenRepositoryStub = mockUpdateAccessTokenRepository();
    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub
    );
    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub
    };
};

describe('DbAuthentication UseCase', () => {
    it('should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'loadByEmail'
        );
        await sut.auth(mockAuthentication());
        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com');
    });

    it('should throw if LoadAccountByEmailRepository throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'loadByEmail'
        ).mockImplementationOnce(throwError);
        const promise = sut.auth(mockAuthentication());
        await expect(promise).rejects.toThrow();
    });

    it('should return null if LoadAccountByEmailRepository returns null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            'loadByEmail'
        ).mockReturnValueOnce(null);
        const accessToken = await sut.auth(mockAuthentication());
        expect(accessToken).toBeNull();
    });

    it('should call HashComparer with correct values', async () => {
        const { sut, hashComparerStub } = makeSut();
        const compareSpy = jest.spyOn(hashComparerStub, 'compare');
        await sut.auth(mockAuthentication());
        expect(compareSpy).toHaveBeenCalledWith(
            'any_password',
            'hashed_password'
        );
    });

    it('should throw if HashComparer throws', async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, 'compare').mockImplementationOnce(
            throwError
        );
        const promise = sut.auth(mockAuthentication());
        await expect(promise).rejects.toThrow();
    });

    it('should return null if HashComparer returns false', async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(
            Promise.resolve(false)
        );
        const accessToken = await sut.auth(mockAuthentication());
        expect(accessToken).toBeNull();
    });

    it('should call Encrypter with correct id', async () => {
        const { sut, encrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
        await sut.auth(mockAuthentication());
        expect(encryptSpy).toHaveBeenCalledWith('any_id');
    });

    it('should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, 'encrypt').mockImplementationOnce(throwError);
        const promise = sut.auth(mockAuthentication());
        await expect(promise).rejects.toThrow();
    });

    it('should return a token on success', async () => {
        const { sut } = makeSut();
        const accessToken = await sut.auth(mockAuthentication());
        expect(accessToken).toBe('any_token');
    });

    it('should call UpdateAccessTokenRepository with correct values', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        const updateSpy = jest.spyOn(
            updateAccessTokenRepositoryStub,
            'updateAccessToken'
        );
        await sut.auth(mockAuthentication());
        expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token');
    });

    it('should throw if UpdateAccessTokenRepository throws', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        jest.spyOn(
            updateAccessTokenRepositoryStub,
            'updateAccessToken'
        ).mockImplementationOnce(throwError);
        const promise = sut.auth(mockAuthentication());
        await expect(promise).rejects.toThrow();
    });
});
