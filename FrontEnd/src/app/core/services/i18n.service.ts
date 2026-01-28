import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'ar';

export interface Translation {
    [key: string]: string;
    // Common
    appName: string;
    language: string;
    english: string;
    arabic: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    close: string;
    save: string;
    edit: string;
    delete: string;
    back: string;
    yes: string;
    no: string;
    actions: string;
    name: string;
    nameAr: string;
    nameEn: string;
    enterNameAr: string;
    enterNameEn: string;
    enterPrice: string;
    enterPassword: string;
    nameRequired: string;
    priceRequired: string;
    priceMin: string;
    passwordRequired: string;
    passwordMinLength: string;
    emailRequired: string;
    emailInvalid: string;
    create: string;
    update: string;
    all: string;
    time: string;
    items: string;
    aed: string;
    currency: string;
    noOrders: string;
    normalMode: string;
    tvMode: string;
    adminLogin: string;
    adminDashboard: string;
    addProduct: string;
    todayProfit: string;
    totalProfit: string;
    loginSuccess: string;
    loginFailed: string;
    deleteSuccess: string;
    imageUploadFailed: string;
    updateSuccess: string;
    createSuccess: string;

    // Menu
    menu: string;
    products: string;
    cart: string;
    addToCart: string;
    checkout: string;
    emptyCart: string;
    total: string;
    estimatedTotal: string;
    quantity: string;
    price: string;
    available: string;
    unavailable: string;
    category: string;
    search: string;
    freshlyPrepared: string;
    subtotal: string;
    vat: string;
    confirmOrder: string;
    orderPlaced: string;
    noProducts: string;

    // Order
    order: string;
    orders: string;
    orderNumber: string;
    queueNumber: string;
    orderDate: string;
    orderTime: string;
    status: string;
    pending: string;
    preparing: string;
    delivered: string;
    cashOnly: string;
    paymentMethod: string;
    payOnPickup: string;
    validToday: string;
    yourQueueNumber: string;
    orderPlacedSuccess: string;
    mealBeingPrepared: string;
    payCashAtCounter: string;
    totalAmountLabel: string;
    dateLabel: string;
    timeLabel: string;
    backToMenu: string;
    saveScreenshot: string;

    // Kitchen
    kitchen: string;
    startPreparing: string;
    inPreparation: string;
    noOrdersYet: string;
    refreshing: string;

    // Display
    publicDisplay: string;
    todayOrders: string;

    // Admin
    admin: string;
    dashboard: string;
    login: string;
    logout: string;
    password: string;
    email: string;
    welcomeBack: string;
    enterCredentials: string;
    emailAr: string;
    passwordAr: string;
    invalidPassword: string;
    invalidPasswordAr: string;
    forgotPassword: string;
    loginButton: string;
    schoolCanteenManagement: string;
    privacyPolicy: string;
    termsOfService: string;
    profit: string;
    revenue: string;
    todayRevenue: string;
    totalRevenue: string;
    ordersCount: string;
    canteenAdmin: string;
    schoolManagement: string;
    canteenProOverview: string;
    realTimeTracking: string;
    pendingOrders: string;
    totalOrders: string;
    activeOrders: string;
    needsAttention: string;
    revenueToday: string;
    recentOrders: string;
    viewAllOrders: string;
    cashOnlyPolicy: string;
    cashOnlyReminder: string;
    verifyPayment: string;

    // Products Admin
    createProduct: string;
    editProduct: string;
    deleteProduct: string;
    productName: string;
    productNameAr: string;
    productNameEn: string;
    description: string;
    descriptionAr: string;
    descriptionEn: string;
    uploadImage: string;
    image: string;

    // Orders Admin
    markDelivered: string;
    filterByDate: string;
    filterByStatus: string;
    allStatuses: string;

    // Messages
    orderSuccess: string;
    orderError: string;
    loginError: string;
    productCreated: string;
    productUpdated: string;
    productDeleted: string;
    orderDelivered: string;
    preparingStarted: string;
    confirmDelete: string;
}

