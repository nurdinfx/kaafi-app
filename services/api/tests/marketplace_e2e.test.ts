import request from 'supertest';
import createApp from '../src/app';
import prisma from '../src/db';

const app = createApp();

describe('HUDI-SOFT MARKETPLACE (Fududeeye App) - Production Verification Suite', () => {
  let adminToken: string;
  let customerToken: string;
  let customerId: string;
  let sellerToken: string;
  let sellerId: string;
  let businessToken: string;
  let businessId: string;
  let driverToken: string;
  let vehicleListingId: string;
  let electronicsListingId: string;
  let createdOfferId: string;
  let transactionId: string;
  let deliveryJobId: string;
  let deliveryPin: string;
  let customerPhone: string;

  beforeAll(async () => {
    // Ensure clean state or connect to existing
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ----------------------------------------------------
  // SCENARIO 1: Customer Registration, Login & Browse
  // ----------------------------------------------------
  test('TEST 1: Customer registration, login, browse categories, and search', async () => {
    customerPhone = `+25290711${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Register customer
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phoneNumber: customerPhone,
        password: 'Password123!',
        fullName: 'Farah Customer',
        city: 'Garoowe',
        initialRole: 'CUSTOMER',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    customerToken = regRes.body.data.token;
    customerId = regRes.body.data.user.id;

    // 2. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: customerPhone,
        password: 'Password123!',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();

    // 3. Browse categories
    const catRes = await request(app).get('/api/v1/categories');
    expect(catRes.status).toBe(200);
    expect(Array.isArray(catRes.body.data)).toBe(true);

    // 4. Search listings
    const searchRes = await request(app).get('/api/v1/listings?city=Garoowe');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
  });

  // ----------------------------------------------------
  // SCENARIO 2: Individual Seller Registration & Listing
  // ----------------------------------------------------
  test('TEST 2: Individual seller registration, verification request, and listing publish', async () => {
    const sellerPhone = `+25290722${Math.floor(1000 + Math.random() * 9000)}`;

    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phoneNumber: sellerPhone,
        password: 'Password123!',
        fullName: 'Hassan Seller',
        city: 'Garoowe',
        initialRole: 'INDIVIDUAL_SELLER',
      });

    expect(regRes.status).toBe(201);
    sellerToken = regRes.body.data.token;
    sellerId = regRes.body.data.user.id;

    // Submit verification document
    const verRes = await request(app)
      .post('/api/v1/trust/verification')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        targetType: 'SELLER',
        documentType: 'NATIONAL_ID',
        documentUrl: 'https://storage.hudisoft.so/docs/id-hassan.pdf',
      });
    expect(verRes.status).toBe(201);

    // Fetch electronics category
    const catRes = await request(app).get('/api/v1/categories/electronics');
    const categoryId = catRes.body.data.id;

    // Create listing
    const listingRes = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'iPhone 15 Pro Max 256GB Desert Titanium',
        description: 'Brand new, sealed box with official 1 year warranty. Pickup in Garoowe.',
        price: 1150.0,
        currency: 'USD',
        categoryId,
        condition: 'NEW',
        inventoryCount: 3,
        city: 'Garoowe',
        landmark: 'Near Suuqa Hantiwadaag',
        mediaUrls: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569'],
      });

    expect(listingRes.status).toBe(201);
    expect(listingRes.body.data.id).toBeDefined();
    electronicsListingId = listingRes.body.data.id;

    // Verify it appears publicly
    const publicRes = await request(app).get(`/api/v1/listings/${listingRes.body.data.slug}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.price).toBe(1150.0);
  });

  // ----------------------------------------------------
  // SCENARIO 3: Business Store, Branches, Employees
  // ----------------------------------------------------
  test('TEST 3: Business creates store, branches, and employees', async () => {
    const bizPhone = `+25290733${Math.floor(1000 + Math.random() * 9000)}`;

    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phoneNumber: bizPhone,
        password: 'Password123!',
        fullName: 'Nugaal Auto Owner',
        city: 'Garoowe',
        initialRole: 'BUSINESS_SELLER',
      });

    businessToken = regRes.body.data.token;

    // Create complete digital store
    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        businessName: 'Nugaal Motors Garoowe',
        phone: bizPhone,
        city: 'Garoowe',
        landmarkAddress: 'Wadada 30-ka, Garoowe',
        openingHours: 'Sat - Thu: 7:30 AM - 8:00 PM',
      });

    expect(storeRes.status).toBe(201);
    businessId = storeRes.body.data.id;

    // Add branch
    const branchRes = await request(app)
      .post(`/api/v1/stores/${businessId}/branches`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        branchName: 'Nugaal Motors Main Showroom',
        city: 'Garoowe',
        landmark: 'Near Airport Road',
      });
    expect(branchRes.status).toBe(201);

    // Add employee
    const empRes = await request(app)
      .post(`/api/v1/stores/${businessId}/employees`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        userId: customerId,
        roleTitle: 'Inventory Manager',
        permissions: ['inventory.manage', 'orders.read'],
      });
    expect(empRes.status).toBe(201);
  });

  // ----------------------------------------------------
  // SCENARIO 5: Offer Negotiation Engine
  // ----------------------------------------------------
  test('TEST 5: Offer negotiation: Buyer offer -> Seller counter-offer -> Buyer accept -> Transaction created', async () => {
    // 1. Buyer offers $1,050 for the $1,150 phone
    const offerRes = await request(app)
      .post('/api/v1/offers')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: electronicsListingId,
        offeredPrice: 1050.0,
        notes: 'Can pickup today in Garoowe with cash or EVC Plus.',
      });

    expect(offerRes.status).toBe(201);
    expect(offerRes.body.data.status).toBe('PENDING');
    createdOfferId = offerRes.body.data.id;

    // 2. Seller counter-offers $1,100
    const counterRes = await request(app)
      .post(`/api/v1/offers/${createdOfferId}/counter`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        counterPrice: 1100.0,
        notes: 'Lowest price I can do for brand new sealed box.',
      });

    expect(counterRes.status).toBe(200);
    expect(counterRes.body.data.status).toBe('COUNTERED');
    expect(counterRes.body.data.counterPrice).toBe(1100.0);

    // 3. Buyer accepts counter-offer
    const acceptRes = await request(app)
      .post(`/api/v1/offers/${createdOfferId}/accept`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.offer.status).toBe('ACCEPTED');
    expect(acceptRes.body.data.transaction).toBeDefined();
    expect(acceptRes.body.data.transaction.totalAmount).toBe(1100.0);
  });

  // ----------------------------------------------------
  // SCENARIO 6: "Request What You Need" & Matching
  // ----------------------------------------------------
  test('TEST 6: Buyer creates request -> sellers notified -> seller submits offer', async () => {
    const catRes = await request(app).get('/api/v1/categories/vehicles');
    const vehicleCatId = catRes.body.data.id;

    // Buyer creates request
    const reqRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        categoryId: vehicleCatId,
        title: 'Toyota Prado TXL 2019-2021 in clean condition',
        description: 'Budget up to $18,000. Ready to buy immediately in Garoowe.',
        targetBudget: 18000.0,
        city: 'Garoowe',
      });

    expect(reqRes.status).toBe(201);
    const buyerRequestId = reqRes.body.data.id;

    // Seller submits offer on this request
    const offerRes = await request(app)
      .post('/api/v1/offers')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        requestId: buyerRequestId,
        offeredPrice: 17500.0,
        notes: 'I have a 2020 Prado TXL clean import from Dubai available for inspection.',
      });

    expect(offerRes.status).toBe(201);
    expect(offerRes.body.data.offeredPrice).toBe(17500.0);
  });

  // ----------------------------------------------------
  // SCENARIO 7: Vehicle Vertical
  // ----------------------------------------------------
  test('TEST 7: Seller creates dedicated vehicle listing with custom attributes', async () => {
    const catRes = await request(app).get('/api/v1/categories/vehicles');
    const vehicleCatId = catRes.body.data.id;

    const vRes = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Toyota Land Cruiser Prado TXL 2020',
        description: 'Low mileage, automatic, clean engine, inspected.',
        price: 18500.0,
        currency: 'USD',
        categoryId: vehicleCatId,
        city: 'Garoowe',
        landmark: 'Near Hotel Rugsan',
        vehicleData: {
          make: 'Toyota',
          model: 'Land Cruiser Prado',
          year: 2020,
          mileageKm: 42000,
          transmission: 'AUTOMATIC',
          fuelType: 'PETROL',
          color: 'White Pearl',
          inspectionPassed: true,
        },
      });

    expect(vRes.status).toBe(201);
    expect(vRes.body.data.vehicleDetails).toBeDefined();
    expect(vRes.body.data.vehicleDetails.make).toBe('Toyota');
    vehicleListingId = vRes.body.data.id;
  });

  // ----------------------------------------------------
  // SCENARIO 10: B2B Wholesale RFQ & Quotes
  // ----------------------------------------------------
  test('TEST 10: B2B Wholesale: Buyer RFQ -> Supplier Quote -> Awarded', async () => {
    // 1. Business creates RFQ for 500 bags of cement
    const rfqRes = await request(app)
      .post('/api/v1/wholesale/rfq')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        title: '500 Bags Construction Grade Cement',
        description: 'Require high-strength 42.5N cement delivered to Garoowe site.',
        requiredQty: 500,
        unitOfMeasure: 'BAGS',
        targetPrice: 8.5,
        deliveryCity: 'Garoowe',
      });

    expect(rfqRes.status).toBe(201);
    const rfqId = rfqRes.body.data.id;

    // 2. Supplier submits quote
    const quoteRes = await request(app)
      .post(`/api/v1/wholesale/rfq/${rfqId}/quotes`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        unitPrice: 8.25,
        currency: 'USD',
        moq: 100,
        deliveryDays: 2,
        notes: 'Top quality Berbera cement with on-site offloading.',
      });

    expect(quoteRes.status).toBe(201);
    const quoteId = quoteRes.body.data.id;

    // 3. Buyer accepts quote
    const acceptRes = await request(app)
      .post(`/api/v1/wholesale/quotes/${quoteId}/accept`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.transaction).toBeDefined();
    expect(acceptRes.body.data.transaction.subtotalAmount).toBe(4125.0); // 500 * 8.25
  });

  // ----------------------------------------------------
  // SCENARIO 4 & 11: Direct Purchase, Delivery & Proof of Delivery
  // ----------------------------------------------------
  test('TEST 4 & 11: Checkout -> Payment -> Driver Dispatch -> Proof of Delivery PIN -> Wallet release', async () => {
    // 1. Register a Driver
    const driverPhone = `+25290744${Math.floor(1000 + Math.random() * 9000)}`;
    const driverReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        phoneNumber: driverPhone,
        password: 'Password123!',
        fullName: 'Ali Driver',
        city: 'Garoowe',
        initialRole: 'DRIVER',
      });
    driverToken = driverReg.body.data.token;

    // 2. Customer places order with DRIVER_DELIVERY
    const orderRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fulfillmentType: 'DRIVER_DELIVERY',
        deliveryCity: 'Garoowe',
        deliveryLandmark: 'Near University of Puntland (PSU)',
        recipientPhone: customerPhone,
        items: [
          {
            listingId: electronicsListingId,
            quantity: 1,
          },
        ],
      });

    expect(orderRes.status).toBe(201);
    transactionId = orderRes.body.data.id;

    // 3. Initiate EVC Plus Payment
    const payRes = await request(app)
      .post('/api/v1/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        transactionId,
        provider: 'EVC_PLUS',
        payerPhone: '+252907123456',
        idempotencyKey: `IDEM-PAY-${transactionId}`,
      });

    expect(payRes.status).toBe(200);
    expect(payRes.body.data.payment).toBeDefined();

    // 4. Driver finds available delivery job and accepts
    const jobRes = await prisma.deliveryJob.findUnique({ where: { transactionId } });
    expect(jobRes).toBeDefined();
    deliveryJobId = jobRes!.id;
    deliveryPin = jobRes!.deliveryPin; // secret PIN given by buyer to driver

    const acceptJobRes = await request(app)
      .post(`/api/v1/logistics/jobs/${deliveryJobId}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(acceptJobRes.status).toBe(200);

    // 5. Driver enters customer Proof of Delivery PIN
    const completeRes = await request(app)
      .post(`/api/v1/logistics/jobs/${deliveryJobId}/complete`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        deliveryPin,
      });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.job.status).toBe('DELIVERED');

    // 6. Verify Transaction is COMPLETED
    const tx = await prisma.marketplaceTransaction.findUnique({ where: { id: transactionId } });
    expect(tx?.status).toBe('COMPLETED');
  });

  // ----------------------------------------------------
  // SCENARIOS 12 & 13: RBAC & Tenant Isolation Tests
  // ----------------------------------------------------
  test('TEST 12: Normal customer calling Admin API is rejected with 403 Forbidden', async () => {
    const adminRes = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${customerToken}`); // Customer token!

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
  });

  test('TEST 13: Tenant Isolation: User A cannot manage Business B branches', async () => {
    const tamperRes = await request(app)
      .post(`/api/v1/stores/${businessId}/branches`)
      .set('Authorization', `Bearer ${sellerToken}`) // Seller Hassan trying to modify Nugaal Motors!
      .send({
        branchName: 'Hacked Branch',
        city: 'Garoowe',
      });

    expect(tamperRes.status).toBe(403);
    expect(tamperRes.body.success).toBe(false);
  });

  // ----------------------------------------------------
  // SCENARIOS 14, 15 & 16: Financial & Review Integrity
  // ----------------------------------------------------
  test('TEST 14: Client cannot tamper with wallet balance', async () => {
    // Attempting to withdraw more than available balance is rejected
    const payoutRes = await request(app)
      .post('/api/v1/payments/wallet/payout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        amount: 999999.0,
        destinationType: 'EVC_PLUS',
        phoneNumber: '+252907111222',
      });

    expect(payoutRes.status).toBe(400);
    expect(payoutRes.body.error.code).toBe('INSUFFICIENT_FUNDS');
  });

  test('TEST 15: Payment webhook replay is strictly idempotent', async () => {
    const eventId = `EVT-WEBHOOK-${Date.now()}`;

    // First call
    const firstCall = await request(app)
      .post('/api/v1/payments/webhook/EVC_PLUS')
      .send({
        eventId,
        transactionId,
        status: 'SUCCESS',
        providerReference: 'EVC-REF-123',
      });
    expect(firstCall.status).toBe(200);

    // Replayed call
    const replayCall = await request(app)
      .post('/api/v1/payments/webhook/EVC_PLUS')
      .send({
        eventId,
        transactionId,
        status: 'SUCCESS',
        providerReference: 'EVC-REF-123',
      });
    expect(replayCall.status).toBe(200);
    expect(replayCall.body.message).toContain('Idempotent response');
  });

  test('TEST 16: Duplicate review attempt is rejected with 409 Conflict', async () => {
    // 1. Submit legitimate review
    const reviewRes = await request(app)
      .post('/api/v1/trust/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: electronicsListingId,
        rating: 5,
        comment: 'Excellent brand new phone, very fast seller in Garoowe!',
      });
    expect(reviewRes.status).toBe(201);

    // 2. Attempt duplicate review on same listing
    const dupRes = await request(app)
      .post('/api/v1/trust/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: electronicsListingId,
        rating: 5,
        comment: 'Submitting duplicate spam review',
      });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('CONFLICT');
  });

  // ----------------------------------------------------
  // SCENARIO 9: Social Discovery -> Listing Commerce
  // ----------------------------------------------------
  test('TEST 9 (Social): Creator publishes post linking listing -> customers discover and interact', async () => {
    // Create social post tagging the phone listing
    const postRes = await request(app)
      .post('/api/v1/social/posts')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        caption: 'Unboxing the new iPhone 15 Pro Max available at our Garoowe store!',
        mediaUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
        mediaType: 'SHORT_VIDEO',
        linkedListingIds: [electronicsListingId],
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.data.linkedListings.length).toBe(1);

    const postId = postRes.body.data.id;

    // Customer likes post
    const likeRes = await request(app)
      .post(`/api/v1/social/posts/${postId}/like`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.data.liked).toBe(true);

    // Customer follows seller
    const followRes = await request(app)
      .post(`/api/v1/social/follow/${sellerId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(followRes.status).toBe(200);
    expect(followRes.body.data.following).toBe(true);
  });

  // ----------------------------------------------------
  // PHASE 1 & 2 EXTENSIONS: Users, Roles, Real Estate, Services & Lifecycle
  // ----------------------------------------------------
  test('TEST 17: Canonical Users API: GET /me, PATCH /me, GET /:id and public listings', async () => {
    // 1. GET /api/v1/users/me
    const meRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.id).toBe(customerId);
    expect(meRes.body.data.roles).toContain('CUSTOMER');

    // 2. PATCH /api/v1/users/me
    const patchRes = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bio: 'Marketplace buyer and tech enthusiast in Garoowe.',
        city: 'Garoowe',
      });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.bio).toContain('tech enthusiast');

    // 3. GET /api/v1/users/:id (Public seller profile)
    const publicUserRes = await request(app).get(`/api/v1/users/${sellerId}`);
    expect(publicUserRes.status).toBe(200);
    expect(publicUserRes.body.data.fullName).toBe('Hassan Seller');

    // 4. GET /api/v1/users/:id/listings
    const sellerListingsRes = await request(app).get(`/api/v1/users/${sellerId}/listings`);
    expect(sellerListingsRes.status).toBe(200);
    expect(Array.isArray(sellerListingsRes.body.data)).toBe(true);
  });

  test('TEST 18: Canonical Roles API: GET /roles and POST /roles/request capability', async () => {
    // 1. GET /api/v1/roles
    const rolesRes = await request(app).get('/api/v1/roles');
    expect(rolesRes.status).toBe(200);
    expect(rolesRes.body.data.length).toBeGreaterThanOrEqual(13);

    // 2. Customer requests CREATOR capability
    const reqRoleRes = await request(app)
      .post('/api/v1/roles/request')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        roleName: 'CREATOR',
      });
    expect(reqRoleRes.status).toBe(201);
    expect(reqRoleRes.body.data.status).toBe('ACTIVE');
  });

  test('TEST 19: Phase 2 Real Estate & Land Listing with PropertyDetails & Landmark Addressing', async () => {
    const catRes = await request(app).get('/api/v1/categories/real-estate');
    const propertyCatId = catRes.body.data.id;

    const propRes = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Luxury 4-Bedroom Villa in Hodan District, Garoowe',
        description: 'Modern residential villa with master bedrooms, borehole water, solar power, and compound wall.',
        price: 85000.0,
        currency: 'USD',
        categoryId: propertyCatId,
        city: 'Garoowe',
        district: 'Hodan',
        landmark: 'Near Puntland State House',
        propertyData: {
          propertyType: 'HOUSE',
          transactionType: 'SALE',
          bedrooms: 4,
          bathrooms: 3,
          areaSqMeters: 450,
          furnished: true,
          hasParking: true,
          landTitleStatus: 'TITLE_DEED',
        },
      });

    expect(propRes.status).toBe(201);
    expect(propRes.body.data.propertyDetails).toBeDefined();
    expect(propRes.body.data.propertyDetails.bedrooms).toBe(4);
    expect(propRes.body.data.district).toBe('Hodan');
  });

  test('TEST 20: Phase 2 Service Listing with ServiceDetails and hourly pricing', async () => {
    const catRes = await request(app).get('/api/v1/categories/services');
    const serviceCatId = catRes.body.data.id;

    const sRes = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Professional Solar & Electrical Installation Service',
        description: 'Certified engineer for residential & commercial solar setups across Nugaal region.',
        price: 45.0,
        currency: 'USD',
        categoryId: serviceCatId,
        city: 'Garoowe',
        landmark: 'Near Wadada 30-ka',
        serviceData: {
          serviceType: 'SOLAR_INSTALLATION',
          pricingModel: 'HOURLY',
          yearsExperience: 8,
          serviceArea: 'Garoowe and surrounding Nugaal districts',
          availability: 'Sat-Thu 8:00 AM - 6:00 PM',
        },
      });

    expect(sRes.status).toBe(201);
    expect(sRes.body.data.serviceDetails).toBeDefined();
    expect(sRes.body.data.serviceDetails.yearsExperience).toBe(8);
  });

  test('TEST 21: Phase 2 Listing Lifecycle: Update listing price & soft-archive', async () => {
    // 1. Seller updates price and landmark
    const updateRes = await request(app)
      .patch(`/api/v1/listings/${electronicsListingId}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        price: 1120.0,
        landmark: 'Near Suuqa Hantiwadaag (Opposite Golis Tower)',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.price).toBe(1120.0);
    expect(updateRes.body.data.landmark).toContain('Opposite Golis Tower');

    // 2. Unauthorized user cannot update
    const unauthRes = await request(app)
      .patch(`/api/v1/listings/${electronicsListingId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 500.0 });
    expect(unauthRes.status).toBe(403);

    // 3. Seller archives listing
    const deleteRes = await request(app)
      .delete(`/api/v1/listings/${electronicsListingId}`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(deleteRes.status).toBe(200);

    const archived = await prisma.listing.findUnique({ where: { id: electronicsListingId } });
    expect(archived?.status).toBe('ARCHIVED');
  });
});
