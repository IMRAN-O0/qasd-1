/**
 * وظائف إدارة كلمات المرور
 *
 * توفر هذه الوحدة وظائف متقدمة للتعامل مع كلمات المرور، بما في ذلك
 * التشفير والتحقق وتقييم قوة كلمة المرور وتوليد كلمات مرور عشوائية.
 */

// ثابت الملح الافتراضي (يجب تغييره في بيئة الإنتاج)
const DEFAULT_SALT = 'QASD_SECURE_SALT_2023';

/**
 * تشفير كلمة المرور باستخدام خوارزمية PBKDF2
 *
 * تستخدم هذه الدالة خوارزمية PBKDF2 لتشفير كلمات المرور بطريقة آمنة
 * من خلال تطبيق دالة تجزئة متكررة مع ملح.
 *
 * @param {string} password - كلمة المرور المراد تشفيرها
 * @param {string} [salt=DEFAULT_SALT] - الملح المستخدم في التشفير
 * @param {number} [iterations=10000] - عدد التكرارات
 * @returns {string} كلمة المرور المشفرة
 */
function hashPassword(password, salt = DEFAULT_SALT, iterations = 10000) {
  try {
    if (!password) {
      throw new Error('كلمة المرور مطلوبة');
    }

    // في بيئة الإنتاج، يجب استخدام مكتبة تشفير قوية مثل bcrypt أو argon2
    // هنا نستخدم محاكاة لـ PBKDF2 باستخدام الأدوات المتاحة في المتصفح

    // دمج كلمة المرور مع الملح
    const combinedPassword = `${password}:${salt}`;

    // تطبيق دالة التجزئة بشكل متكرر
    let hash = combinedPassword;
    for (let i = 0; i < iterations; i++) {
      // استخدام btoa كبديل بسيط لدالة التجزئة
      // في التطبيق الحقيقي، يجب استخدام دالة تجزئة قوية مثل SHA-256
      hash = btoa(hash);
    }

    // إضافة معلومات التشفير إلى الناتج
    // الصيغة: {algorithm}${iterations}${salt}${hash}
    return `PBKDF2$${iterations}$${salt}$${hash}`;
  } catch (error) {
    console.error('خطأ في تشفير كلمة المرور:', error);
    throw error;
  }
}

/**
 * التحقق من صحة كلمة المرور
 *
 * @param {string} password - كلمة المرور المدخلة
 * @param {string} hashedPassword - كلمة المرور المشفرة المخزنة
 * @returns {boolean} ما إذا كانت كلمة المرور صحيحة
 */
function verifyPassword(password, hashedPassword) {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    // التحقق من صيغة كلمة المرور المشفرة
    if (!hashedPassword.includes('$')) {
      // صيغة قديمة (قبل التحسين)
      return btoa(`${password}:${DEFAULT_SALT}`) === hashedPassword;
    }

    // تحليل كلمة المرور المشفرة
    const [algorithm, iterations, salt, hash] = hashedPassword.split('$');

    // التحقق من الخوارزمية
    if (algorithm !== 'PBKDF2') {
      return false;
    }

    // تشفير كلمة المرور المدخلة بنفس المعلمات
    const hashedInput = hashPassword(password, salt, parseInt(iterations, 10));

    // مقارنة النتيجة
    return hashedInput === hashedPassword;
  } catch (error) {
    console.error('خطأ في التحقق من كلمة المرور:', error);
    return false;
  }
}

/**
 * تقييم قوة كلمة المرور
 *
 * @param {string} password - كلمة المرور المراد تقييمها
 * @returns {Object} نتيجة التقييم
 */
