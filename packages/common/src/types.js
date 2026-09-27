"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentType = exports.LedgerType = exports.PaymentProvider = exports.TransactionStatus = exports.OfferStatus = exports.ListingStatus = exports.ListingCondition = exports.VerticalType = exports.RoleType = void 0;
var RoleType;
(function (RoleType) {
    RoleType["CUSTOMER"] = "CUSTOMER";
    RoleType["INDIVIDUAL_SELLER"] = "INDIVIDUAL_SELLER";
    RoleType["BUSINESS_SELLER"] = "BUSINESS_SELLER";
    RoleType["CREATOR"] = "CREATOR";
    RoleType["SERVICE_PROVIDER"] = "SERVICE_PROVIDER";
    RoleType["WHOLESALE_BUYER"] = "WHOLESALE_BUYER";
    RoleType["WHOLESALE_SELLER"] = "WHOLESALE_SELLER";
    RoleType["DRIVER"] = "DRIVER";
    RoleType["MERCHANT_STAFF"] = "MERCHANT_STAFF";
    RoleType["PROPERTY_AGENT"] = "PROPERTY_AGENT";
    RoleType["VEHICLE_DEALER"] = "VEHICLE_DEALER";
    RoleType["MODERATOR"] = "MODERATOR";
    RoleType["SUPPORT_AGENT"] = "SUPPORT_AGENT";
    RoleType["FINANCE_ADMIN"] = "FINANCE_ADMIN";
    RoleType["OPERATIONS_ADMIN"] = "OPERATIONS_ADMIN";
    RoleType["MARKETING_ADMIN"] = "MARKETING_ADMIN";
    RoleType["SUPER_ADMIN"] = "SUPER_ADMIN";
})(RoleType || (exports.RoleType = RoleType = {}));
var VerticalType;
(function (VerticalType) {
    VerticalType["PRODUCT"] = "PRODUCT";
    VerticalType["VEHICLE"] = "VEHICLE";
    VerticalType["REAL_ESTATE"] = "REAL_ESTATE";
    VerticalType["LAND"] = "LAND";
    VerticalType["SERVICE"] = "SERVICE";
    VerticalType["WHOLESALE"] = "WHOLESALE";
})(VerticalType || (exports.VerticalType = VerticalType = {}));
var ListingCondition;
(function (ListingCondition) {
    ListingCondition["NEW"] = "NEW";
    ListingCondition["LIKE_NEW"] = "LIKE_NEW";
    ListingCondition["USED_GOOD"] = "USED_GOOD";
    ListingCondition["USED_FAIR"] = "USED_FAIR";
})(ListingCondition || (exports.ListingCondition = ListingCondition = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["DRAFT"] = "DRAFT";
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    ListingStatus["SUSPENDED"] = "SUSPENDED";
    ListingStatus["SOLD"] = "SOLD";
    ListingStatus["ARCHIVED"] = "ARCHIVED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "PENDING";
    OfferStatus["COUNTERED"] = "COUNTERED";
    OfferStatus["ACCEPTED"] = "ACCEPTED";
    OfferStatus["REJECTED"] = "REJECTED";
    OfferStatus["EXPIRED"] = "EXPIRED";
    OfferStatus["CANCELLED"] = "CANCELLED";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    TransactionStatus["PAID"] = "PAID";
    TransactionStatus["PREPARING"] = "PREPARING";
    TransactionStatus["READY_FOR_PICKUP"] = "READY_FOR_PICKUP";
    TransactionStatus["IN_TRANSIT"] = "IN_TRANSIT";
    TransactionStatus["DELIVERED"] = "DELIVERED";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["DISPUTED"] = "DISPUTED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["EVC_PLUS"] = "EVC_PLUS";
    PaymentProvider["ZAAD"] = "ZAAD";
    PaymentProvider["SAHAL"] = "SAHAL";
    PaymentProvider["WALLET"] = "WALLET";
    PaymentProvider["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
    PaymentProvider["CARD"] = "CARD";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var LedgerType;
(function (LedgerType) {
    LedgerType["CREDIT"] = "CREDIT";
    LedgerType["DEBIT"] = "DEBIT";
    LedgerType["COMMISSION"] = "COMMISSION";
    LedgerType["PAYOUT"] = "PAYOUT";
    LedgerType["REFUND"] = "REFUND";
    LedgerType["ADJUSTMENT"] = "ADJUSTMENT";
})(LedgerType || (exports.LedgerType = LedgerType = {}));
var FulfillmentType;
(function (FulfillmentType) {
    FulfillmentType["SELF_PICKUP"] = "SELF_PICKUP";
    FulfillmentType["MERCHANT_DELIVERY"] = "MERCHANT_DELIVERY";
    FulfillmentType["DRIVER_DELIVERY"] = "DRIVER_DELIVERY";
    FulfillmentType["DIGITAL"] = "DIGITAL";
})(FulfillmentType || (exports.FulfillmentType = FulfillmentType = {}));