@Injectable({
    providedIn: 'root'
})
export class I18nService {
    private langKey = 'canteen_lang';
    private currentLang: Language;
    private langSubject: BehaviorSubject<Language>;

    private translations: Record<Language, Translation> = {
        en: {
            // Common
            appName: 'School Canteen',
            language: 'Language',
            english: 'English',
            arabic: 'العربية',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            confirm: 'Confirm',
            close: 'Close',
            save: 'Save',
            edit: 'Edit',
            delete: 'Delete',
            back: 'Back',
            yes: 'Yes',
            no: 'No',
            actions: 'Actions',
            name: 'Name',
            nameAr: 'Name (Arabic)',
            nameEn: 'Name (English)',
            enterNameAr: 'Enter name in Arabic',
            enterNameEn: 'Enter name in English',
            enterPrice: 'Enter price',
            enterPassword: 'Enter password',
            nameRequired: 'Name is required',
            priceRequired: 'Price is required',
            priceMin: 'Price must be greater than 0',
            passwordRequired: 'Password is required',
            passwordMinLength: 'Password must be at least 6 characters',
            emailRequired: 'Email is required',
            emailInvalid: 'Invalid email format',
            create: 'Create',
            update: 'Update',
            all: 'All',
            time: 'Time',
            items: 'Items',
            aed: 'AED',
            currency: 'Đ',
            noOrders: 'No orders yet',
            normalMode: 'Normal Mode',
            tvMode: 'TV Mode',
            adminLogin: 'Admin Login',
            adminDashboard: 'Admin Dashboard',
            addProduct: 'Add Product',
            todayProfit: "Today's Profit",
            totalProfit: 'Total Profit',
            loginSuccess: 'Login successful',
            loginFailed: 'Login failed',
            deleteSuccess: 'Deleted successfully',
            imageUploadFailed: 'Image upload failed',
            updateSuccess: 'Updated successfully',
            createSuccess: 'Created successfully',

            // Menu
            menu: 'Menu',
            products: 'Products',
            cart: 'Your Cart',
            addToCart: 'Add to Cart',
            checkout: 'Checkout',
            emptyCart: 'Your cart is empty',
            total: 'Total',
            estimatedTotal: 'Estimated Total',
            quantity: 'Quantity',
            price: 'Price',
            available: 'Available',
            unavailable: 'Unavailable',
            category: 'Category',
            search: 'Search',
            freshlyPrepared: 'Freshly prepared every morning',
            subtotal: 'Subtotal',
            vat: 'VAT',
            confirmOrder: 'CONFIRM CASH ORDER',
            orderPlaced: 'Order placed successfully!',
            noProducts: 'No products available',

            // Order
            order: 'Order',
            orders: 'Orders',
            orderNumber: 'Order Number',
            queueNumber: 'Queue Number',
            orderDate: 'Order Date',
            orderTime: 'Order Time',
            status: 'Status',
            pending: 'Pending',
            preparing: 'Preparing',
            delivered: 'Delivered',
            cashOnly: 'Cash Only',
            paymentMethod: 'Payment Method',
            payOnPickup: 'Pay cash on pickup',
            validToday: 'Queue number valid for today only',
            yourQueueNumber: 'Your Queue Number',
            orderPlacedSuccess: 'Order Placed Successfully!',
            mealBeingPrepared: 'Your meal is being prepared. Please head to the counter.',
            payCashAtCounter: 'PAY CASH AT COUNTER',
            totalAmountLabel: 'Total Amount',
            dateLabel: 'DATE',
            timeLabel: 'TIME',
            backToMenu: 'Back to Menu',
            saveScreenshot: 'Save Screenshot',

            // Kitchen
            kitchen: 'Kitchen',
            startPreparing: 'Start Preparing',
            inPreparation: 'In Preparation',
            noOrdersYet: 'No orders yet',
            refreshing: 'Refreshing...',

            // Display
            publicDisplay: 'Public Display',
            todayOrders: "Today's Orders",

            // Admin
            admin: 'Admin',
            dashboard: 'Dashboard',
            login: 'Login',
            logout: 'Logout',
            password: 'Password',
            email: 'Email',
            welcomeBack: 'Welcome Back',
            enterCredentials: 'Enter credentials to manage the canteen',
            emailAr: 'البريد الإلكتروني',
            passwordAr: 'كلمة المرور',
            invalidPassword: 'Invalid password, please try again.',
            invalidPasswordAr: 'كلمة مرور غير صحيحة، يرجى المحاولة مرة أخرى.',
            forgotPassword: 'Forgot Password?',
            loginButton: 'Login',
            schoolCanteenManagement: 'School Canteen Management System',
            privacyPolicy: 'Privacy Policy',
            termsOfService: 'Terms of Service',
            profit: 'Profit',
            revenue: 'Revenue',
            todayRevenue: "Today's Revenue",
            totalRevenue: 'Total Revenue',
            ordersCount: 'Orders Count',
            canteenAdmin: 'Canteen Admin',
            schoolManagement: 'SCHOOL MANAGEMENT',
            canteenProOverview: 'CanteenPro Overview',
            realTimeTracking: 'Real-time canteen order management and revenue tracking',
            pendingOrders: 'PENDING ORDERS',
            totalOrders: 'TOTAL ORDERS',
            activeOrders: 'Active orders',
            needsAttention: 'Needs attention',
            revenueToday: 'Revenue today',
            recentOrders: 'Recent Orders',
            viewAllOrders: 'View All Orders',
            cashOnlyPolicy: 'REMINDER: CASH-ONLY POLICY',
            cashOnlyReminder: 'All student orders must be settled in cash at the counter before delivery. Verify payment before marking as Delivered.',
            verifyPayment: 'Verify payment before marking as Delivered',

            // Products Admin
            createProduct: 'Create Product',
            editProduct: 'Edit Product',
            deleteProduct: 'Delete Product',
            productName: 'Product Name',
            productNameAr: 'Product Name (Arabic)',
            productNameEn: 'Product Name (English)',
            description: 'Description',
            descriptionAr: 'Description (Arabic)',
            descriptionEn: 'Description (English)',
            uploadImage: 'Upload Image',
            image: 'Image',

            // Orders Admin
            markDelivered: 'Mark as Delivered',
            filterByDate: 'Filter by Date',
            filterByStatus: 'Filter by Status',
            allStatuses: 'All Statuses',

            // Messages
            orderSuccess: 'Order created successfully!',
            orderError: 'Failed to create order',
            loginError: 'Invalid password',
            productCreated: 'Product created successfully',
            productUpdated: 'Product updated successfully',
            productDeleted: 'Product deleted successfully',
            orderDelivered: 'Order marked as delivered',
            preparingStarted: 'Preparation started',
            confirmDelete: 'Are you sure you want to delete this product?'
        },
        ar: {
            // Common
            appName: 'مقصف المدرسة',
            language: 'اللغة',
            english: 'English',
            arabic: 'العربية',
            loading: 'جاري التحميل...',
            error: 'خطأ',
            success: 'نجح',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
            close: 'إغلاق',
            save: 'حفظ',
            edit: 'تعديل',
            delete: 'حذف',
            back: 'رجوع',
            yes: 'نعم',
            no: 'لا',
            actions: 'الإجراءات',
            name: 'الاسم',
            nameAr: 'الاسم (عربي)',
            nameEn: 'الاسم (إنجليزي)',
            enterNameAr: 'أدخل الاسم بالعربية',
            enterNameEn: 'أدخل الاسم بالإنجليزية',
            enterPrice: 'أدخل السعر',
            enterPassword: 'أدخل كلمة المرور',
            nameRequired: 'الاسم مطلوب',
            priceRequired: 'السعر مطلوب',
            priceMin: 'السعر يجب أن يكون أكبر من 0',
            passwordRequired: 'كلمة المرور مطلوبة',
            passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            emailRequired: 'البريد الإلكتروني مطلوب',
            emailInvalid: 'صيغة البريد الإلكتروني غير صحيحة',
            create: 'إنشاء',
            update: 'تحديث',
            all: 'الكل',
            time: 'الوقت',
            items: 'العناصر',
            aed: 'درهم',
            currency: 'Đ',
            noOrders: 'لا توجد طلبات',
            normalMode: 'الوضع العادي',
            tvMode: 'وضع التلفاز',
            adminLogin: 'تسجيل دخول المسؤول',
            adminDashboard: 'لوحة تحكم المسؤول',
            addProduct: 'إضافة منتج',
            todayProfit: 'ربح اليوم',
            totalProfit: 'الربح الإجمالي',
            loginSuccess: 'تم تسجيل الدخول بنجاح',
            loginFailed: 'فشل تسجيل الدخول',
            deleteSuccess: 'تم الحذف بنجاح',
            imageUploadFailed: 'فشل رفع الصورة',
            updateSuccess: 'تم التحديث بنجاح',
            createSuccess: 'تم الإنشاء بنجاح',

            // Menu
            menu: 'القائمة',
            products: 'المنتجات',
            cart: 'سلتك',
            addToCart: 'أضف للسلة',
            checkout: 'إتمام الطلب',
            emptyCart: 'السلة فارغة',
            total: 'الإجمالي',
            estimatedTotal: 'الإجمالي المتوقع',
            quantity: 'الكمية',
            price: 'السعر',
            available: 'متاح',
            unavailable: 'غير متاح',
            category: 'الفئة',
            search: 'بحث',
            freshlyPrepared: 'محضر طازج كل صباح',
            subtotal: 'المجموع الفرعي',
            vat: 'الضريبة',
            confirmOrder: 'تأكيد الطلب النقدي',
            orderPlaced: 'تم إنشاء الطلب بنجاح!',
            noProducts: 'لا توجد منتجات متاحة',

            // Order
            order: 'الطلب',
            orders: 'الطلبات',
            orderNumber: 'رقم الطلب',
            queueNumber: 'رقم الدور',
            orderDate: 'تاريخ الطلب',
            orderTime: 'وقت الطلب',
            status: 'الحالة',
            pending: 'قيد الانتظار',
            preparing: 'قيد التحضير',
            delivered: 'تم التسليم',
            cashOnly: 'نقدي فقط',
            paymentMethod: 'طريقة الدفع',
            payOnPickup: 'ادفع نقداً عند الاستلام',
            validToday: 'رقم الدور صالح لهذا اليوم فقط',
            yourQueueNumber: 'رقم دورك',
            orderPlacedSuccess: 'تم تقديم الطلب بنجاح!',
            mealBeingPrepared: 'وجبتك قيد التحضير. يرجى التوجه إلى الكاونتر.',
            payCashAtCounter: 'ادفع نقداً عند الكاونتر',
            totalAmountLabel: 'المبلغ الإجمالي',
            dateLabel: 'التاريخ',
            timeLabel: 'الوقت',
            backToMenu: 'العودة للقائمة',
            saveScreenshot: 'حفظ لقطة شاشة',

            // Kitchen
            kitchen: 'المطبخ',
            startPreparing: 'ابدأ التحضير',
            inPreparation: 'قيد التحضير',
            noOrdersYet: 'لا توجد طلبات بعد',
            refreshing: 'جاري التحديث...',

            // Display
            publicDisplay: 'شاشة العرض',
            todayOrders: 'طلبات اليوم',

            // Admin
            admin: 'المسؤول',
            dashboard: 'لوحة التحكم',
            login: 'تسجيل الدخول',
            logout: 'تسجيل الخروج',
            password: 'كلمة المرور',
            email: 'البريد الإلكتروني',
            welcomeBack: 'مرحباً بك مجدداً',
            enterCredentials: 'أدخل بياناتك لإدارة المقصف',
            emailAr: 'البريد الإلكتروني',
            passwordAr: 'كلمة المرور',
            invalidPassword: 'كلمة مرور غير صحيحة، يرجى المحاولة مرة أخرى.',
            invalidPasswordAr: 'Invalid password, please try again.',
            forgotPassword: 'هل نسيت كلمة المرور؟',
            loginButton: 'تسجيل الدخول',
            schoolCanteenManagement: 'نظام إدارة مطعم المدرسة',
            privacyPolicy: 'سياسة الخصوصية',
            termsOfService: 'شروط الخدمة',
            profit: 'الربح',
            revenue: 'الإيرادات',
            todayRevenue: 'إيرادات اليوم',
            totalRevenue: 'إجمالي الإيرادات',
            ordersCount: 'عدد الطلبات',
            canteenAdmin: 'إدارة المطعم',
            schoolManagement: 'إدارة المدرسة',
            canteenProOverview: 'نظرة عامة على المطعم',
            realTimeTracking: 'إدارة الطلبات وتتبع الإيرادات في الوقت الفعلي',
            pendingOrders: 'الطلبات المعلقة',
            totalOrders: 'إجمالي الطلبات',
            activeOrders: 'الطلبات النشطة',
            needsAttention: 'تحتاج إلى اهتمام',
            revenueToday: 'إيرادات اليوم',
            recentOrders: 'الطلبات الأخيرة',
            viewAllOrders: 'عرض جميع الطلبات',
            cashOnlyPolicy: 'تذكير: سياسة النقد فقط',
            cashOnlyReminder: 'يجب دفع جميع طلبات الطلاب نقدًا على المنضدة قبل التسليم. تحقق من الدفع قبل وضع علامة كمسلّم.',
            verifyPayment: 'تحقق من الدفع قبل وضع علامة كمسلّم',

            // Products Admin
            createProduct: 'إنشاء منتج',
            editProduct: 'تعديل المنتج',
            deleteProduct: 'حذف المنتج',
            productName: 'اسم المنتج',
            productNameAr: 'اسم المنتج (عربي)',
            productNameEn: 'اسم المنتج (إنجليزي)',
            description: 'الوصف',
            descriptionAr: 'الوصف (عربي)',
            descriptionEn: 'الوصف (إنجليزي)',
            uploadImage: 'رفع صورة',
            image: 'الصورة',

            // Orders Admin
            markDelivered: 'تم التسليم',
            filterByDate: 'تصفية بالتاريخ',
            filterByStatus: 'تصفية بالحالة',
            allStatuses: 'جميع الحالات',

            // Messages
            orderSuccess: 'تم إنشاء الطلب بنجاح!',
            orderError: 'فشل في إنشاء الطلب',
            loginError: 'كلمة مرور خاطئة',
            productCreated: 'تم إنشاء المنتج بنجاح',
            productUpdated: 'تم تحديث المنتج بنجاح',
            productDeleted: 'تم حذف المنتج بنجاح',
            orderDelivered: 'تم تسليم الطلب',
            preparingStarted: 'تم بدء التحضير',
            confirmDelete: 'هل أنت متأكد من حذف هذا المنتج؟'
        }
    };

    constructor() {
        const stored = localStorage.getItem(this.langKey) as Language;
        this.currentLang = stored || 'ar'; // Default to Arabic
        this.langSubject = new BehaviorSubject<Language>(this.currentLang);
        this.applyDirection();
    }

    get lang$() {
        return this.langSubject.asObservable();
    }

    getCurrentLang(): Language {
        return this.currentLang;
    }

    setLanguage(lang: Language): void {
        this.currentLang = lang;
        localStorage.setItem(this.langKey, lang);
        this.langSubject.next(lang);
        this.applyDirection();
    }

    toggleLanguage(): void {
        const newLang: Language = this.currentLang === 'ar' ? 'en' : 'ar';
        this.setLanguage(newLang);
    }

    private applyDirection(): void {
        const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = this.currentLang;
    }

    t(key: keyof Translation): string {
        return this.translations[this.currentLang][key];
    }

    getTranslations(): Translation {
        return this.translations[this.currentLang];
    }

    // Helper to get bilingual field
    getBilingualField(item: any, fieldName: string): string {
        const suffix = this.currentLang === 'ar' ? 'Ar' : 'En';
        return item[fieldName + suffix] || item[fieldName] || '';
    }
}
