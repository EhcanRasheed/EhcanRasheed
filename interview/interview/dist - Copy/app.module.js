"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const profile_module_1 = require("./profile/profile.module");
const question_module_1 = require("./question/question.module");
const progress_module_1 = require("./progress/progress.module");
const resume_module_1 = require("./resume/resume.module");
const mail_module_1 = require("./mail/mail.module");
const interview_module_1 = require("./interview/interview.module");
const answer_module_1 = require("./answer/answer.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASS || 'amnazia1122',
                database: process.env.DB_NAME || 'interview',
                autoLoadEntities: true,
                synchronize: true,
            }),
            auth_module_1.AuthModule,
            profile_module_1.UserModule,
            question_module_1.QuestionModule,
            progress_module_1.ProgressModule,
            resume_module_1.ResumeModule,
            mail_module_1.MailModule,
            interview_module_1.InterviewModule,
            answer_module_1.AnswerModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map