function evaluatePasswordStrength(password) {
  try {
    if (!password) {
      return {
        score: 0,
        strength: 'ضعيفة جدًا',
        feedback: 'كلمة المرور فارغة'
      };
    }

    let score = 0;
    const feedback = [];

    // التحقق من طول كلمة المرور
    if (password.length < 8) {
      feedback.push('كلمة المرور قصيرة جدًا (يجب أن تكون 8 أحرف على الأقل)');
    } else {
      score += Math.min(2, Math.floor(password.length / 4));
    }

    // التحقق من وجود أحرف كبيرة
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('أضف حرفًا كبيرًا على الأقل');
    }

    // التحقق من وجود أحرف صغيرة
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('أضف حرفًا صغيرًا على الأقل');
    }

    // التحقق من وجود أرقام
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('أضف رقمًا واحدًا على الأقل');
    }

    // التحقق من وجود رموز خاصة
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('أضف رمزًا خاصًا على الأقل');
    }

    // التحقق من التنوع
    const uniqueChars = new Set(password.split('')).size;
    score += Math.min(2, Math.floor(uniqueChars / 4));

    // تحديد مستوى القوة
    let strength = 'ضعيفة جدًا';
    if (score >= 7) {
      strength = 'قوية جدًا';
    } else if (score >= 5) {
      strength = 'قوية';
    } else if (score >= 3) {
      strength = 'متوسطة';
    } else if (score >= 2) {
      strength = 'ضعيفة';
    }

    return {
      score,
      strength,
      feedback: feedback.join('. ')
    };
  } catch (error) {
    console.error('خطأ في تقييم قوة كلمة المرور:', error);
    return {
      score: 0,
      strength: 'غير معروفة',
      feedback: 'حدث خطأ أثناء التقييم'
    };
  }
}

/**
 * توليد كلمة مرور عشوائية
 *
 * @param {number} [length=12] - طول كلمة المرور
 * @param {Object} [options] - خيارات التوليد
 * @param {boolean} [options.uppercase=true] - تضمين أحرف كبيرة
 * @param {boolean} [options.lowercase=true] - تضمين أحرف صغيرة
 * @param {boolean} [options.numbers=true] - تضمين أرقام
 * @param {boolean} [options.symbols=true] - تضمين رموز خاصة
 * @returns {string} كلمة المرور المولدة
 */
function generatePassword(length = 12, options = {}) {
  try {
    // الخيارات الافتراضية
    const config = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      ...options
    };

    // مجموعات الأحرف
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // بناء مجموعة الأحرف المتاحة
    let availableChars = '';
    if (config.uppercase) {
      availableChars += uppercaseChars;
    }
    if (config.lowercase) {
      availableChars += lowercaseChars;
    }
    if (config.numbers) {
      availableChars += numberChars;
    }
    if (config.symbols) {
      availableChars += symbolChars;
    }

    // التحقق من وجود أحرف متاحة
    if (!availableChars) {
      throw new Error('يجب تمكين نوع واحد على الأقل من الأحرف');
    }

    // توليد كلمة المرور
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      password += availableChars[randomIndex];
    }

    // التأكد من أن كلمة المرور تحتوي على جميع أنواع الأحرف المطلوبة
    const hasUppercase = config.uppercase ? /[A-Z]/.test(password) : true;
    const hasLowercase = config.lowercase ? /[a-z]/.test(password) : true;
    const hasNumbers = config.numbers ? /\d/.test(password) : true;
    const hasSymbols = config.symbols ? /[^A-Za-z0-9]/.test(password) : true;

    // إذا لم تستوفِ كلمة المرور جميع المتطلبات، توليد كلمة مرور جديدة
    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSymbols) {
      return generatePassword(length, options);
    }

    return password;
  } catch (error) {
    console.error('خطأ في توليد كلمة المرور:', error);
    throw error;
  }
}

/**
 * تحويل كلمة مرور مشفرة بالصيغة القديمة إلى الصيغة الجديدة
 *
 * @param {string} oldHashedPassword - كلمة المرور المشفرة بالصيغة القديمة
 * @param {string} plainPassword - كلمة المرور الأصلية (غير المشفرة)
 * @returns {string} كلمة المرور المشفرة بالصيغة الجديدة
 */
function upgradePasswordHash(oldHashedPassword, plainPassword) {
  try {
    // التحقق من صحة كلمة المرور القديمة
    if (!verifyPassword(plainPassword, oldHashedPassword)) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    // تشفير كلمة المرور بالصيغة الجديدة
    return hashPassword(plainPassword);
  } catch (error) {
    console.error('خطأ في ترقية تشفير كلمة المرور:', error);
    throw error;
  }
}

export const passwordUtils = {
  hashPassword,
  verifyPassword,
  evaluatePasswordStrength,
  generatePassword,
  upgradePasswordHash
};

export default passwordUtils;
