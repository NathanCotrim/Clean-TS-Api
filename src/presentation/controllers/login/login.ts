import { Authentication } from '../../../domain/usecases/authentication';
import { InvalidParamError, MissingParamError } from '../../errors';
import {
    badRequest,
    serverError,
    unauthorized
} from '../../helpers/http-helper';
import { Controller, HttpRequest, HttpResponse } from '../../protocols';
import { EmailValidator } from '../signup/signup-protocols';

export class LoginController implements Controller {
    private readonly emailValidator: EmailValidator;
    private readonly authentication: Authentication;

    constructor(
        emailValidator: EmailValidator,
        authentication: Authentication
    ) {
        this.emailValidator = emailValidator;
        this.authentication = authentication;
    }

    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredFields = ['email', 'password'];

            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field));
                }
            }

            const { email, password } = httpRequest.body;

            const emailIsValid = this.emailValidator.isValid(email);

            if (!emailIsValid) {
                return badRequest(new InvalidParamError('email'));
            }

            const accessToken = await this.authentication.auth(email, password);

            if (!accessToken) return unauthorized();

            return {
                statusCode: 200,
                body: ''
            };
        } catch (error) {
            return serverError(error);
        }
    }
}