const fs = require('fs');
let s = fs.readFileSync('src/admin/admin.service.ts', 'utf8');

if (!s.includes('PaymentRequest')) {
  s = s.replace(/import \{ BankFeedback \} from '..\/question\/entity\/bank-feedback.entity';/, 
    "import { BankFeedback } from '../question/entity/bank-feedback.entity';\nimport { PaymentRequest, PaymentStatus } from './entity/payment.entity';");
    
  s = s.replace(/private readonly feedbackRepo: Repository<BankFeedback>,/,
    "private readonly feedbackRepo: Repository<BankFeedback>,\n    @InjectRepository(PaymentRequest)\n    private readonly paymentRepo: Repository<PaymentRequest>,");

  const methods = 
  "  // --- Payment Management ---\n" +
  "  async getUserApprovedTierAndPending(userId: number) {\n" +
  "    const user = await this.profileRepo.findOne({ where: { id: userId } });\n" +
  "    const pending = await this.paymentRepo.findOne({ where: { userId, status: PaymentStatus.PENDING } });\n" +
  "    return { tier: user ? user.role : 'free', pending };\n" +
  "  }\n\n" +
  "  async submitPaymentRequest(userId: number, email: string, dto: any) {\n" +
  "    const req = this.paymentRepo.create({\n" +
  "      userId,\n" +
  "      userEmail: email,\n" +
  "      requestedTier: dto.requestedTier,\n" +
  "      paymentMethod: dto.paymentMethod,\n" +
  "      screenshotBase64: dto.screenshotBase64,\n" +
  "      status: PaymentStatus.PENDING,\n" +
  "    });\n" +
  "    return this.paymentRepo.save(req);\n" +
  "  }\n\n" +
  "  async getAllPayments() {\n" +
  "    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });\n" +
  "  }\n\n" +
  "  async approvePayment(id: number) {\n" +
  "    const payment = await this.paymentRepo.findOne({ where: { id } });\n" +
  "    if (!payment) throw new NotFoundException('Payment not found');\n" +
  "    payment.status = PaymentStatus.APPROVED;\n" +
  "    await this.paymentRepo.save(payment);\n" +
  "    return payment;\n" +
  "  }\n\n" +
  "  async rejectPayment(id: number) {\n" +
  "    const payment = await this.paymentRepo.findOne({ where: { id } });\n" +
  "    if (!payment) throw new NotFoundException('Payment not found');\n" +
  "    payment.status = PaymentStatus.REJECTED;\n" +
  "    return this.paymentRepo.save(payment);\n" +
  "  }\n\n" +
  "  async deletePayment(id: number) {\n" +
  "    const payment = await this.paymentRepo.findOne({ where: { id } });\n" +
  "    if (!payment) throw new NotFoundException('Payment not found');\n" +
  "    await this.paymentRepo.remove(payment);\n" +
  "    return { message: 'Deleted' };\n" +
  "  }\n";

  const lastBraceIndex = s.lastIndexOf('}');
  s = s.substring(0, lastBraceIndex) + methods + '\n}\n';
  fs.writeFileSync('src/admin/admin.service.ts', s);
}
console.log('done admin service patch');
