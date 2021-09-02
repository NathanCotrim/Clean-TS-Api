import { ValidationComposite } from './validation-composite';
import { MissingParamError } from '../../errors';
import { Validation } from './validation';

describe('Validation Composite', () => {
    const makeValidation = (): Validation => {
        class ValidationStub implements Validation {
            validate(input: any): Error | null {
                return null;
            }
        }
        return new ValidationStub();
    };

    interface SutTypes {
        sut: ValidationComposite;
        validationStubs: Validation[];
    }

    const makeSut = (): SutTypes => {
        const validationStubs = [makeValidation(), makeValidation()];
        const sut = new ValidationComposite(validationStubs);
        return {
            sut,
            validationStubs
        };
    };

    it('should return an error if any validation fails', () => {
        const { sut, validationStubs } = makeSut();
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(
            new MissingParamError('field')
        );
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new MissingParamError('field'));
    });

    it('should return the first error if more then one validation fails', () => {
        const { sut, validationStubs } = makeSut();
        jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(
            new Error()
        );
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(
            new MissingParamError('field')
        );
        const error = sut.validate({ field: 'any_value' });
        expect(error).toEqual(new Error());
    });

    it('should not return if validation succeeds', () => {
        const { sut } = makeSut();
        const error = sut.validate({ field: 'any_value' });
        expect(error).toBeFalsy();
    });
});