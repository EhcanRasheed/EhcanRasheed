const fs = require('fs');
let s = fs.readFileSync('src/admin/admin.module.ts', 'utf8');
if (!s.includes('PaymentRequest')) {
  s = s.replace(/import \{ BankFeedback \} from '..\/question\/entity\/bank-feedback.entity';/, 
    "import { BankFeedback } from '../question/entity/bank-feedback.entity';\nimport { PaymentRequest } from './entity/payment.entity';\nimport { PaymentController } from './payment.controller';");
  s = s.replace(/TypeOrmModule\.forFeature\(\[(.*?)\]\)/, "TypeOrmModule.forFeature([$1, PaymentRequest])");
  s = s.replace(/controllers: \[(.*?)\]/, "controllers: [$1, PaymentController]");
  fs.writeFileSync('src/admin/admin.module.ts', s);
}
console.log('done module');
