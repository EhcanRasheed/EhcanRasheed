const fs = require('fs');
let s = fs.readFileSync('src/admin/admin.service.ts', 'utf8');

if (!s.includes('PaymentRequest')) {
  s = s.replace(/import \{ BankFeedback \} from '..\/question\/entity\/bank-feedback.entity';/, 
    "import { BankFeedback } from '../question/entity/bank-feedback.entity';\nimport { PaymentRequest, PaymentStatus } from './entity/payment.entity';");
    
  s = s.replace(/private readonly feedbackRepo: Repository<BankFeedback>,/,
    "private readonly feedbackRepo: Repository<BankFeedback>,\n    @InjectRepository(PaymentRequest)\n    private readonly paymentRepo: Repository<PaymentRequest>,");

  const methods = \
  // --- Payment Management ---
  async getUserApprovedTierAndPending(userId: number) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    const pending = await this.paymentRepo.findOne({ where: { userId, status: PaymentStatus.PENDING } });
    return { tier: user ? user.role : 'free', pending };
  }

  async submitPaymentRequest(userId: number, email: string, dto: any) {
    const req = this.paymentRepo.create({
      userId,
      userEmail: email,
      requestedTier: dto.requestedTier,
      paymentMethod: dto.paymentMethod,
      screenshotBase64: dto.screenshotBase64,
      status: PaymentStatus.PENDING,
    });
    return this.paymentRepo.save(req);
  }

  async getAllPayments() {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  async approvePayment(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.APPROVED;
    await this.paymentRepo.save(payment);
    return payment;
  }

  async rejectPayment(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.REJECTED;
    return this.paymentRepo.save(payment);
  }

  async deletePayment(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.paymentRepo.remove(payment);
    return { message: 'Deleted' };
  }
\;

  const lastBraceIndex = s.lastIndexOf('}');
  s = s.substring(0, lastBraceIndex) + methods + '\n}\n';
  fs.writeFileSync('src/admin/admin.service.ts', s);
}
console.log('done admin service');
