
import { Body, Controller, Post } from '@nestjs/common';
import { CreateValidationDemoDto } from './dto/create-validation-demo.dto';

@Controller('validation-demo')
export class ValidationDemoController {
  @Post()
  create(@Body() dto: CreateValidationDemoDto) {
    // The DTO has already passed global validation.
    return {
      message: 'Request validated successfully!',
      data: dto,
    };
  }
}
