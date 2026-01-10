/**
 * Data generator utilities for creating test data
 * Provides methods for generating realistic test data for various scenarios
 */

export interface UserData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: AddressData;
  role?: 'admin' | 'user' | 'readonly';
  isActive?: boolean;
  createdAt?: Date;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inStock: boolean;
  quantity?: number;
  imageUrl?: string;
}

export interface OrderData {
  id?: string;
  userId: string;
  products: ProductData[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  shippingAddress: AddressData;
}

/**
 * Generate random test data
 */
export class DataGenerator {
  private static readonly FIRST_NAMES = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Christopher', 'Jessica',
    'Matthew', 'Ashley', 'Joshua', 'Amanda', 'Daniel', 'Stephanie', 'Andrew', 'Nicole',
    'James', 'Elizabeth', 'Justin', 'Heather', 'Joseph', 'Melissa', 'Robert', 'Michelle'
  ];

  private static readonly LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
  ];

  private static readonly DOMAINS = [
    'example.com', 'test.com', 'demo.org', 'sample.net', 'mock.io', 'testcase.dev'
  ];

  private static readonly STREETS = [
    'Main Street', 'Oak Avenue', 'Park Road', 'First Street', 'Elm Street',
    'Washington Avenue', 'Maple Street', 'Second Street', 'Cherry Lane', 'Pine Street'
  ];

  private static readonly CITIES = [
    'Springfield', 'Franklin', 'Georgetown', 'Madison', 'Riverside', 'Salem',
    'Fairview', 'Clinton', 'Bristol', 'Auburn', 'Manchester', 'Oxford', 'Milford'
  ];

  private static readonly STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana'
  ];

  private static readonly PRODUCT_NAMES = [
    'Wireless Headphones', 'Smart Watch', 'Laptop Computer', 'Coffee Maker',
    'Running Shoes', 'Smartphone', 'Tablet', 'Bluetooth Speaker', 'Fitness Tracker',
    'Gaming Mouse', 'Office Chair', 'Monitor', 'Keyboard', 'Webcam', 'Desk Lamp'
  ];

  private static readonly CATEGORIES = [
    'Electronics', 'Clothing', 'Sports', 'Books', 'Home & Garden',
    'Automotive', 'Health & Beauty', 'Toys & Games', 'Music', 'Movies'
  ];

  /**
   * Generate random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random string of specified length
   */
  static randomString(length: number, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random UUID
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Pick random item from array
   */
  static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random email address
   */
  static email(firstName?: string, lastName?: string, domain?: string): string {
    const fName = firstName || this.randomChoice(this.FIRST_NAMES);
    const lName = lastName || this.randomChoice(this.LAST_NAMES);
    const domainName = domain || this.randomChoice(this.DOMAINS);
    const timestamp = Date.now().toString().slice(-4);

    return `${fName.toLowerCase()}.${lName.toLowerCase()}${timestamp}@${domainName}`;
  }

  /**
   * Generate random password
   */
  static password(length = 12, includeSpecialChars = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
      chars += specialChars;
    }

    // Ensure password contains at least one character from each category
    let password = '';
    password += this.randomChoice(lowercase.split(''));
    password += this.randomChoice(uppercase.split(''));
    password += this.randomChoice(numbers.split(''));

    if (includeSpecialChars) {
      password += this.randomChoice(specialChars.split(''));
    }

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += this.randomChoice(chars.split(''));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate random phone number
   */
  static phoneNumber(): string {
    const areaCode = this.randomInt(200, 999);
    const exchange = this.randomInt(200, 999);
    const number = this.randomInt(1000, 9999);
    return `(${areaCode}) ${exchange}-${number}`;
  }

  /**
   * Generate random user data
   */
  static userData(overrides: Partial<UserData> = {}): UserData {
    const firstName = this.randomChoice(this.FIRST_NAMES);
    const lastName = this.randomChoice(this.LAST_NAMES);

    return {
      id: this.uuid(),
      firstName,
      lastName,
      email: this.email(firstName, lastName),
      password: this.password(),
      phone: this.phoneNumber(),
      address: this.addressData(),
      role: this.randomChoice(['admin', 'user', 'readonly']),
      isActive: true,
      createdAt: new Date(),
      ...overrides
    };
  }

  /**
   * Generate random address data
   */
  static addressData(overrides: Partial<AddressData> = {}): AddressData {
    return {
      street: `${this.randomInt(1, 9999)} ${this.randomChoice(this.STREETS)}`,
      city: this.randomChoice(this.CITIES),
      state: this.randomChoice(this.STATES),
      zipCode: this.randomInt(10000, 99999).toString(),
      country: 'United States',
      ...overrides
    };
  }

  /**
   * Generate random product data
   */
  static productData(overrides: Partial<ProductData> = {}): ProductData {
    const name = this.randomChoice(this.PRODUCT_NAMES);
    const category = this.randomChoice(this.CATEGORIES);

    return {
      id: this.uuid(),
      name,
      description: `High-quality ${name.toLowerCase()} with excellent features and durability.`,
      price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
      category,
      sku: this.randomString(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      quantity: this.randomInt(0, 100),
      imageUrl: `https://picsum.photos/400/300?random=${this.randomInt(1, 1000)}`,
      ...overrides
    };
  }

  /**
   * Generate random order data
   */
  static orderData(overrides: Partial<OrderData> = {}): OrderData {
    const products = Array.from({ length: this.randomInt(1, 5) }, () => this.productData());
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

    return {
      id: this.uuid(),
      userId: this.uuid(),
      products,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: this.randomChoice(['pending', 'processing', 'shipped', 'delivered']),
      orderDate: new Date(),
      shippingAddress: this.addressData(),
      ...overrides
    };
  }

  /**
   * Generate multiple users
   */
  static users(count: number, overrides: Partial<UserData> = {}): UserData[] {
    return Array.from({ length: count }, () => this.userData(overrides));
  }

  /**
   * Generate multiple products
   */
  static products(count: number, overrides: Partial<ProductData> = {}): ProductData[] {
    return Array.from({ length: count }, () => this.productData(overrides));
  }

  /**
   * Generate multiple orders
   */
  static orders(count: number, overrides: Partial<OrderData> = {}): OrderData[] {
    return Array.from({ length: count }, () => this.orderData(overrides));
  }

  /**
   * Generate test data for specific scenarios
   */
  static scenarios = {
    /**
     * Generate admin user
     */
    adminUser: (): UserData => this.userData({ role: 'admin' }),

    /**
     * Generate regular user
     */
    regularUser: (): UserData => this.userData({ role: 'user' }),

    /**
     * Generate readonly user
     */
    readonlyUser: (): UserData => this.userData({ role: 'readonly' }),

    /**
     * Generate user with invalid email
     */
    invalidEmailUser: (): UserData => this.userData({ email: 'invalid-email' }),

    /**
     * Generate inactive user
     */
    inactiveUser: (): UserData => this.userData({ isActive: false }),

    /**
     * Generate expensive product
     */
    expensiveProduct: (): ProductData => this.productData({ price: this.randomInt(500, 2000) }),

    /**
     * Generate out of stock product
     */
    outOfStockProduct: (): ProductData => this.productData({ inStock: false, quantity: 0 }),

    /**
     * Generate large order
     */
    largeOrder: (): OrderData => {
      const products = Array.from({ length: this.randomInt(5, 15) }, () => this.productData());
      const totalAmount = products.reduce((sum, product) => sum + product.price, 0);
      return this.orderData({ products, totalAmount: parseFloat(totalAmount.toFixed(2)) });
    },

    /**
     * Generate cancelled order
     */
    cancelledOrder: (): OrderData => this.orderData({ status: 'cancelled' }),
  };
}

/**
 * Test data builder for fluent API
 */
export class TestDataBuilder {
  private data: any = {};

  static user(): UserDataBuilder {
    return new UserDataBuilder();
  }

  static product(): ProductDataBuilder {
    return new ProductDataBuilder();
  }

  static order(): OrderDataBuilder {
    return new OrderDataBuilder();
  }
}

export class UserDataBuilder {
  private data: Partial<UserData> = {};

  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withRole(role: 'admin' | 'user' | 'readonly'): this {
    this.data.role = role;
    return this;
  }

  inactive(): this {
    this.data.isActive = false;
    return this;
  }

  build(): UserData {
    return DataGenerator.userData(this.data);
  }
}

export class ProductDataBuilder {
  private data: Partial<ProductData> = {};

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withPrice(price: number): this {
    this.data.price = price;
    return this;
  }

  withCategory(category: string): this {
    this.data.category = category;
    return this;
  }

  outOfStock(): this {
    this.data.inStock = false;
    this.data.quantity = 0;
    return this;
  }

  build(): ProductData {
    return DataGenerator.productData(this.data);
  }
}

export class OrderDataBuilder {
  private data: Partial<OrderData> = {};

  withUserId(userId: string): this {
    this.data.userId = userId;
    return this;
  }

  withStatus(status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): this {
    this.data.status = status;
    return this;
  }

  withProducts(products: ProductData[]): this {
    this.data.products = products;
    return this;
  }

  build(): OrderData {
    return DataGenerator.orderData(this.data);
  }
}