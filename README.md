# CV Mastery — ERP Platform / منصة ERP متعددة الشركات

Next.js 14 · TypeScript · Tailwind · Supabase (Auth + Postgres + RLS + Storage) · Vercel
الواجهة بالكامل عربي / English (زرار تبديل اللغة في كل صفحة).

## المستويات الثلاثة / The three levels

| المستوى | المسار | الوصف |
|---|---|---|
| Super Admin | `/admin` | أنت: العملاء، الباقات، الاشتراكات، الإيرادات، الهوية، الروابط، الإعدادات، سجل العمليات |
| Client Dashboard | `/app` | لوحة كل شركة: عملاء/موردين، مبيعات، مشتريات، مخزون، فواتير ومدفوعات، تقارير، فريق وصلاحيات، إعدادات |
| Platform Engine | قاعدة البيانات + `src/lib` | Multi-tenancy + RLS، RBAC، Feature Flags، باقات، Branding، Audit Logs |

صفحات عامة: `/` (Landing) · `/login` · `/join/<token>` (تسجيل مستخدم لشركة) · `/l/<token>` (نموذج طلب عام) · `/suspended`.

## ما تتحكم فيه من لوحة الأدمن
- إنشاء/إيقاف/تفعيل أي شركة، وحذفها.
- تاريخ بداية ونهاية الاشتراك: بعد النهاية الحساب يتوقف تلقائيًا (RLS + الواجهة).
- باقات وأسعار (شهري/سنوي) وسعر خاص لكل عميل وحد أقصى للمستخدمين.
- البرامج المفعّلة لكل عميل (Feature Flags) + إيقاف أي برنامج على مستوى المنصة كلها.
- الهوية: رفع **الشعار**، الألوان الثلاثة، فاتح/داكن، شكل التنقل (جانبي/علوي)، استدارة الحواف، الاسم المعروض ورسالة الترحيب بالعربي والإنجليزي، وعناصر الداشبورد الظاهرة.
- تسجيل دفعة اشتراك: بتمدّد الاشتراك وتفعّل العميل تلقائيًا، وتظهر في الإيرادات.
- إعدادات المنصة: شعارها، نصوص الصفحة الرئيسية، بيانات الدعم، وضع الصيانة.
- سجل عمليات كامل.

## التشغيل المحلي
1. Supabase → New project، ثم SQL Editor، نفّذ `supabase/migrations/001_init.sql` كاملًا (بينشئ الجداول والسياسات وbucket الشعارات والباقات المبدئية).
2. انسخ `.env.example` إلى `.env.local` واملأه من Project Settings → API.
3. Authentication → Add user (إيميلك وباسورد)، ثم في SQL Editor:
   ```sql
   insert into profiles (id, full_name, platform_role)
   select id, 'Owner', 'super_admin' from auth.users where email = 'YOUR_EMAIL';
   ```
4. `npm install` ثم `npm run dev` وافتح `http://localhost:3000/login`.

## Deployment Checklist
- [ ] نفّذت `001_init.sql` على مشروع Supabase الإنتاجي بدون أخطاء.
- [ ] أنشأت حساب الأدمن ونفّذت سطر `super_admin`.
- [ ] `npm run build` بينجح محليًا.
- [ ] رفعت الكود على GitHub (`.env.local` غير مرفوع).
- [ ] Vercel → Import Project، وأضفت المتغيرات الأربعة: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` موجود في Vercel فقط، ولا يبدأ بـ `NEXT_PUBLIC`.
- [ ] `NEXT_PUBLIC_APP_URL` = رابط الموقع الفعلي (بيُستخدم في الروابط اللي بتبعتها للعملاء).
- [ ] Supabase → Authentication → URL Configuration: ضفت رابط الموقع.
- [ ] جرّبت: إنشاء عميل، رفع شعار، إنشاء رابط تسجيل، التسجيل بيه، إيقاف العميل (الدخول لازم يتقفل)، تفعيله.
- [ ] جرّبت حسابين من شركتين مختلفتين وتأكدت إن كل واحد يشوف بياناته بس.

## إضافة برنامج جديد
1. أضف مفتاحه في `MODULES` و`NAV` داخل `src/lib/modules.ts`.
2. أنشئ صفحته تحت `src/app/app/<name>/` وابدأها بـ `requireTenant("<key>")`.
3. أضف جدوله في SQL مع `tenant_id`، وأضفه لقائمة الجداول في كتلة `do $$` الخاصة بالـ RLS.
4. أضف أسماءه في `src/lib/dict.ts` (`m.<key>` و`md.<key>`)، وفعّله للعميل من لوحة الأدمن.

## ملاحظات أمان
- كل جداول العميل محمية بـ RLS عبر دالة واحدة `can_access(tenant, perm)` تفحص: نفس الشركة + الشركة فعّالة + البرنامج مفعّل + الدور يملك الصلاحية.
- أدوار العميل: مالك (كل شيء)، مدير، محاسب، مبيعات، مخزن، وتقدر تضيف أدوار مخصصة.
- العمليات الحساسة (إنشاء مستخدم، تأكيد مستند، رفع شعار) بتتم من السيرفر بـ service role بعد فحص الصلاحية في الكود.
- صفحة التقارير بتقرأ بالـ service role لكن مقيّدة بـ `tenant_id` من الجلسة.

## المدفوعات (لاحقًا)
الاشتراكات حاليًا تُسجّل يدويًا من `/admin/billing`. لربط Stripe أو بوابة محلية (Paymob/Fawry مثلًا): أنشئ route في `src/app/api/webhooks/<provider>/route.ts` تستدعي نفس منطق `recordPayment` عند نجاح الدفع.
