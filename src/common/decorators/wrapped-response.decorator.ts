import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { BaseResponseDto } from '../dto/base-response.dto';

interface ApiWrappedOptions {
  model: Type<unknown> | null;
  isArray?: boolean;
  status?: number;
  description?: string;
}

export const ApiWrappedResponse = (
  options: ApiWrappedOptions,
): MethodDecorator => {
  const {
    model,
    isArray = false,
    status = 200,
    description = 'Successful response',
  } = options;

  const success = String(status).startsWith('2');

  // Если model null — значит data пустой объект
  const dataSchema =
    model === null
      ? { type: 'object', description: 'Empty object' }
      : isArray
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          }
        : { $ref: getSchemaPath(model) };

  // Подключаем ApiExtraModels, если model != null
  const decorators =
    model !== null
      ? [ApiExtraModels(BaseResponseDto, model)]
      : [ApiExtraModels(BaseResponseDto)];

  return applyDecorators(
    ...decorators,
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: success },
              timestamp: {
                type: 'string',
                format: 'date-time',
                example: new Date().toISOString(),
              },
              data: dataSchema,
            },
          },
        ],
      },
    }),
  );
};
