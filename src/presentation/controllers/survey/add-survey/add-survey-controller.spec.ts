import {
    AddSurvey,
    HttpRequest,
    Validation
} from './add-survey-controller-protocols';
import { AddSurveyController } from './add-survey-controller';
import {
    badRequest,
    noContent,
    serverError
} from '../../../helpers/http/http-helper';
import { throwError } from '@/domain/test';

import mockDate from 'mockdate';
import { mockAddSurvey, mockValidation } from '@/presentation/test';

type SutTypes = {
    sut: AddSurveyController;
    validationSpy: Validation;
    addSurveySpy: AddSurvey;
};

const mockRequest = (): HttpRequest => ({
    body: {
        question: 'any_question',
        answers: [
            {
                image: 'any_img',
                answer: 'any_answer'
            }
        ],
        date: new Date()
    }
});

const makeSut = (): SutTypes => {
    const validationSpy = mockValidation();
    const addSurveySpy = mockAddSurvey();
    const sut = new AddSurveyController(validationSpy, addSurveySpy);

    return {
        sut,
        validationSpy,
        addSurveySpy
    };
};

describe('Add Survey Controller', () => {
    beforeAll(() => {
        mockDate.set(new Date());
    });

    afterAll(() => {
        mockDate.reset();
    });

    it('should call Validation with correct values', async () => {
        const { sut, validationSpy } = makeSut();
        const validateSpy = jest.spyOn(validationSpy, 'validate');

        const httpRequest = mockRequest();
        await sut.handle(httpRequest);

        expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
    });

    it('should return 400 if validation fails', async () => {
        const { sut, validationSpy } = makeSut();
        jest.spyOn(validationSpy, 'validate').mockReturnValueOnce(new Error());

        const httpRequest = mockRequest();
        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(badRequest(new Error()));
    });

    it('should call AddSurvey with correct values', async () => {
        const { sut, addSurveySpy } = makeSut();
        const addSpy = jest.spyOn(addSurveySpy, 'add');

        const httpRequest = mockRequest();
        await sut.handle(httpRequest);

        expect(addSpy).toHaveBeenCalledWith(httpRequest.body);
    });

    it('should return 500 if AddSurvey throws', async () => {
        const { sut, addSurveySpy } = makeSut();
        jest.spyOn(addSurveySpy, 'add').mockImplementationOnce(throwError);

        const httpResponse = await sut.handle(mockRequest());

        expect(httpResponse).toEqual(serverError(new Error()));
    });

    it('should return 204 if on success', async () => {
        const { sut } = makeSut();

        const httpResponse = await sut.handle(mockRequest());

        expect(httpResponse).toEqual(noContent());
    });
});
