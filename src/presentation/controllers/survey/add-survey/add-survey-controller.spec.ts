import {
    AddSurvey,
    AddSurveyModel,
    HttpRequest,
    Validation
} from './add-survey-controller-protocols';
import { AddSurveyController } from './add-survey-controller';
import {
    badRequest,
    noContent,
    serverError
} from '../../../helpers/http/http-helper';

describe('Add Survey Controller', () => {
    interface SutTypes {
        sut: AddSurveyController;
        validationStub: Validation;
        addSurveyStub: AddSurvey;
    }

    const makeFakeRequest = (): HttpRequest => ({
        body: {
            question: 'any_question',
            answers: [
                {
                    image: 'any_img',
                    answer: 'any_answer'
                }
            ]
        }
    });

    const makeAddSurveyStub = (): AddSurvey => {
        class AddSurveyStub implements AddSurvey {
            async add(data: AddSurveyModel): Promise<void> {
                return new Promise((resolve) => resolve());
            }
        }

        return new AddSurveyStub();
    };

    const makeValidationStub = (): Validation => {
        class ValidationStub implements Validation {
            validate(input: any): Error {
                return null;
            }
        }

        return new ValidationStub();
    };

    const makeSut = (): SutTypes => {
        const validationStub = makeValidationStub();
        const addSurveyStub = makeAddSurveyStub();
        const sut = new AddSurveyController(validationStub, addSurveyStub);

        return {
            sut,
            validationStub,
            addSurveyStub
        };
    };

    it('should call Validation with correct values', async () => {
        const { sut, validationStub } = makeSut();
        const validateSpy = jest.spyOn(validationStub, 'validate');

        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);

        expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
    });

    it('should return 400 if validation fails', async () => {
        const { sut, validationStub } = makeSut();
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error());

        const httpRequest = makeFakeRequest();
        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(badRequest(new Error()));
    });

    it('should call AddSurvey with correct values', async () => {
        const { sut, addSurveyStub } = makeSut();
        const addSpy = jest.spyOn(addSurveyStub, 'add');

        const httpRequest = makeFakeRequest();
        await sut.handle(httpRequest);

        expect(addSpy).toHaveBeenCalledWith(httpRequest.body);
    });

    it('should return 500 if AddSurvey throws', async () => {
        const { sut, addSurveyStub } = makeSut();
        jest.spyOn(addSurveyStub, 'add').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        );

        const httpResponse = await sut.handle(makeFakeRequest());

        expect(httpResponse).toEqual(serverError(new Error()));
    });

    it('should return 204 if on success', async () => {
        const { sut } = makeSut();

        const httpResponse = await sut.handle(makeFakeRequest());

        expect(httpResponse).toEqual(noContent());
    });
});