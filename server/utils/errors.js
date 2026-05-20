// Centralized error messages with locale support
// Usage: errors(code, lang) or errors.fr[code] / errors.ar[code]

const errorMessages = {
  // General
  SERVER_ERROR: { fr: 'Erreur serveur', en: 'Server error', ar: 'خطأ في الخادم' },
  NOT_FOUND: { fr: 'Route non trouvée', en: 'Route not found', ar: 'المسار غير موجود' },
  INVALID_JSON: { fr: 'JSON invalide', en: 'Invalid JSON', ar: 'JSON غير صالح' },
  RATE_LIMITED: { fr: 'Trop de requêtes. Veuillez réessayer plus tard.', en: 'Too many requests. Please try again later.', ar: 'طلبات كثيرة. يرجى المحاولة لاحقاً.' },

  // Auth
  TOKEN_REQUIRED: { fr: 'Token requis', en: 'Token required', ar: 'الرمز مطلوب' },
  ACCOUNT_DISABLED: { fr: 'Compte désactivé', en: 'Account disabled', ar: 'الحساب معطل' },
  TOKEN_EXPIRED: { fr: 'Token expiré', en: 'Token expired', ar: 'انتهت صلاحية الرمز' },
  TOKEN_INVALID: { fr: 'Token invalide', en: 'Invalid token', ar: 'رمز غير صالح' },
  ADMIN_REQUIRED: { fr: 'Accès administrateur requis', en: 'Admin access required', ar: 'يتطلب صلاحيات المسؤول' },
  LOGIN_RATE_LIMITED: { fr: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.', en: 'Too many login attempts. Try again in 15 minutes.', ar: 'محاولات تسجيل دخول كثيرة. حاولوا بعد 15 دقيقة.' },
  CREDENTIALS_REQUIRED: { fr: 'Email et mot de passe requis', en: 'Email and password required', ar: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
  INVALID_CREDENTIALS: { fr: 'Email ou mot de passe incorrect', en: 'Invalid email or password', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },

  // Products
  PRODUCT_REQUIRED_FIELDS: { fr: 'ID, nom, catégorie et prix requis', en: 'ID, name, category and price required', ar: 'المعرّف والاسم والفئة والسعر مطلوبون' },
  PRODUCT_PRICE_INVALID: { fr: 'Le prix doit être un nombre positif', en: 'Price must be a positive number', ar: 'يجب أن يكون السعر رقماً موجباً' },
  PRODUCT_CREATED: { fr: 'Produit créé', en: 'Product created', ar: 'تم إنشاء المنتج' },
  PRODUCT_DUPLICATE: { fr: 'Un produit avec cet ID existe déjà', en: 'A product with this ID already exists', ar: 'منتج بهذا المعرف موجود بالفعل' },
  PRODUCT_NOT_FOUND: { fr: 'Produit introuvable', en: 'Product not found', ar: 'المنتج غير موجود' },
  PRODUCT_UPDATED: { fr: 'Produit mis à jour', en: 'Product updated', ar: 'تم تحديث المنتج' },
  PRODUCT_DISABLED: { fr: 'Produit désactivé', en: 'Product disabled', ar: 'تم تعطيل المنتج' },
  PRODUCT_DELETED: { fr: 'Produit supprimé définitivement', en: 'Product permanently deleted', ar: 'تم حذف المنتج نهائياً' },
  IMAGE_REQUIRED: { fr: 'Aucune image fournie', en: 'No image provided', ar: 'لم يتم تقديم صورة' },
  IMAGE_UPDATED: { fr: 'Image mise à jour', en: 'Image updated', ar: 'تم تحديث الصورة' },
  IMAGE_PATH_REQUIRED: { fr: 'Chemin image requis', en: 'Image path required', ar: 'مسار الصورة مطلوب' },
  IMAGE_PATH_INVALID: { fr: 'Chemin image invalide', en: 'Invalid image path', ar: 'مسار الصورة غير صالح' },
  IMAGE_DELETED: { fr: 'Image supprimée', en: 'Image deleted', ar: 'تم حذف الصورة' },

  // Orders
  ORDER_CREATED: { fr: 'Commande créée avec succès', en: 'Order created successfully', ar: 'تم إنشاء الطلب بنجاح' },
  ORDER_CREATE_ERROR: { fr: 'Erreur lors de la création de la commande', en: 'Error creating order', ar: 'خطأ في إنشاء الطلب' },
  ORDER_NOT_FOUND: { fr: 'Commande introuvable', en: 'Order not found', ar: 'الطلب غير موجود' },
  ORDER_RATE_LIMITED: { fr: 'Trop de commandes. Veuillez réessayer plus tard.', en: 'Too many orders. Please try again later.', ar: 'طلبات كثيرة. يرجى المحاولة لاحقاً.' },
  INVALID_STATUS: { fr: 'Statut invalide', en: 'Invalid status', ar: 'حالة غير صالحة' },
  ORDER_UPDATED: { fr: 'Commande mise à jour', en: 'Order updated', ar: 'تم تحديث الطلب' },

  // Contact
  CONTACT_FIELDS_REQUIRED: { fr: 'Nom, email et message requis', en: 'Name, email and message required', ar: 'الاسم والبريد والمحتوى مطلوبون' },
  CONTACT_NAME_SHORT: { fr: 'Le nom doit contenir au moins 2 caractères', en: 'Name must be at least 2 characters', ar: 'يجب أن يحتوي الاسم على حرفين على الأقل' },
  CONTACT_EMAIL_INVALID: { fr: "Format d'email invalide", en: 'Invalid email format', ar: 'صيغة البريد الإلكتروني غير صالحة' },
  CONTACT_MESSAGE_LONG: { fr: 'Le message ne doit pas dépasser 5000 caractères', en: 'Message must not exceed 5000 characters', ar: 'يجب ألا يتجاوز المحتوى 5000 حرف' },
  CONTACT_SENT: { fr: 'Message envoyé avec succès', en: 'Message sent successfully', ar: 'تم إرسال الرسالة بنجاح' },
  CONTACT_RATE_LIMITED: { fr: 'Trop de messages envoyés. Veuillez réessayer plus tard.', en: 'Too many messages. Please try again later.', ar: 'رسائل كثيرة. يرجى المحاولة لاحقاً.' },

  // Validation
  NAME_REQUIRED: { fr: "Le nom est requis (2 caractères minimum)", en: 'Name is required (2 characters minimum)', ar: 'الاسم مطلوب (حرفان على الأقل)' },
  PHONE_INVALID: { fr: 'Numéro de téléphone invalide', en: 'Invalid phone number', ar: 'رقم الهاتف غير صالح' },
  WILAYA_REQUIRED: { fr: 'La wilaya est requise', en: 'Wilaya is required', ar: 'الولاية مطلوبة' },
  ADDRESS_REQUIRED: { fr: "L'adresse de livraison est requise (2 caractères minimum)", en: 'Delivery address is required (2 characters minimum)', ar: 'عنوان التوصيل مطلوب (حرفان على الأقل)' },
  CART_EMPTY: { fr: 'Le panier est vide', en: 'Cart is empty', ar: 'السلة فارغة' },
  EMAIL_INVALID: { fr: "Format d'email invalide", en: 'Invalid email format', ar: 'صيغة البريد الإلكتروني غير صالحة' },
  PRODUCT_OUT_OF_STOCK: { fr: 'Produit en rupture de stock', en: 'Product out of stock', ar: 'المنتج غير متوفر' },
  PRODUCT_NOT_AVAILABLE: { fr: 'Produit introuvable', en: 'Product not available', ar: 'المنتج غير متوفر' },
  STOCK_INSUFFICIENT: { fr: 'Stock insuffisant', en: 'Insufficient stock', ar: 'المخزون غير كافٍ' },

  // Families
  FAMILY_FIELDS_REQUIRED: { fr: 'ID et libellé requis', en: 'ID and label required', ar: 'المعرّف والتسمية مطلوبان' },
  FAMILY_DUPLICATE: { fr: 'Cette famille existe déjà', en: 'This family already exists', ar: 'هذه العائلة موجودة بالفعل' },
  FAMILY_NOT_FOUND: { fr: 'Famille non trouvée', en: 'Family not found', ar: 'العائلة غير موجودة' },
  FAMILY_IN_USE: { fr: 'produit(s) utilisent cette famille', en: 'product(s) use this family', ar: 'منتج(منتجات) يستخدمون هذه العائلة' },
  FAMILY_DELETED: { fr: 'Famille supprimée', en: 'Family deleted', ar: 'تم حذف العائلة' },

  // Messages
  MESSAGE_MARKED_READ: { fr: 'Message marqué comme lu', en: 'Message marked as read', ar: 'تم تعليم الرسالة كمقروءة' },
  MESSAGE_DELETED: { fr: 'Message supprimé', en: 'Message deleted', ar: 'تم حذف الرسالة' },

  // Wilayas
  WILAYA_NOT_FOUND: { fr: 'Wilaya not found', en: 'Wilaya not found', ar: 'الولاية غير موجودة' },

  // CSV Export
  CSV_EXPORT_ERROR: { fr: 'Erreur export CSV', en: 'CSV export error', ar: 'خطأ في تصدير CSV' },

  // CSV Labels (used for column headers and status/delivery translations in exports)
  CSV_HEADERS: { fr: ['ID', 'Date', 'Client', 'Téléphone', 'Email', 'Wilaya', 'Commune', 'Adresse', 'Articles', 'Total', 'Frais livraison', 'Type livraison', 'Statut', 'Notes'], en: ['ID', 'Date', 'Customer', 'Phone', 'Email', 'Wilaya', 'Commune', 'Address', 'Items', 'Total', 'Delivery Fee', 'Delivery Type', 'Status', 'Notes'], ar: ['المعرّف', 'التاريخ', 'العميل', 'الهاتف', 'البريد', 'الولاية', 'البلدية', 'العنوان', 'المنتجات', 'المجموع', 'رسوم التوصيل', 'نوع التوصيل', 'الحالة', 'ملاحظات'] },
  CSV_STATUS_PENDING: { fr: 'En attente', en: 'Pending', ar: 'قيد الانتظار' },
  CSV_STATUS_CONFIRMED: { fr: 'Confirmée', en: 'Confirmed', ar: 'مؤكدة' },
  CSV_STATUS_SHIPPED: { fr: 'Expédiée', en: 'Shipped', ar: 'تم الشحن' },
  CSV_STATUS_DELIVERED: { fr: 'Livrée', en: 'Delivered', ar: 'تم التوصيل' },
  CSV_STATUS_CANCELLED: { fr: 'Annulée', en: 'Cancelled', ar: 'ملغاة' },
  CSV_DELIVERY_DOMICILE: { fr: 'Domicile', en: 'Home delivery', ar: 'توصيل للمنزل' },
  CSV_DELIVERY_BUREAU: { fr: 'Bureau', en: 'Office pickup', ar: 'استلام من المكتب' },
  PRODUCT_UPDATED: { fr: 'Produit mis à jour', en: 'Product updated', ar: 'تم تحديث المنتج' },
  PRODUCT_DISABLED: { fr: 'Produit désactivé', en: 'Product disabled', ar: 'تم تعطيل المنتج' },
  IMAGE_UPDATED: { fr: 'Image mise à jour', en: 'Image updated', ar: 'تم تحديث الصورة' },
  MESSAGE_MARKED_READ: { fr: 'Message marqué comme lu', en: 'Message marked as read', ar: 'تم تعليم الرسالة كمقروءة' },
  MESSAGE_DELETED: { fr: 'Message supprimé', en: 'Message deleted', ar: 'تم حذف الرسالة' },
  FAMILY_DELETED: { fr: 'Famille supprimée', en: 'Family deleted', ar: 'تم حذف العائلة' },
  ORDER_UPDATED: { fr: 'Commande mise à jour', en: 'Order updated', ar: 'تم تحديث الطلب' },
  PRODUCT_DELETED: { fr: 'Produit supprimé définitivement', en: 'Product permanently deleted', ar: 'تم حذف المنتج نهائياً' },
};

function getError(code, lang = 'ar') {
  const msg = errorMessages[code];
  if (!msg) return code;
  return msg[lang] || msg.ar || code;
}

module.exports = { errorMessages, getError };