import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account (Patient or Insurer) and returns a JWT access token.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password.',
  })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}