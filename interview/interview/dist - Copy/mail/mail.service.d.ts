export declare class MailService {
    private transporter;
    constructor();
    private sendMail;
    sendAccountActivation(email: string, name: string, token: string): Promise<void>;
    sendPasswordReset(email: string, name: string, token: string): Promise<void>;
    sendWelcomeEmail(email: string, name: string, role: string): Promise<void>;
}
