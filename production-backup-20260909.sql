--
-- PostgreSQL database dump
--

\restrict p8fkmG9bQPhf0m2WDhkSfPFiPzn3a83fT9Xc9q3hkb1d0GTQi7O3aOiYsAuN3lF

-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: prisma_postgres; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS prisma_postgres WITH SCHEMA public;


--
-- Name: EXTENSION prisma_postgres; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION prisma_postgres IS 'prisma_postgres';


--
-- Name: AddressType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AddressType" AS ENUM (
    'SHIPPING',
    'BILLING',
    'BOTH'
);


--
-- Name: AuthProvider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuthProvider" AS ENUM (
    'WEB',
    'GOOGLE'
);


--
-- Name: BannerTextAlignment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BannerTextAlignment" AS ENUM (
    'LEFT',
    'CENTER',
    'RIGHT'
);


--
-- Name: BannerTextTheme; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BannerTextTheme" AS ENUM (
    'LIGHT',
    'DARK'
);


--
-- Name: CartStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CartStatus" AS ENUM (
    'ACTIVE',
    'ABANDONED',
    'CONVERTED'
);


--
-- Name: CouponSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CouponSource" AS ENUM (
    'MANUAL',
    'BIRTHDAY'
);


--
-- Name: CouponType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CouponType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SHIPPING'
);


--
-- Name: HomepageBannerPlacement; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HomepageBannerPlacement" AS ENUM (
    'HERO',
    'TOP',
    'MIDDLE',
    'BOTTOM',
    'ANNOUNCEMENT_BAR',
    'HOME_HERO',
    'HOME_CAMPAIGN',
    'HOME_CATEGORY',
    'PRODUCT_LISTING'
);


--
-- Name: HomepageSectionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HomepageSectionType" AS ENUM (
    'BANNER',
    'FEATURED_PRODUCTS',
    'CATEGORY_PRODUCTS',
    'CUSTOM'
);


--
-- Name: InventoryTransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InventoryTransactionType" AS ENUM (
    'IMPORT',
    'EXPORT',
    'SALE',
    'RETURN',
    'ADJUSTMENT',
    'RESERVATION',
    'RELEASE'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'VOIDED'
);


--
-- Name: LegacyProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LegacyProductStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ARCHIVED',
    'OUT_OF_STOCK'
);


--
-- Name: LegacyProductVisibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LegacyProductVisibility" AS ENUM (
    'PUBLIC',
    'HIDDEN',
    'PRIVATE'
);


--
-- Name: MembershipBenefitType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MembershipBenefitType" AS ENUM (
    'PERCENTAGE_ORDER_DISCOUNT',
    'FIXED_ORDER_DISCOUNT',
    'FREE_SHIPPING',
    'BIRTHDAY_VOUCHER',
    'EARLY_ACCESS',
    'EXCLUSIVE_PRODUCTS',
    'BONUS_POINTS',
    'CAMPAIGN_ACCESS',
    'FREE_GIFT',
    'CUSTOM_TEXT'
);


--
-- Name: MembershipResetStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MembershipResetStatus" AS ENUM (
    'RUNNING',
    'COMPLETED',
    'FAILED'
);


--
-- Name: NotificationPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationPriority" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER',
    'PAYMENT',
    'SHIPPING',
    'PROMOTION',
    'SYSTEM'
);


--
-- Name: OrderSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderSource" AS ENUM (
    'OFFLINE',
    'ONLINE'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_TO_SHIP',
    'SHIPPING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: OtpPurpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OtpPurpose" AS ENUM (
    'LOGIN',
    'REGISTER',
    'VERIFY_PHONE',
    'RESET_PASSWORD'
);


--
-- Name: PaymentLogType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentLogType" AS ENUM (
    'CREATED',
    'REDIRECTED',
    'WEBHOOK_RECEIVED',
    'VERIFIED',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'MANUAL_UPDATE'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'COD',
    'CARD',
    'BANK_TRANSFER',
    'MOMO',
    'ZALOPAY',
    'PAYPAL',
    'STRIPE',
    'CASH'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'UNPAID',
    'PENDING',
    'PROCESSING',
    'AUTHORIZED',
    'PAID',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


--
-- Name: PolicyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PolicyStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'HIDDEN'
);


--
-- Name: PolicyType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PolicyType" AS ENUM (
    'PURCHASE_GUIDE',
    'SHIPPING',
    'RETURN_REFUND',
    'PRIVACY',
    'TERMS',
    'PAYMENT',
    'OTHER'
);


--
-- Name: ProductDraftMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductDraftMode" AS ENUM (
    'CREATE',
    'EDIT'
);


--
-- Name: ProductDraftStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductDraftStatus" AS ENUM (
    'ACTIVE',
    'APPLIED',
    'DISCARDED'
);


--
-- Name: ProductGender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductGender" AS ENUM (
    'WOMEN',
    'MEN',
    'UNISEX',
    'KIDS'
);


--
-- Name: ProductImportMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductImportMode" AS ENUM (
    'CREATE_ONLY'
);


--
-- Name: ProductImportStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductImportStatus" AS ENUM (
    'UPLOADED',
    'VALIDATING',
    'READY',
    'PROCESSING',
    'COMPLETED',
    'PARTIALLY_COMPLETED',
    'FAILED'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'DISCONTINUED'
);


--
-- Name: ShippingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ShippingStatus" AS ENUM (
    'PENDING',
    'READY_TO_SHIP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
    'RETURNED'
);


--
-- Name: UserGender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserGender" AS ENUM (
    'FEMALE',
    'MALE',
    'OTHER',
    'UNSPECIFIED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'CUSTOMER'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    "actorId" integer,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" integer,
    "previousValue" jsonb,
    "newValue" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: brand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    description text,
    website text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: brand_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brand_id_seq OWNED BY public.brand.id;


--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    "userId" integer,
    status public."CartStatus" DEFAULT 'ACTIVE'::public."CartStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- Name: cart_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_item (
    id integer NOT NULL,
    "cartId" integer NOT NULL,
    "productId" integer NOT NULL,
    "variantId" integer,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cart_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_item_id_seq OWNED BY public.cart_item.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    color text NOT NULL,
    icon text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "metaRobots" text,
    "parentId" integer,
    "position" integer DEFAULT 0 NOT NULL,
    "seoImage" text,
    slug text
);


--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;


--
-- Name: coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    type public."CouponType" NOT NULL,
    value numeric(65,30) NOT NULL,
    "minOrderAmount" numeric(65,30),
    "maxDiscountAmount" numeric(65,30),
    "usageLimit" integer,
    "usageLimitPerUser" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "firstOrderOnly" boolean DEFAULT false NOT NULL,
    "maximumUsagePerDay" integer,
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "normalizedCode" text NOT NULL,
    "publicToken" text NOT NULL,
    source public."CouponSource" DEFAULT 'MANUAL'::public."CouponSource" NOT NULL,
    "recipientUserId" integer,
    "birthdayYear" integer
);


--
-- Name: coupon_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_category (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "categoryId" integer NOT NULL
);


--
-- Name: coupon_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coupon_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coupon_category_id_seq OWNED BY public.coupon_category.id;


--
-- Name: coupon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coupon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coupon_id_seq OWNED BY public.coupon.id;


--
-- Name: coupon_membership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_membership (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "membershipId" integer NOT NULL,
    "discountRate" numeric(65,30) NOT NULL
);


--
-- Name: coupon_membership_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coupon_membership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_membership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coupon_membership_id_seq OWNED BY public.coupon_membership.id;


--
-- Name: coupon_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_product (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "productId" integer NOT NULL
);


--
-- Name: coupon_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coupon_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coupon_product_id_seq OWNED BY public.coupon_product.id;


--
-- Name: daily_finance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_finance (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "monthlyFinanceId" integer NOT NULL,
    "capitalCash" numeric(65,30) DEFAULT 0 NOT NULL,
    "capitalBank" numeric(65,30) DEFAULT 0 NOT NULL,
    "revenueCash" numeric(65,30) DEFAULT 0 NOT NULL,
    "revenueBank" numeric(65,30) DEFAULT 0 NOT NULL,
    "profitCash" numeric(65,30) DEFAULT 0 NOT NULL,
    "profitBank" numeric(65,30) DEFAULT 0 NOT NULL,
    "totalProfit" numeric(65,30) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    note text
);


--
-- Name: daily_finance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_finance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_finance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_finance_id_seq OWNED BY public.daily_finance.id;


--
-- Name: daily_sold_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_sold_product (
    id integer NOT NULL,
    "dailyFinanceId" integer NOT NULL,
    "productId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "importPrice" numeric(65,30) NOT NULL,
    sales jsonb NOT NULL
);


--
-- Name: daily_sold_product_contribution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_sold_product_contribution (
    id integer NOT NULL,
    "dailyFinanceId" integer NOT NULL,
    "dailySoldProductId" integer,
    "orderId" integer NOT NULL,
    "orderItemId" integer NOT NULL,
    "productId" integer NOT NULL,
    "variantId" integer,
    quantity integer NOT NULL,
    "sellPrice" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: daily_sold_product_contribution_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_sold_product_contribution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_sold_product_contribution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_sold_product_contribution_id_seq OWNED BY public.daily_sold_product_contribution.id;


--
-- Name: daily_sold_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_sold_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_sold_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_sold_product_id_seq OWNED BY public.daily_sold_product.id;


--
-- Name: discount_redemption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount_redemption (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "orderId" integer NOT NULL,
    "codeSnapshot" text NOT NULL,
    "discountTypeSnapshot" public."CouponType" NOT NULL,
    "discountValueSnapshot" numeric(65,30) NOT NULL,
    "discountAmount" numeric(65,30) NOT NULL,
    "subtotalSnapshot" numeric(65,30) NOT NULL,
    "redeemedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: discount_redemption_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discount_redemption_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: discount_redemption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discount_redemption_id_seq OWNED BY public.discount_redemption.id;


--
-- Name: excluded_coupon_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.excluded_coupon_category (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "categoryId" integer NOT NULL
);


--
-- Name: excluded_coupon_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.excluded_coupon_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: excluded_coupon_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.excluded_coupon_category_id_seq OWNED BY public.excluded_coupon_category.id;


--
-- Name: excluded_coupon_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.excluded_coupon_product (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "productId" integer NOT NULL
);


--
-- Name: excluded_coupon_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.excluded_coupon_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: excluded_coupon_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.excluded_coupon_product_id_seq OWNED BY public.excluded_coupon_product.id;


--
-- Name: homepage_banner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_banner (
    id integer NOT NULL,
    title text NOT NULL,
    subtitle text,
    "imageUrl" text NOT NULL,
    "desktopImage" text,
    "mobileImage" text,
    "imagePublicId" text,
    "linkUrl" text,
    placement public."HomepageBannerPlacement" DEFAULT 'HERO'::public."HomepageBannerPlacement" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "internalName" text DEFAULT 'Banner trang chủ'::text NOT NULL,
    eyebrow text,
    description text,
    "mobileImagePublicId" text,
    "imageAlt" text DEFAULT ''::text NOT NULL,
    "primaryCtaLabel" text,
    "primaryCtaUrl" text,
    "secondaryCtaLabel" text,
    "secondaryCtaUrl" text,
    "textAlignment" public."BannerTextAlignment" DEFAULT 'LEFT'::public."BannerTextAlignment" NOT NULL,
    "textTheme" public."BannerTextTheme" DEFAULT 'LIGHT'::public."BannerTextTheme" NOT NULL,
    "overlayOpacity" integer DEFAULT 20 NOT NULL,
    "createdById" integer,
    "updatedById" integer
);


--
-- Name: homepage_banner_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homepage_banner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homepage_banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homepage_banner_id_seq OWNED BY public.homepage_banner.id;


--
-- Name: homepage_featured_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_featured_product (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    title text,
    "position" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: homepage_featured_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homepage_featured_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homepage_featured_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homepage_featured_product_id_seq OWNED BY public.homepage_featured_product.id;


--
-- Name: homepage_section; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_section (
    id integer NOT NULL,
    title text NOT NULL,
    subtitle text,
    type public."HomepageSectionType" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    config jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: homepage_section_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homepage_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homepage_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homepage_section_id_seq OWNED BY public.homepage_section.id;


--
-- Name: homepage_section_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_section_product (
    id integer NOT NULL,
    "sectionId" integer NOT NULL,
    "productId" integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: homepage_section_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.homepage_section_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: homepage_section_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.homepage_section_product_id_seq OWNED BY public.homepage_section_product.id;


--
-- Name: inventory_transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transaction (
    id integer NOT NULL,
    "variantId" integer,
    type public."InventoryTransactionType" NOT NULL,
    quantity integer NOT NULL,
    "balanceAfter" integer NOT NULL,
    "referenceType" text,
    "referenceId" integer,
    note text,
    "unitImportPrice" numeric(65,30),
    "unitSellPrice" numeric(65,30),
    "warehouseId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productId" integer
);


--
-- Name: inventory_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_transaction_id_seq OWNED BY public.inventory_transaction.id;


--
-- Name: invoice_sequence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_sequence (
    key text NOT NULL,
    value integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: membership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    level integer DEFAULT 0 NOT NULL,
    color text,
    icon text,
    priority integer DEFAULT 0 NOT NULL,
    benefits jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "minSpendAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "discountRate" numeric(65,30) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "birthdayMaxDiscountAmount" numeric(65,30),
    code text NOT NULL,
    terms text
);


--
-- Name: membership_benefit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_benefit (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    type public."MembershipBenefitType" NOT NULL,
    icon text,
    "isActive" boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "usageLimit" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "usageLimitPerUser" integer,
    automatic boolean DEFAULT true NOT NULL,
    "requiresRedemption" boolean DEFAULT false NOT NULL,
    "minOrderValue" numeric(65,30),
    "maxDiscountAmount" numeric(65,30),
    "salesChannels" jsonb,
    "canCombineWithCoupons" boolean DEFAULT false NOT NULL,
    "canCombineWithBenefits" boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "internalNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: membership_benefit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_benefit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_benefit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_benefit_id_seq OWNED BY public.membership_benefit.id;


--
-- Name: membership_benefit_redemption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_benefit_redemption (
    id integer NOT NULL,
    "benefitId" integer NOT NULL,
    "userId" integer NOT NULL,
    "orderId" integer,
    "cycleYear" integer NOT NULL,
    "valueSnapshot" numeric(65,30),
    "nameSnapshot" text NOT NULL,
    "typeSnapshot" public."MembershipBenefitType" NOT NULL,
    amount numeric(65,30) DEFAULT 0 NOT NULL,
    "redeemedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: membership_benefit_redemption_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_benefit_redemption_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_benefit_redemption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_benefit_redemption_id_seq OWNED BY public.membership_benefit_redemption.id;


--
-- Name: membership_benefit_tier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_benefit_tier (
    id integer NOT NULL,
    "benefitId" integer NOT NULL,
    "membershipId" integer NOT NULL,
    value numeric(65,30),
    config jsonb
);


--
-- Name: membership_benefit_tier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_benefit_tier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_benefit_tier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_benefit_tier_id_seq OWNED BY public.membership_benefit_tier.id;


--
-- Name: membership_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_history (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "membershipId" integer,
    "membershipNameSnapshot" text NOT NULL,
    "minSpendAmountSnapshot" numeric(65,30) DEFAULT 0 NOT NULL,
    "discountRateSnapshot" numeric(65,30) DEFAULT 0 NOT NULL,
    "cycleYear" integer NOT NULL,
    spending numeric(65,30) DEFAULT 0 NOT NULL,
    "rankStartDate" timestamp(3) without time zone NOT NULL,
    "rankEndDate" timestamp(3) without time zone NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: membership_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_history_id_seq OWNED BY public.membership_history.id;


--
-- Name: membership_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_id_seq OWNED BY public.membership.id;


--
-- Name: membership_reset_run; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_reset_run (
    id integer NOT NULL,
    "cycleYear" integer NOT NULL,
    status public."MembershipResetStatus" DEFAULT 'RUNNING'::public."MembershipResetStatus" NOT NULL,
    reason text,
    "processedCount" integer DEFAULT 0 NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: membership_reset_run_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_reset_run_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_reset_run_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_reset_run_id_seq OWNED BY public.membership_reset_run.id;


--
-- Name: monthly_expense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_expense (
    id integer NOT NULL,
    "monthlyFinanceId" integer NOT NULL,
    name text NOT NULL,
    amount numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: monthly_expense_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.monthly_expense_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_expense_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.monthly_expense_id_seq OWNED BY public.monthly_expense.id;


--
-- Name: monthly_finance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_finance (
    id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    "totalDailyProfit" numeric(65,30) DEFAULT 0 NOT NULL,
    "totalExpense" numeric(65,30) DEFAULT 0 NOT NULL,
    profit numeric(65,30) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: monthly_finance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.monthly_finance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: monthly_finance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.monthly_finance_id_seq OWNED BY public.monthly_finance.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    "userId" integer,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    priority public."NotificationPriority" DEFAULT 'NORMAL'::public."NotificationPriority" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."order" (
    id integer NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" integer,
    "shippingAddressId" integer,
    "billingAddressId" integer,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    source public."OrderSource" DEFAULT 'ONLINE'::public."OrderSource" NOT NULL,
    subtotal numeric(65,30) DEFAULT 0 NOT NULL,
    "discountAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "shippingFee" numeric(65,30) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "paidAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "remainingAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "paymentMethod" public."PaymentMethod",
    "paymentStatus" public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    "isPaid" boolean DEFAULT false NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "couponId" integer,
    "receiverName" text,
    "receiverPhone" text,
    "receiverAddress" text,
    "receiverWard" text,
    "receiverDistrict" text,
    "receiverProvince" text,
    latitude numeric(65,30),
    longitude numeric(65,30),
    note text,
    "placedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cancelledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" integer,
    "updatedById" integer,
    "totalCost" numeric(65,30) DEFAULT 0 NOT NULL,
    profit numeric(65,30) DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "idempotencyKey" text,
    "deliveredAt" timestamp(3) without time zone,
    "discountCodeSnapshot" text
);


--
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;


--
-- Name: order_invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_invoice (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "invoiceNumber" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "publicToken" text,
    "publicAccessEnabled" boolean DEFAULT true NOT NULL,
    "isPrimary" boolean DEFAULT true NOT NULL,
    "orderCodeSnapshot" text NOT NULL,
    "orderSourceSnapshot" public."OrderSource" NOT NULL,
    "orderStatusSnapshot" public."OrderStatus" NOT NULL,
    "paymentMethodSnapshot" public."PaymentMethod",
    "paymentStatusSnapshot" public."PaymentStatus",
    "sellerName" text,
    "sellerPhone" text,
    "sellerEmail" text,
    "sellerAddress" text,
    "sellerLogoUrl" text,
    "sellerTaxCode" text,
    "sellerFooterNote" text,
    "returnPolicyNote" text,
    "customerName" text,
    "customerPhone" text,
    "customerEmail" text,
    "shippingAddress" text,
    subtotal numeric(65,30) DEFAULT 0 NOT NULL,
    "discountAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "shippingFee" numeric(65,30) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "couponCodeSnapshot" text,
    note text,
    "issuedAt" timestamp(3) without time zone,
    "issuedById" integer,
    "voidedAt" timestamp(3) without time zone,
    "voidedById" integer,
    "voidReason" text,
    "sourceUpdatedAtSnapshot" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: order_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_invoice_id_seq OWNED BY public.order_invoice.id;


--
-- Name: order_invoice_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_invoice_item (
    id integer NOT NULL,
    "invoiceId" integer NOT NULL,
    "orderItemId" integer,
    "productName" text NOT NULL,
    "variantName" text,
    "colorName" text,
    "sizeName" text,
    sku text,
    "imageUrl" text,
    quantity integer NOT NULL,
    "unitPrice" numeric(65,30) NOT NULL,
    "lineDiscount" numeric(65,30) DEFAULT 0 NOT NULL,
    "lineTotal" numeric(65,30) NOT NULL
);


--
-- Name: order_invoice_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_invoice_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_invoice_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_invoice_item_id_seq OWNED BY public.order_invoice_item.id;


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "productId" integer,
    "variantId" integer,
    "productTitle" text NOT NULL,
    sku text,
    size text,
    color text,
    "variantOptionsSnapshot" jsonb,
    quantity integer NOT NULL,
    "unitPrice" numeric(65,30) NOT NULL,
    "totalPrice" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productImageUrl" text,
    "originalUnitPrice" numeric(65,30) DEFAULT 0 NOT NULL,
    "unitCost" numeric(65,30) DEFAULT 0 NOT NULL,
    "lineSubtotal" numeric(65,30) DEFAULT 0 NOT NULL,
    "lineCost" numeric(65,30) DEFAULT 0 NOT NULL,
    "lineProfit" numeric(65,30) DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_item_id_seq OWNED BY public.order_item.id;


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "previousStatus" public."OrderStatus",
    "currentStatus" public."OrderStatus" NOT NULL,
    "changedById" integer,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- Name: otp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp (
    id integer NOT NULL,
    "userId" integer,
    phone text,
    "codeHash" text NOT NULL,
    purpose public."OtpPurpose" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "attemptCount" integer DEFAULT 0 NOT NULL,
    "ipAddress" text,
    device text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text
);


--
-- Name: otp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_id_seq OWNED BY public.otp.id;


--
-- Name: password_reset_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_token (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_token_id_seq OWNED BY public.password_reset_token.id;


--
-- Name: payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    amount numeric(65,30) NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    "transactionId" text,
    "providerTransactionId" text,
    "providerResponse" jsonb,
    "failureReason" text,
    "webhookPayload" jsonb,
    "providerPayload" jsonb,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_id_seq OWNED BY public.payment.id;


--
-- Name: payment_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_log (
    id integer NOT NULL,
    "paymentId" integer NOT NULL,
    type public."PaymentLogType" NOT NULL,
    message text,
    payload jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payment_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_log_id_seq OWNED BY public.payment_log.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id integer NOT NULL,
    title text NOT NULL,
    "imageUrl" text NOT NULL,
    "imagePublicId" text NOT NULL,
    "categoryId" integer NOT NULL,
    "importPrice" numeric(65,30) NOT NULL,
    "sellPrice" numeric(65,30) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    brand text,
    "brandId" integer,
    "careInstructions" text,
    description text,
    gender public."ProductGender",
    height numeric(65,30),
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    length numeric(65,30),
    material text,
    "productStatus" public."LegacyProductStatus" DEFAULT 'DRAFT'::public."LegacyProductStatus",
    "publishedAt" timestamp(3) without time zone,
    "seoDescription" text,
    "seoKeywords" text,
    "seoTitle" text,
    slug text,
    "soldCount" integer DEFAULT 0 NOT NULL,
    tags jsonb,
    "videoUrl" text,
    "viewCount" integer DEFAULT 0 NOT NULL,
    visibility public."LegacyProductVisibility" DEFAULT 'PUBLIC'::public."LegacyProductVisibility" NOT NULL,
    weight numeric(65,30),
    width numeric(65,30),
    status public."ProductStatus" DEFAULT 'PRIVATE'::public."ProductStatus" NOT NULL,
    "organicFavoriteCount" integer DEFAULT 0 NOT NULL,
    "favoriteCountAdjustment" integer DEFAULT 0 NOT NULL,
    "descriptionContent" jsonb,
    "descriptionHtml" text
);


--
-- Name: product_draft; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_draft (
    id integer NOT NULL,
    mode public."ProductDraftMode" NOT NULL,
    status public."ProductDraftStatus" DEFAULT 'ACTIVE'::public."ProductDraftStatus" NOT NULL,
    "originalProductId" integer,
    "createdById" integer NOT NULL,
    "currentStep" text,
    data jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "appliedAt" timestamp(3) without time zone,
    "discardedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: product_draft_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_draft_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_draft_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_draft_id_seq OWNED BY public.product_draft.id;


--
-- Name: product_favorite_adjustment_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_favorite_adjustment_log (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "adminId" integer NOT NULL,
    "previousAdjustment" integer NOT NULL,
    "newAdjustment" integer NOT NULL,
    "organicCount" integer NOT NULL,
    "previousDisplayCount" integer NOT NULL,
    "newDisplayCount" integer NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_favorite_adjustment_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_favorite_adjustment_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_favorite_adjustment_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_favorite_adjustment_log_id_seq OWNED BY public.product_favorite_adjustment_log.id;


--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: product_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_image (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "variantId" integer,
    url text NOT NULL,
    "publicId" text,
    "altText" text,
    "position" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_image_id_seq OWNED BY public.product_image.id;


--
-- Name: product_import_job; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_import_job (
    id text NOT NULL,
    status public."ProductImportStatus" DEFAULT 'UPLOADED'::public."ProductImportStatus" NOT NULL,
    "fileName" text NOT NULL,
    mode public."ProductImportMode" DEFAULT 'CREATE_ONLY'::public."ProductImportMode" NOT NULL,
    "createMissingCategories" boolean DEFAULT false NOT NULL,
    "forcePrivate" boolean DEFAULT false NOT NULL,
    "totalProducts" integer DEFAULT 0 NOT NULL,
    "totalVariants" integer DEFAULT 0 NOT NULL,
    "totalImages" integer DEFAULT 0 NOT NULL,
    processed integer DEFAULT 0 NOT NULL,
    succeeded integer DEFAULT 0 NOT NULL,
    failed integer DEFAULT 0 NOT NULL,
    skipped integer DEFAULT 0 NOT NULL,
    "sourceData" jsonb,
    "validationErrors" jsonb,
    "resultData" jsonb,
    "processingToken" text,
    "processingStartedAt" timestamp(3) without time zone,
    "createdById" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: product_variant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    sku text NOT NULL,
    size text,
    color text,
    barcode text,
    price numeric(65,30),
    "importPrice" numeric(65,30) DEFAULT 0 NOT NULL,
    "sellPrice" numeric(65,30) DEFAULT 0 NOT NULL,
    "comparePrice" numeric(65,30),
    quantity integer DEFAULT 0 NOT NULL,
    "reservedQuantity" integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    weight numeric(65,30),
    "averageCost" numeric(65,30),
    "imagePriority" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "colorCode" text
);


--
-- Name: product_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_variant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_variant_id_seq OWNED BY public.product_variant.id;


--
-- Name: product_variant_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant_image (
    id integer NOT NULL,
    "variantId" integer NOT NULL,
    url text NOT NULL,
    "publicId" text,
    "altText" text,
    "position" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_variant_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_variant_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_variant_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_variant_image_id_seq OWNED BY public.product_variant_image.id;


--
-- Name: product_variant_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant_option (
    id integer NOT NULL,
    "variantId" integer NOT NULL,
    "optionId" integer NOT NULL
);


--
-- Name: product_variant_option_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_variant_option_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_variant_option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_variant_option_id_seq OWNED BY public.product_variant_option.id;


--
-- Name: recently_viewed_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recently_viewed_product (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: recently_viewed_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recently_viewed_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recently_viewed_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recently_viewed_product_id_seq OWNED BY public.recently_viewed_product.id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review (
    id integer NOT NULL,
    "userId" integer,
    "productId" integer NOT NULL,
    "variantId" integer,
    rating integer NOT NULL,
    title text,
    comment text,
    "adminReply" text,
    "repliedAt" timestamp(3) without time zone,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_id_seq OWNED BY public.review.id;


--
-- Name: review_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_image (
    id integer NOT NULL,
    "reviewId" integer NOT NULL,
    url text NOT NULL,
    "publicId" text,
    "altText" text,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: review_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_image_id_seq OWNED BY public.review_image.id;


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_history (
    id integer NOT NULL,
    "userId" integer,
    keyword text NOT NULL,
    filters jsonb,
    "resultCount" integer,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: search_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_history_id_seq OWNED BY public.search_history.id;


--
-- Name: shipping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "warehouseId" integer,
    carrier text,
    "trackingNumber" text,
    status public."ShippingStatus" DEFAULT 'PENDING'::public."ShippingStatus" NOT NULL,
    "shippingDistanceKm" numeric(65,30),
    "shippingFee" numeric(65,30),
    "estimatedMinutes" integer,
    "routePolyline" text,
    "originLatitude" numeric(65,30),
    "originLongitude" numeric(65,30),
    "destinationLatitude" numeric(65,30),
    "destinationLongitude" numeric(65,30),
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: shipping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_id_seq OWNED BY public.shipping.id;


--
-- Name: store_policy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_policy (
    id integer NOT NULL,
    type public."PolicyType" NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    summary text,
    content jsonb NOT NULL,
    status public."PolicyStatus" DEFAULT 'DRAFT'::public."PolicyStatus" NOT NULL,
    "showInFooter" boolean DEFAULT true NOT NULL,
    "footerOrder" integer DEFAULT 0 NOT NULL,
    "seoTitle" text,
    "seoDescription" text,
    "publishedAt" timestamp(3) without time zone,
    "createdById" integer,
    "updatedById" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contentJson" jsonb,
    "contentHtml" text,
    "summaryJson" jsonb,
    "summaryHtml" text,
    "summaryText" text
);


--
-- Name: store_policy_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.store_policy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: store_policy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.store_policy_id_seq OWNED BY public.store_policy.id;


--
-- Name: store_setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_setting (
    id integer DEFAULT 1 NOT NULL,
    "storeName" text,
    phone text,
    email text,
    address text,
    "logoUrl" text,
    "taxCode" text,
    "invoiceFooter" text,
    "returnPolicy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    phone text,
    "passwordHash" text,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "firstName" text,
    "lastName" text,
    "displayName" text,
    "avatarUrl" text,
    birthday timestamp(3) without time zone,
    gender public."UserGender",
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalSpent" numeric(65,30) DEFAULT 0 NOT NULL,
    "rewardPoints" integer DEFAULT 0 NOT NULL,
    "phoneVerifiedAt" timestamp(3) without time zone,
    "lastLoginAt" timestamp(3) without time zone,
    "membershipId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    email text,
    "googleId" text,
    "authProvider" public."AuthProvider" DEFAULT 'WEB'::public."AuthProvider" NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone
);


--
-- Name: user_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_address (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type public."AddressType" DEFAULT 'BOTH'::public."AddressType" NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    line1 text NOT NULL,
    line2 text,
    ward text,
    district text,
    city text NOT NULL,
    province text,
    "postalCode" text,
    country text DEFAULT 'VN'::text NOT NULL,
    latitude numeric(65,30),
    longitude numeric(65,30),
    "isDefaultShipping" boolean DEFAULT false NOT NULL,
    "isDefaultBilling" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_address_id_seq OWNED BY public.user_address.id;


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_session (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    device text,
    "userAgent" text,
    "ipAddress" text,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_session_id_seq OWNED BY public.user_session.id;


--
-- Name: variant_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.variant_group (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    name text NOT NULL,
    slug text,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: variant_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.variant_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: variant_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.variant_group_id_seq OWNED BY public.variant_group.id;


--
-- Name: variant_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.variant_option (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    value text NOT NULL,
    slug text,
    metadata jsonb,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: variant_option_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.variant_option_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: variant_option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.variant_option_id_seq OWNED BY public.variant_option.id;


--
-- Name: warehouse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse (
    id integer NOT NULL,
    name text NOT NULL,
    code text,
    phone text,
    address text,
    ward text,
    district text,
    province text,
    country text DEFAULT 'VN'::text NOT NULL,
    latitude numeric(65,30),
    longitude numeric(65,30),
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warehouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warehouse_id_seq OWNED BY public.warehouse.id;


--
-- Name: warehouse_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse_inventory (
    id integer NOT NULL,
    "warehouseId" integer NOT NULL,
    "variantId" integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "reservedQuantity" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: warehouse_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warehouse_inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warehouse_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warehouse_inventory_id_seq OWNED BY public.warehouse_inventory.id;


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist (
    id integer NOT NULL,
    "userId" integer,
    name text DEFAULT 'Default'::text NOT NULL,
    "isDefault" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlist_id_seq OWNED BY public.wishlist.id;


--
-- Name: wishlist_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist_item (
    id integer NOT NULL,
    "wishlistId" integer NOT NULL,
    "userId" integer,
    "productId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wishlist_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlist_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlist_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlist_item_id_seq OWNED BY public.wishlist_item.id;


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: brand id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand ALTER COLUMN id SET DEFAULT nextval('public.brand_id_seq'::regclass);


--
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- Name: cart_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item ALTER COLUMN id SET DEFAULT nextval('public.cart_item_id_seq'::regclass);


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);


--
-- Name: coupon id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon ALTER COLUMN id SET DEFAULT nextval('public.coupon_id_seq'::regclass);


--
-- Name: coupon_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_category ALTER COLUMN id SET DEFAULT nextval('public.coupon_category_id_seq'::regclass);


--
-- Name: coupon_membership id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_membership ALTER COLUMN id SET DEFAULT nextval('public.coupon_membership_id_seq'::regclass);


--
-- Name: coupon_product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_product ALTER COLUMN id SET DEFAULT nextval('public.coupon_product_id_seq'::regclass);


--
-- Name: daily_finance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_finance ALTER COLUMN id SET DEFAULT nextval('public.daily_finance_id_seq'::regclass);


--
-- Name: daily_sold_product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product ALTER COLUMN id SET DEFAULT nextval('public.daily_sold_product_id_seq'::regclass);


--
-- Name: daily_sold_product_contribution id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution ALTER COLUMN id SET DEFAULT nextval('public.daily_sold_product_contribution_id_seq'::regclass);


--
-- Name: discount_redemption id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_redemption ALTER COLUMN id SET DEFAULT nextval('public.discount_redemption_id_seq'::regclass);


--
-- Name: excluded_coupon_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_category ALTER COLUMN id SET DEFAULT nextval('public.excluded_coupon_category_id_seq'::regclass);


--
-- Name: excluded_coupon_product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_product ALTER COLUMN id SET DEFAULT nextval('public.excluded_coupon_product_id_seq'::regclass);


--
-- Name: homepage_banner id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_banner ALTER COLUMN id SET DEFAULT nextval('public.homepage_banner_id_seq'::regclass);


--
-- Name: homepage_featured_product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_featured_product ALTER COLUMN id SET DEFAULT nextval('public.homepage_featured_product_id_seq'::regclass);


--
-- Name: homepage_section id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_section ALTER COLUMN id SET DEFAULT nextval('public.homepage_section_id_seq'::regclass);


--
-- Name: homepage_section_product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_section_product ALTER COLUMN id SET DEFAULT nextval('public.homepage_section_product_id_seq'::regclass);


--
-- Name: inventory_transaction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transaction ALTER COLUMN id SET DEFAULT nextval('public.inventory_transaction_id_seq'::regclass);


--
-- Name: membership id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership ALTER COLUMN id SET DEFAULT nextval('public.membership_id_seq'::regclass);


--
-- Name: membership_benefit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit ALTER COLUMN id SET DEFAULT nextval('public.membership_benefit_id_seq'::regclass);


--
-- Name: membership_benefit_redemption id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_redemption ALTER COLUMN id SET DEFAULT nextval('public.membership_benefit_redemption_id_seq'::regclass);


--
-- Name: membership_benefit_tier id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_tier ALTER COLUMN id SET DEFAULT nextval('public.membership_benefit_tier_id_seq'::regclass);


--
-- Name: membership_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_history ALTER COLUMN id SET DEFAULT nextval('public.membership_history_id_seq'::regclass);


--
-- Name: membership_reset_run id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_reset_run ALTER COLUMN id SET DEFAULT nextval('public.membership_reset_run_id_seq'::regclass);


--
-- Name: monthly_expense id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_expense ALTER COLUMN id SET DEFAULT nextval('public.monthly_expense_id_seq'::regclass);


--
-- Name: monthly_finance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_finance ALTER COLUMN id SET DEFAULT nextval('public.monthly_finance_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);


--
-- Name: order_invoice id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice ALTER COLUMN id SET DEFAULT nextval('public.order_invoice_id_seq'::regclass);


--
-- Name: order_invoice_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice_item ALTER COLUMN id SET DEFAULT nextval('public.order_invoice_item_id_seq'::regclass);


--
-- Name: order_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item ALTER COLUMN id SET DEFAULT nextval('public.order_item_id_seq'::regclass);


--
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- Name: otp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp ALTER COLUMN id SET DEFAULT nextval('public.otp_id_seq'::regclass);


--
-- Name: password_reset_token id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_token ALTER COLUMN id SET DEFAULT nextval('public.password_reset_token_id_seq'::regclass);


--
-- Name: payment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment ALTER COLUMN id SET DEFAULT nextval('public.payment_id_seq'::regclass);


--
-- Name: payment_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_log ALTER COLUMN id SET DEFAULT nextval('public.payment_log_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: product_draft id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_draft ALTER COLUMN id SET DEFAULT nextval('public.product_draft_id_seq'::regclass);


--
-- Name: product_favorite_adjustment_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_favorite_adjustment_log ALTER COLUMN id SET DEFAULT nextval('public.product_favorite_adjustment_log_id_seq'::regclass);


--
-- Name: product_image id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image ALTER COLUMN id SET DEFAULT nextval('public.product_image_id_seq'::regclass);


--
-- Name: product_variant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant ALTER COLUMN id SET DEFAULT nextval('public.product_variant_id_seq'::regclass);


--
-- Name: product_variant_image id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_image ALTER COLUMN id SET DEFAULT nextval('public.product_variant_image_id_seq'::regclass);


--
-- Name: product_variant_option id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option ALTER COLUMN id SET DEFAULT nextval('public.product_variant_option_id_seq'::regclass);


--
-- Name: recently_viewed_product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recently_viewed_product ALTER COLUMN id SET DEFAULT nextval('public.recently_viewed_product_id_seq'::regclass);


--
-- Name: review id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review ALTER COLUMN id SET DEFAULT nextval('public.review_id_seq'::regclass);


--
-- Name: review_image id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_image ALTER COLUMN id SET DEFAULT nextval('public.review_image_id_seq'::regclass);


--
-- Name: search_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history ALTER COLUMN id SET DEFAULT nextval('public.search_history_id_seq'::regclass);


--
-- Name: shipping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping ALTER COLUMN id SET DEFAULT nextval('public.shipping_id_seq'::regclass);


--
-- Name: store_policy id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_policy ALTER COLUMN id SET DEFAULT nextval('public.store_policy_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_address id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address ALTER COLUMN id SET DEFAULT nextval('public.user_address_id_seq'::regclass);


--
-- Name: user_session id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session ALTER COLUMN id SET DEFAULT nextval('public.user_session_id_seq'::regclass);


--
-- Name: variant_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variant_group ALTER COLUMN id SET DEFAULT nextval('public.variant_group_id_seq'::regclass);


--
-- Name: variant_option id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variant_option ALTER COLUMN id SET DEFAULT nextval('public.variant_option_id_seq'::regclass);


--
-- Name: warehouse id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse ALTER COLUMN id SET DEFAULT nextval('public.warehouse_id_seq'::regclass);


--
-- Name: warehouse_inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_inventory ALTER COLUMN id SET DEFAULT nextval('public.warehouse_inventory_id_seq'::regclass);


--
-- Name: wishlist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist ALTER COLUMN id SET DEFAULT nextval('public.wishlist_id_seq'::regclass);


--
-- Name: wishlist_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_item ALTER COLUMN id SET DEFAULT nextval('public.wishlist_item_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d23de6b9-9ed2-4c94-99da-dd76d18c94b2	55beaa79991a1804d6bde435deb38a1c72a3c39177eb50e7ea4c22bde91ff611	2026-04-06 08:02:12.797834+00	20260215171520	\N	\N	2026-04-06 08:02:09.313103+00	1
c1e0a51e-ff63-43e2-bb20-ede619b4ef50	9a1d3d88e88d947d90c8638d161c8152013a3858d5bf298a1a47e1fff7085f12	2026-08-27 09:04:47.767127+00	20260827033000_order_delivered_at	\N	\N	2026-08-27 09:04:45.483125+00	1
66ab2874-9cc2-4f9e-b4cd-c89b7019a32a	365e549cef46f42d04c0fc9367e0ade66dff0958c3a223a8622783a845aa0c4b	2026-04-06 08:02:14.953378+00	20260305072521_add_note_to_daily_finance	\N	\N	2026-04-06 08:02:13.416694+00	1
83496f18-5ddf-473c-95be-974d232610da	6f31920efec4cae95c82b18379a5906ab3e195bddcdbb4ddbedf922304ca5fc1	2026-04-06 08:02:17.934797+00	20260305133135_add_product	\N	\N	2026-04-06 08:02:15.550155+00	1
e54d8276-5445-4165-a21e-f1a2aea95601	a2a2f39a805093740cdd6cb1ad309ab8c518d4950369e342006d99b0a1ab4354	2026-04-06 08:02:20.891736+00	20260305133908_update_product	\N	\N	2026-04-06 08:02:18.844033+00	1
c71bae87-20c9-44d1-8014-d8c5b3c75445	6831e5f32217bbf018ee72993300abee4290d8a63cb8aa56becd28f392c09520	2026-08-28 10:40:46.369863+00	20260827090000_add_product_drafts	\N	\N	2026-08-28 10:40:42.584894+00	1
3e97c547-43bf-4c07-bb4d-fd2e5f54bbbb	c6a8131173bfe3602a6300c52f699fb887688ff105886f1c6bdfeb64325491a3	2026-04-06 08:02:23.245656+00	20260317131221_update_modal_category	\N	\N	2026-04-06 08:02:21.65984+00	1
a385c8b8-4a15-4710-b7f8-4fcf5856c547	bfb7f4c7653dbbfaaba520b65380706a39d913e38b18ed66089980e1626ff405	2026-04-06 08:02:26.821417+00	20260401093000_add_daily_sold_product	\N	\N	2026-04-06 08:02:23.795668+00	1
96e3ba90-3305-46fe-9098-5bda6ec949a1	6e691770c824b5ff869e3fea6fab4a296ac8aaae6fda9ad0acc8028d97828181	2026-09-08 09:25:03.738429+00	20260908031539	\N	\N	2026-09-08 09:25:01.335326+00	1
3039e80e-0b21-461e-b9fd-27f63a377d0b	3a418351f77ecb3f2850498543bdf3b343c97351a33fe71a08d15cacc7730d33	2026-04-06 08:02:29.459797+00	20260406153000_daily_sold_product_sales	\N	\N	2026-04-06 08:02:27.45153+00	1
90839413-fe43-44c4-83be-c9f788a445f4	d4ec95a86ef76c780dd2efa373e2e733b30fbdd29bd2e957e790ed029dff8ede	2026-08-28 10:40:52.446484+00	20260828090000_product_status_v2_and_import_jobs	\N	\N	2026-08-28 10:40:46.948318+00	1
63d3a126-e2af-4e59-8ec5-4584b0f3c033	6c461ee1f1c44bdec369e54383387274cafcbc81b64ab15819fa76b88a311d0b	2026-04-06 08:02:31.748702+00	20260406153100_adjust_daily_sold_product_columns	\N	\N	2026-04-06 08:02:30.108886+00	1
f4a56e40-4906-4177-a0f1-72405fb6b90c	aafba596daf3e7c2501ce1774f394fa5ae6de62fd472a87ccf40b4e01b899420	\N	20260724073444	\N	2026-08-24 03:29:02.500611+00	2026-08-24 02:46:42.727154+00	0
4a32d2cc-7ff8-4319-a61e-094efae0e3c4	aafba596daf3e7c2501ce1774f394fa5ae6de62fd472a87ccf40b4e01b899420	2026-08-24 03:29:03.242355+00	20260724073444		\N	2026-08-24 03:29:03.242355+00	0
19a9ab80-01dc-49a6-a6a1-24ff80bb5575	da4872bfbee8ebec86171bd0e08a933bf49310ed99688ee6c8db2e8fa089c740	2026-08-26 04:32:33.315149+00	20260825090000_add_email_google_password_reset	\N	\N	2026-08-26 04:32:27.457662+00	1
81ca9d83-e006-4a17-bbd9-22c2f0f4f625	1cd0d3984cc3e4e26b5aa6106bf77207cd058388a6e5c9a006b6d4b12a354e54	2026-08-27 09:04:34.81018+00	20260826043000_daily_detail_order_management	\N	\N	2026-08-27 09:04:28.759148+00	1
3ddb9f3b-6d4e-4c5f-9db0-935e13274c33	0f5d32ddc227ba3fe0c4c27fa226f9b388b6b450e15ce8702ba5988aac839c6d	2026-08-28 10:40:55.190513+00	20260828120000_add_variant_color_code	\N	\N	2026-08-28 10:40:53.026319+00	1
43f39619-f73c-419c-829e-86440924571d	724799687d35a0c9bce8ab502b41a6446f729446fb763b70df5c6a727ced3b6d	2026-08-27 09:04:41.193945+00	20260826062000_daily_sold_product_contributions	\N	\N	2026-08-27 09:04:35.377785+00	1
6d183e11-58c2-4fe7-ac85-65adc590be44	afb243e3aa72ec02596cbd57197fe38701dac12fb9348071d9d70177ff0111cd	2026-08-27 09:04:44.897672+00	20260827031500_fix_order_inventory_transactions	\N	\N	2026-08-27 09:04:41.759496+00	1
9a58149a-84c9-412b-a381-2d2c74b32de8	7661a96e634fad5f71134d6743e725e0f3d14602c745a26cca028be153b587a1	2026-08-29 09:08:34.792144+00	20260829090000_discount_codes	\N	\N	2026-08-29 09:08:29.748174+00	1
67316011-73b8-452e-9ac5-3504f68878ae	b4c4b510724e079390a426ad63df87419331c779f243190d7936e106d68088e1	2026-09-08 09:25:07.952687+00	20260908090000_product_favorite_counts	\N	\N	2026-09-08 09:25:04.33856+00	1
0c3cf92f-e821-4370-b659-280781b1b98a	f40ab860d44b3277e10c3fb8b6482ef73a2b87fe0a51c479df79712112092bef	2026-08-29 09:08:36.718332+00	20260829110000_coupon_membership_discount_rate	\N	\N	2026-08-29 09:08:35.340422+00	1
3f01658c-d3bc-4f2c-9397-5f696a1a7b17	ceaed9d0a553f6cae5fd37c6bfd1273843783076c2751e4bebd82148de35a00e	2026-08-29 09:08:40.611733+00	20260829130000_birthday_coupon_delivery	\N	\N	2026-08-29 09:08:37.279026+00	1
11af79b9-e654-45fb-964b-14ec5939bb1e	168dc5c3815bf5bc45800ead328f7413de5915b4174ca1563f2b936523d9559e	2026-09-03 09:57:03.823576+00	20260903090000_membership_cycles_benefits_audit	\N	\N	2026-09-03 09:56:50.653627+00	1
24f03287-1713-4118-a709-cb17df549c08	67975c5162812ee703f5405c38d58e6fe11f02dfafaffab15c58a79fa006842e	2026-09-08 09:25:15.020805+00	20260908120000_content_management	\N	\N	2026-09-08 09:25:08.548415+00	1
5704fb8b-d10a-4482-b166-395f9712c26f	40a1a90b69710e99243c62d59c296411d7f07a0d53cd2934f7908f00e4bebf78	2026-09-08 09:25:18.246362+00	20260908133000_add_rich_text_content	\N	\N	2026-09-08 09:25:15.855986+00	1
2294b451-5a66-435d-a451-171d47878122	49ef3aac78a5dae38a7e98cb5f52d55f78c415900dcb6e86306cf379f3bf46dd	2026-09-08 09:25:20.334765+00	20260908150000_policy_summary_rich_text	\N	\N	2026-09-08 09:25:18.844803+00	1
1bac1489-9a11-4f51-a1f6-0bc9c5437a08	72542080a7c5f09d36dcc49e8d733051698c4189890537584cee3562e4c48a60	\N	20260909092627	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260909092627\n\nDatabase error code: 42704\n\nDatabase error:\nERROR: index "order_invoice_one_primary_issued_idx" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42704), message: "index \\"order_invoice_one_primary_issued_idx\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(1421), routine: Some("DropErrorMsgNonExistent") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260909092627"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260909092627"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:248	2026-09-09 09:59:07.661277+00	2026-09-09 09:56:14.301402+00	0
1d87c748-bd25-429a-9def-e75b25a46bd6	28f2b809a0c6cb8cfacd852c23135c0beb4827677287b71fb1bce6bec9ee7e0e	2026-09-09 09:59:18.267392+00	20260909092627	\N	\N	2026-09-09 09:59:17.192461+00	1
4c68061e-e812-4cc3-8b09-9d98ed185f78	dca3589937fa3f35f4dfa6e850a434db4fd42ac9c069058c4ef5548a888a7861	2026-09-09 09:59:24.509812+00	20260909120000_add_order_invoices	\N	\N	2026-09-09 09:59:18.801166+00	1
c89f4e16-1886-469d-9479-6d19fb900d94	8ee405ac0efa1a5cabe3a903df9bbdbfeb43fcea12c00dd07338b784a23e78f1	2026-09-09 09:59:26.769737+00	20260909123000_preserve_invoices_when_order_deleted	\N	\N	2026-09-09 09:59:25.160051+00	1
048993b7-409b-40f1-a610-37062e6ae927	4635374b47cf972ceeb182b47b247a52de6190c8d5e269d2a18dc14d83c9b34e	2026-09-09 10:11:25.136664+00	20260909130000_restore_invoice_primary_index	\N	\N	2026-09-09 10:11:23.594259+00	1
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (id, "actorId", action, "entityType", "entityId", "previousValue", "newValue", "createdAt") FROM stdin;
1	2	UPDATE	MEMBERSHIP	1	{"code": "MEMBERSHIP-1", "name": "Bạc", "level": 0, "isActive": true, "discountRate": "10", "minSpendAmount": "3000000"}	{"id": 1, "code": "MEMBERSHIP-1", "icon": null, "name": "Bạc", "color": "#D96C8A", "level": 0, "terms": null, "benefits": null, "isActive": true, "priority": 0, "createdAt": "2026-08-29T12:57:44.215Z", "updatedAt": "2026-09-03T11:12:44.993Z", "description": null, "discountRate": "5", "minSpendAmount": "3000000", "birthdayMaxDiscountAmount": null}	2026-09-03 11:12:45.004
2	2	UPDATE	MEMBERSHIP	3	{"code": "MEMBERSHIP-3", "name": "Kim cương", "level": 0, "isActive": true, "discountRate": "15", "minSpendAmount": "15000000"}	{"id": 3, "code": "MEMBERSHIP-3", "icon": null, "name": "Kim cương", "color": "#D96C8A", "level": 2, "terms": null, "benefits": null, "isActive": true, "priority": 0, "createdAt": "2026-08-29T12:59:24.614Z", "updatedAt": "2026-09-03T11:13:07.757Z", "description": null, "discountRate": "15", "minSpendAmount": "15000000", "birthdayMaxDiscountAmount": null}	2026-09-03 11:13:07.769
\.


--
-- Data for Name: brand; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brand (id, name, slug, logo, description, website, "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart (id, "userId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cart_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_item (id, "cartId", "productId", "variantId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.category (id, name, "createdAt", "updatedAt", color, icon, description, "isActive", "metaRobots", "parentId", "position", "seoImage", slug) FROM stdin;
1	Vớ	2026-04-06 08:32:07.274	2026-04-06 08:32:11.692	#9EE9C8	footprints	\N	t	\N	\N	0	\N	\N
2	Balo	2026-04-06 08:32:21.768	2026-04-06 08:32:21.768	#9ADCF7	handbag	\N	t	\N	\N	0	\N	\N
3	Dù	2026-04-06 08:32:35.982	2026-04-06 08:32:35.982	#D3C2FF	shopping-bag	\N	t	\N	\N	0	\N	\N
4	Túi	2026-04-06 08:33:06.16	2026-04-06 08:33:06.16	#F8E4A6	handbag	\N	t	\N	\N	0	\N	\N
5	Phụ kiện	2026-04-06 08:35:33.024	2026-04-06 08:35:33.024	#F7C8D8	glasses	\N	t	\N	\N	0	\N	\N
6	Dép	2026-04-06 08:35:47.348	2026-04-06 08:35:47.348	#C9D4FF	footprints	\N	t	\N	\N	0	\N	\N
7	Giày	2026-04-06 08:35:58.405	2026-04-06 08:35:58.405	#9EE9C8	footprints	\N	t	\N	\N	0	\N	\N
8	Quần jean	2026-04-06 08:36:30.642	2026-04-06 08:36:30.642	#D3C2FF	shirt	\N	t	\N	\N	0	\N	\N
9	Quần kaki	2026-04-06 08:36:43.071	2026-04-06 08:36:51.53	#F8E4A6	shirt	\N	t	\N	\N	0	\N	\N
10	Quần thun	2026-04-06 08:38:24.793	2026-04-06 08:38:24.793	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
11	Áo thun	2026-04-06 08:38:38.272	2026-04-06 08:38:38.272	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
12	Đồ bộ	2026-04-06 08:44:03.776	2026-04-06 08:44:03.776	#D3C2FF	shirt	\N	t	\N	\N	0	\N	\N
13	Quần tây	2026-04-06 08:44:15.355	2026-04-06 08:44:21.682	#9EE9C8	shirt	\N	t	\N	\N	0	\N	\N
14	Đồ xả	2026-04-06 08:44:36.42	2026-04-06 08:44:36.42	#F8E4A6	shirt	\N	t	\N	\N	0	\N	\N
15	Quần ống suôn	2026-04-06 08:44:58.164	2026-04-06 08:44:58.164	#9ADCF7	shirt	\N	t	\N	\N	0	\N	\N
16	Áo kiểu	2026-04-06 08:45:06.99	2026-04-06 08:45:06.99	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
17	Chân váy	2026-04-06 08:45:16.716	2026-04-06 08:45:16.716	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
18	Quần bí	2026-04-06 08:47:25.775	2026-04-06 08:47:25.775	#9EE9C8	shirt	\N	t	\N	\N	0	\N	\N
19	đồ lót	2026-04-06 08:47:44.791	2026-04-06 08:47:44.791	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
20	Áo sơ mi	2026-04-06 08:47:56.147	2026-04-06 08:47:56.147	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
21	Áo khoác	2026-04-06 08:48:06.792	2026-04-06 08:48:06.792	#D3C2FF	shirt	\N	t	\N	\N	0	\N	\N
22	Nón	2026-04-06 08:48:12.922	2026-04-06 08:48:12.922	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
23	Nước hoa	2026-04-06 08:48:22.839	2026-04-06 08:48:22.839	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
24	Áo hai dây	2026-04-06 08:48:33.324	2026-04-06 08:48:33.324	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
25	Đồ ngủ	2026-04-06 08:48:51.274	2026-04-06 08:48:51.274	#F8E4A6	shirt	\N	t	\N	\N	0	\N	\N
26	Bao tay	2026-04-06 09:06:00.276	2026-04-06 09:06:00.276	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
27	Áo mưa	2026-04-06 09:10:43.873	2026-04-06 09:10:43.873	#9ADCF7	shirt	\N	t	\N	\N	0	\N	\N
28	Khăn	2026-04-08 07:28:57.624	2026-04-08 07:28:57.624	#F7C8D8	shopping-bag	\N	t	\N	\N	0	\N	\N
29	Áo ba lỗ	2026-04-24 09:03:55.754	2026-04-24 09:03:55.754	#F8E4A6	shirt	\N	t	\N	\N	0	\N	\N
30	Váy	2026-05-10 11:12:15.366	2026-05-10 11:12:39.712	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
31	Áo jean	2026-07-05 12:47:24.215	2026-07-05 12:47:24.215	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
32	L71 Demi DingDing	2026-07-23 13:38:23.853	2026-07-23 13:38:23.853	#F7C8D8	shirt	\N	t	\N	\N	0	\N	\N
33	Set đồ	2026-07-26 09:19:32.218	2026-07-26 09:19:32.218	#C9D4FF	shirt	\N	t	\N	\N	0	\N	\N
\.


--
-- Data for Name: coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon (id, code, name, description, type, value, "minOrderAmount", "maxDiscountAmount", "usageLimit", "usageLimitPerUser", "usedCount", "firstOrderOnly", "maximumUsagePerDay", "startsAt", "endsAt", "isActive", "createdAt", "updatedAt", "normalizedCode", "publicToken", source, "recipientUserId", "birthdayYear") FROM stdin;
1	QN-CZANRS	Chào mừng 2/9	\N	PERCENTAGE	10.000000000000000000000000000000	\N	100000.000000000000000000000000000000	1	1	0	f	\N	\N	\N	f	2026-08-29 09:31:47.133	2026-08-29 09:33:16.815	QN-CZANRS	7DuSsQ_2H1dit3M1igH3KD_4WajEmYew	MANUAL	\N	\N
\.


--
-- Data for Name: coupon_category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_category (id, "couponId", "categoryId") FROM stdin;
\.


--
-- Data for Name: coupon_membership; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_membership (id, "couponId", "membershipId", "discountRate") FROM stdin;
\.


--
-- Data for Name: coupon_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_product (id, "couponId", "productId") FROM stdin;
\.


--
-- Data for Name: daily_finance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_finance (id, date, "monthlyFinanceId", "capitalCash", "capitalBank", "revenueCash", "revenueBank", "profitCash", "profitBank", "totalProfit", "createdAt", "updatedAt", note) FROM stdin;
1	2026-03-01 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
2	2026-03-02 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
3	2026-03-03 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
4	2026-03-04 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
5	2026-03-05 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
6	2026-03-06 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
7	2026-03-07 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
8	2026-03-08 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
9	2026-03-09 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
10	2026-03-10 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
11	2026-03-11 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
12	2026-03-12 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
13	2026-03-13 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
14	2026-03-14 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
15	2026-03-15 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
16	2026-03-16 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
17	2026-03-17 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
18	2026-03-18 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
19	2026-03-19 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
20	2026-03-20 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
21	2026-03-21 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
22	2026-03-22 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
23	2026-03-23 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
24	2026-03-24 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
25	2026-03-25 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
26	2026-03-26 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
27	2026-03-27 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
28	2026-03-28 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
30	2026-03-30 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
31	2026-03-31 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:03:54.157	\N
36	2026-04-05 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:04:30.779	\N
48	2026-04-17 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:04:30.779	\N
49	2026-04-18 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:04:30.779	\N
37	2026-04-06 00:00:00	2	1270000.000000000000000000000000000000	0.000000000000000000000000000000	1400000.000000000000000000000000000000	150000.000000000000000000000000000000	130000.000000000000000000000000000000	150000.000000000000000000000000000000	280000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 15:02:52.304	\N
35	2026-04-04 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	240000.000000000000000000000000000000	120000.000000000000000000000000000000	240000.000000000000000000000000000000	360000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:34:24.855	\N
32	2026-04-01 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:34:41.172	\N
40	2026-04-09 00:00:00	2	1700000.000000000000000000000000000000	798000.000000000000000000000000000000	2040000.000000000000000000000000000000	798000.000000000000000000000000000000	340000.000000000000000000000000000000	0.000000000000000000000000000000	340000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-09 15:53:51.657	\N
29	2026-03-29 00:00:00	1	0.000000000000000000000000000000	0.000000000000000000000000000000	20000000.000000000000000000000000000000	9700000.000000000000000000000000000000	20000000.000000000000000000000000000000	9700000.000000000000000000000000000000	29700000.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-04-06 08:14:14.688	\N
38	2026-04-07 00:00:00	2	0.000000000000000000000000000000	90000.000000000000000000000000000000	230000.000000000000000000000000000000	0.000000000000000000000000000000	230000.000000000000000000000000000000	0.000000000000000000000000000000	230000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-07 13:12:51.457	\N
62	2026-01-01 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
63	2026-01-02 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
39	2026-04-08 00:00:00	2	1530000.000000000000000000000000000000	173000.000000000000000000000000000000	1750000.000000000000000000000000000000	798000.000000000000000000000000000000	220000.000000000000000000000000000000	625000.000000000000000000000000000000	845000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-08 15:41:06.898	\N
64	2026-01-03 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
65	2026-01-04 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
34	2026-04-03 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:33:31.849	\N
33	2026-04-02 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-06 08:34:10.728	\N
66	2026-01-05 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
67	2026-01-06 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
68	2026-01-07 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
69	2026-01-08 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
70	2026-01-09 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
71	2026-01-10 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
72	2026-01-11 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
73	2026-01-12 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
74	2026-01-13 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
75	2026-01-14 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
76	2026-01-15 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
42	2026-04-11 00:00:00	2	2110000.000000000000000000000000000000	1228000.000000000000000000000000000000	2530000.000000000000000000000000000000	2168000.000000000000000000000000000000	420000.000000000000000000000000000000	940000.000000000000000000000000000000	1360000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-11 14:59:25.039	\N
41	2026-04-10 00:00:00	2	2020000.000000000000000000000000000000	798000.000000000000000000000000000000	2110000.000000000000000000000000000000	1228000.000000000000000000000000000000	90000.000000000000000000000000000000	430000.000000000000000000000000000000	520000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-10 15:38:09.228	\N
50	2026-04-19 00:00:00	2	0.000000000000000000000000000000	4508000.000000000000000000000000000000	800000.000000000000000000000000000000	5758000.000000000000000000000000000000	800000.000000000000000000000000000000	1250000.000000000000000000000000000000	2050000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-19 14:19:47.186	\N
43	2026-04-12 00:00:00	2	2400000.000000000000000000000000000000	2168000.000000000000000000000000000000	3290000.000000000000000000000000000000	3318000.000000000000000000000000000000	890000.000000000000000000000000000000	1150000.000000000000000000000000000000	2040000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-12 16:07:13.021	\N
44	2026-04-13 00:00:00	2	3290000.000000000000000000000000000000	3318000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-13 12:27:26.964	\N
45	2026-04-14 00:00:00	2	2730000.000000000000000000000000000000	3548000.000000000000000000000000000000	3440000.000000000000000000000000000000	3608000.000000000000000000000000000000	710000.000000000000000000000000000000	60000.000000000000000000000000000000	770000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-14 15:23:10.865	\N
46	2026-04-15 00:00:00	2	3285000.000000000000000000000000000000	3608000.000000000000000000000000000000	3240000.000000000000000000000000000000	3798000.000000000000000000000000000000	-45000.000000000000000000000000000000	190000.000000000000000000000000000000	145000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-15 16:20:20.133	\N
47	2026-04-16 00:00:00	2	3210000.000000000000000000000000000000	3798000.000000000000000000000000000000	3700000.000000000000000000000000000000	4578000.000000000000000000000000000000	490000.000000000000000000000000000000	780000.000000000000000000000000000000	1270000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-16 15:53:26.644	\N
51	2026-04-20 00:00:00	2	1980000.000000000000000000000000000000	5058000.000000000000000000000000000000	2800000.000000000000000000000000000000	5458000.000000000000000000000000000000	820000.000000000000000000000000000000	400000.000000000000000000000000000000	1220000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-20 14:49:49.498	\N
57	2026-04-26 00:00:00	2	0.000000000000000000000000000000	3148000.000000000000000000000000000000	500000.000000000000000000000000000000	3709000.000000000000000000000000000000	500000.000000000000000000000000000000	561000.000000000000000000000000000000	1061000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-26 14:33:14.063	\N
52	2026-04-21 00:00:00	2	2690000.000000000000000000000000000000	5458000.000000000000000000000000000000	2860000.000000000000000000000000000000	5498000.000000000000000000000000000000	170000.000000000000000000000000000000	40000.000000000000000000000000000000	210000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-21 15:21:12.368	\N
53	2026-04-22 00:00:00	2	2720000.000000000000000000000000000000	5298000.000000000000000000000000000000	2950000.000000000000000000000000000000	5588000.000000000000000000000000000000	230000.000000000000000000000000000000	290000.000000000000000000000000000000	520000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-22 16:06:22.054	\N
54	2026-04-23 00:00:00	2	1950000.000000000000000000000000000000	5588000.000000000000000000000000000000	2110000.000000000000000000000000000000	5978000.000000000000000000000000000000	160000.000000000000000000000000000000	390000.000000000000000000000000000000	550000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-24 10:15:38.814	\N
55	2026-04-24 00:00:00	2	2110000.000000000000000000000000000000	1348000.000000000000000000000000000000	2210000.000000000000000000000000000000	1368000.000000000000000000000000000000	100000.000000000000000000000000000000	20000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-24 15:56:43.316	\N
56	2026-04-25 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	447000.000000000000000000000000000000	0.000000000000000000000000000000	447000.000000000000000000000000000000	0.000000000000000000000000000000	447000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-26 14:02:32.099	\N
58	2026-04-27 00:00:00	2	0.000000000000000000000000000000	0.000000000000000000000000000000	514000.000000000000000000000000000000	0.000000000000000000000000000000	514000.000000000000000000000000000000	0.000000000000000000000000000000	514000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-28 09:31:56.088	\N
59	2026-04-28 00:00:00	2	1500000.000000000000000000000000000000	3757000.000000000000000000000000000000	1770000.000000000000000000000000000000	4350000.000000000000000000000000000000	270000.000000000000000000000000000000	593000.000000000000000000000000000000	863000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-28 15:48:45.551	\N
60	2026-04-29 00:00:00	2	1715000.000000000000000000000000000000	4357000.000000000000000000000000000000	2630000.000000000000000000000000000000	4677000.000000000000000000000000000000	915000.000000000000000000000000000000	320000.000000000000000000000000000000	1235000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-04-29 15:30:28.75	\N
77	2026-01-16 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
78	2026-01-17 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
79	2026-01-18 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
80	2026-01-19 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
81	2026-01-20 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
82	2026-01-21 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
83	2026-01-22 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
84	2026-01-23 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
85	2026-01-24 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
86	2026-01-25 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
87	2026-01-26 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
88	2026-01-27 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
89	2026-01-28 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
90	2026-01-29 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
91	2026-01-30 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
92	2026-01-31 00:00:00	3	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.824	\N
93	2026-02-01 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
94	2026-02-02 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
95	2026-02-03 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
96	2026-02-04 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
97	2026-02-05 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
98	2026-02-06 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
99	2026-02-07 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
100	2026-02-08 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
101	2026-02-09 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
102	2026-02-10 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
103	2026-02-11 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
104	2026-02-12 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
105	2026-02-13 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
106	2026-02-14 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
107	2026-02-15 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
108	2026-02-16 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
109	2026-02-17 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
110	2026-02-18 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
111	2026-02-19 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
112	2026-02-20 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
113	2026-02-21 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
114	2026-02-22 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
115	2026-02-23 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
116	2026-02-24 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
117	2026-02-25 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
118	2026-02-26 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
119	2026-02-27 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
120	2026-02-28 00:00:00	4	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-04-06 10:18:20.204	\N
61	2026-04-30 00:00:00	2	2550000.000000000000000000000000000000	4677000.000000000000000000000000000000	2820000.000000000000000000000000000000	5327000.000000000000000000000000000000	270000.000000000000000000000000000000	650000.000000000000000000000000000000	920000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-05-01 04:46:30.276	\N
121	2026-05-01 00:00:00	5	0.000000000000000000000000000000	2548000.000000000000000000000000000000	0.000000000000000000000000000000	2778000.000000000000000000000000000000	0.000000000000000000000000000000	230000.000000000000000000000000000000	230000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-01 14:37:25.872	\N
122	2026-05-02 00:00:00	5	2000000.000000000000000000000000000000	2778000.000000000000000000000000000000	2120000.000000000000000000000000000000	2958000.000000000000000000000000000000	120000.000000000000000000000000000000	180000.000000000000000000000000000000	300000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-02 14:48:39.961	\N
124	2026-05-04 00:00:00	5	2260000.000000000000000000000000000000	2046000.000000000000000000000000000000	2400000.000000000000000000000000000000	2646000.000000000000000000000000000000	140000.000000000000000000000000000000	600000.000000000000000000000000000000	740000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-04 13:46:05.406	\N
123	2026-05-03 00:00:00	5	2045000.000000000000000000000000000000	2958000.000000000000000000000000000000	2460000.000000000000000000000000000000	3758000.000000000000000000000000000000	415000.000000000000000000000000000000	800000.000000000000000000000000000000	1215000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-03 14:15:38.037	\N
125	2026-05-05 00:00:00	5	2120000.000000000000000000000000000000	2107000.000000000000000000000000000000	3440000.000000000000000000000000000000	2227000.000000000000000000000000000000	1320000.000000000000000000000000000000	120000.000000000000000000000000000000	1440000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-05 15:08:08.137	\N
128	2026-05-08 00:00:00	5	2480000.000000000000000000000000000000	1440000.000000000000000000000000000000	2870000.000000000000000000000000000000	2740000.000000000000000000000000000000	390000.000000000000000000000000000000	1300000.000000000000000000000000000000	1690000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-08 14:38:34.352	\N
126	2026-05-06 00:00:00	5	3440000.000000000000000000000000000000	2000000.000000000000000000000000000000	3670000.000000000000000000000000000000	2120000.000000000000000000000000000000	230000.000000000000000000000000000000	120000.000000000000000000000000000000	350000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-06 14:50:52.464	\N
129	2026-05-09 00:00:00	5	2750000.000000000000000000000000000000	2100000.000000000000000000000000000000	3370000.000000000000000000000000000000	2905000.000000000000000000000000000000	620000.000000000000000000000000000000	805000.000000000000000000000000000000	1425000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-09 16:29:15.232	\N
127	2026-05-07 00:00:00	5	2070000.000000000000000000000000000000	1720000.000000000000000000000000000000	2680000.000000000000000000000000000000	2380000.000000000000000000000000000000	610000.000000000000000000000000000000	660000.000000000000000000000000000000	1270000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-08 07:24:44.403	\N
130	2026-05-10 00:00:00	5	1670000.000000000000000000000000000000	2905000.000000000000000000000000000000	4010000.000000000000000000000000000000	4445000.000000000000000000000000000000	2340000.000000000000000000000000000000	1540000.000000000000000000000000000000	3880000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-10 15:03:25.044	\N
132	2026-05-12 00:00:00	5	2185000.000000000000000000000000000000	10698000.000000000000000000000000000000	3090000.000000000000000000000000000000	11361000.000000000000000000000000000000	905000.000000000000000000000000000000	663000.000000000000000000000000000000	1568000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-14 09:49:09.243	\N
131	2026-05-11 00:00:00	5	1570000.000000000000000000000000000000	11543000.000000000000000000000000000000	3160000.000000000000000000000000000000	12353000.000000000000000000000000000000	1590000.000000000000000000000000000000	810000.000000000000000000000000000000	2400000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-11 14:51:39.768	\N
133	2026-05-13 00:00:00	5	3090000.000000000000000000000000000000	11361000.000000000000000000000000000000	3940000.000000000000000000000000000000	13206000.000000000000000000000000000000	850000.000000000000000000000000000000	1845000.000000000000000000000000000000	2695000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-13 14:54:57.573	\N
135	2026-05-15 00:00:00	5	2960000.000000000000000000000000000000	0.000000000000000000000000000000	3890000.000000000000000000000000000000	710000.000000000000000000000000000000	930000.000000000000000000000000000000	710000.000000000000000000000000000000	1640000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-15 16:02:59.663	\N
134	2026-05-14 00:00:00	5	590000.000000000000000000000000000000	12368000.000000000000000000000000000000	2960000.000000000000000000000000000000	13018000.000000000000000000000000000000	2370000.000000000000000000000000000000	650000.000000000000000000000000000000	3020000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-15 09:40:14.129	\N
137	2026-05-17 00:00:00	5	3511000.000000000000000000000000000000	0.000000000000000000000000000000	5250000.000000000000000000000000000000	820000.000000000000000000000000000000	1739000.000000000000000000000000000000	820000.000000000000000000000000000000	2559000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-18 11:09:50.615	\N
136	2026-05-16 00:00:00	5	3740000.000000000000000000000000000000	0.000000000000000000000000000000	4370000.000000000000000000000000000000	410000.000000000000000000000000000000	630000.000000000000000000000000000000	410000.000000000000000000000000000000	1040000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-16 14:54:01.234	\N
144	2026-05-24 00:00:00	5	1280000.000000000000000000000000000000	0.000000000000000000000000000000	2200000.000000000000000000000000000000	290000.000000000000000000000000000000	920000.000000000000000000000000000000	290000.000000000000000000000000000000	1210000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-24 15:19:30.442	\N
138	2026-05-18 00:00:00	5	1100000.000000000000000000000000000000	0.000000000000000000000000000000	3090000.000000000000000000000000000000	780000.000000000000000000000000000000	1990000.000000000000000000000000000000	780000.000000000000000000000000000000	2770000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-18 15:31:27.748	\N
139	2026-05-19 00:00:00	5	1590000.000000000000000000000000000000	0.000000000000000000000000000000	2260000.000000000000000000000000000000	150000.000000000000000000000000000000	670000.000000000000000000000000000000	150000.000000000000000000000000000000	820000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-20 08:30:46.113	\N
140	2026-05-20 00:00:00	5	2260000.000000000000000000000000000000	0.000000000000000000000000000000	3520000.000000000000000000000000000000	0.000000000000000000000000000000	1260000.000000000000000000000000000000	0.000000000000000000000000000000	1260000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-20 15:48:21.768	\N
141	2026-05-21 00:00:00	5	3820000.000000000000000000000000000000	0.000000000000000000000000000000	5010000.000000000000000000000000000000	810000.000000000000000000000000000000	1190000.000000000000000000000000000000	810000.000000000000000000000000000000	2000000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-21 15:21:56.403	\N
143	2026-05-23 00:00:00	5	5670000.000000000000000000000000000000	0.000000000000000000000000000000	8080000.000000000000000000000000000000	950000.000000000000000000000000000000	2410000.000000000000000000000000000000	950000.000000000000000000000000000000	3360000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-23 15:51:56.333	\N
142	2026-05-22 00:00:00	5	3725000.000000000000000000000000000000	0.000000000000000000000000000000	5860000.000000000000000000000000000000	110000.000000000000000000000000000000	2135000.000000000000000000000000000000	110000.000000000000000000000000000000	2245000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-23 15:50:21.254	\N
146	2026-05-26 00:00:00	5	0.000000000000000000000000000000	0.000000000000000000000000000000	1660000.000000000000000000000000000000	0.000000000000000000000000000000	1660000.000000000000000000000000000000	0.000000000000000000000000000000	1660000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-26 15:22:05.324	\N
145	2026-05-25 00:00:00	5	0.000000000000000000000000000000	0.000000000000000000000000000000	1090000.000000000000000000000000000000	120000.000000000000000000000000000000	1090000.000000000000000000000000000000	120000.000000000000000000000000000000	1210000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-25 14:30:17.348	\N
147	2026-05-27 00:00:00	5	0.000000000000000000000000000000	0.000000000000000000000000000000	700000.000000000000000000000000000000	0.000000000000000000000000000000	700000.000000000000000000000000000000	0.000000000000000000000000000000	700000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-27 15:03:21.728	\N
148	2026-05-28 00:00:00	5	1570000.000000000000000000000000000000	0.000000000000000000000000000000	2570000.000000000000000000000000000000	90000.000000000000000000000000000000	1000000.000000000000000000000000000000	90000.000000000000000000000000000000	1090000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-28 15:05:14.287	\N
149	2026-05-29 00:00:00	5	2170000.000000000000000000000000000000	0.000000000000000000000000000000	3990000.000000000000000000000000000000	0.000000000000000000000000000000	1820000.000000000000000000000000000000	0.000000000000000000000000000000	1820000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-29 15:20:20.389	\N
225	2026-07-13 00:00:00	8	5200000.000000000000000000000000000000	0.000000000000000000000000000000	6110000.000000000000000000000000000000	360000.000000000000000000000000000000	910000.000000000000000000000000000000	360000.000000000000000000000000000000	1270000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-13 16:11:23.783	\N
165	2026-06-14 00:00:00	6	2050000.000000000000000000000000000000	0.000000000000000000000000000000	3490000.000000000000000000000000000000	1130000.000000000000000000000000000000	1440000.000000000000000000000000000000	1130000.000000000000000000000000000000	2570000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-14 15:48:30.979	\N
182	1978-01-01 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
150	2026-05-30 00:00:00	5	1490000.000000000000000000000000000000	0.000000000000000000000000000000	1960000.000000000000000000000000000000	480000.000000000000000000000000000000	470000.000000000000000000000000000000	480000.000000000000000000000000000000	950000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-05-30 15:00:13.947	\N
183	1978-01-02 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
184	1978-01-03 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
151	2026-05-31 00:00:00	5	1800000.000000000000000000000000000000	0.000000000000000000000000000000	2650000.000000000000000000000000000000	2030000.000000000000000000000000000000	850000.000000000000000000000000000000	2030000.000000000000000000000000000000	2880000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-06-01 04:54:23.145	Chị Anh nợ 560k\n1 dây nịch\n1 set váy 260\n
185	1978-01-04 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
152	2026-06-01 00:00:00	6	2650000.000000000000000000000000000000	0.000000000000000000000000000000	3900000.000000000000000000000000000000	0.000000000000000000000000000000	1250000.000000000000000000000000000000	0.000000000000000000000000000000	1250000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-02 02:13:26.563	\N
186	1978-01-05 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
153	2026-06-02 00:00:00	6	1340000.000000000000000000000000000000	0.000000000000000000000000000000	2375000.000000000000000000000000000000	0.000000000000000000000000000000	1035000.000000000000000000000000000000	0.000000000000000000000000000000	1035000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-02 16:05:56.098	\N
187	1978-01-06 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
188	1978-01-07 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
189	1978-01-08 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
190	1978-01-09 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
191	1978-01-10 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
192	1978-01-11 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
193	1978-01-12 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
154	2026-06-03 00:00:00	6	1495000.000000000000000000000000000000	0.000000000000000000000000000000	1680000.000000000000000000000000000000	730000.000000000000000000000000000000	185000.000000000000000000000000000000	730000.000000000000000000000000000000	915000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-03 15:59:14.808	\N
194	1978-01-13 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
155	2026-06-04 00:00:00	6	0.000000000000000000000000000000	0.000000000000000000000000000000	920000.000000000000000000000000000000	0.000000000000000000000000000000	920000.000000000000000000000000000000	0.000000000000000000000000000000	920000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-05 09:52:07.935	\N
195	1978-01-14 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
156	2026-06-05 00:00:00	6	1530000.000000000000000000000000000000	0.000000000000000000000000000000	1910000.000000000000000000000000000000	790000.000000000000000000000000000000	380000.000000000000000000000000000000	790000.000000000000000000000000000000	1170000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-05 15:36:25.548	\N
157	2026-06-06 00:00:00	6	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-07 09:56:25.664	\N
158	2026-06-07 00:00:00	6	0.000000000000000000000000000000	0.000000000000000000000000000000	1600000.000000000000000000000000000000	0.000000000000000000000000000000	1600000.000000000000000000000000000000	0.000000000000000000000000000000	1600000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-07 15:43:13.589	\N
196	1978-01-15 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
197	1978-01-16 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
198	1978-01-17 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
159	2026-06-08 00:00:00	6	1750000.000000000000000000000000000000	0.000000000000000000000000000000	2630000.000000000000000000000000000000	580000.000000000000000000000000000000	880000.000000000000000000000000000000	580000.000000000000000000000000000000	1460000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-08 15:30:14.381	\N
160	2026-06-09 00:00:00	6	0.000000000000000000000000000000	0.000000000000000000000000000000	605000.000000000000000000000000000000	0.000000000000000000000000000000	605000.000000000000000000000000000000	0.000000000000000000000000000000	605000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-10 03:43:21.927	\N
199	1978-01-18 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
200	1978-01-19 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
201	1978-01-20 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
161	2026-06-10 00:00:00	6	1850000.000000000000000000000000000000	0.000000000000000000000000000000	2250000.000000000000000000000000000000	1765000.000000000000000000000000000000	400000.000000000000000000000000000000	1765000.000000000000000000000000000000	2165000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-10 15:56:50.619	\N
202	1978-01-21 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
203	1978-01-22 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
204	1978-01-23 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
162	2026-06-11 00:00:00	6	2130000.000000000000000000000000000000	0.000000000000000000000000000000	2660000.000000000000000000000000000000	375000.000000000000000000000000000000	530000.000000000000000000000000000000	375000.000000000000000000000000000000	905000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-12 08:59:16.557	\N
205	1978-01-24 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
206	1978-01-25 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
207	1978-01-26 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
208	1978-01-27 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
209	1978-01-28 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
210	1978-01-29 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
211	1978-01-30 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
212	1978-01-31 00:00:00	7	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.762	\N
213	2026-07-01 00:00:00	8	1780000.000000000000000000000000000000	0.000000000000000000000000000000	2430000.000000000000000000000000000000	160000.000000000000000000000000000000	650000.000000000000000000000000000000	160000.000000000000000000000000000000	810000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-01 15:49:10.827	\N
163	2026-06-12 00:00:00	6	2430000.000000000000000000000000000000	0.000000000000000000000000000000	4620000.000000000000000000000000000000	1040000.000000000000000000000000000000	2190000.000000000000000000000000000000	1040000.000000000000000000000000000000	3230000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-12 15:57:47.536	\N
167	2026-06-16 00:00:00	6	3860000.000000000000000000000000000000	0.000000000000000000000000000000	4480000.000000000000000000000000000000	1020000.000000000000000000000000000000	620000.000000000000000000000000000000	1020000.000000000000000000000000000000	1640000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-17 07:44:42.855	\N
175	2026-06-24 00:00:00	6	2735000.000000000000000000000000000000	0.000000000000000000000000000000	2935000.000000000000000000000000000000	0.000000000000000000000000000000	200000.000000000000000000000000000000	0.000000000000000000000000000000	200000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-25 15:16:31.36	\N
176	2026-06-25 00:00:00	6	0.000000000000000000000000000000	0.000000000000000000000000000000	1730000.000000000000000000000000000000	0.000000000000000000000000000000	1730000.000000000000000000000000000000	0.000000000000000000000000000000	1730000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-25 15:17:06.974	\N
170	2026-06-19 00:00:00	6	2650000.000000000000000000000000000000	0.000000000000000000000000000000	4620000.000000000000000000000000000000	660000.000000000000000000000000000000	1970000.000000000000000000000000000000	660000.000000000000000000000000000000	2630000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-19 16:07:51.727	\N
166	2026-06-15 00:00:00	6	3472000.000000000000000000000000000000	0.000000000000000000000000000000	3940000.000000000000000000000000000000	540000.000000000000000000000000000000	468000.000000000000000000000000000000	540000.000000000000000000000000000000	1008000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-16 10:32:02.6	\N
168	2026-06-17 00:00:00	6	3650000.000000000000000000000000000000	0.000000000000000000000000000000	3920000.000000000000000000000000000000	240000.000000000000000000000000000000	270000.000000000000000000000000000000	240000.000000000000000000000000000000	510000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-17 15:10:45.662	\N
178	2026-06-27 00:00:00	6	1860000.000000000000000000000000000000	0.000000000000000000000000000000	3100000.000000000000000000000000000000	430000.000000000000000000000000000000	1240000.000000000000000000000000000000	430000.000000000000000000000000000000	1670000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-27 18:24:12.83	\N
164	2026-06-13 00:00:00	6	3170000.000000000000000000000000000000	0.000000000000000000000000000000	9850000.000000000000000000000000000000	1470000.000000000000000000000000000000	6680000.000000000000000000000000000000	1470000.000000000000000000000000000000	8150000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-20 05:12:12.809	Thanh lý hàng +6M
171	2026-06-20 00:00:00	6	0.000000000000000000000000000000	0.000000000000000000000000000000	890000.000000000000000000000000000000	0.000000000000000000000000000000	890000.000000000000000000000000000000	0.000000000000000000000000000000	890000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-20 16:22:21.513	\N
177	2026-06-26 00:00:00	6	2180000.000000000000000000000000000000	0.000000000000000000000000000000	2310000.000000000000000000000000000000	1425000.000000000000000000000000000000	130000.000000000000000000000000000000	1425000.000000000000000000000000000000	1555000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-27 03:40:59.458	\N
169	2026-06-18 00:00:00	6	2060000.000000000000000000000000000000	0.000000000000000000000000000000	2900000.000000000000000000000000000000	720000.000000000000000000000000000000	840000.000000000000000000000000000000	720000.000000000000000000000000000000	1560000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-18 16:08:27.81	\N
181	2026-06-30 00:00:00	6	960000.000000000000000000000000000000	0.000000000000000000000000000000	2030000.000000000000000000000000000000	640000.000000000000000000000000000000	1070000.000000000000000000000000000000	640000.000000000000000000000000000000	1710000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-30 14:28:58.551	\N
173	2026-06-22 00:00:00	6	2050000.000000000000000000000000000000	0.000000000000000000000000000000	3240000.000000000000000000000000000000	890000.000000000000000000000000000000	1190000.000000000000000000000000000000	890000.000000000000000000000000000000	2080000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-23 09:02:04.617	\N
172	2026-06-21 00:00:00	6	1650000.000000000000000000000000000000	0.000000000000000000000000000000	4050000.000000000000000000000000000000	1310000.000000000000000000000000000000	2400000.000000000000000000000000000000	1310000.000000000000000000000000000000	3710000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-22 06:17:37.51	\N
180	2026-06-29 00:00:00	6	1860000.000000000000000000000000000000	0.000000000000000000000000000000	1890000.000000000000000000000000000000	0.000000000000000000000000000000	30000.000000000000000000000000000000	0.000000000000000000000000000000	30000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-30 04:57:06.982	\N
174	2026-06-23 00:00:00	6	2465000.000000000000000000000000000000	0.000000000000000000000000000000	2825000.000000000000000000000000000000	580000.000000000000000000000000000000	360000.000000000000000000000000000000	580000.000000000000000000000000000000	940000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-23 15:39:58.225	\N
179	2026-06-28 00:00:00	6	2100000.000000000000000000000000000000	0.000000000000000000000000000000	4460000.000000000000000000000000000000	800000.000000000000000000000000000000	2360000.000000000000000000000000000000	800000.000000000000000000000000000000	3160000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-06-28 15:48:36.431	\N
214	2026-07-02 00:00:00	8	0.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-02 14:46:55.891	\N
216	2026-07-04 00:00:00	8	0.000000000000000000000000000000	0.000000000000000000000000000000	980000.000000000000000000000000000000	0.000000000000000000000000000000	980000.000000000000000000000000000000	0.000000000000000000000000000000	980000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-05 03:49:28.172	\N
215	2026-07-03 00:00:00	8	0.000000000000000000000000000000	0.000000000000000000000000000000	510000.000000000000000000000000000000	0.000000000000000000000000000000	510000.000000000000000000000000000000	0.000000000000000000000000000000	510000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-05 13:32:00.712	\N
218	2026-07-06 00:00:00	8	2200000.000000000000000000000000000000	0.000000000000000000000000000000	3390000.000000000000000000000000000000	520000.000000000000000000000000000000	1190000.000000000000000000000000000000	520000.000000000000000000000000000000	1710000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-06 15:45:11.98	\N
217	2026-07-05 00:00:00	8	1345000.000000000000000000000000000000	0.000000000000000000000000000000	3500000.000000000000000000000000000000	795000.000000000000000000000000000000	2155000.000000000000000000000000000000	795000.000000000000000000000000000000	2950000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-05 16:07:30.937	\N
221	2026-07-09 00:00:00	8	2370000.000000000000000000000000000000	0.000000000000000000000000000000	2620000.000000000000000000000000000000	840000.000000000000000000000000000000	250000.000000000000000000000000000000	840000.000000000000000000000000000000	1090000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-09 15:40:35.479	\N
220	2026-07-08 00:00:00	8	1820000.000000000000000000000000000000	0.000000000000000000000000000000	2500000.000000000000000000000000000000	350000.000000000000000000000000000000	680000.000000000000000000000000000000	350000.000000000000000000000000000000	1030000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-08 15:59:33.645	\N
219	2026-07-07 00:00:00	8	0.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-12 15:16:11.419	\N
222	2026-07-10 00:00:00	8	700000.000000000000000000000000000000	0.000000000000000000000000000000	2050000.000000000000000000000000000000	1015000.000000000000000000000000000000	1350000.000000000000000000000000000000	1015000.000000000000000000000000000000	2365000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-10 15:54:46.988	\N
223	2026-07-11 00:00:00	8	1650000.000000000000000000000000000000	0.000000000000000000000000000000	2640000.000000000000000000000000000000	2795000.000000000000000000000000000000	990000.000000000000000000000000000000	2795000.000000000000000000000000000000	3785000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-11 15:46:14.204	\N
244	2026-08-01 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	960000.000000000000000000000000000000	0.000000000000000000000000000000	960000.000000000000000000000000000000	0.000000000000000000000000000000	960000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-02 03:19:15.266	\N
258	2026-08-15 00:00:00	9	2499000.000000000000000000000000000000	0.000000000000000000000000000000	3070000.000000000000000000000000000000	1750000.000000000000000000000000000000	571000.000000000000000000000000000000	1750000.000000000000000000000000000000	2321000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-15 15:02:16.515	\N
224	2026-07-12 00:00:00	8	2520000.000000000000000000000000000000	0.000000000000000000000000000000	5460000.000000000000000000000000000000	2020000.000000000000000000000000000000	2940000.000000000000000000000000000000	2020000.000000000000000000000000000000	4960000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-12 15:09:41.161	\N
238	2026-07-26 00:00:00	8	1300000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	1770000.000000000000000000000000000000	0.000000000000000000000000000000	1770000.000000000000000000000000000000	1770000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-26 17:12:18.416	\N
252	2026-08-09 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1275000.000000000000000000000000000000	410000.000000000000000000000000000000	1275000.000000000000000000000000000000	410000.000000000000000000000000000000	1685000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-09 16:14:49.688	\N
253	2026-08-10 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1510000.000000000000000000000000000000	0.000000000000000000000000000000	1510000.000000000000000000000000000000	0.000000000000000000000000000000	1510000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-11 09:17:43.602	\N
239	2026-07-27 00:00:00	8	1440000.000000000000000000000000000000	0.000000000000000000000000000000	1480000.000000000000000000000000000000	1000000.000000000000000000000000000000	40000.000000000000000000000000000000	1000000.000000000000000000000000000000	1040000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-27 15:54:41.886	\N
226	2026-07-14 00:00:00	8	1950000.000000000000000000000000000000	0.000000000000000000000000000000	2160000.000000000000000000000000000000	1095000.000000000000000000000000000000	210000.000000000000000000000000000000	1095000.000000000000000000000000000000	1305000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-14 15:50:28.224	\N
274	2026-08-31 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	700000.000000000000000000000000000000	1115000.000000000000000000000000000000	700000.000000000000000000000000000000	1115000.000000000000000000000000000000	1815000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-31 13:13:24.908	\N
245	2026-08-02 00:00:00	9	1650000.000000000000000000000000000000	0.000000000000000000000000000000	2070000.000000000000000000000000000000	960000.000000000000000000000000000000	420000.000000000000000000000000000000	960000.000000000000000000000000000000	1380000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-02 15:54:08.141	\N
227	2026-07-15 00:00:00	8	1945000.000000000000000000000000000000	0.000000000000000000000000000000	3850000.000000000000000000000000000000	520000.000000000000000000000000000000	1905000.000000000000000000000000000000	520000.000000000000000000000000000000	2425000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-15 16:06:36.506	\N
275	2026-09-01 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	1020000.000000000000000000000000000000	0.000000000000000000000000000000	1020000.000000000000000000000000000000	0.000000000000000000000000000000	1020000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 12:42:05.092	\N
240	2026-07-28 00:00:00	8	1460000.000000000000000000000000000000	0.000000000000000000000000000000	1980000.000000000000000000000000000000	1120000.000000000000000000000000000000	520000.000000000000000000000000000000	1120000.000000000000000000000000000000	1640000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-28 14:57:39.032	\N
254	2026-08-11 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1420000.000000000000000000000000000000	1730000.000000000000000000000000000000	1420000.000000000000000000000000000000	1730000.000000000000000000000000000000	3150000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-11 16:07:03.788	\N
228	2026-07-16 00:00:00	8	3800000.000000000000000000000000000000	0.000000000000000000000000000000	4000000.000000000000000000000000000000	845000.000000000000000000000000000000	200000.000000000000000000000000000000	845000.000000000000000000000000000000	1045000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-16 15:45:41.654	\N
246	2026-08-03 00:00:00	9	1970000.000000000000000000000000000000	0.000000000000000000000000000000	2650000.000000000000000000000000000000	885000.000000000000000000000000000000	680000.000000000000000000000000000000	885000.000000000000000000000000000000	1565000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-03 15:11:22.187	\N
241	2026-07-29 00:00:00	8	1960000.000000000000000000000000000000	0.000000000000000000000000000000	2460000.000000000000000000000000000000	130000.000000000000000000000000000000	500000.000000000000000000000000000000	130000.000000000000000000000000000000	630000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-29 15:41:05.921	\N
267	2026-08-24 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1160000.000000000000000000000000000000	0.000000000000000000000000000000	1160000.000000000000000000000000000000	0.000000000000000000000000000000	1160000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-25 04:50:24.185	\N
247	2026-08-04 00:00:00	9	2680000.000000000000000000000000000000	0.000000000000000000000000000000	2800000.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-05 13:57:31.169	\N
268	2026-08-25 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1790000.000000000000000000000000000000	0.000000000000000000000000000000	1790000.000000000000000000000000000000	0.000000000000000000000000000000	1790000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-26 03:50:28.923	\N
255	2026-08-12 00:00:00	9	2550000.000000000000000000000000000000	0.000000000000000000000000000000	2950000.000000000000000000000000000000	2020000.000000000000000000000000000000	400000.000000000000000000000000000000	2020000.000000000000000000000000000000	2420000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-12 15:50:11.561	\N
229	2026-07-17 00:00:00	8	2350000.000000000000000000000000000000	0.000000000000000000000000000000	2830000.000000000000000000000000000000	1235000.000000000000000000000000000000	480000.000000000000000000000000000000	1235000.000000000000000000000000000000	1715000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-18 16:02:43.48	\N
248	2026-08-05 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	350000.000000000000000000000000000000	0.000000000000000000000000000000	350000.000000000000000000000000000000	0.000000000000000000000000000000	350000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-06 09:39:58.837	\N
230	2026-07-18 00:00:00	8	2590000.000000000000000000000000000000	0.000000000000000000000000000000	3200000.000000000000000000000000000000	840000.000000000000000000000000000000	610000.000000000000000000000000000000	840000.000000000000000000000000000000	1450000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-18 16:03:27.641	\N
249	2026-08-06 00:00:00	9	2340000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	620000.000000000000000000000000000000	0.000000000000000000000000000000	620000.000000000000000000000000000000	620000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-07 05:20:36.857	\N
242	2026-07-30 00:00:00	8	2243000.000000000000000000000000000000	0.000000000000000000000000000000	3200000.000000000000000000000000000000	975000.000000000000000000000000000000	957000.000000000000000000000000000000	975000.000000000000000000000000000000	1932000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-30 15:17:05.939	\N
259	2026-08-16 00:00:00	9	2420000.000000000000000000000000000000	0.000000000000000000000000000000	4320000.000000000000000000000000000000	600000.000000000000000000000000000000	1900000.000000000000000000000000000000	600000.000000000000000000000000000000	2500000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-16 16:45:56.619	\N
231	2026-07-19 00:00:00	8	3980000.000000000000000000000000000000	0.000000000000000000000000000000	6130000.000000000000000000000000000000	1715000.000000000000000000000000000000	2150000.000000000000000000000000000000	1715000.000000000000000000000000000000	3865000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-19 16:56:43.886	\N
243	2026-07-31 00:00:00	8	1900000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-31 11:25:24.95	\N
232	2026-07-20 00:00:00	8	1730000.000000000000000000000000000000	0.000000000000000000000000000000	1790000.000000000000000000000000000000	160000.000000000000000000000000000000	60000.000000000000000000000000000000	160000.000000000000000000000000000000	220000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-21 09:31:43.037	\N
233	2026-07-21 00:00:00	8	1600000.000000000000000000000000000000	0.000000000000000000000000000000	1790000.000000000000000000000000000000	600000.000000000000000000000000000000	190000.000000000000000000000000000000	600000.000000000000000000000000000000	790000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-21 16:01:25.361	\N
234	2026-07-22 00:00:00	8	1670000.000000000000000000000000000000	0.000000000000000000000000000000	1890000.000000000000000000000000000000	735000.000000000000000000000000000000	220000.000000000000000000000000000000	735000.000000000000000000000000000000	955000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-22 15:02:53.76	\N
235	2026-07-23 00:00:00	8	0.000000000000000000000000000000	0.000000000000000000000000000000	790000.000000000000000000000000000000	260000.000000000000000000000000000000	790000.000000000000000000000000000000	260000.000000000000000000000000000000	1050000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-23 15:45:50.269	\N
236	2026-07-24 00:00:00	8	1210000.000000000000000000000000000000	0.000000000000000000000000000000	1500000.000000000000000000000000000000	540000.000000000000000000000000000000	290000.000000000000000000000000000000	540000.000000000000000000000000000000	830000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-24 14:25:19.913	\N
237	2026-07-25 00:00:00	8	1400000.000000000000000000000000000000	0.000000000000000000000000000000	2190000.000000000000000000000000000000	430000.000000000000000000000000000000	790000.000000000000000000000000000000	430000.000000000000000000000000000000	1220000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-07-25 15:16:23.572	\N
273	2026-08-30 00:00:00	9	1200000.000000000000000000000000000000	0.000000000000000000000000000000	1900000.000000000000000000000000000000	600000.000000000000000000000000000000	700000.000000000000000000000000000000	600000.000000000000000000000000000000	1300000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-31 13:13:44.114	\N
250	2026-08-07 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	825000.000000000000000000000000000000	1570000.000000000000000000000000000000	825000.000000000000000000000000000000	1570000.000000000000000000000000000000	2395000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-07 19:07:12.368	\N
251	2026-08-08 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	771000.000000000000000000000000000000	0.000000000000000000000000000000	771000.000000000000000000000000000000	0.000000000000000000000000000000	771000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-08 15:53:58.283	\N
260	2026-08-17 00:00:00	9	2820000.000000000000000000000000000000	0.000000000000000000000000000000	3260000.000000000000000000000000000000	0.000000000000000000000000000000	440000.000000000000000000000000000000	0.000000000000000000000000000000	440000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-18 02:57:25.254	\N
269	2026-08-26 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-26 14:18:47.913	\N
256	2026-08-13 00:00:00	9	2240000.000000000000000000000000000000	0.000000000000000000000000000000	3360000.000000000000000000000000000000	1915000.000000000000000000000000000000	1120000.000000000000000000000000000000	1915000.000000000000000000000000000000	3035000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-13 15:34:05.458	\N
261	2026-08-18 00:00:00	9	2460000.000000000000000000000000000000	0.000000000000000000000000000000	3730000.000000000000000000000000000000	570000.000000000000000000000000000000	1270000.000000000000000000000000000000	570000.000000000000000000000000000000	1840000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-18 15:32:15.032	\N
257	2026-08-14 00:00:00	9	1333000.000000000000000000000000000000	0.000000000000000000000000000000	3750000.000000000000000000000000000000	2330000.000000000000000000000000000000	2417000.000000000000000000000000000000	2330000.000000000000000000000000000000	4747000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-14 14:44:19.355	\N
262	2026-08-19 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1050000.000000000000000000000000000000	0.000000000000000000000000000000	1050000.000000000000000000000000000000	0.000000000000000000000000000000	1050000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-20 14:30:05.405	\N
263	2026-08-20 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	525000.000000000000000000000000000000	0.000000000000000000000000000000	525000.000000000000000000000000000000	0.000000000000000000000000000000	525000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-20 15:12:40.416	\N
264	2026-08-21 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	670000.000000000000000000000000000000	540000.000000000000000000000000000000	670000.000000000000000000000000000000	540000.000000000000000000000000000000	1210000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-21 15:15:59.66	\N
265	2026-08-22 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	2020000.000000000000000000000000000000	0.000000000000000000000000000000	2020000.000000000000000000000000000000	0.000000000000000000000000000000	2020000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-23 07:57:16.46	\N
266	2026-08-23 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1655000.000000000000000000000000000000	700000.000000000000000000000000000000	1655000.000000000000000000000000000000	700000.000000000000000000000000000000	2355000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-23 16:05:40.72	\N
270	2026-08-27 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	785000.000000000000000000000000000000	0.000000000000000000000000000000	785000.000000000000000000000000000000	0.000000000000000000000000000000	785000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-27 15:58:23.306	\N
271	2026-08-28 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	2010000.000000000000000000000000000000	0.000000000000000000000000000000	2010000.000000000000000000000000000000	0.000000000000000000000000000000	2010000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-28 16:10:34.754	\N
272	2026-08-29 00:00:00	9	0.000000000000000000000000000000	0.000000000000000000000000000000	1170000.000000000000000000000000000000	0.000000000000000000000000000000	1170000.000000000000000000000000000000	0.000000000000000000000000000000	1170000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-08-30 09:23:22.919	\N
276	2026-09-02 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	930000.000000000000000000000000000000	0.000000000000000000000000000000	930000.000000000000000000000000000000	0.000000000000000000000000000000	930000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-02 17:45:40.412	\N
278	2026-09-04 00:00:00	10	2890000.000000000000000000000000000000	0.000000000000000000000000000000	3230000.000000000000000000000000000000	1110000.000000000000000000000000000000	340000.000000000000000000000000000000	1110000.000000000000000000000000000000	1450000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-04 14:27:54.646	\N
283	2026-09-09 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
284	2026-09-10 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
285	2026-09-11 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
286	2026-09-12 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
287	2026-09-13 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
288	2026-09-14 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
289	2026-09-15 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
290	2026-09-16 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
291	2026-09-17 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
292	2026-09-18 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
293	2026-09-19 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
294	2026-09-20 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
295	2026-09-21 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
296	2026-09-22 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
277	2026-09-03 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	1130000.000000000000000000000000000000	0.000000000000000000000000000000	1130000.000000000000000000000000000000	0.000000000000000000000000000000	1130000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-03 14:52:13.588	\N
279	2026-09-05 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	240000.000000000000000000000000000000	0.000000000000000000000000000000	240000.000000000000000000000000000000	0.000000000000000000000000000000	240000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-06 17:11:48.606	\N
280	2026-09-06 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	1020000.000000000000000000000000000000	0.000000000000000000000000000000	1020000.000000000000000000000000000000	0.000000000000000000000000000000	1020000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-06 17:13:01.126	\N
281	2026-09-07 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	865000.000000000000000000000000000000	0.000000000000000000000000000000	865000.000000000000000000000000000000	0.000000000000000000000000000000	865000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-07 14:54:19.365	\N
282	2026-09-08 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	647000.000000000000000000000000000000	0.000000000000000000000000000000	647000.000000000000000000000000000000	0.000000000000000000000000000000	647000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-09 10:19:40.481	\N
297	2026-09-23 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
298	2026-09-24 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
299	2026-09-25 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
300	2026-09-26 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
301	2026-09-27 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
302	2026-09-28 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
303	2026-09-29 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
304	2026-09-30 00:00:00	10	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-01 10:07:11.489	\N
\.


--
-- Data for Name: daily_sold_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_sold_product (id, "dailyFinanceId", "productId", "createdAt", "updatedAt", "importPrice", sales) FROM stdin;
8686	161	48	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
8687	161	64	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
13	37	53	2026-04-06 13:27:38.343	2026-04-06 13:27:38.343	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14	37	16	2026-04-06 13:27:38.343	2026-04-06 13:27:38.343	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
15	37	1	2026-04-06 13:27:38.343	2026-04-06 13:27:38.343	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
16	37	9	2026-04-06 13:27:38.343	2026-04-06 13:27:38.343	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
17	37	26	2026-04-06 13:27:38.343	2026-04-06 13:27:38.343	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
23	38	32	2026-04-07 13:13:01.297	2026-04-07 13:13:01.297	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
305	40	56	2026-04-09 11:39:07.218	2026-04-09 11:39:07.218	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
306	40	26	2026-04-09 11:39:07.218	2026-04-09 11:39:07.218	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
307	40	62	2026-04-09 11:39:07.218	2026-04-09 11:39:07.218	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
1493	50	19	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1494	50	17	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	75000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 150000}]
1495	50	22	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
1496	50	1	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
1497	50	26	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
1498	50	40	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
1499	50	2	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1500	50	20	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
1501	50	27	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}, {"quantity": 1, "sellPrice": 70000}]
1502	50	24	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
1503	50	9	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
1504	50	8	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
1505	50	35	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1506	50	57	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
1507	50	3	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
1508	50	51	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1509	50	47	2026-04-19 15:30:58.203	2026-04-19 15:30:58.203	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
264	39	59	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
265	39	9	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
266	39	7	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
267	39	1	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 10000}]
268	39	24	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
269	39	28	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
270	39	17	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
271	39	26	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
272	39	57	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
273	39	61	2026-04-08 15:05:43.087	2026-04-08 15:05:43.087	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
427	41	20	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
428	41	30	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
429	41	53	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
430	41	1	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
599	42	30	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
600	42	26	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
431	41	32	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
432	41	42	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 35000}]
433	41	25	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
434	41	26	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
435	41	36	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
436	41	47	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
437	41	17	2026-04-10 15:46:25.212	2026-04-10 15:46:25.212	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
601	42	1	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 9, "sellPrice": 10000}]
602	42	11	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
603	42	9	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
604	42	36	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
605	42	42	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 35000}]
606	42	23	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
607	42	56	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
608	42	31	2026-04-11 15:50:55.053	2026-04-11 15:50:55.053	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
8688	161	32	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
8689	161	1	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
8690	161	65	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
8691	161	93	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
880	44	19	2026-04-13 14:25:00.375	2026-04-13 14:25:00.375	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
881	44	15	2026-04-13 14:25:00.375	2026-04-13 14:25:00.375	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
882	44	26	2026-04-13 14:25:00.375	2026-04-13 14:25:00.375	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
883	44	25	2026-04-13 14:25:00.375	2026-04-13 14:25:00.375	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
884	44	7	2026-04-13 14:25:00.375	2026-04-13 14:25:00.375	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
995	46	9	2026-04-15 14:33:56.245	2026-04-15 14:33:56.245	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
996	46	63	2026-04-15 14:33:56.245	2026-04-15 14:33:56.245	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 40000}]
997	46	18	2026-04-15 14:33:56.245	2026-04-15 14:33:56.245	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
998	46	55	2026-04-15 14:33:56.245	2026-04-15 14:33:56.245	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
999	46	1	2026-04-15 14:33:56.245	2026-04-15 14:33:56.245	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
1000	46	36	2026-04-15 14:33:56.245	2026-04-15 14:33:56.245	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
849	43	26	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
850	43	58	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
851	43	18	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}, {"quantity": 1, "sellPrice": 50000}]
852	43	34	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
853	43	38	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 160000}]
854	43	19	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
855	43	1	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 10000}]
856	43	30	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	105000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 180000}]
857	43	51	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
858	43	27	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
859	43	42	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
860	43	7	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
861	43	25	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
862	43	64	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
863	43	32	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
864	43	15	2026-04-12 15:01:52.284	2026-04-12 15:01:52.284	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
1734	54	1	2026-04-23 15:05:18.103	2026-04-23 15:05:18.103	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
1735	54	24	2026-04-23 15:05:18.103	2026-04-23 15:05:18.103	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
1736	54	26	2026-04-23 15:05:18.103	2026-04-23 15:05:18.103	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
951	45	18	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
952	45	16	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
953	45	64	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
954	45	26	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
955	45	15	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
956	45	8	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
957	45	47	2026-04-14 14:37:15.861	2026-04-14 14:37:15.861	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
1660	52	47	2026-04-21 08:51:24.895	2026-04-21 08:51:24.895	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
1107	47	56	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
1108	47	58	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
1109	47	23	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
1110	47	25	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1111	47	47	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1112	47	37	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}, {"quantity": 1, "sellPrice": 110000}]
1113	47	15	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
1114	47	1	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
1115	47	18	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
1116	47	9	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
1117	47	17	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
1118	47	22	2026-04-16 14:45:35.972	2026-04-16 14:45:35.972	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 210000}]
1661	52	1	2026-04-21 08:51:24.895	2026-04-21 08:51:24.895	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
1662	52	14	2026-04-21 08:51:24.895	2026-04-21 08:51:24.895	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
1737	54	8	2026-04-23 15:05:18.103	2026-04-23 15:05:18.103	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1738	54	34	2026-04-23 15:05:18.103	2026-04-23 15:05:18.103	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
1739	54	53	2026-04-23 15:05:18.103	2026-04-23 15:05:18.103	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
2498	128	69	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 20000}]
2499	128	24	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	75000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 120000}]
2500	128	58	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	115000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 190000}]
2501	128	1	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
2502	128	68	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
2503	128	26	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
1783	55	64	2026-04-25 06:09:59.948	2026-04-25 06:09:59.948	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1784	55	26	2026-04-25 06:09:59.948	2026-04-25 06:09:59.948	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
1693	53	9	2026-04-22 14:28:25.041	2026-04-22 14:28:25.041	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
1694	53	26	2026-04-22 14:28:25.041	2026-04-22 14:28:25.041	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
1695	53	25	2026-04-22 14:28:25.041	2026-04-22 14:28:25.041	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
1696	53	1	2026-04-22 14:28:25.041	2026-04-22 14:28:25.041	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
1697	53	51	2026-04-22 14:28:25.041	2026-04-22 14:28:25.041	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1698	53	57	2026-04-22 14:28:25.041	2026-04-22 14:28:25.041	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
1785	55	15	2026-04-25 06:09:59.948	2026-04-25 06:09:59.948	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1786	55	35	2026-04-25 06:09:59.948	2026-04-25 06:09:59.948	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1787	55	51	2026-04-25 06:09:59.948	2026-04-25 06:09:59.948	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
2097	61	53	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
2098	61	40	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
2099	61	1	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}, {"quantity": 1, "sellPrice": 15000}]
2100	61	24	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
2101	61	26	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
2102	61	27	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 80000}]
2103	61	34	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
2104	61	35	2026-04-30 11:02:19.159	2026-04-30 11:02:19.159	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1645	51	63	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
1646	51	1	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
1647	51	64	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1648	51	15	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
1649	51	53	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
1650	51	32	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
1651	51	26	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 60000}]
1652	51	30	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	105000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 180000}]
1653	51	40	2026-04-20 15:12:16.547	2026-04-20 15:12:16.547	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
1890	57	1	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
1891	57	8	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
1892	57	26	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 60000}]
1893	57	35	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1894	57	30	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
1895	57	38	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
1896	57	25	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
1897	57	45	2026-04-26 14:03:07.682	2026-04-26 14:03:07.682	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
1820	56	42	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
1821	56	1	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
1822	56	3	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
1823	56	64	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1824	56	14	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
1825	56	57	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
1826	56	26	2026-04-25 12:21:21.965	2026-04-25 12:21:21.965	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
1915	58	26	2026-04-27 14:35:26.107	2026-04-27 14:35:26.107	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
1916	58	15	2026-04-27 14:35:26.107	2026-04-27 14:35:26.107	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
1917	58	53	2026-04-27 14:35:26.107	2026-04-27 14:35:26.107	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
1918	58	51	2026-04-27 14:35:26.107	2026-04-27 14:35:26.107	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
1950	59	22	2026-04-28 15:49:42.99	2026-04-28 15:49:42.99	145000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 200000}]
1951	59	64	2026-04-28 15:49:42.99	2026-04-28 15:49:42.99	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
1952	59	36	2026-04-28 15:49:42.99	2026-04-28 15:49:42.99	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
1953	59	9	2026-04-28 15:49:42.99	2026-04-28 15:49:42.99	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
1954	59	26	2026-04-28 15:49:42.99	2026-04-28 15:49:42.99	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
1955	59	1	2026-04-28 15:49:42.99	2026-04-28 15:49:42.99	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
8692	161	9	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
5012	139	15	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
5013	139	68	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
5014	139	53	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
5015	139	14	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
5016	139	20	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
5017	139	26	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
2267	124	30	2026-05-04 13:37:13.921	2026-05-04 13:37:13.921	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
2268	124	14	2026-05-04 13:37:13.921	2026-05-04 13:37:13.921	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
2269	124	17	2026-05-04 13:37:13.921	2026-05-04 13:37:13.921	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
2270	124	26	2026-05-04 13:37:13.921	2026-05-04 13:37:13.921	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
2271	124	51	2026-05-04 13:37:13.921	2026-05-04 13:37:13.921	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
2272	124	19	2026-05-04 13:37:13.921	2026-05-04 13:37:13.921	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
5018	139	8	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
5019	139	91	2026-05-19 15:08:53.591	2026-05-19 15:08:53.591	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
2504	128	14	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
8693	161	16	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
2035	60	20	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
2036	60	30	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
2037	60	26	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
2038	60	18	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
2039	60	15	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
2040	60	55	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
2041	60	36	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
2042	60	25	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
2043	60	67	2026-04-29 15:04:59.11	2026-04-29 15:04:59.11	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
8694	161	14	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 65000}]
2505	128	7	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
2506	128	30	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
2507	128	36	2026-05-08 13:43:34.663	2026-05-08 13:43:34.663	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
2406	127	24	2026-05-07 14:33:26.911	2026-05-07 14:33:26.911	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
2407	127	51	2026-05-07 14:33:26.911	2026-05-07 14:33:26.911	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
2408	127	6	2026-05-07 14:33:26.911	2026-05-07 14:33:26.911	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
2409	127	30	2026-05-07 14:33:26.911	2026-05-07 14:33:26.911	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
2117	121	58	2026-05-02 09:13:10.136	2026-05-02 09:13:10.136	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
2118	121	26	2026-05-02 09:13:10.136	2026-05-02 09:13:10.136	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
2410	127	26	2026-05-07 14:33:26.911	2026-05-07 14:33:26.911	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
2411	127	63	2026-05-07 14:33:26.911	2026-05-07 14:33:26.911	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
2131	122	68	2026-05-02 15:18:03.217	2026-05-02 15:18:03.217	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
2132	122	40	2026-05-02 15:18:03.217	2026-05-02 15:18:03.217	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
2133	122	12	2026-05-02 15:18:03.217	2026-05-02 15:18:03.217	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
2134	122	9	2026-05-02 15:18:03.217	2026-05-02 15:18:03.217	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
2135	122	26	2026-05-02 15:18:03.217	2026-05-02 15:18:03.217	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
4678	136	30	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
4679	136	10	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
4680	136	38	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
4681	136	43	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	8000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 40000}]
4682	136	26	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
4683	136	68	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
4684	136	39	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
4685	136	40	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4686	136	25	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4687	136	63	2026-05-17 11:32:56.764	2026-05-17 11:32:56.764	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
6560	147	14	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
6561	147	57	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
6562	147	125	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
6563	147	42	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
6564	147	1	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
6565	147	38	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
6566	147	51	2026-05-27 12:14:51.908	2026-05-27 12:14:51.908	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
3612	123	26	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
3613	123	20	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
3614	123	63	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
3615	123	25	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
3616	123	68	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
3617	123	55	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
3618	123	14	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
3619	123	42	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
3620	123	15	2026-05-12 10:18:10.806	2026-05-12 10:18:10.806	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
3634	126	9	2026-05-12 10:19:26.76	2026-05-12 10:19:26.76	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
3635	126	53	2026-05-12 10:19:26.76	2026-05-12 10:19:26.76	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
3636	126	16	2026-05-12 10:19:26.76	2026-05-12 10:19:26.76	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
3637	126	31	2026-05-12 10:19:26.76	2026-05-12 10:19:26.76	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
3638	126	15	2026-05-12 10:19:26.76	2026-05-12 10:19:26.76	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
4037	133	36	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 50000}]
4038	133	20	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	85000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 160000}]
4039	133	26	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 9, "sellPrice": 60000}]
4040	133	42	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 40000}]
4041	133	89	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30000}]
4042	133	25	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4043	133	64	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 50000}]
4044	133	15	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
4045	133	24	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
4046	133	18	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
4047	133	16	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
4048	133	8	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
4049	133	9	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
4050	133	57	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
4051	133	95	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
4052	133	1	2026-05-13 14:43:49.037	2026-05-13 14:43:49.037	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
4497	135	30	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
4498	135	1	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	7000.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 10000}]
4499	135	17	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
4500	135	47	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
4501	135	14	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
4502	135	93	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
4503	135	16	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
2674	129	18	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
2675	129	54	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	95000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
2676	129	27	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
2677	129	40	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
2678	129	69	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
2679	129	26	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
2680	129	22	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
2681	129	21	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
2682	129	55	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
2683	129	32	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
2684	129	68	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
2685	129	1	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
2686	129	58	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
2687	129	47	2026-05-09 13:13:51.089	2026-05-09 13:13:51.089	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
3550	131	26	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
3551	131	36	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 50000}]
3552	131	64	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
3553	131	14	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
3554	131	1	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
3555	131	17	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
3556	131	30	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
3557	131	69	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
3558	131	75	2026-05-11 14:36:21.287	2026-05-11 14:36:21.287	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
3621	125	30	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
3622	125	24	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}, {"quantity": 3, "sellPrice": 100000}]
3586	130	36	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 13, "sellPrice": 50000}]
3587	130	19	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
3588	130	63	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
3589	130	42	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 35000}]
3590	130	17	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
3591	130	68	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
3592	130	26	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 60000}, {"quantity": 2, "sellPrice": 50000}]
3593	130	50	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
3594	130	32	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
3595	130	40	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
3596	130	24	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
3597	130	51	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}, {"quantity": 1, "sellPrice": 50000}]
3598	130	21	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
3599	130	57	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	57000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 100000}]
3600	130	56	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
3601	130	54	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	95000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 160000}]
3602	130	89	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
3603	130	15	2026-05-12 10:17:04.673	2026-05-12 10:17:04.673	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
3623	125	27	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
3624	125	42	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
3625	125	26	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
3626	125	53	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
3627	125	25	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
3628	125	17	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
3629	125	15	2026-05-12 10:18:55.853	2026-05-12 10:18:55.853	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
3639	132	1	2026-05-12 12:38:06.509	2026-05-12 12:38:06.509	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
3640	132	15	2026-05-12 12:38:06.509	2026-05-12 12:38:06.509	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
3641	132	17	2026-05-12 12:38:06.509	2026-05-12 12:38:06.509	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
4504	135	18	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
4505	135	25	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4506	135	96	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
4507	135	40	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4508	135	15	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
4509	135	32	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
4510	135	21	2026-05-15 14:46:43.252	2026-05-15 14:46:43.252	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
4937	138	26	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
4938	138	24	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	75000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 100000}]
4939	138	15	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
4940	138	14	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
4941	138	92	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	65000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
4942	138	17	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
4943	138	27	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4304	134	47	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
4305	134	25	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
4306	134	24	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	75000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 120000}, {"quantity": 2, "sellPrice": 100000}]
4307	134	21	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
4308	134	9	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
4309	134	26	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}, {"quantity": 4, "sellPrice": 50000}]
4310	134	36	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 50000}]
4311	134	92	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
4312	134	32	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
4313	134	18	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
4314	134	15	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
4315	134	30	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
4316	134	63	2026-05-14 15:30:09.367	2026-05-14 15:30:09.367	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
6727	149	26	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
6728	149	24	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	75000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 120000}]
6729	149	21	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	110000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 190000}]
6730	149	57	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
6731	149	129	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	28000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
6732	149	17	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
6733	149	1	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
6734	149	63	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
6735	149	32	2026-05-29 15:20:41.43	2026-05-29 15:20:41.43	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
5351	141	14	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
5352	141	125	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
4944	138	18	2026-05-18 11:49:10.758	2026-05-18 11:49:10.758	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
5353	141	93	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
5354	141	15	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
5355	141	1	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	7000.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 10000}]
5356	141	26	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
5357	141	24	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
5358	141	20	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
5359	141	7	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30000}]
5360	141	9	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
5361	141	57	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
5362	141	33	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 250000}]
5363	141	47	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
5364	141	58	2026-05-21 14:54:39.945	2026-05-21 14:54:39.945	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
4987	137	37	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
4988	137	17	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
4989	137	21	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
4990	137	15	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
4991	137	63	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
4992	137	43	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
4993	137	41	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
4994	137	33	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 250000}]
4995	137	38	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
4996	137	30	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
4997	137	1	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
4998	137	5	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
7768	153	1	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	7000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
7769	153	43	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	9000.000000000000000000000000000000	[{"quantity": 9, "sellPrice": 15000}]
7770	153	47	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7771	153	14	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
7772	153	17	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	75000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 120000}]
7773	153	89	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
7774	153	51	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
7775	153	64	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
4999	137	6	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
5000	137	26	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
5001	137	79	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
5002	137	18	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
5003	137	112	2026-05-19 14:51:21.72	2026-05-19 14:51:21.72	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
5115	140	92	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
5116	140	47	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
5117	140	30	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
5118	140	57	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	57000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
5119	140	17	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
5120	140	1	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
5121	140	15	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
5122	140	53	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
5123	140	26	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
5124	140	20	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
5125	140	33	2026-05-20 14:23:08.721	2026-05-20 14:23:08.721	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 250000}]
8695	161	33	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
10616	167	34	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 160000}]
10617	167	72	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	69000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
10618	167	2	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
10619	167	64	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
10620	167	68	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
10621	167	19	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
10622	167	7	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
6602	148	64	2026-05-28 15:04:21.866	2026-05-28 15:04:21.866	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
6603	148	17	2026-05-28 15:04:21.866	2026-05-28 15:04:21.866	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
6604	148	125	2026-05-28 15:04:21.866	2026-05-28 15:04:21.866	60000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
6605	148	24	2026-05-28 15:04:21.866	2026-05-28 15:04:21.866	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
6606	148	89	2026-05-28 15:04:21.866	2026-05-28 15:04:21.866	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
6607	148	32	2026-05-28 15:04:21.866	2026-05-28 15:04:21.866	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
10623	167	18	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
10624	167	58	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
10625	167	1	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
10626	167	88	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
10627	167	127	2026-06-16 14:24:59.952	2026-06-16 14:24:59.952	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
13422	181	129	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	28000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
13423	181	16	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	70000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
13424	181	36	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 50000}]
13425	181	22	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
7776	153	58	2026-06-02 14:16:55.933	2026-06-02 14:16:55.933	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
8344	159	53	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
8345	159	48	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
8346	159	26	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
8347	159	27	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
8348	159	22	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	145000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 200000}]
8349	159	1	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
8350	159	30	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
8351	159	92	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
8352	159	132	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
8353	159	51	2026-06-08 12:06:13.051	2026-06-08 12:06:13.051	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
6377	144	42	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
6378	144	24	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
6379	144	1	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
6380	144	65	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
6381	144	15	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
6382	144	126	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
6383	144	26	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
6384	144	9	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
6385	144	19	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
6386	144	16	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	70000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
6387	144	36	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
6388	144	8	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
6389	144	64	2026-05-24 13:50:50.411	2026-05-24 13:50:50.411	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
8056	156	30	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
8057	156	21	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
8058	156	136	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
8059	156	36	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
8060	156	16	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	70000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
8061	156	1	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
8062	156	19	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	47000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 90000}]
8063	156	41	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
8064	156	43	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
8065	156	53	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
8066	156	7	2026-06-05 15:36:13.892	2026-06-05 15:36:13.892	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
5533	142	53	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
5534	142	26	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 60000}]
5535	142	63	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
5536	142	1	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
5537	142	25	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
5538	142	15	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	60000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
5539	142	30	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	105000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 180000}]
5540	142	40	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 80000}]
5541	142	64	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
5542	142	47	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
5543	142	5	2026-05-22 14:04:15.71	2026-05-22 14:04:15.71	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
6409	145	114	2026-05-25 14:30:40.602	2026-05-25 14:30:40.602	125000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
6410	145	115	2026-05-25 14:30:40.602	2026-05-25 14:30:40.602	90000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
6411	145	87	2026-05-25 14:30:40.602	2026-05-25 14:30:40.602	140000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 280000}]
6412	145	56	2026-05-25 14:30:40.602	2026-05-25 14:30:40.602	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
6413	145	92	2026-05-25 14:30:40.602	2026-05-25 14:30:40.602	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
6475	146	30	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
6476	146	22	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}, {"quantity": 1, "sellPrice": 190000}]
6477	146	9	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
6478	146	56	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
6479	146	55	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
6480	146	51	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
6481	146	41	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
6482	146	43	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
6483	146	26	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
6484	146	57	2026-05-26 14:37:31.783	2026-05-26 14:37:31.783	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
6161	143	1	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	7000.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 10000}]
6162	143	63	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 45000}]
6163	143	26	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 100000}]
6164	143	19	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
6165	143	14	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	45000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 70000}]
6166	143	43	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	9000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 15000}]
6167	143	41	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	23000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 45000}]
6168	143	36	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
6169	143	32	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
6170	143	9	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
6171	143	65	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
6172	143	35	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
6173	143	53	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	46000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 90000}]
6174	143	123	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	95000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
6175	143	56	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
6176	143	55	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
6177	143	92	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
6178	143	128	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
6179	143	96	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
6180	143	98	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
6181	143	30	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
6182	143	33	2026-05-23 15:51:26.953	2026-05-23 15:51:26.953	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
6860	150	14	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
6861	150	9	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
6862	150	57	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
6863	150	26	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
6864	150	35	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
6865	150	19	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}, {"quantity": 1, "sellPrice": 90000}]
6866	150	47	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
6867	150	1	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	7000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
6868	150	129	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
6869	150	15	2026-05-30 13:00:31.042	2026-05-30 13:00:31.042	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
7523	151	30	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
7524	151	93	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
7525	151	92	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
7526	151	57	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	57000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
7527	151	24	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
7528	151	20	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
7529	151	53	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
7530	151	47	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
7531	151	25	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
7532	151	17	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
7533	151	1	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
7534	151	68	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7535	151	64	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7536	151	65	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
7537	151	14	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
7538	151	58	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
7539	151	116	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	69000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
7540	151	48	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
7541	151	19	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	47000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 90000}]
7542	151	16	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	70000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
7543	151	18	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}, {"quantity": 1, "sellPrice": 60000}]
7544	151	26	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
7545	151	15	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
7546	151	129	2026-05-31 15:25:57.198	2026-05-31 15:25:57.198	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
8087	157	42	2026-06-07 09:56:16.642	2026-06-07 09:56:16.642	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
8088	157	1	2026-06-07 09:56:16.642	2026-06-07 09:56:16.642	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
8089	157	47	2026-06-07 09:56:16.642	2026-06-07 09:56:16.642	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7934	155	8	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
7935	155	65	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
7936	155	132	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
7937	155	1	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
7938	155	92	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
7939	155	33	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
7940	155	53	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
7941	155	64	2026-06-04 12:51:24.818	2026-06-04 12:51:24.818	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7671	152	4	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
7672	152	1	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
7673	152	47	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7674	152	30	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
7675	152	24	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
7676	152	26	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
7677	152	14	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
7678	152	7	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7679	152	41	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
7680	152	9	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
7681	152	69	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
7682	152	132	2026-06-01 14:42:16.287	2026-06-01 14:42:16.287	115000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
7877	154	51	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
7878	154	17	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
7879	154	42	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
7880	154	25	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
7881	154	68	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
7882	154	69	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
7883	154	53	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
7884	154	58	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
7885	154	55	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
7886	154	48	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
7887	154	1	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
7888	154	9	2026-06-03 14:29:49.23	2026-06-03 14:29:49.23	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
8696	161	26	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
8697	161	37	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
8698	161	62	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
8699	161	40	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
8700	161	92	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	65000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
8701	161	17	2026-06-10 14:37:25.215	2026-06-10 14:37:25.215	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
9320	163	37	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
9321	163	43	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	9000.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 15000}]
9322	163	1	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	7000.000000000000000000000000000000	[{"quantity": 11, "sellPrice": 10000}]
9323	163	96	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
9324	163	32	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	35000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
9325	163	8	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 65000}]
9326	163	17	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}, {"quantity": 1, "sellPrice": 120000}]
9327	163	33	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 260000}]
9328	163	22	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
9329	163	21	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}, {"quantity": 1, "sellPrice": 190000}]
9330	163	51	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
9331	163	9	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
9332	163	31	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
9333	163	26	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
9334	163	41	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
9335	163	30	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
9336	163	47	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
9337	163	38	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
9338	163	14	2026-06-12 14:56:22.817	2026-06-12 14:56:22.817	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
10504	166	129	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	28000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
10505	166	22	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
10506	166	58	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
10507	166	41	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
8370	160	30	2026-06-09 13:46:24.474	2026-06-09 13:46:24.474	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
8371	160	26	2026-06-09 13:46:24.474	2026-06-09 13:46:24.474	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
8372	160	41	2026-06-09 13:46:24.474	2026-06-09 13:46:24.474	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
8373	160	127	2026-06-09 13:46:24.474	2026-06-09 13:46:24.474	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
8374	160	1	2026-06-09 13:46:24.474	2026-06-09 13:46:24.474	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
10508	166	30	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
10509	166	26	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
8228	158	16	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	70000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
8229	158	125	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
8230	158	26	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
8231	158	53	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
8232	158	1	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
8233	158	41	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
8234	158	42	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
8235	158	8	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
8236	158	115	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	90000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
8237	158	100	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	140000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
8238	158	2	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
8239	158	14	2026-06-07 14:42:32.437	2026-06-07 14:42:32.437	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
8786	162	26	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
8787	162	37	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
8788	162	27	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
8789	162	69	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
8790	162	63	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
8791	162	65	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
8792	162	31	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
8793	162	15	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
8794	162	1	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
8795	162	8	2026-06-11 14:28:46.588	2026-06-11 14:28:46.588	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
13426	181	1	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
13427	181	26	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
13428	181	20	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
13429	181	15	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
13430	181	63	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
13431	181	25	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
13432	181	69	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
13433	181	135	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	27000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
13434	181	138	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
13435	181	136	2026-06-30 14:16:20.52	2026-06-30 14:16:20.52	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
19394	245	9	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19395	245	30	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 210000}, {"quantity": 1, "sellPrice": 190000}]
12242	175	57	2026-06-24 10:56:31.369	2026-06-24 10:56:31.369	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
12243	175	1	2026-06-24 10:56:31.369	2026-06-24 10:56:31.369	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
12244	175	64	2026-06-24 10:56:31.369	2026-06-24 10:56:31.369	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
19396	245	32	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	35000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
19397	245	44	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
19398	245	133	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
10894	169	26	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
10895	169	30	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}, {"quantity": 1, "sellPrice": 190000}]
10896	169	24	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}, {"quantity": 1, "sellPrice": 120000}]
10897	169	65	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
10898	169	14	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
10899	169	16	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
10900	169	1	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
10901	169	125	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	60000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
10902	169	33	2026-06-18 15:30:12.905	2026-06-18 15:30:12.905	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
10510	166	18	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
10511	166	19	2026-06-15 14:23:45.853	2026-06-15 14:23:45.853	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
11199	170	32	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
11200	170	17	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	75000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 120000}]
11201	170	1	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	7000.000000000000000000000000000000	[{"quantity": 8, "sellPrice": 10000}]
11202	170	136	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
11203	170	18	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
11204	170	57	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
11205	170	34	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
9667	164	17	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
9668	164	14	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
9669	164	1	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
9670	164	25	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
9671	164	89	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
9672	164	21	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
9673	164	5	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
9674	164	41	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
9675	164	36	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
9676	164	40	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
9677	164	19	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
9678	164	26	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
9679	164	32	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
9680	164	58	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	115000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
9681	164	43	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	9000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 15000}]
9682	164	20	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	85000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 160000}]
9683	164	55	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
9684	164	38	2026-06-13 15:12:51.424	2026-06-13 15:12:51.424	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
11206	170	21	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	110000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 190000}]
11207	170	14	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
11208	170	138	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
11209	170	47	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
11210	170	27	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
10445	165	19	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
11293	171	26	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
11294	171	43	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	9000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 15000}]
11295	171	139	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
11296	171	51	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
11297	171	138	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
11298	171	18	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
11299	171	1	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
11300	171	25	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
11301	171	37	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
11302	171	69	2026-06-20 15:15:41.477	2026-06-20 15:15:41.477	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
18783	239	14	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
18784	239	1	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
18785	239	17	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
12502	178	37	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
10446	165	41	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	23000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 40000}]
10447	165	26	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 10, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 45000}]
10448	165	125	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
10449	165	51	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
10450	165	132	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
10451	165	92	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
10452	165	1	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	7000.000000000000000000000000000000	[{"quantity": 8, "sellPrice": 10000}]
10453	165	18	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
10454	165	43	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	9000.000000000000000000000000000000	[{"quantity": 10, "sellPrice": 15000}]
10455	165	37	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
10456	165	14	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}, {"quantity": 1, "sellPrice": 80000}]
10457	165	63	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 44000}]
10458	165	33	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
10459	165	7	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
10460	165	48	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
10461	165	30	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
10462	165	21	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
10463	165	42	2026-06-14 13:33:55.845	2026-06-14 13:33:55.845	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
12503	178	26	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
12504	178	20	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
12505	178	57	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
12506	178	93	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
10679	168	26	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
10680	168	41	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
10681	168	43	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
10682	168	18	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
10683	168	1	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	7000.000000000000000000000000000000	[{"quantity": 10, "sellPrice": 10000}]
10684	168	24	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
10685	168	133	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
10686	168	47	2026-06-17 14:19:46.228	2026-06-17 14:19:46.228	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
12507	178	51	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
12508	178	139	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
12509	178	22	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 210000}]
12510	178	30	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
12511	178	68	2026-06-27 14:39:37.149	2026-06-27 14:39:37.149	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
18786	239	15	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
18787	239	19	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
18788	239	18	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18789	239	161	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18790	239	129	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14307	221	136	2026-07-09 12:36:52.177	2026-07-09 12:36:52.177	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
14308	221	30	2026-07-09 12:36:52.177	2026-07-09 12:36:52.177	100000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 190000}]
14309	221	41	2026-07-09 12:36:52.177	2026-07-09 12:36:52.177	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
14310	221	149	2026-07-09 12:36:52.177	2026-07-09 12:36:52.177	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
14311	221	22	2026-07-09 12:36:52.177	2026-07-09 12:36:52.177	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
11211	170	93	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
11212	170	20	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
11213	170	36	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
11214	170	26	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
11215	170	35	2026-06-19 14:05:18.42	2026-06-19 14:05:18.42	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
17223	229	43	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	9000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 15000}]
17224	229	41	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	23000.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 45000}, {"quantity": 1, "sellPrice": 40000}]
17225	229	136	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
17226	229	30	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
17227	229	21	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
17228	229	93	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
17229	229	24	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
12228	174	26	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 50000}]
12229	174	16	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
12230	174	1	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	7000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
12231	174	139	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
12232	174	30	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
12233	174	138	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
12234	174	7	2026-06-23 14:20:31.485	2026-06-23 14:20:31.485	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
17230	229	146	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	60000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
13530	214	1	2026-07-02 14:46:44.583	2026-07-02 14:46:44.583	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
13531	214	8	2026-07-02 14:46:44.583	2026-07-02 14:46:44.583	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
13532	214	14	2026-07-02 14:46:44.583	2026-07-02 14:46:44.583	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
11904	172	59	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
11905	172	26	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 50000}]
11906	172	5	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
11907	172	133	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
11908	172	140	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
11909	172	51	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
11910	172	47	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
11911	172	9	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}, {"quantity": 1, "sellPrice": 10000}]
11912	172	65	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}, {"quantity": 2, "sellPrice": 120000}]
11913	172	33	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}, {"quantity": 1, "sellPrice": 260000}]
11914	172	57	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
11915	172	24	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
11916	172	132	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
11917	172	15	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	60000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}, {"quantity": 1, "sellPrice": 90000}]
11918	172	53	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}, {"quantity": 1, "sellPrice": 90000}]
11919	172	64	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
11920	172	32	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	35000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
11921	172	22	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
11922	172	1	2026-06-21 14:29:33.459	2026-06-21 14:29:33.459	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
12128	173	14	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}, {"quantity": 1, "sellPrice": 70000}]
12129	173	26	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
12130	173	1	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
12131	173	48	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
12132	173	31	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}, {"quantity": 1, "sellPrice": 50000}]
12133	173	18	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
12134	173	30	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
12135	173	93	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
12136	173	126	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
12137	173	9	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
12138	173	91	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
12139	173	25	2026-06-22 15:22:24.833	2026-06-22 15:22:24.833	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
17231	229	40	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
17232	229	26	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
17233	229	92	2026-07-17 15:03:18.315	2026-07-17 15:03:18.315	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
19399	245	26	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
19400	245	148	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
19401	245	136	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
19402	245	14	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
19403	245	68	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
13242	180	43	2026-06-29 11:23:27.525	2026-06-29 11:23:27.525	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
16442	225	26	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}, {"quantity": 6, "sellPrice": 50000}]
14274	220	126	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
14275	220	18	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14276	220	147	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	86000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
14277	220	1	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
14278	220	89	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
14279	220	20	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
14280	220	69	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
14281	220	24	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 125000}]
14282	220	32	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
14283	220	11	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 5000}]
14284	220	19	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14285	220	26	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
14286	220	25	2026-07-08 14:05:36.139	2026-07-08 14:05:36.139	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
16443	225	15	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
16444	225	56	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16445	225	63	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
16446	225	33	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
13552	215	4	2026-07-03 12:46:27.796	2026-07-03 12:46:27.796	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
13553	215	17	2026-07-03 12:46:27.796	2026-07-03 12:46:27.796	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
13554	215	1	2026-07-03 12:46:27.796	2026-07-03 12:46:27.796	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
13555	215	89	2026-07-03 12:46:27.796	2026-07-03 12:46:27.796	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
12414	177	64	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
12415	177	16	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
12416	177	14	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
12417	177	126	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
12418	177	22	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
12419	177	21	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
12420	177	15	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
12421	177	57	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	57000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
12422	177	138	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
12423	177	51	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
12424	177	9	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
12425	177	1	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
12426	177	92	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
12427	177	26	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
12428	177	7	2026-06-26 15:00:39.524	2026-06-26 15:00:39.524	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
13556	215	18	2026-07-03 12:46:27.796	2026-07-03 12:46:27.796	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
16447	225	129	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
16448	225	43	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
16449	225	41	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
16450	225	38	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
16451	225	37	2026-07-13 14:51:02.37	2026-07-13 14:51:02.37	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
17058	228	14	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	40000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 70000}]
17059	228	30	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
17060	228	149	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
17061	228	25	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
17062	228	21	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
17063	228	26	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
17064	228	48	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	7500.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
17065	228	1	2026-07-16 14:30:19.386	2026-07-16 14:30:19.386	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
13219	179	30	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
13220	179	18	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
13221	179	142	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30}]
13222	179	143	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
13223	179	38	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 170000}]
13224	179	26	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 11, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 40000}]
13225	179	12	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 10, "sellPrice": 3000}]
13226	179	36	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
13227	179	144	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	40000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 100000}]
13228	179	69	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
13229	179	41	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	23000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 45000}]
13230	179	35	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
13231	179	129	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
13232	179	27	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
13233	179	57	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
13234	179	133	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
13235	179	47	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}, {"quantity": 1, "sellPrice": 50000}]
13236	179	43	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
13237	179	32	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	35000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
13238	179	5	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
13239	179	139	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
13240	179	93	2026-06-28 13:38:50.355	2026-06-28 13:38:50.355	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
14001	217	63	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
14002	217	64	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
14003	217	118	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	69000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
14004	217	78	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	140000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 280000}]
14005	217	40	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14006	217	32	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 2, "sellPrice": 130000}]
14007	217	17	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
14008	217	1	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
14009	217	26	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 50000}]
14010	217	9	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
14011	217	42	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 40000}]
14012	217	5	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14013	217	25	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
14014	217	148	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
14015	217	38	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
14016	217	41	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
13514	213	17	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
13515	213	1	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
13516	213	14	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	45000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 70000}]
13517	213	24	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
13518	213	9	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
13519	213	136	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
13520	213	144	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
13521	213	15	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
13522	213	139	2026-07-01 14:09:46.004	2026-07-01 14:09:46.004	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14017	217	108	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	210000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 210000}]
14018	217	138	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14019	217	33	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
13628	216	26	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
13629	216	1	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
13630	216	30	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
13631	216	136	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
13632	216	138	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
13633	216	57	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
13634	216	18	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
13635	216	21	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
13636	216	41	2026-07-04 15:17:42.376	2026-07-04 15:17:42.376	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
14020	217	139	2026-07-05 15:14:20.685	2026-07-05 15:14:20.685	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
16632	226	30	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
16633	226	59	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30000}]
16634	226	154	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
16635	226	1	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	7000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
16636	226	146	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
16637	226	43	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
16638	226	20	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16639	226	42	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 35000}]
16640	226	92	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
16641	226	149	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16642	226	14	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}, {"quantity": 1, "sellPrice": 60000}]
16643	226	64	2026-07-14 14:30:38.687	2026-07-14 14:30:38.687	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
18113	232	133	2026-07-20 15:49:39.218	2026-07-20 15:49:39.218	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
18114	232	1	2026-07-20 15:49:39.218	2026-07-20 15:49:39.218	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
18115	232	20	2026-07-20 15:49:39.218	2026-07-20 15:49:39.218	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
19404	245	159	2026-08-02 13:14:10.388	2026-08-02 13:14:10.388	29000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
20074	252	1	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
20075	252	93	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}, {"quantity": 1, "sellPrice": 140000}]
18791	239	26	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18792	239	185	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	125000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
18793	239	125	2026-07-27 13:40:43.003	2026-07-27 13:40:43.003	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
17347	230	47	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
17348	230	30	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
17349	230	41	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
17350	230	43	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	9000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 15000}]
17351	230	68	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
14137	218	17	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	75000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 120000}]
14138	218	1	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	7000.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 10000}]
14139	218	14	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14140	218	26	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
14141	218	32	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
14142	218	126	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
14143	218	18	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}, {"quantity": 1, "sellPrice": 60000}]
14144	218	64	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
14145	218	42	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 40000}]
14146	218	138	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14147	218	139	2026-07-06 14:00:05.031	2026-07-06 14:00:05.031	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14148	219	19	2026-07-07 13:09:08.071	2026-07-07 13:09:08.071	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14620	222	149	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	36000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
14621	222	21	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
14622	222	19	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	47000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
14623	222	138	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14624	222	14	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
14625	222	15	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
14626	222	1	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	7000.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 10000}]
14627	222	63	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
14628	222	93	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
14629	222	97	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
14630	222	103	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	125000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
14631	222	89	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	28000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
14632	222	59	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 30000}]
14633	222	133	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
14634	222	150	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
14635	222	145	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	94000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
14636	222	40	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
14637	222	26	2026-07-10 14:31:08.91	2026-07-10 14:31:08.91	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
20076	252	26	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
20077	252	53	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
20078	252	159	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	29000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
20079	252	8	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
20080	252	139	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
20081	252	191	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	19000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
20082	252	192	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	43000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
18171	233	139	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	33000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
18172	233	24	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
18173	233	9	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
18174	233	1	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
18175	233	26	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
18176	233	15	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
16986	227	26	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 60000}]
16987	227	43	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
16988	227	41	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
16989	227	89	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
16990	227	93	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16991	227	149	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}, {"quantity": 1, "sellPrice": 130000}, {"quantity": 1, "sellPrice": 120000}]
16992	227	30	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
16993	227	51	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
16994	227	37	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16995	227	5	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
16996	227	136	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
16997	227	57	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
16998	227	24	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
16999	227	15	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
17000	227	21	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
17352	230	19	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
17353	230	26	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	0.000000000000000000000000000000	[{"quantity": 8, "sellPrice": 60000}, {"quantity": 4, "sellPrice": 50000}]
17354	230	133	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
17355	230	157	2026-07-18 15:05:55.442	2026-07-18 15:05:55.442	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
15289	223	69	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
15290	223	20	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	85000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
15291	223	5	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
15292	223	30	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
15293	223	47	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
15294	223	26	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
15295	223	149	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
15296	223	32	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
15297	223	18	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
15298	223	120	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	69000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
15299	223	101	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
15300	223	15	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
15301	223	152	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	19000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
15302	223	151	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	150000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 295000}]
15303	223	37	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
15304	223	41	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	23000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 45000}]
15305	223	43	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}, {"quantity": 2, "sellPrice": 10000}]
15306	223	35	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
15307	223	14	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
15308	223	17	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
15309	223	90	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	90.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
15310	223	57	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
15311	223	141	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
15312	223	38	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
15313	223	129	2026-07-11 14:53:00.791	2026-07-11 14:53:00.791	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
20083	252	149	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}, {"quantity": 1, "sellPrice": 120000}]
20084	252	144	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
20085	252	157	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
20086	252	63	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
20087	252	32	2026-08-09 13:15:38.798	2026-08-09 13:15:38.798	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18177	233	33	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
18178	233	18	2026-07-21 14:34:08.701	2026-07-21 14:34:08.701	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18491	237	47	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
18492	237	1	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
18493	237	94	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
18494	237	144	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18495	237	138	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
18496	237	24	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	75000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
17001	227	1	2026-07-15 13:07:52.346	2026-07-15 13:07:52.346	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
18497	237	40	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
16310	224	107	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	69000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
16311	224	21	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
16312	224	1	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	7000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
16313	224	145	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	94000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
16314	224	24	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
16315	224	149	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}, {"quantity": 1, "sellPrice": 120000}]
16316	224	18	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
16317	224	93	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16318	224	32	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
16319	224	9	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
16320	224	15	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
16321	224	19	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	47000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
16322	224	48	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	7500.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30000}]
16323	224	30	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
16324	224	146	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	60000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
16325	224	43	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	9000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 15000}]
16326	224	41	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	23000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 45000}]
16327	224	33	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 280000}]
16328	224	22	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
16329	224	37	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 170000}]
16330	224	55	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
16331	224	57	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	57000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
16332	224	26	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	0.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 60000}]
16333	224	129	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
16334	224	42	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	0.000000000000000000000000000000	[{"quantity": 10, "sellPrice": 40000}]
16335	224	7	2026-07-12 15:46:28.485	2026-07-12 15:46:28.485	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
18208	234	69	2026-07-22 12:15:40.931	2026-07-22 12:15:40.931	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 20000}]
18209	234	153	2026-07-22 12:15:40.931	2026-07-22 12:15:40.931	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18210	234	26	2026-07-22 12:15:40.931	2026-07-22 12:15:40.931	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18211	234	51	2026-07-22 12:15:40.931	2026-07-22 12:15:40.931	37000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
18212	234	9	2026-07-22 12:15:40.931	2026-07-22 12:15:40.931	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
18213	234	1	2026-07-22 12:15:40.931	2026-07-22 12:15:40.931	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
18347	236	14	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
18348	236	161	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}, {"quantity": 1, "sellPrice": 90000}]
18349	236	30	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
18350	236	51	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
18351	236	65	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18352	236	43	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
18353	236	26	2026-07-24 14:22:57.882	2026-07-24 14:22:57.882	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
18498	237	41	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
18499	237	20	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
18500	237	64	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
18501	237	147	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	86000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
18502	237	56	2026-07-25 14:58:35.584	2026-07-25 14:58:35.584	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
18294	235	15	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	45000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 90000}]
18295	235	153	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	55000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
18296	235	19	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
18297	235	14	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
18298	235	18	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
18299	235	1	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	7000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 10000}]
18300	235	26	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18301	235	20	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
18302	235	136	2026-07-23 13:40:05.097	2026-07-23 13:40:05.097	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
19542	247	17	2026-08-04 11:10:25.761	2026-08-04 11:10:25.761	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
19572	249	22	2026-08-06 12:21:29.654	2026-08-06 12:21:29.654	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
19573	249	136	2026-08-06 12:21:29.654	2026-08-06 12:21:29.654	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
19574	249	149	2026-08-06 12:21:29.654	2026-08-06 12:21:29.654	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
19575	249	14	2026-08-06 12:21:29.654	2026-08-06 12:21:29.654	30000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
19576	249	8	2026-08-06 12:21:29.654	2026-08-06 12:21:29.654	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
19577	249	1	2026-08-06 12:21:29.654	2026-08-06 12:21:29.654	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
18919	241	18	2026-07-29 14:29:13.865	2026-07-29 14:29:13.865	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18920	241	53	2026-07-29 14:29:13.865	2026-07-29 14:29:13.865	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
18921	241	15	2026-07-29 14:29:13.865	2026-07-29 14:29:13.865	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
18922	241	47	2026-07-29 14:29:13.865	2026-07-29 14:29:13.865	25000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
18923	241	32	2026-07-29 14:29:13.865	2026-07-29 14:29:13.865	35000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
18924	241	144	2026-07-29 14:29:13.865	2026-07-29 14:29:13.865	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18087	231	17	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18088	231	32	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	35000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
18089	231	43	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	9000.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 15000}]
18090	231	26	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	0.000000000000000000000000000000	[{"quantity": 7, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 50000}]
18091	231	126	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18092	231	147	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	86000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
18093	231	63	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
18094	231	19	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
18095	231	41	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
18096	231	33	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
18097	231	18	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
18098	231	149	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}, {"quantity": 1, "sellPrice": 120000}]
18099	231	92	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}, {"quantity": 1, "sellPrice": 120000}]
18100	231	158	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
18101	231	59	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 30000}]
18102	231	93	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
18103	231	153	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18104	231	53	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
18105	231	57	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	57000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
18106	231	36	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
18107	231	132	2026-07-19 14:44:21.914	2026-07-19 14:44:21.914	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
18869	240	17	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18870	240	24	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18871	240	44	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
18872	240	30	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
18873	240	5	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 80000}]
18874	240	53	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	46000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 90000}]
18875	240	1	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
18876	240	89	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18877	240	33	2026-07-28 14:42:35.17	2026-07-28 14:42:35.17	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
18649	238	20	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
18650	238	32	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 2, "sellPrice": 130000}]
18651	238	159	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	29000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18652	238	136	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
18653	238	26	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
18654	238	16	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	63000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18655	238	48	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	7500.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
18656	238	51	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
18657	238	24	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
18658	238	132	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
18659	238	129	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
18660	238	56	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
18661	238	30	2026-07-26 13:59:33.102	2026-07-26 13:59:33.102	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
19201	242	149	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
19202	242	51	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
19203	242	17	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
19204	242	1	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19205	242	14	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
19206	242	9	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19207	242	135	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	27000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
19208	242	157	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
19209	242	30	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
19210	242	154	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
19211	242	43	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}, {"quantity": 3, "sellPrice": 15000}]
19212	242	189	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	51000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
19213	242	147	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	86000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
19214	242	160	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	71000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}, {"quantity": 3, "sellPrice": 99000}]
19215	242	190	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	59000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
19216	242	41	2026-07-30 15:11:45.551	2026-07-30 15:11:45.551	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
19225	243	21	2026-07-31 13:44:45.993	2026-07-31 13:44:45.993	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 180000}]
19226	243	139	2026-07-31 13:44:45.993	2026-07-31 13:44:45.993	33000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
19227	243	14	2026-07-31 13:44:45.993	2026-07-31 13:44:45.993	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
19283	244	22	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 210000}]
19284	244	149	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
19285	244	26	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
19286	244	25	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
19287	244	32	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
19288	244	43	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19289	244	90	2026-08-01 16:07:47.994	2026-08-01 16:07:47.994	90000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
22827	262	164	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	125000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
22828	262	193	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	30000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
22829	262	136	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
22830	262	8	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
22831	262	24	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
22832	262	32	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}, {"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}, {"quantity": 1, "sellPrice": 110000}]
22833	262	1	2026-08-19 14:01:53.552	2026-08-19 14:01:53.552	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
22272	258	33	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
22273	258	32	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
22274	258	55	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	110000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
19530	246	189	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	51000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}, {"quantity": 1, "sellPrice": 110000}]
19531	246	92	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
19532	246	57	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	57000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
19533	246	17	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
19534	246	1	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19535	246	26	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
19536	246	96	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
19537	246	138	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
19538	246	42	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 35000}]
19539	246	7	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
19540	246	14	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
19541	246	20	2026-08-03 15:02:44.48	2026-08-03 15:02:44.48	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
19548	248	26	2026-08-05 13:58:07.726	2026-08-05 13:58:07.726	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
19549	248	1	2026-08-05 13:58:07.726	2026-08-05 13:58:07.726	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
19550	248	168	2026-08-05 13:58:07.726	2026-08-05 13:58:07.726	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 270000}]
19846	250	20	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
19847	250	9	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19848	250	133	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
19849	250	96	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
19850	250	42	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 35000}]
19851	250	159	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	29000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
19852	250	53	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
19853	250	68	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
19854	250	1	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
19855	250	19	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
19856	250	41	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	23000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 40000}]
19857	250	63	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
19858	250	26	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
19859	250	33	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
19860	250	30	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	100000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 190000}]
19861	250	166	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	135000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 280000}]
19862	250	86	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	140000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 280000}]
19863	250	126	2026-08-07 15:32:32.651	2026-08-07 15:32:32.651	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
19901	251	22	2026-08-08 12:48:08.278	2026-08-08 12:48:08.278	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
19902	251	41	2026-08-08 12:48:08.278	2026-08-08 12:48:08.278	23000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 45000}]
19903	251	63	2026-08-08 12:48:08.278	2026-08-08 12:48:08.278	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
19904	251	159	2026-08-08 12:48:08.278	2026-08-08 12:48:08.278	29000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
19905	251	43	2026-08-08 12:48:08.278	2026-08-08 12:48:08.278	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 11000}]
19906	251	3	2026-08-08 12:48:08.278	2026-08-08 12:48:08.278	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
20165	253	21	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
20166	253	20	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
20167	253	63	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
20168	253	192	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	43000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
20169	253	30	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
20170	253	19	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
20171	253	58	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
20172	253	26	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
20173	253	157	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
20174	253	94	2026-08-10 15:20:17.463	2026-08-10 15:20:17.463	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
23714	268	48	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	7500.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
23715	268	32	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
23716	268	133	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	20000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
23717	268	69	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	11000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 20000}]
23718	268	22	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	145000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 210000}]
23719	268	30	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
23720	268	192	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	43000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
23721	268	149	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}, {"quantity": 1, "sellPrice": 110000}]
23722	268	92	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
23723	268	3	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
23724	268	57	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	56000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
23725	268	25	2026-08-25 15:10:25.704	2026-08-25 15:10:25.704	40000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
21010	255	174	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	150000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 295000}]
21011	255	26	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	0.000000000000000000000000000000	[{"quantity": 9, "sellPrice": 60000}, {"quantity": 1, "sellPrice": 50000}]
21012	255	14	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	30000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
21013	255	32	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	35000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 130000}]
21014	255	33	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
21015	255	149	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
21016	255	23	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
21017	255	64	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
21018	255	137	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
21019	255	15	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	45000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
21020	255	1	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
21021	255	41	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}, {"quantity": 1, "sellPrice": 50000}]
21022	255	43	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
21023	255	190	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	59000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
21024	255	96	2026-08-12 14:28:55.597	2026-08-12 14:28:55.597	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
22945	264	30	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
22946	264	47	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
22947	264	93	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
22948	264	26	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
22949	264	21	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
22950	264	22	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 230000}]
22951	264	192	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	43000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
22952	264	19	2026-08-21 14:40:17.028	2026-08-21 14:40:17.028	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
23172	265	5	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
23173	265	144	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
23174	265	41	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
23175	265	96	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 110000}]
23176	265	26	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
23177	265	1	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	7000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 10000}]
23178	265	21	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	110000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 200000}]
23179	265	19	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
23180	265	36	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30000}]
23181	265	30	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
23182	265	42	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 40000}]
23183	265	190	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	59000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
23184	265	15	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
23185	265	136	2026-08-22 14:13:27.391	2026-08-22 14:13:27.391	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
20703	254	30	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
20704	254	32	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	35000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 130000}]
20705	254	26	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	0.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 60000}]
20706	254	37	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
20707	254	149	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 130000}]
20708	254	20	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
20709	254	137	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
20710	254	1	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	7000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 10000}]
20711	254	41	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
20712	254	36	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 50000}]
20713	254	43	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	9000.000000000000000000000000000000	[{"quantity": 6, "sellPrice": 15000}]
20714	254	19	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	36000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
20715	254	17	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
20716	254	14	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	30000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
20717	254	129	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
20718	254	132	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	115000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
20719	254	44	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 140000}]
20720	254	22	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
20721	254	154	2026-08-11 14:50:50.489	2026-08-11 14:50:50.489	55000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
22556	259	186	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	120000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 250000}]
22557	259	18	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
22558	259	192	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	43000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 160000}]
22559	259	2	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
22560	259	157	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 220000}, {"quantity": 1, "sellPrice": 230000}]
22561	259	9	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
22562	259	26	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}, {"quantity": 3, "sellPrice": 50000}]
22563	259	14	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	30000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
22564	259	20	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	65000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
22565	259	47	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
22566	259	34	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
22567	259	8	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
22568	259	102	2026-08-16 15:28:55.317	2026-08-16 15:28:55.317	135000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 280000}]
22577	260	1	2026-08-17 14:26:08.016	2026-08-17 14:26:08.016	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
22578	260	14	2026-08-17 14:26:08.016	2026-08-17 14:26:08.016	30000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
22579	260	19	2026-08-17 14:26:08.016	2026-08-17 14:26:08.016	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
22580	260	30	2026-08-17 14:26:08.016	2026-08-17 14:26:08.016	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
22874	263	63	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
22875	263	1	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	7000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
22876	263	41	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	23000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
22877	263	43	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
22878	263	51	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
22879	263	53	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
22880	263	26	2026-08-20 14:17:39.366	2026-08-20 14:17:39.366	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
21628	256	43	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
21629	256	14	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	30000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
21630	256	5	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
21631	256	48	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	7500.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
21632	256	89	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
21633	256	21	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
21634	256	42	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 35000}]
21635	256	41	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	23000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 45000}, {"quantity": 1, "sellPrice": 40000}]
21636	256	26	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 60000}]
21637	256	32	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	35000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 130000}]
21638	256	30	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 190000}]
21639	256	20	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	65000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 160000}]
21640	256	147	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	86000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
21641	256	56	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	100000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
21642	256	190	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	59000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
21643	256	40	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
21644	256	192	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	43000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
21645	256	159	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	29000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
21646	256	160	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	71000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 220000}]
21647	256	136	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
21648	256	96	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
21649	256	1	2026-08-13 14:54:44.975	2026-08-13 14:54:44.975	7000.000000000000000000000000000000	[{"quantity": 5, "sellPrice": 10000}]
22262	258	47	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	25000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 50000}]
22263	258	30	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}, {"quantity": 1, "sellPrice": 210000}]
22264	258	63	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
22265	258	136	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}, {"quantity": 1, "sellPrice": 50000}]
22266	258	132	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
22267	258	192	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	43000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 160000}]
22268	258	51	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
22269	258	48	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	7500.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 15000}]
22270	258	144	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	40000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 100000}]
22271	258	41	2026-08-15 14:04:30.997	2026-08-15 14:04:30.997	23000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 45000}]
22740	261	1	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}, {"quantity": 2, "sellPrice": 15000}]
22741	261	21	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	110000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
22742	261	42	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 30000}, {"quantity": 2, "sellPrice": 35000}]
22743	261	136	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
22744	261	16	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	63000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
22745	261	17	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
22746	261	53	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	46000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 90000}]
22747	261	19	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
22748	261	5	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
22749	261	30	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
22750	261	32	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
22751	261	138	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	22000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 90000}]
22752	261	26	2026-08-18 13:58:16.482	2026-08-18 13:58:16.482	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
22088	257	30	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	102000.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 200000}]
22089	257	21	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	110000.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 200000}]
22090	257	149	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
22091	257	24	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	75000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 130000}]
22092	257	192	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	43000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 150000}]
22093	257	53	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
22094	257	129	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	28000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
22095	257	136	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	20000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
22096	257	177	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	130000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 270000}]
22097	257	43	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 16000}]
22098	257	17	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
22099	257	14	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	30000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 70000}]
22100	257	33	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	105000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 260000}, {"quantity": 4, "sellPrice": 250000}]
22101	257	38	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 180000}]
22102	257	26	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 60000}]
22103	257	16	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	63000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
22104	257	65	2026-08-14 14:18:45.923	2026-08-14 14:18:45.923	70000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
23402	266	22	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	145000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 230000}]
23403	266	141	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 100000}]
23404	266	15	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	45000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
23405	266	33	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	105000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 260000}]
23406	266	48	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	7500.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
23407	266	172	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	90000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
23408	266	193	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	30000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
23409	266	16	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	63000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}]
23410	266	1	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
23411	266	43	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	9000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 15000}]
23412	266	32	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	35000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 120000}, {"quantity": 1, "sellPrice": 130000}]
23413	266	65	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	70000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 120000}]
23414	266	53	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	46000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
23415	266	63	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 45000}]
23416	266	7	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 40000}]
23417	266	148	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	0.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 250000}]
23418	266	26	2026-08-23 13:04:56.289	2026-08-23 13:04:56.289	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
23728	269	1	2026-08-26 12:57:00.023	2026-08-26 12:57:00.023	7000.000000000000000000000000000000	[{"quantity": 2, "sellPrice": 10000}]
23729	269	51	2026-08-26 12:57:00.023	2026-08-26 12:57:00.023	37000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
23535	267	138	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	22000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
23536	267	14	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	30000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 70000}]
23537	267	35	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 80000}]
23538	267	26	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	0.000000000000000000000000000000	[{"quantity": 3, "sellPrice": 60000}]
23539	267	43	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	9000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 10000}]
23540	267	18	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	0.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 50000}]
23541	267	192	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	43000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 150000}]
23542	267	30	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	102000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 200000}]
23543	267	19	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	36000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 90000}]
23544	267	8	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	38000.000000000000000000000000000000	[{"quantity": 1, "sellPrice": 60000}]
23545	267	63	2026-08-24 13:51:17.418	2026-08-24 13:51:17.418	0.000000000000000000000000000000	[{"quantity": 4, "sellPrice": 45000}]
\.


--
-- Data for Name: daily_sold_product_contribution; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_sold_product_contribution (id, "dailyFinanceId", "dailySoldProductId", "orderId", "orderItemId", "productId", "variantId", quantity, "sellPrice", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: discount_redemption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discount_redemption (id, "couponId", "orderId", "codeSnapshot", "discountTypeSnapshot", "discountValueSnapshot", "discountAmount", "subtotalSnapshot", "redeemedAt") FROM stdin;
\.


--
-- Data for Name: excluded_coupon_category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.excluded_coupon_category (id, "couponId", "categoryId") FROM stdin;
\.


--
-- Data for Name: excluded_coupon_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.excluded_coupon_product (id, "couponId", "productId") FROM stdin;
\.


--
-- Data for Name: homepage_banner; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homepage_banner (id, title, subtitle, "imageUrl", "desktopImage", "mobileImage", "imagePublicId", "linkUrl", placement, "position", "isActive", "startsAt", "endsAt", "createdAt", "updatedAt", "internalName", eyebrow, description, "mobileImagePublicId", "imageAlt", "primaryCtaLabel", "primaryCtaUrl", "secondaryCtaLabel", "secondaryCtaUrl", "textAlignment", "textTheme", "overlayOpacity", "createdById", "updatedById") FROM stdin;
\.


--
-- Data for Name: homepage_featured_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homepage_featured_product (id, "productId", title, "position", "isActive", "startsAt", "endsAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: homepage_section; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homepage_section (id, title, subtitle, type, "position", "isActive", config, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: homepage_section_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homepage_section_product (id, "sectionId", "productId", "position") FROM stdin;
\.


--
-- Data for Name: inventory_transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transaction (id, "variantId", type, quantity, "balanceAfter", "referenceType", "referenceId", note, "unitImportPrice", "unitSellPrice", "warehouseId", "createdAt", "productId") FROM stdin;
1	\N	SALE	2	56	ORDER	1	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 10:56:16.43	14
2	\N	SALE	1	20	ORDER	1	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 10:56:16.462	51
3	\N	SALE	1	49	ORDER	1	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 10:56:16.489	47
4	\N	SALE	1	18	ORDER	2	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 11:50:53.981	30
5	\N	SALE	1	49	ORDER	2	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 11:50:54.012	42
6	\N	SALE	1	43	ORDER	2	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 11:50:54.041	25
7	\N	SALE	1	4	ORDER	3	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 11:58:06.121	8
8	\N	SALE	2	47	ORDER	4	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 12:26:35.641	47
9	\N	SALE	1	55	ORDER	5	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-27 12:48:14.078	14
10	\N	SALE	1	95	ORDER	6	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 08:20:23.564	32
11	\N	SALE	1	31	ORDER	7	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 08:30:16.537	214
12	\N	RETURN	1	96	ORDER	6	Hoàn tồn kho đơn tại shop	\N	\N	\N	2026-08-28 08:30:23.841	32
13	\N	SALE	1	54	ORDER	8	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 08:43:04.491	14
14	\N	SALE	1	78	ORDER	8	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 08:43:04.519	18
15	\N	SALE	1	2	ORDER	9	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 10:08:35.853	89
16	\N	SALE	1	2	ORDER	9	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 10:08:35.881	34
17	\N	SALE	1	40	ORDER	9	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 10:08:35.908	17
18	\N	SALE	1	87	ORDER	10	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 10:11:09.695	192
19	\N	SALE	1	47	ORDER	11	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 10:23:03.005	141
20	\N	SALE	2	20	ORDER	12	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 12:20:23.565	44
21	\N	SALE	2	12	ORDER	12	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 12:20:23.595	63
22	\N	SALE	1	14	ORDER	12	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 12:20:23.623	7
23	\N	SALE	1	38	ORDER	13	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 12:51:31.939	33
24	\N	SALE	1	4	ORDER	14	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 13:42:50.038	132
25	\N	SALE	1	78	ORDER	14	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 13:42:50.066	26
26	\N	SALE	1	89	ORDER	14	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 13:42:50.093	32
27	\N	SALE	2	196	ORDER	14	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 13:42:50.122	43
28	\N	SALE	1	46	ORDER	15	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-28 14:08:27.083	47
29	\N	SALE	1	45	ORDER	16	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 06:50:00.327	47
30	\N	SALE	1	0	ORDER	17	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 11:10:26.782	169
31	\N	SALE	1	1	ORDER	17	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 11:10:26.811	200
32	\N	SALE	1	8	ORDER	18	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 11:36:23.987	1
33	\N	SALE	2	83	ORDER	18	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 11:36:24.013	41
34	\N	SALE	2	29	ORDER	19	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 13:57:10.521	21
35	\N	SALE	1	20	ORDER	19	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-29 13:57:10.549	149
36	\N	SALE	2	10	ORDER	20	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-31 12:11:21.621	63
37	\N	SALE	1	0	ORDER	21	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-31 13:14:21.739	204
38	\N	SALE	1	1	ORDER	21	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-08-31 13:14:21.768	213
39	\N	SALE	1	10	ORDER	22	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:12:14.577	22
40	\N	SALE	2	6	ORDER	22	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:12:14.617	1
41	\N	SALE	1	19	ORDER	23	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:13:34.034	149
42	\N	SALE	3	7	ORDER	23	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:13:34.063	63
43	\N	SALE	1	86	ORDER	23	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:13:34.091	192
44	\N	SALE	1	13	ORDER	23	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:13:34.12	57
45	\N	SALE	1	20	ORDER	24	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:14:04.346	64
46	\N	SALE	1	44	ORDER	24	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 10:14:04.373	47
47	\N	SALE	1	12	ORDER	25	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-01 12:41:50.807	57
48	\N	SALE	1	1	ORDER	26	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 09:52:25.417	34
49	\N	SALE	1	20	ORDER	27	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 10:08:31.741	133
50	\N	SALE	1	43	ORDER	28	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 10:17:46.478	47
51	\N	SALE	1	42	ORDER	29	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 10:33:03.586	47
52	\N	SALE	1	42	ORDER	29	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 10:33:03.616	25
53	\N	SALE	2	13	ORDER	30	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 11:21:27.871	16
54	\N	SALE	1	39	ORDER	30	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 11:21:27.898	17
55	\N	SALE	3	3	ORDER	30	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 11:21:27.926	1
56	\N	SALE	1	18	ORDER	30	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 11:21:27.953	139
57	\N	SALE	1	53	ORDER	31	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-02 12:39:37.801	14
58	\N	SALE	1	5	ORDER	32	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 09:34:47.184	194
59	\N	SALE	1	77	ORDER	32	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 09:34:47.21	26
60	\N	SALE	1	3	ORDER	32	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 09:34:47.237	37
61	\N	SALE	1	11	ORDER	33	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 10:16:10.257	57
62	\N	SALE	1	48	ORDER	33	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 10:16:10.286	42
63	\N	SALE	1	38	ORDER	34	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 10:20:34.961	17
64	\N	SALE	2	1	ORDER	34	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 10:20:34.996	1
65	\N	SALE	1	88	ORDER	35	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 10:22:09.09	144
66	\N	SALE	1	195	ORDER	36	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 11:12:13.448	43
67	\N	SALE	1	37	ORDER	37	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 14:12:00.563	30
68	\N	SALE	2	46	ORDER	37	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 14:12:00.597	42
69	\N	SALE	1	52	ORDER	38	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 14:18:29.445	14
70	\N	SALE	1	51	ORDER	39	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-03 14:25:42.774	14
71	\N	SALE	2	5	ORDER	40	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 04:43:07.313	63
72	\N	SALE	1	50	ORDER	41	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 07:46:09.854	14
73	\N	SALE	2	41	ORDER	42	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 08:48:16.48	157
74	\N	SALE	1	18	ORDER	42	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 08:48:16.508	149
75	\N	SALE	1	19	ORDER	42	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 08:48:16.536	51
76	\N	SALE	1	36	ORDER	43	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 08:55:31.391	53
77	\N	SALE	2	48	ORDER	43	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 08:55:31.417	14
78	\N	SALE	1	47	ORDER	44	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 11:25:28.517	14
79	\N	SALE	2	2	ORDER	45	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 11:40:44.165	132
80	\N	SALE	2	5	ORDER	46	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-04 12:48:41.202	54
81	\N	SALE	2	45	ORDER	47	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-05 03:53:51.718	14
82	\N	SALE	1	18	ORDER	48	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-05 11:03:24.798	51
83	\N	RETURN	2	4	ORDER	45	Hoàn tồn kho đơn tại shop	\N	\N	\N	2026-09-05 11:36:58.309	132
84	\N	SALE	2	0	ORDER	45	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-05 11:36:58.341	24
85	\N	SALE	1	7	ORDER	49	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 02:13:43.406	6
86	\N	SALE	2	43	ORDER	50	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 03:04:02.072	14
87	\N	SALE	1	3	ORDER	51	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 06:14:13.555	132
88	\N	SALE	1	0	ORDER	52	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 13:54:29.1	73
89	\N	SALE	1	1	ORDER	52	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 13:54:29.131	211
90	\N	SALE	1	17	ORDER	52	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 13:54:29.159	51
91	\N	SALE	1	6	ORDER	53	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-06 17:12:43.665	6
92	\N	SALE	1	7	ORDER	54	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 03:40:54.059	40
93	\N	SALE	1	35	ORDER	55	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 10:31:47.357	53
94	\N	SALE	1	42	ORDER	55	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 10:31:47.383	14
95	\N	SALE	1	12	ORDER	56	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 10:41:07.536	16
96	\N	SALE	1	41	ORDER	57	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 11:14:09.717	14
97	\N	SALE	2	98	ORDER	57	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 11:14:09.745	1
98	\N	SALE	2	49	ORDER	57	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 11:14:09.773	9
99	\N	SALE	1	4	ORDER	57	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 11:14:09.8	194
100	\N	SALE	1	76	ORDER	58	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 12:54:42.553	26
101	\N	SALE	3	39	ORDER	59	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 14:18:49.606	47
102	\N	SALE	1	40	ORDER	60	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 14:25:32.174	14
103	\N	SALE	1	48	ORDER	60	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-07 14:25:32.204	69
104	\N	SALE	1	16	ORDER	61	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 08:31:54.614	51
105	\N	SALE	2	44	ORDER	61	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 08:31:54.649	42
106	\N	SALE	1	38	ORDER	61	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 08:31:54.682	47
107	\N	SALE	1	75	ORDER	62	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 09:52:07.826	26
108	\N	SALE	1	37	ORDER	62	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 09:52:07.857	47
109	\N	SALE	1	74	ORDER	63	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 11:14:57.503	26
110	\N	SALE	1	30	ORDER	63	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 11:14:57.531	214
111	\N	SALE	1	73	ORDER	63	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 11:15:07.712	26
112	\N	SALE	1	72	ORDER	64	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 13:55:05.116	26
113	\N	SALE	1	8	ORDER	64	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 13:55:05.146	10
114	\N	SALE	1	36	ORDER	65	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 14:06:51.666	30
115	\N	SALE	1	13	ORDER	65	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-08 14:06:51.695	7
116	\N	SALE	1	35	ORDER	66	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-09 08:46:40.064	30
117	\N	SALE	1	53	ORDER	66	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-09 08:46:40.093	93
118	\N	SALE	1	33	ORDER	66	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-09 08:46:40.121	19
119	\N	SALE	1	27	ORDER	66	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-09 08:46:40.15	128
120	\N	SALE	1	34	ORDER	67	Tạo/cập nhật đơn tại shop	\N	\N	\N	2026-09-09 09:55:25.157	30
\.


--
-- Data for Name: invoice_sequence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_sequence (key, value, "updatedAt") FROM stdin;
\.


--
-- Data for Name: membership; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership (id, name, description, level, color, icon, priority, benefits, "isActive", "minSpendAmount", "discountRate", "createdAt", "updatedAt", "birthdayMaxDiscountAmount", code, terms) FROM stdin;
2	Vàng	\N	1	\N	\N	1	\N	t	6000000.000000000000000000000000000000	10.000000000000000000000000000000	2026-08-29 12:58:44.084	2026-08-29 12:58:44.084	\N	MEMBERSHIP-2	\N
1	Bạc	\N	0	#D96C8A	\N	0	\N	t	3000000.000000000000000000000000000000	5.000000000000000000000000000000	2026-08-29 12:57:44.215	2026-09-03 11:12:44.993	\N	MEMBERSHIP-1	\N
3	Kim cương	\N	2	#D96C8A	\N	0	\N	t	15000000.000000000000000000000000000000	15.000000000000000000000000000000	2026-08-29 12:59:24.614	2026-09-03 11:13:07.757	\N	MEMBERSHIP-3	\N
\.


--
-- Data for Name: membership_benefit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_benefit (id, name, code, description, type, icon, "isActive", "position", "startsAt", "endsAt", "usageLimit", "usedCount", "usageLimitPerUser", automatic, "requiresRedemption", "minOrderValue", "maxDiscountAmount", "salesChannels", "canCombineWithCoupons", "canCombineWithBenefits", priority, "internalNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: membership_benefit_redemption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_benefit_redemption (id, "benefitId", "userId", "orderId", "cycleYear", "valueSnapshot", "nameSnapshot", "typeSnapshot", amount, "redeemedAt") FROM stdin;
\.


--
-- Data for Name: membership_benefit_tier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_benefit_tier (id, "benefitId", "membershipId", value, config) FROM stdin;
\.


--
-- Data for Name: membership_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_history (id, "userId", "membershipId", "membershipNameSnapshot", "minSpendAmountSnapshot", "discountRateSnapshot", "cycleYear", spending, "rankStartDate", "rankEndDate", reason, "createdAt", "updatedAt") FROM stdin;
1	3	\N	Chưa đạt hạng	0.000000000000000000000000000000	0.000000000000000000000000000000	2026	0.000000000000000000000000000000	2025-12-31 17:00:00	2026-12-31 17:00:00	ANNUAL_RESET	2026-09-03 14:52:30.342	2026-09-04 04:43:17.949
\.


--
-- Data for Name: membership_reset_run; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_reset_run (id, "cycleYear", status, reason, "processedCount", "startedAt", "completedAt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: monthly_expense; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monthly_expense (id, "monthlyFinanceId", name, amount, "createdAt") FROM stdin;
4	1	Chi linh tinh	1000000.000000000000000000000000000000	2026-04-06 10:08:50.363
5	1	Tiền nhà	5600000.000000000000000000000000000000	2026-04-06 10:09:02.95
6	2	Nhập hàng	38000000.000000000000000000000000000000	2026-04-06 10:09:23.392
7	2	Tiền nhà	7260000.000000000000000000000000000000	2026-04-10 11:48:03.838
8	2	Tiền nợ	3000000.000000000000000000000000000000	2026-04-10 11:48:16.251
9	2	Nhập hàng	2590000.000000000000000000000000000000	2026-04-24 09:07:10.829
11	5	Tiền trọ	8080000.000000000000000000000000000000	2026-05-10 05:34:20.706
13	5	Đồ nam	5000000.000000000000000000000000000000	2026-05-12 15:51:15.484
12	5	Nón + vớ	1045000.000000000000000000000000000000	2026-05-12 04:10:35.223
10	5	Váy	2500000.000000000000000000000000000000	2026-05-10 05:33:16.436
14	5	Tấm bạc	380000.000000000000000000000000000000	2026-05-12 18:10:19.491
17	5	Quần thun mỏng	816000.000000000000000000000000000000	2026-05-16 05:31:57.396
16	5	Quần thun mỏng	117000.000000000000000000000000000000	2026-05-16 05:31:24.596
15	5	Jean nữ	8926000.000000000000000000000000000000	2026-05-15 11:00:33.424
18	5	Đồ lót 	4700000.000000000000000000000000000000	2026-05-16 14:55:49.791
19	5	Váy	3151000.000000000000000000000000000000	2026-05-17 03:42:33.052
20	5	Áo polo	3175000.000000000000000000000000000000	2026-05-20 08:27:44.569
21	5	Dép	3300000.000000000000000000000000000000	2026-05-22 13:04:11.233
22	5	Túi lớn	190000.000000000000000000000000000000	2026-05-23 15:51:29.823
23	5	Cọc đồ	2000000.000000000000000000000000000000	2026-05-26 14:19:49.989
24	5	Nhập quần áo (quần tay nữ-ngủ tl-lô 19k)	3300000.000000000000000000000000000000	2026-05-29 15:24:04.778
25	6	Nhập hàng (túi trong suốt - nón kết - nón tai bèo)	1430000.000000000000000000000000000000	2026-06-02 03:43:46.081
26	6	Mua bọc	40000.000000000000000000000000000000	2026-06-02 06:52:03.396
27	6	Sửa cửa	500000.000000000000000000000000000000	2026-06-02 06:52:12.995
28	6	Nhập lô quần tây	1886000.000000000000000000000000000000	2026-06-05 03:30:11.874
29	6	Nhập lô hàng	6000000.000000000000000000000000000000	2026-06-05 09:53:48.616
30	6	Tiền nhà	8235000.000000000000000000000000000000	2026-06-11 03:25:15.909
32	6	Áo thun nam	650000.000000000000000000000000000000	2026-06-11 03:30:20.819
33	6	Quần thun dài	750000.000000000000000000000000000000	2026-06-11 03:30:31.908
31	6	Quần tây nam	2000000.000000000000000000000000000000	2026-06-11 03:30:05.037
34	6	Dép-lô sục lô 22k	2167000.000000000000000000000000000000	2026-06-18 04:31:12.072
35	6	Đèn	2000000.000000000000000000000000000000	2026-06-20 05:09:09.729
36	6	Lô dép nữ 35k-33k	2900000.000000000000000000000000000000	2026-06-20 05:10:04.249
37	6	Lô đồ ngủ la tinh	4200000.000000000000000000000000000000	2026-06-20 05:10:16.947
38	6	Đồ tole	2970000.000000000000000000000000000000	2026-06-30 08:58:46.973
39	8	Nhập hàng (ống tay-khăn tắm-dây nịt)	1585000.000000000000000000000000000000	2026-07-01 02:55:16.86
40	8	Nhập đồ tole	2190000.000000000000000000000000000000	2026-07-02 11:05:29.731
41	8	Nhập hàng	1783000.000000000000000000000000000000	2026-07-05 09:38:46.968
42	8	Tiền nhà	7822000.000000000000000000000000000000	2026-07-10 14:44:04.895
45	8	Nhập dép + giày	4495000.000000000000000000000000000000	2026-07-14 10:56:50.658
46	8	Quần tây nam	3500000.000000000000000000000000000000	2026-07-14 10:57:02.432
47	8	Polo nam	1500000.000000000000000000000000000000	2026-07-14 10:57:13.435
48	8	giày dép	5613000.000000000000000000000000000000	2026-07-17 07:35:50.803
49	8	Jean nam	2360000.000000000000000000000000000000	2026-07-18 12:59:25.761
50	8	Kaki nam	1885000.000000000000000000000000000000	2026-07-21 14:22:28.993
51	8	Sơ mi nam	391000.000000000000000000000000000000	2026-07-21 14:22:56.27
52	8	Lô váy nữ	3500000.000000000000000000000000000000	2026-07-21 14:30:51.27
53	8	Lô áo thun cao cấp nữ	2900000.000000000000000000000000000000	2026-07-21 14:31:48.216
54	8	Lô váy 71k	3552000.000000000000000000000000000000	2026-07-23 13:36:34.685
55	8	Váy ngọc linh	3340000.000000000000000000000000000000	2026-07-24 02:24:53.664
56	8	Nhập móc canh	650000.000000000000000000000000000000	2026-07-26 08:24:27.993
57	8	Áo nam	2425000.000000000000000000000000000000	2026-07-28 11:03:10.872
58	8	Lô áo nữ	2980000.000000000000000000000000000000	2026-07-30 12:12:07.51
59	9	Sục thấp 50₫	1400000.000000000000000000000000000000	2026-08-06 12:16:29.403
60	9	Tiền nhà	7806000.000000000000000000000000000000	2026-08-10 14:09:47.593
61	9	Nhập hàng đồ nam	6500000.000000000000000000000000000000	2026-08-14 11:30:25.884
62	9	Dép xốp	580000.000000000000000000000000000000	2026-08-18 09:29:27.383
63	9	Dán cúp ngực	300000.000000000000000000000000000000	2026-08-19 04:29:18.107
64	9	Giày nhựa nữ	380000.000000000000000000000000000000	2026-08-24 08:31:12.765
65	9	Nhập váy	6000000.000000000000000000000000000000	2026-08-26 05:37:36.911
66	9	Nhập nón	1100000.000000000000000000000000000000	2026-08-26 12:40:16.287
67	9	Tiền ship	104000.000000000000000000000000000000	2026-08-27 10:52:02.387
68	9	Nhập quần thun nữ	1184000.000000000000000000000000000000	2026-08-28 08:40:20.628
69	9	Quần tây nữ	1500000.000000000000000000000000000000	2026-08-28 09:42:55.866
70	9	Quần umi lưng thun nữ	2000000.000000000000000000000000000000	2026-08-28 09:43:14.641
71	9	Áo ngực	1740000.000000000000000000000000000000	2026-08-28 09:43:40.264
72	9	Tole	1320000.000000000000000000000000000000	2026-08-28 09:44:05.535
73	9	Nhập dép nam	3100000.000000000000000000000000000000	2026-08-29 14:14:14.766
74	9	Nhập quàn tây nam	2100000.000000000000000000000000000000	2026-08-31 13:15:56.583
\.


--
-- Data for Name: monthly_finance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monthly_finance (id, year, month, "totalDailyProfit", "totalExpense", profit, "createdAt", "updatedAt") FROM stdin;
4	2026	2	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:20.204	2026-06-19 12:29:22.223
3	2026	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-04-06 10:18:12.824	2026-04-06 10:18:12.938
6	2026	6	51098000.000000000000000000000000000000	35728000.000000000000000000000000000000	51098000.000000000000000000000000000000	2026-06-01 04:29:04.128	2026-07-18 17:35:35.115
8	2026	7	45582000.000000000000000000000000000000	52471000.000000000000000000000000000000	45582000.000000000000000000000000000000	2026-07-01 02:09:30.993	2026-09-08 11:16:16.444
9	2026	8	49099000.000000000000000000000000000000	37114000.000000000000000000000000000000	49099000.000000000000000000000000000000	2026-08-01 12:03:53.234	2026-09-08 11:16:30.872
10	2026	9	7302000.000000000000000000000000000000	0.000000000000000000000000000000	7302000.000000000000000000000000000000	2026-09-01 10:07:11.489	2026-09-09 10:22:00.785
7	1978	1	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2026-06-12 14:06:40.762	2026-06-12 14:06:40.856
1	2026	3	29700000.000000000000000000000000000000	6600000.000000000000000000000000000000	29700000.000000000000000000000000000000	2026-04-06 08:03:54.157	2026-08-12 15:52:05.412
2	2026	4	18500000.000000000000000000000000000000	50850000.000000000000000000000000000000	18500000.000000000000000000000000000000	2026-04-06 08:04:30.779	2026-08-12 15:52:15.966
5	2026	5	51437000.000000000000000000000000000000	46680000.000000000000000000000000000000	51437000.000000000000000000000000000000	2026-05-01 04:44:00.251	2026-08-12 15:52:45.019
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (id, "userId", type, title, message, data, "isRead", "readAt", priority, "createdAt") FROM stdin;
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."order" (id, "orderNumber", "userId", "shippingAddressId", "billingAddressId", status, source, subtotal, "discountAmount", "shippingFee", "taxAmount", "totalAmount", "paidAmount", "remainingAmount", "paymentMethod", "paymentStatus", "isPaid", "paidAt", "couponId", "receiverName", "receiverPhone", "receiverAddress", "receiverWard", "receiverDistrict", "receiverProvince", latitude, longitude, note, "placedAt", "cancelledAt", "createdAt", "updatedAt", "createdById", "updatedById", "totalCost", profit, "completedAt", "idempotencyKey", "deliveredAt", "discountCodeSnapshot") FROM stdin;
1	ORD-20260827-38F99C	\N	\N	\N	COMPLETED	OFFLINE	260000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	260000.000000000000000000000000000000	260000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-27 10:56:16.202	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-27 10:56:16.202	\N	2026-08-27 10:56:16.322	2026-08-27 10:57:09.173	2	2	122000.000000000000000000000000000000	138000.000000000000000000000000000000	2026-08-27 10:56:16.202	fabad0af-c366-4476-8f8b-3d37b29e5ea2	\N	\N
2	ORD-20260827-801869	\N	\N	\N	COMPLETED	OFFLINE	315000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	315000.000000000000000000000000000000	315000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-27 11:50:53.72	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-27 11:50:53.72	\N	2026-08-27 11:50:53.879	2026-08-27 11:50:53.879	2	2	142000.000000000000000000000000000000	173000.000000000000000000000000000000	2026-08-27 11:50:53.72	7217301d-5b2a-490b-befa-a8cc87913c7a	\N	\N
3	ORD-20260827-2DA179	\N	\N	\N	COMPLETED	OFFLINE	60000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-27 11:58:05.888	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-27 11:58:05.888	\N	2026-08-27 11:58:06.024	2026-08-27 11:58:06.024	2	2	38000.000000000000000000000000000000	22000.000000000000000000000000000000	2026-08-27 11:58:05.888	b21e1901-cf23-4dca-a75b-075429f3bd48	\N	\N
4	ORD-20260827-5B1ADC	\N	\N	\N	COMPLETED	OFFLINE	80000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-27 12:26:34.817	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-27 12:26:34.817	\N	2026-08-27 12:26:35.537	2026-08-27 12:26:35.537	2	2	50000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-08-27 12:26:34.817	26720544-5ec1-447d-bb62-832bdc202658	\N	\N
5	ORD-20260827-C3CF5E	\N	\N	\N	COMPLETED	OFFLINE	70000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	70000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-27 12:48:13.863	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-27 12:48:13.863	\N	2026-08-27 12:48:13.986	2026-08-27 12:48:13.986	2	2	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-27 12:48:13.863	63609b64-7bfb-46f4-a1af-97b33f3d43a0	\N	\N
7	ORD-20260828-07C402	\N	\N	\N	COMPLETED	OFFLINE	130000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	130000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 08:30:16.34	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 08:30:16.34	\N	2026-08-28 08:30:16.444	2026-08-28 08:30:16.444	2	2	37000.000000000000000000000000000000	93000.000000000000000000000000000000	2026-08-28 08:30:16.34	0ab3a1c1-1ff9-4d4e-ab23-4ba967e9a7ea	\N	\N
6	ORD-20260828-F0F89E	\N	\N	\N	CANCELLED	OFFLINE	130000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	130000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	REFUNDED	t	2026-08-28 08:20:23.337	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 08:20:23.337	2026-08-28 08:30:23.851	2026-08-28 08:20:23.47	2026-08-28 08:30:23.87	2	2	35000.000000000000000000000000000000	95000.000000000000000000000000000000	2026-08-28 08:20:23.337	cdb0178c-4fc0-45b7-8f3d-7d39ae52c30f	\N	\N
8	ORD-20260828-240ECA	\N	\N	\N	COMPLETED	OFFLINE	120000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 08:43:04.295	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 08:43:04.295	\N	2026-08-28 08:43:04.401	2026-08-28 08:43:04.401	2	2	30000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-28 08:43:04.295	97bff4e3-7557-42da-8211-376fe3a7bc1b	\N	\N
9	ORD-20260828-954E8E	\N	\N	\N	COMPLETED	OFFLINE	340000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	340000.000000000000000000000000000000	340000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 10:08:35.626	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 10:08:35.626	\N	2026-08-28 10:08:35.747	2026-08-28 10:08:35.747	2	2	98000.000000000000000000000000000000	242000.000000000000000000000000000000	2026-08-28 10:08:35.626	1160ba30-aaf6-4463-88b2-959d7fd8e56e	\N	\N
10	ORD-20260828-AA085B	\N	\N	\N	COMPLETED	OFFLINE	150000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 10:11:09.463	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 10:11:09.463	\N	2026-08-28 10:11:09.581	2026-08-28 10:11:09.581	2	2	43000.000000000000000000000000000000	107000.000000000000000000000000000000	2026-08-28 10:11:09.463	39e9f00b-e1c2-4a36-b320-a7ba5e03098b	\N	\N
11	ORD-20260828-A33B7D	\N	\N	\N	COMPLETED	OFFLINE	120000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 10:23:02.774	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 10:23:02.774	\N	2026-08-28 10:23:02.899	2026-08-28 10:23:02.899	2	2	35000.000000000000000000000000000000	85000.000000000000000000000000000000	2026-08-28 10:23:02.774	5b71ea00-72b1-4503-beb8-991f63211198	\N	\N
12	ORD-20260828-71247B	\N	\N	\N	COMPLETED	OFFLINE	430000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	430000.000000000000000000000000000000	430000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 12:20:23.301	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 12:20:23.301	\N	2026-08-28 12:20:23.47	2026-08-28 12:20:23.47	2	2	46000.000000000000000000000000000000	384000.000000000000000000000000000000	2026-08-28 12:20:23.301	d537e76c-f3a4-4c7d-b7ff-3d1c2973a9c9	\N	\N
13	ORD-20260828-5D06F9	\N	\N	\N	COMPLETED	OFFLINE	250000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	250000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 12:51:31.59	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 12:51:31.59	\N	2026-08-28 12:51:31.845	2026-08-28 12:51:31.845	2	2	105000.000000000000000000000000000000	145000.000000000000000000000000000000	2026-08-28 12:51:31.59	83743650-9daa-4280-9031-2c218646ec27	\N	\N
14	ORD-20260828-67C425	\N	\N	\N	COMPLETED	OFFLINE	420000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	420000.000000000000000000000000000000	420000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 13:42:49.783	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 13:42:49.783	\N	2026-08-28 13:42:49.944	2026-08-28 13:42:49.944	2	2	181000.000000000000000000000000000000	239000.000000000000000000000000000000	2026-08-28 13:42:49.783	67788a3b-3fe4-4793-8c0d-6be1f42aff3b	\N	\N
15	ORD-20260828-134115	\N	\N	\N	COMPLETED	OFFLINE	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-28 14:08:26.153	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-28 14:08:26.153	\N	2026-08-28 14:08:26.449	2026-08-28 14:08:26.449	2	2	25000.000000000000000000000000000000	25000.000000000000000000000000000000	2026-08-28 14:08:26.153	3a9accf0-70b8-43f8-a583-0f5ad1d3d0f6	\N	\N
16	ORD-20260829-DE2347	\N	\N	\N	COMPLETED	OFFLINE	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-29 06:50:00.091	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-29 06:50:00.091	\N	2026-08-29 06:50:00.233	2026-08-29 06:50:00.233	2	2	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-08-29 06:50:00.091	7d7193fc-8524-4ee2-8427-4377d10c8ee7	\N	\N
17	ORD-20260829-580BEE	\N	\N	\N	COMPLETED	OFFLINE	480000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	480000.000000000000000000000000000000	480000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-29 11:10:26.533	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-29 11:10:26.533	\N	2026-08-29 11:10:26.691	2026-08-29 11:35:59.228	2	2	250000.000000000000000000000000000000	230000.000000000000000000000000000000	2026-08-29 11:10:26.533	96d1b888-e055-41a0-b3c6-bcf5f825b5a0	\N	\N
18	ORD-20260829-7FCE22	\N	\N	\N	COMPLETED	OFFLINE	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-29 11:36:23.785	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-29 11:36:23.785	\N	2026-08-29 11:36:23.904	2026-08-29 11:36:23.904	2	2	63000.000000000000000000000000000000	37000.000000000000000000000000000000	2026-08-29 11:36:23.785	5b3c0b28-ca8e-4cac-9269-a80295255a3f	\N	\N
19	ORD-20260829-204492	\N	\N	\N	COMPLETED	OFFLINE	550000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	550000.000000000000000000000000000000	550000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-29 13:57:10.278	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-29 13:57:10.278	\N	2026-08-29 13:57:10.425	2026-08-29 13:57:10.425	2	2	256000.000000000000000000000000000000	294000.000000000000000000000000000000	2026-08-29 13:57:10.278	f5c9087c-25d7-4c4f-bb00-669d9a4cb725	\N	\N
20	ORD-20260831-49193F	\N	\N	\N	COMPLETED	OFFLINE	90000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-31 12:11:21.386	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-31 12:11:21.386	\N	2026-08-31 12:11:21.531	2026-08-31 12:11:21.531	2	2	0.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-31 12:11:21.386	90332f23-47fe-4984-8836-f248b6eab603	\N	\N
21	ORD-20260831-E1D83C	\N	\N	\N	COMPLETED	OFFLINE	465000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	465000.000000000000000000000000000000	465000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-08-31 13:14:21.503	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-31 13:14:21.503	\N	2026-08-31 13:14:21.642	2026-08-31 13:14:21.642	2	2	231000.000000000000000000000000000000	234000.000000000000000000000000000000	2026-08-31 13:14:21.503	bdab4401-4f81-4705-a73d-8bc8bc02eb40	\N	\N
22	ORD-20260901-AB2AA2	\N	\N	\N	COMPLETED	OFFLINE	260000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	260000.000000000000000000000000000000	260000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-01 10:12:14.337	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-01 10:12:14.337	\N	2026-09-01 10:12:14.477	2026-09-01 10:12:14.477	2	2	159000.000000000000000000000000000000	101000.000000000000000000000000000000	2026-09-01 10:12:14.337	ef908757-34c1-4455-ad63-e013f0e52ba9	\N	\N
23	ORD-20260901-2AC95F	\N	\N	\N	COMPLETED	OFFLINE	500000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	500000.000000000000000000000000000000	500000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-01 10:13:32.495	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-01 10:13:32.495	\N	2026-09-01 10:13:32.62	2026-09-01 10:13:32.62	2	2	135000.000000000000000000000000000000	365000.000000000000000000000000000000	2026-09-01 10:13:32.495	751c202e-7cf0-44b3-a682-f6817dd6d222	\N	\N
24	ORD-20260901-24F9F5	\N	\N	\N	COMPLETED	OFFLINE	130000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	130000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-01 10:14:04.157	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-01 10:14:04.157	\N	2026-09-01 10:14:04.253	2026-09-01 10:14:04.253	2	2	25000.000000000000000000000000000000	105000.000000000000000000000000000000	2026-09-01 10:14:04.157	e692ddfc-8e9b-4c37-a26f-07d524684840	\N	\N
25	ORD-20260901-980DFA	\N	\N	\N	COMPLETED	OFFLINE	130000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	130000.000000000000000000000000000000	130000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-01 12:41:50.584	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-01 12:41:50.584	\N	2026-09-01 12:41:50.718	2026-09-01 12:41:50.718	2	2	56000.000000000000000000000000000000	74000.000000000000000000000000000000	2026-09-01 12:41:50.584	f9118fd0-02fc-4c79-aa78-c0f1979a4df1	\N	\N
26	ORD-20260902-A4DE83	\N	\N	\N	COMPLETED	OFFLINE	150000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-02 09:52:25.145	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-02 09:52:25.145	\N	2026-09-02 09:52:25.299	2026-09-02 09:52:25.299	2	2	0.000000000000000000000000000000	150000.000000000000000000000000000000	2026-09-02 09:52:25.145	ace9cde1-a53a-45c8-9996-342a79c90d19	\N	\N
27	ORD-20260902-EB6596	\N	\N	\N	COMPLETED	OFFLINE	50000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-02 10:08:31.528	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-02 10:08:31.528	\N	2026-09-02 10:08:31.649	2026-09-02 10:08:59.005	2	2	20000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-09-02 10:08:31.528	353f1ead-0bc1-40bb-9d71-513b5febadcc	\N	\N
28	ORD-20260902-B306D3	\N	\N	\N	COMPLETED	OFFLINE	40000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-02 10:17:46.281	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-02 10:17:46.281	\N	2026-09-02 10:17:46.383	2026-09-02 10:17:46.383	2	2	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-02 10:17:46.281	d595cf86-4c32-4517-84e9-5ce594760080	\N	\N
29	ORD-20260902-3F3CE5	\N	\N	\N	COMPLETED	OFFLINE	120000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-02 10:33:03.383	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-02 10:33:03.383	\N	2026-09-02 10:33:03.492	2026-09-02 10:33:03.492	2	2	65000.000000000000000000000000000000	55000.000000000000000000000000000000	2026-09-02 10:33:03.383	1f553d53-8b1a-4613-9d28-21248b25dae2	\N	\N
30	ORD-20260902-189F95	\N	\N	\N	COMPLETED	OFFLINE	480000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	480000.000000000000000000000000000000	480000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-02 11:21:27.633	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-02 11:21:27.633	\N	2026-09-02 11:21:27.776	2026-09-02 11:21:27.776	2	2	250000.000000000000000000000000000000	230000.000000000000000000000000000000	2026-09-02 11:21:27.633	d7098e19-43c8-4b6a-b226-5e82f9d3a9b3	\N	\N
31	ORD-20260902-2CACC6	\N	\N	\N	COMPLETED	OFFLINE	90000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-02 12:39:37.426	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-02 12:39:37.426	\N	2026-09-02 12:39:37.688	2026-09-02 12:39:37.688	2	2	30000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-02 12:39:37.426	84968bc8-f2c7-41e0-a3e9-e93c8fb839df	\N	\N
32	ORD-20260903-7CCAC2	\N	\N	\N	COMPLETED	OFFLINE	300000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	300000.000000000000000000000000000000	300000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 09:34:46.936	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 09:34:46.936	\N	2026-09-03 09:34:47.091	2026-09-03 09:34:47.091	2	2	64000.000000000000000000000000000000	236000.000000000000000000000000000000	2026-09-03 09:34:46.936	9436c157-766a-42c0-9eb8-7f0ffc00da37	\N	\N
33	ORD-20260903-408F19	\N	\N	\N	COMPLETED	OFFLINE	155000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	155000.000000000000000000000000000000	155000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 10:16:09.989	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 10:16:09.989	\N	2026-09-03 10:16:10.156	2026-09-03 10:16:10.156	2	2	56000.000000000000000000000000000000	99000.000000000000000000000000000000	2026-09-03 10:16:09.989	e42bceeb-a1f2-48ef-a3f5-751ee5b7ad08	\N	\N
34	ORD-20260903-7D51D3	\N	\N	\N	COMPLETED	OFFLINE	150000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 10:20:34.741	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 10:20:34.741	\N	2026-09-03 10:20:34.84	2026-09-03 10:20:34.84	2	2	84000.000000000000000000000000000000	66000.000000000000000000000000000000	2026-09-03 10:20:34.741	9ccc35fd-a473-4a9a-99f8-a7fbeda6b5d1	\N	\N
35	ORD-20260903-7C4EBE	\N	\N	\N	COMPLETED	OFFLINE	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 10:22:08.857	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 10:22:08.857	\N	2026-09-03 10:22:08.995	2026-09-03 10:22:08.995	2	2	40000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-03 10:22:08.857	8f9028ad-a40e-4de5-b5e3-96137bcf53c2	\N	\N
36	ORD-20260903-9A5A5B	\N	\N	\N	COMPLETED	OFFLINE	15000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000	15000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 11:12:13.192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 11:12:13.192	\N	2026-09-03 11:12:13.349	2026-09-03 11:12:13.349	2	2	9000.000000000000000000000000000000	6000.000000000000000000000000000000	2026-09-03 11:12:13.192	9b9448a6-0e8a-4e1d-bd69-45c094241046	\N	\N
37	ORD-20260903-3D2BC6	\N	\N	\N	COMPLETED	OFFLINE	270000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	270000.000000000000000000000000000000	270000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 14:12:00.277	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 14:12:00.277	\N	2026-09-03 14:12:00.454	2026-09-03 14:12:00.454	2	2	104000.000000000000000000000000000000	166000.000000000000000000000000000000	2026-09-03 14:12:00.277	27f52c43-dab2-4de2-9933-c19d4218377e	\N	\N
38	ORD-20260903-539EE5	\N	\N	\N	COMPLETED	OFFLINE	70000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	70000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 14:18:29.261	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 14:18:29.261	\N	2026-09-03 14:18:29.36	2026-09-03 14:18:29.36	2	2	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-03 14:18:29.261	b1a68338-8860-458a-a565-97d8467e964d	\N	\N
39	ORD-20260903-E5F515	\N	\N	\N	COMPLETED	OFFLINE	70000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	70000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-03 14:25:42.54	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-03 14:25:42.54	\N	2026-09-03 14:25:42.684	2026-09-03 14:25:42.684	2	2	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-03 14:25:42.54	84be8986-2a38-40cb-a0b9-b2bda471c7be	\N	\N
40	ORD-20260904-F80F35	\N	\N	\N	COMPLETED	OFFLINE	90000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 04:43:07.1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 04:43:07.1	\N	2026-09-04 04:43:07.225	2026-09-04 04:43:07.225	2	2	0.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-04 04:43:07.1	26761d88-81f8-44ea-88e2-487ae2578dfc	\N	\N
41	ORD-20260904-DC3F44	\N	\N	\N	COMPLETED	OFFLINE	70000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	70000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 07:46:09.635	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 07:46:09.635	\N	2026-09-04 07:46:09.762	2026-09-04 07:46:09.762	2	2	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-04 07:46:09.635	04c38093-475a-4fc6-93ab-5dabc8a68b5a	\N	\N
42	ORD-20260904-EA38A1	\N	\N	\N	COMPLETED	OFFLINE	650000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	650000.000000000000000000000000000000	650000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 08:48:16.23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 08:48:16.23	\N	2026-09-04 08:48:16.384	2026-09-04 08:48:16.384	2	2	165000.000000000000000000000000000000	485000.000000000000000000000000000000	2026-09-04 08:48:16.23	102b27a6-0463-4985-8511-36ab8ff13f3e	\N	\N
43	ORD-20260904-733ED2	\N	\N	\N	COMPLETED	OFFLINE	230000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	230000.000000000000000000000000000000	230000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 08:55:31.177	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 08:55:31.177	\N	2026-09-04 08:55:31.284	2026-09-04 08:55:31.284	2	2	106000.000000000000000000000000000000	124000.000000000000000000000000000000	2026-09-04 08:55:31.177	b17c0c7d-3927-4ec2-833a-74ee910c8d57	\N	\N
44	ORD-20260904-3E8440	\N	\N	\N	COMPLETED	OFFLINE	70000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	70000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 11:25:28.306	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 11:25:28.306	\N	2026-09-04 11:25:28.427	2026-09-04 11:25:28.427	2	2	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-04 11:25:28.306	89b93200-fd88-4575-b2e6-cfd058b8da2e	\N	\N
46	ORD-20260904-2E1738	\N	\N	\N	COMPLETED	OFFLINE	300000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	300000.000000000000000000000000000000	300000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 12:48:40.979	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 12:48:40.979	\N	2026-09-04 12:48:41.107	2026-09-04 12:48:41.107	2	2	190000.000000000000000000000000000000	110000.000000000000000000000000000000	2026-09-04 12:48:40.979	a4e8f457-fc09-49ef-9633-6812a7924e86	\N	\N
47	ORD-20260905-E1DD6D	\N	\N	\N	COMPLETED	OFFLINE	160000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	160000.000000000000000000000000000000	160000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-05 03:53:51.507	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-05 03:53:51.507	\N	2026-09-05 03:53:51.631	2026-09-05 03:53:51.631	2	2	60000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-05 03:53:51.507	863c86e2-81cf-4deb-9525-d75e49ccaf95	\N	\N
48	ORD-20260905-961E9A	\N	\N	\N	COMPLETED	OFFLINE	80000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-05 11:03:24.561	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-05 11:03:24.561	\N	2026-09-05 11:03:24.69	2026-09-05 11:03:24.69	2	2	37000.000000000000000000000000000000	43000.000000000000000000000000000000	2026-09-05 11:03:24.561	aa984de0-9b2c-48f3-8791-908d57372632	\N	\N
45	ORD-20260904-0674C1	\N	\N	\N	COMPLETED	OFFLINE	400000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	400000.000000000000000000000000000000	400000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-04 11:40:43.908	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-04 11:40:43.908	\N	2026-09-04 11:40:44.071	2026-09-05 11:36:58.389	2	2	150000.000000000000000000000000000000	250000.000000000000000000000000000000	2026-09-04 11:40:43.908	226fa1fc-2d75-4eea-b214-9c149fbdc5fc	\N	\N
49	ORD-20260906-472ED5	\N	\N	\N	COMPLETED	OFFLINE	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-06 02:13:43.199	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-06 02:13:43.199	\N	2026-09-06 02:13:43.318	2026-09-06 02:13:43.318	2	2	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-06 02:13:43.199	03f5decc-0602-4b80-8b1f-1859d53e4b9b	\N	\N
50	ORD-20260906-8B090D	\N	\N	\N	COMPLETED	OFFLINE	140000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	140000.000000000000000000000000000000	140000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-06 03:04:01.836	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-06 03:04:01.836	\N	2026-09-06 03:04:01.974	2026-09-06 03:04:01.974	2	2	60000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-06 03:04:01.836	1db2fd9c-da7c-4942-80a7-ac1c8583bae7	\N	\N
51	ORD-20260906-14CBF0	\N	\N	\N	COMPLETED	OFFLINE	200000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	200000.000000000000000000000000000000	200000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-06 06:14:13.33	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-06 06:14:13.33	\N	2026-09-06 06:14:13.462	2026-09-06 06:14:13.462	2	2	130000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-06 06:14:13.33	dd8c3007-43fb-4a2a-ada1-cf1167f9856e	\N	\N
52	ORD-20260906-AAAC7A	\N	\N	\N	COMPLETED	OFFLINE	480000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	480000.000000000000000000000000000000	480000.000000000000000000000000000000	0.000000000000000000000000000000	BANK_TRANSFER	PAID	t	2026-09-06 13:54:28.789	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-06 13:54:28.789	\N	2026-09-06 13:54:28.919	2026-09-06 13:54:28.919	2	2	302000.000000000000000000000000000000	178000.000000000000000000000000000000	2026-09-06 13:54:28.789	1f3cfa15-1612-4ae3-bca7-5680041b7056	\N	\N
53	ORD-20260906-3FA804	\N	\N	\N	COMPLETED	OFFLINE	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-06 05:00:00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-06 05:00:00	\N	2026-09-06 17:12:43.572	2026-09-06 17:12:43.572	2	2	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-06 05:00:00	cc93e5f0-2bf0-428e-85c6-128817b111e3	\N	\N
54	ORD-20260907-D44365	\N	\N	\N	COMPLETED	OFFLINE	80000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 03:40:53.797	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 03:40:53.797	\N	2026-09-07 03:40:53.963	2026-09-07 03:40:53.963	2	2	0.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-07 03:40:53.797	523fd99f-d542-4c3c-a4e1-8322491d9b56	\N	\N
55	ORD-20260907-67AD9D	\N	\N	\N	COMPLETED	OFFLINE	160000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	160000.000000000000000000000000000000	160000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 10:31:47.137	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 10:31:47.137	\N	2026-09-07 10:31:47.268	2026-09-07 10:31:47.268	2	2	76000.000000000000000000000000000000	84000.000000000000000000000000000000	2026-09-07 10:31:47.137	dbe319d5-e6dc-44cc-a7e8-0a63c442fab9	\N	\N
56	ORD-20260907-871E87	\N	\N	\N	COMPLETED	OFFLINE	120000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 10:41:07.287	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 10:41:07.287	\N	2026-09-07 10:41:07.437	2026-09-07 10:41:07.437	2	2	63000.000000000000000000000000000000	57000.000000000000000000000000000000	2026-09-07 10:41:07.287	bcd89b9a-3574-4816-af20-98eb220c15c3	\N	\N
57	ORD-20260907-2E1FFE	\N	\N	\N	COMPLETED	OFFLINE	220000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	220000.000000000000000000000000000000	220000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 11:14:09.472	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 11:14:09.472	\N	2026-09-07 11:14:09.621	2026-09-07 11:14:43.431	2	2	108000.000000000000000000000000000000	112000.000000000000000000000000000000	2026-09-07 11:14:09.472	039f6467-02f8-45c2-9312-18d18a185f4c	\N	\N
58	ORD-20260907-B26E41	\N	\N	\N	COMPLETED	OFFLINE	60000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 12:54:41.443	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 12:54:41.443	\N	2026-09-07 12:54:41.578	2026-09-07 12:54:41.578	2	2	0.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-07 12:54:41.443	f5aced5f-c858-42ae-945e-e33b89db6452	\N	\N
59	ORD-20260907-302B50	\N	\N	\N	COMPLETED	OFFLINE	135000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	135000.000000000000000000000000000000	135000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 14:18:49.367	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 14:18:49.367	\N	2026-09-07 14:18:49.505	2026-09-07 14:18:49.505	2	2	75000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-07 14:18:49.367	f12ec4f3-8eb3-4396-99cd-b20a621c9893	\N	\N
60	ORD-20260907-3C8D92	\N	\N	\N	COMPLETED	OFFLINE	90000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-07 14:25:31.927	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-07 14:25:31.927	\N	2026-09-07 14:25:32.059	2026-09-07 14:25:32.059	2	2	41000.000000000000000000000000000000	49000.000000000000000000000000000000	2026-09-07 14:25:31.927	8a3847f3-841d-41b6-8caa-d8c80bec0355	\N	\N
61	ORD-20260908-25266F	\N	\N	\N	COMPLETED	OFFLINE	220000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	220000.000000000000000000000000000000	220000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-08 08:31:54.349	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-08 08:31:54.349	\N	2026-09-08 08:31:54.495	2026-09-08 08:31:54.495	2	2	62000.000000000000000000000000000000	158000.000000000000000000000000000000	2026-09-08 08:31:54.349	dede9397-ad89-4604-bc39-419bb907fd03	\N	\N
62	ORD-20260908-6279C9	\N	\N	\N	COMPLETED	OFFLINE	100000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-08 09:52:07.582	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-08 09:52:07.582	\N	2026-09-08 09:52:07.725	2026-09-08 09:52:07.725	2	2	25000.000000000000000000000000000000	75000.000000000000000000000000000000	2026-09-08 09:52:07.582	50b10588-7890-47de-991d-6eef1fc2f70d	\N	\N
63	ORD-20260908-5CFC04	\N	\N	\N	COMPLETED	OFFLINE	230000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	230000.000000000000000000000000000000	230000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-08 11:14:57.287	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-08 11:14:57.287	\N	2026-09-08 11:14:57.413	2026-09-08 11:15:07.756	2	2	37000.000000000000000000000000000000	193000.000000000000000000000000000000	2026-09-08 11:14:57.287	a2a38c0f-3608-4dfd-b7c9-2b0b5bd739cf	\N	\N
64	ORD-20260908-309FCB	\N	\N	\N	COMPLETED	OFFLINE	75000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	75000.000000000000000000000000000000	75000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-08 13:55:04.851	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-08 13:55:04.851	\N	2026-09-08 13:55:05.019	2026-09-08 13:55:05.019	2	2	0.000000000000000000000000000000	75000.000000000000000000000000000000	2026-09-08 13:55:04.851	960dc2d9-6bd7-4575-a608-627cbfd365b0	\N	\N
65	ORD-20260908-A59F2A	\N	\N	\N	COMPLETED	OFFLINE	250000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	250000.000000000000000000000000000000	250000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-08 14:06:51.445	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-08 14:06:51.445	\N	2026-09-08 14:06:51.575	2026-09-08 14:06:51.575	2	2	104000.000000000000000000000000000000	146000.000000000000000000000000000000	2026-09-08 14:06:51.445	7e727a71-e2bb-4f7d-afd3-d471ca4e38ca	\N	\N
66	ORD-20260909-191BE1	\N	\N	\N	COMPLETED	OFFLINE	540000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	540000.000000000000000000000000000000	540000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-09 08:46:39.81	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-09 08:46:39.81	\N	2026-09-09 08:46:39.955	2026-09-09 08:46:39.955	2	2	213000.000000000000000000000000000000	327000.000000000000000000000000000000	2026-09-09 08:46:39.81	3382c7c9-9c4d-49b1-a758-59afcedf9230	\N	\N
67	ORD-20260909-F34150	\N	\N	\N	COMPLETED	OFFLINE	200000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	200000.000000000000000000000000000000	200000.000000000000000000000000000000	0.000000000000000000000000000000	CASH	PAID	t	2026-09-09 09:55:24.876	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-09-09 09:55:24.876	\N	2026-09-09 09:55:25.063	2026-09-09 09:55:25.063	2	2	104000.000000000000000000000000000000	96000.000000000000000000000000000000	2026-09-09 09:55:24.876	cbcaab6e-cd1e-4fa6-a8e6-ea2fc264ef0b	\N	\N
\.


--
-- Data for Name: order_invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_invoice (id, "orderId", "invoiceNumber", version, status, "publicToken", "publicAccessEnabled", "isPrimary", "orderCodeSnapshot", "orderSourceSnapshot", "orderStatusSnapshot", "paymentMethodSnapshot", "paymentStatusSnapshot", "sellerName", "sellerPhone", "sellerEmail", "sellerAddress", "sellerLogoUrl", "sellerTaxCode", "sellerFooterNote", "returnPolicyNote", "customerName", "customerPhone", "customerEmail", "shippingAddress", subtotal, "discountAmount", "shippingFee", "taxAmount", "totalAmount", "couponCodeSnapshot", note, "issuedAt", "issuedById", "voidedAt", "voidedById", "voidReason", "sourceUpdatedAtSnapshot", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_invoice_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_invoice_item (id, "invoiceId", "orderItemId", "productName", "variantName", "colorName", "sizeName", sku, "imageUrl", quantity, "unitPrice", "lineDiscount", "lineTotal") FROM stdin;
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_item (id, "orderId", "productId", "variantId", "productTitle", sku, size, color, "variantOptionsSnapshot", quantity, "unitPrice", "totalPrice", "createdAt", "productImageUrl", "originalUnitPrice", "unitCost", "lineSubtotal", "lineCost", "lineProfit", "updatedAt") FROM stdin;
4	1	14	\N	Sục nữ thấp	\N	\N	\N	null	2	70000.000000000000000000000000000000	140000.000000000000000000000000000000	2026-08-27 10:57:09.173		70000.000000000000000000000000000000	30000.000000000000000000000000000000	140000.000000000000000000000000000000	60000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-08-27 10:57:09.173
5	1	51	\N	Dây nịt	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-08-27 10:57:09.173		80000.000000000000000000000000000000	37000.000000000000000000000000000000	80000.000000000000000000000000000000	37000.000000000000000000000000000000	43000.000000000000000000000000000000	2026-08-27 10:57:09.173
6	1	47	\N	Nón kết	\N	\N	\N	null	1	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-27 10:57:09.173		50000.000000000000000000000000000000	25000.000000000000000000000000000000	40000.000000000000000000000000000000	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-08-27 10:57:09.173
7	2	30	\N	Quần tây nam	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-08-27 11:50:53.879		200000.000000000000000000000000000000	102000.000000000000000000000000000000	200000.000000000000000000000000000000	102000.000000000000000000000000000000	98000.000000000000000000000000000000	2026-08-27 11:50:53.879
8	2	42	\N	Quần lót nam	\N	\N	\N	null	1	35000.000000000000000000000000000000	35000.000000000000000000000000000000	2026-08-27 11:50:53.879		40000.000000000000000000000000000000	0.000000000000000000000000000000	35000.000000000000000000000000000000	0.000000000000000000000000000000	35000.000000000000000000000000000000	2026-08-27 11:50:53.879
9	2	25	\N	Quần thun mỏng nam	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-08-27 11:50:53.879		80000.000000000000000000000000000000	40000.000000000000000000000000000000	80000.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-27 11:50:53.879
10	3	8	\N	Túi lớn	\N	\N	\N	null	1	60000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-08-27 11:58:06.024		60000.000000000000000000000000000000	38000.000000000000000000000000000000	60000.000000000000000000000000000000	38000.000000000000000000000000000000	22000.000000000000000000000000000000	2026-08-27 11:58:06.024
11	4	47	\N	Nón kết	\N	\N	\N	null	2	40000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-08-27 12:26:35.537		50000.000000000000000000000000000000	25000.000000000000000000000000000000	80000.000000000000000000000000000000	50000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-08-27 12:26:35.537
12	5	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-08-27 12:48:13.986		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-27 12:48:13.986
13	6	32	\N	Quần tây nữ	\N	\N	\N	null	1	130000.000000000000000000000000000000	130000.000000000000000000000000000000	2026-08-28 08:20:23.47		120000.000000000000000000000000000000	35000.000000000000000000000000000000	130000.000000000000000000000000000000	35000.000000000000000000000000000000	95000.000000000000000000000000000000	2026-08-28 08:20:23.47
14	7	214	\N	Quần thun dài nữ	\N	\N	\N	null	1	130000.000000000000000000000000000000	130000.000000000000000000000000000000	2026-08-28 08:30:16.444		130000.000000000000000000000000000000	37000.000000000000000000000000000000	130000.000000000000000000000000000000	37000.000000000000000000000000000000	93000.000000000000000000000000000000	2026-08-28 08:30:16.444
15	8	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-08-28 08:43:04.401		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-28 08:43:04.401
16	8	18	\N	Dép nữ	\N	\N	\N	null	1	50000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-08-28 08:43:04.401		50000.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	2026-08-28 08:43:04.401
17	9	89	\N	Khăn tắm	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-08-28 10:08:35.747		60000.000000000000000000000000000000	28000.000000000000000000000000000000	70000.000000000000000000000000000000	28000.000000000000000000000000000000	42000.000000000000000000000000000000	2026-08-28 10:08:35.747
18	9	34	\N	Quần jean đùi nữ	\N	\N	\N	null	1	150000.000000000000000000000000000000	150000.000000000000000000000000000000	2026-08-28 10:08:35.747		150000.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	2026-08-28 10:08:35.747
19	9	17	\N	Giày nam	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-08-28 10:08:35.747		120000.000000000000000000000000000000	70000.000000000000000000000000000000	120000.000000000000000000000000000000	70000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-08-28 10:08:35.747
20	10	192	\N	Polo 43k	\N	\N	\N	null	1	150000.000000000000000000000000000000	150000.000000000000000000000000000000	2026-08-28 10:11:09.581		170000.000000000000000000000000000000	43000.000000000000000000000000000000	150000.000000000000000000000000000000	43000.000000000000000000000000000000	107000.000000000000000000000000000000	2026-08-28 10:11:09.581
21	11	141	\N	Dép kiểu nữ	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-08-28 10:23:02.899		100000.000000000000000000000000000000	35000.000000000000000000000000000000	120000.000000000000000000000000000000	35000.000000000000000000000000000000	85000.000000000000000000000000000000	2026-08-28 10:23:02.899
22	12	44	\N	Sơ mi nam	\N	\N	\N	null	2	150000.000000000000000000000000000000	300000.000000000000000000000000000000	2026-08-28 12:20:23.47		150000.000000000000000000000000000000	23000.000000000000000000000000000000	300000.000000000000000000000000000000	46000.000000000000000000000000000000	254000.000000000000000000000000000000	2026-08-28 12:20:23.47
23	12	63	\N	Quần lót nam boxy	\N	\N	\N	null	2	45000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-28 12:20:23.47		45000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-28 12:20:23.47
24	12	7	\N	Túi nhỏ	\N	\N	\N	null	1	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-28 12:20:23.47		50000.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	0.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-28 12:20:23.47
25	13	33	\N	Quần jean nữ dài	\N	\N	\N	null	1	250000.000000000000000000000000000000	250000.000000000000000000000000000000	2026-08-28 12:51:31.845		250000.000000000000000000000000000000	105000.000000000000000000000000000000	250000.000000000000000000000000000000	105000.000000000000000000000000000000	145000.000000000000000000000000000000	2026-08-28 12:51:31.845
26	14	132	\N	Quần túi hộp	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-08-28 13:42:49.944		200000.000000000000000000000000000000	130000.000000000000000000000000000000	200000.000000000000000000000000000000	130000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-08-28 13:42:49.944
27	14	26	\N	Áo thun nam-nữ	\N	\N	\N	null	1	60000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-08-28 13:42:49.944		60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	2026-08-28 13:42:49.944
28	14	32	\N	Quần tây nữ	\N	\N	\N	null	1	130000.000000000000000000000000000000	130000.000000000000000000000000000000	2026-08-28 13:42:49.944		120000.000000000000000000000000000000	33000.000000000000000000000000000000	130000.000000000000000000000000000000	33000.000000000000000000000000000000	97000.000000000000000000000000000000	2026-08-28 13:42:49.944
29	14	43	\N	Quần lót nữ	\N	\N	\N	null	2	15000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-08-28 13:42:49.944		15000.000000000000000000000000000000	9000.000000000000000000000000000000	30000.000000000000000000000000000000	18000.000000000000000000000000000000	12000.000000000000000000000000000000	2026-08-28 13:42:49.944
30	15	47	\N	Nón kết	\N	\N	\N	null	1	50000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-08-28 14:08:26.449		50000.000000000000000000000000000000	25000.000000000000000000000000000000	50000.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	2026-08-28 14:08:26.449
31	16	47	\N	Nón kết	\N	\N	\N	null	1	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-08-29 06:50:00.233		50000.000000000000000000000000000000	25000.000000000000000000000000000000	40000.000000000000000000000000000000	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-08-29 06:50:00.233
34	17	169	\N	S8	\N	\N	\N	null	1	230000.000000000000000000000000000000	230000.000000000000000000000000000000	2026-08-29 11:35:59.228		260000.000000000000000000000000000000	125000.000000000000000000000000000000	230000.000000000000000000000000000000	125000.000000000000000000000000000000	105000.000000000000000000000000000000	2026-08-29 11:35:59.228
35	17	200	\N	s33	\N	\N	\N	null	1	250000.000000000000000000000000000000	250000.000000000000000000000000000000	2026-08-29 11:35:59.228		250000.000000000000000000000000000000	125000.000000000000000000000000000000	250000.000000000000000000000000000000	125000.000000000000000000000000000000	125000.000000000000000000000000000000	2026-08-29 11:35:59.228
36	18	1	\N	Vớ	\N	\N	\N	null	1	10000.000000000000000000000000000000	10000.000000000000000000000000000000	2026-08-29 11:36:23.904		10000.000000000000000000000000000000	7000.000000000000000000000000000000	10000.000000000000000000000000000000	7000.000000000000000000000000000000	3000.000000000000000000000000000000	2026-08-29 11:36:23.904
37	18	41	\N	Áo ngực	\N	\N	\N	null	2	45000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-29 11:36:23.904		45000.000000000000000000000000000000	28000.000000000000000000000000000000	90000.000000000000000000000000000000	56000.000000000000000000000000000000	34000.000000000000000000000000000000	2026-08-29 11:36:23.904
38	19	21	\N	Quần jean đùi nam	\N	\N	\N	null	2	200000.000000000000000000000000000000	400000.000000000000000000000000000000	2026-08-29 13:57:10.425		200000.000000000000000000000000000000	110000.000000000000000000000000000000	400000.000000000000000000000000000000	220000.000000000000000000000000000000	180000.000000000000000000000000000000	2026-08-29 13:57:10.425
39	19	149	\N	Áo thun JetJet	\N	\N	\N	null	1	150000.000000000000000000000000000000	150000.000000000000000000000000000000	2026-08-29 13:57:10.425		150000.000000000000000000000000000000	36000.000000000000000000000000000000	150000.000000000000000000000000000000	36000.000000000000000000000000000000	114000.000000000000000000000000000000	2026-08-29 13:57:10.425
40	20	63	\N	Quần lót nam boxy	\N	\N	\N	null	2	45000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-31 12:11:21.531		45000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	2026-08-31 12:11:21.531
41	21	204	\N	s37	\N	\N	\N	null	1	265000.000000000000000000000000000000	265000.000000000000000000000000000000	2026-08-31 13:14:21.642		265000.000000000000000000000000000000	131000.000000000000000000000000000000	265000.000000000000000000000000000000	131000.000000000000000000000000000000	134000.000000000000000000000000000000	2026-08-31 13:14:21.642
42	21	213	\N	S46	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-08-31 13:14:21.642		200000.000000000000000000000000000000	100000.000000000000000000000000000000	200000.000000000000000000000000000000	100000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-08-31 13:14:21.642
43	22	22	\N	Quần jean dài nam	\N	\N	\N	null	1	240000.000000000000000000000000000000	240000.000000000000000000000000000000	2026-09-01 10:12:14.477		230000.000000000000000000000000000000	145000.000000000000000000000000000000	240000.000000000000000000000000000000	145000.000000000000000000000000000000	95000.000000000000000000000000000000	2026-09-01 10:12:14.477
44	22	1	\N	Vớ	\N	\N	\N	null	2	10000.000000000000000000000000000000	20000.000000000000000000000000000000	2026-09-01 10:12:14.477		10000.000000000000000000000000000000	7000.000000000000000000000000000000	20000.000000000000000000000000000000	14000.000000000000000000000000000000	6000.000000000000000000000000000000	2026-09-01 10:12:14.477
45	23	149	\N	Áo thun JetJet	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-01 10:13:32.62		150000.000000000000000000000000000000	36000.000000000000000000000000000000	120000.000000000000000000000000000000	36000.000000000000000000000000000000	84000.000000000000000000000000000000	2026-09-01 10:13:32.62
46	23	63	\N	Quần lót nam boxy	\N	\N	\N	null	3	45000.000000000000000000000000000000	135000.000000000000000000000000000000	2026-09-01 10:13:32.62		45000.000000000000000000000000000000	0.000000000000000000000000000000	135000.000000000000000000000000000000	0.000000000000000000000000000000	135000.000000000000000000000000000000	2026-09-01 10:13:32.62
47	23	192	\N	Polo 43k	\N	\N	\N	null	1	125000.000000000000000000000000000000	125000.000000000000000000000000000000	2026-09-01 10:13:32.62		170000.000000000000000000000000000000	43000.000000000000000000000000000000	125000.000000000000000000000000000000	43000.000000000000000000000000000000	82000.000000000000000000000000000000	2026-09-01 10:13:32.62
48	23	57	\N	Quần thun dày nam	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-01 10:13:32.62		120000.000000000000000000000000000000	56000.000000000000000000000000000000	120000.000000000000000000000000000000	56000.000000000000000000000000000000	64000.000000000000000000000000000000	2026-09-01 10:13:32.62
49	24	64	\N	Dép kẹp nam	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-01 10:14:04.253		50000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-01 10:14:04.253
50	24	47	\N	Nón kết	\N	\N	\N	null	1	50000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-01 10:14:04.253		50000.000000000000000000000000000000	25000.000000000000000000000000000000	50000.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	2026-09-01 10:14:04.253
51	25	57	\N	Quần thun dày nam	\N	\N	\N	null	1	130000.000000000000000000000000000000	130000.000000000000000000000000000000	2026-09-01 12:41:50.718		120000.000000000000000000000000000000	56000.000000000000000000000000000000	130000.000000000000000000000000000000	56000.000000000000000000000000000000	74000.000000000000000000000000000000	2026-09-01 12:41:50.718
52	26	34	\N	Quần jean đùi nữ	\N	\N	\N	null	1	150000.000000000000000000000000000000	150000.000000000000000000000000000000	2026-09-02 09:52:25.299		150000.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	0.000000000000000000000000000000	150000.000000000000000000000000000000	2026-09-02 09:52:25.299
54	27	133	\N	Nón tai bèo	\N	\N	\N	null	1	50000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-02 10:08:59.005		40000.000000000000000000000000000000	20000.000000000000000000000000000000	50000.000000000000000000000000000000	20000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-09-02 10:08:59.005
55	28	47	\N	Nón kết	\N	\N	\N	null	1	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-02 10:17:46.383		50000.000000000000000000000000000000	25000.000000000000000000000000000000	40000.000000000000000000000000000000	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-02 10:17:46.383
56	29	47	\N	Nón kết	\N	\N	\N	null	1	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-02 10:33:03.492		50000.000000000000000000000000000000	25000.000000000000000000000000000000	40000.000000000000000000000000000000	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-02 10:33:03.492
57	29	25	\N	Quần thun mỏng nam	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-02 10:33:03.492		80000.000000000000000000000000000000	40000.000000000000000000000000000000	80000.000000000000000000000000000000	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-02 10:33:03.492
58	30	16	\N	Giày nữ	\N	\N	\N	null	2	120000.000000000000000000000000000000	240000.000000000000000000000000000000	2026-09-02 11:21:27.776		120000.000000000000000000000000000000	63000.000000000000000000000000000000	240000.000000000000000000000000000000	126000.000000000000000000000000000000	114000.000000000000000000000000000000	2026-09-02 11:21:27.776
59	30	17	\N	Giày nam	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-02 11:21:27.776		120000.000000000000000000000000000000	70000.000000000000000000000000000000	120000.000000000000000000000000000000	70000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-02 11:21:27.776
60	30	1	\N	Vớ	\N	\N	\N	null	3	10000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-09-02 11:21:27.776		10000.000000000000000000000000000000	7000.000000000000000000000000000000	30000.000000000000000000000000000000	21000.000000000000000000000000000000	9000.000000000000000000000000000000	2026-09-02 11:21:27.776
61	30	139	\N	Sục nữ  33k	\N	\N	\N	null	1	90000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-02 11:21:27.776		70000.000000000000000000000000000000	33000.000000000000000000000000000000	90000.000000000000000000000000000000	33000.000000000000000000000000000000	57000.000000000000000000000000000000	2026-09-02 11:21:27.776
62	31	14	\N	Sục nữ thấp	\N	\N	\N	null	1	90000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-02 12:39:37.688		70000.000000000000000000000000000000	30000.000000000000000000000000000000	90000.000000000000000000000000000000	30000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-02 12:39:37.688
63	32	194	\N	Giày nhựa nữ	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-03 09:34:47.091		120000.000000000000000000000000000000	64000.000000000000000000000000000000	120000.000000000000000000000000000000	64000.000000000000000000000000000000	56000.000000000000000000000000000000	2026-09-03 09:34:47.091
64	32	26	\N	Áo thun nam-nữ	\N	\N	\N	null	1	60000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-03 09:34:47.091		60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-03 09:34:47.091
65	32	37	\N	Quần ống suôn	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-03 09:34:47.091		160000.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-03 09:34:47.091
66	33	57	\N	Quần thun dày nam	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-03 10:16:10.156		120000.000000000000000000000000000000	56000.000000000000000000000000000000	120000.000000000000000000000000000000	56000.000000000000000000000000000000	64000.000000000000000000000000000000	2026-09-03 10:16:10.156
67	33	42	\N	Quần lót nam	\N	\N	\N	null	1	35000.000000000000000000000000000000	35000.000000000000000000000000000000	2026-09-03 10:16:10.156		40000.000000000000000000000000000000	0.000000000000000000000000000000	35000.000000000000000000000000000000	0.000000000000000000000000000000	35000.000000000000000000000000000000	2026-09-03 10:16:10.156
68	34	17	\N	Giày nam	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-03 10:20:34.84		120000.000000000000000000000000000000	70000.000000000000000000000000000000	120000.000000000000000000000000000000	70000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-03 10:20:34.84
69	34	1	\N	Vớ	\N	\N	\N	null	2	15000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-09-03 10:20:34.84		10000.000000000000000000000000000000	7000.000000000000000000000000000000	30000.000000000000000000000000000000	14000.000000000000000000000000000000	16000.000000000000000000000000000000	2026-09-03 10:20:34.84
70	35	144	\N	Đồ ngủ la tinh	\N	\N	\N	null	1	100000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-03 10:22:08.995		100000.000000000000000000000000000000	40000.000000000000000000000000000000	100000.000000000000000000000000000000	40000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-03 10:22:08.995
71	36	43	\N	Quần lót nữ	\N	\N	\N	null	1	15000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-03 11:12:13.349		15000.000000000000000000000000000000	9000.000000000000000000000000000000	15000.000000000000000000000000000000	9000.000000000000000000000000000000	6000.000000000000000000000000000000	2026-09-03 11:12:13.349
72	37	30	\N	Quần tây nam	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-03 14:12:00.454		200000.000000000000000000000000000000	104000.000000000000000000000000000000	200000.000000000000000000000000000000	104000.000000000000000000000000000000	96000.000000000000000000000000000000	2026-09-03 14:12:00.454
73	37	42	\N	Quần lót nam	\N	\N	\N	null	2	35000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-03 14:12:00.454		40000.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	0.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-03 14:12:00.454
74	38	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-03 14:18:29.36		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-03 14:18:29.36
75	39	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-03 14:25:42.684		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-03 14:25:42.684
76	40	63	\N	Quần lót nam boxy	\N	\N	\N	null	2	45000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-04 04:43:07.225		45000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	0.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-04 04:43:07.225
77	41	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-04 07:46:09.762		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-04 07:46:09.762
78	42	157	\N	Jean ống suông nam	\N	\N	\N	null	2	220000.000000000000000000000000000000	440000.000000000000000000000000000000	2026-09-04 08:48:16.384		220000.000000000000000000000000000000	46000.000000000000000000000000000000	440000.000000000000000000000000000000	92000.000000000000000000000000000000	348000.000000000000000000000000000000	2026-09-04 08:48:16.384
79	42	149	\N	Áo thun JetJet	\N	\N	\N	null	1	130000.000000000000000000000000000000	130000.000000000000000000000000000000	2026-09-04 08:48:16.384		150000.000000000000000000000000000000	36000.000000000000000000000000000000	130000.000000000000000000000000000000	36000.000000000000000000000000000000	94000.000000000000000000000000000000	2026-09-04 08:48:16.384
80	42	51	\N	Dây nịt	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-04 08:48:16.384		80000.000000000000000000000000000000	37000.000000000000000000000000000000	80000.000000000000000000000000000000	37000.000000000000000000000000000000	43000.000000000000000000000000000000	2026-09-04 08:48:16.384
81	43	53	\N	Sục nam	\N	\N	\N	null	1	90000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-04 08:55:31.284		90000.000000000000000000000000000000	46000.000000000000000000000000000000	90000.000000000000000000000000000000	46000.000000000000000000000000000000	44000.000000000000000000000000000000	2026-09-04 08:55:31.284
82	43	14	\N	Sục nữ thấp	\N	\N	\N	null	2	70000.000000000000000000000000000000	140000.000000000000000000000000000000	2026-09-04 08:55:31.284		70000.000000000000000000000000000000	30000.000000000000000000000000000000	140000.000000000000000000000000000000	60000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-04 08:55:31.284
83	44	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-04 11:25:28.427		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-04 11:25:28.427
85	46	54	\N	Dép da nam hai quai	\N	\N	\N	null	2	150000.000000000000000000000000000000	300000.000000000000000000000000000000	2026-09-04 12:48:41.107		160000.000000000000000000000000000000	95000.000000000000000000000000000000	300000.000000000000000000000000000000	190000.000000000000000000000000000000	110000.000000000000000000000000000000	2026-09-04 12:48:41.107
86	47	14	\N	Sục nữ thấp	\N	\N	\N	null	2	80000.000000000000000000000000000000	160000.000000000000000000000000000000	2026-09-05 03:53:51.631		70000.000000000000000000000000000000	30000.000000000000000000000000000000	160000.000000000000000000000000000000	60000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-05 03:53:51.631
87	48	51	\N	Dây nịt	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-05 11:03:24.69		80000.000000000000000000000000000000	37000.000000000000000000000000000000	80000.000000000000000000000000000000	37000.000000000000000000000000000000	43000.000000000000000000000000000000	2026-09-05 11:03:24.69
88	45	24	\N	Quần thun dài nam	\N	\N	\N	null	2	200000.000000000000000000000000000000	400000.000000000000000000000000000000	2026-09-05 11:36:58.389		120000.000000000000000000000000000000	75000.000000000000000000000000000000	400000.000000000000000000000000000000	150000.000000000000000000000000000000	250000.000000000000000000000000000000	2026-09-05 11:36:58.389
89	49	6	\N	Dù lớn	\N	\N	\N	null	1	100000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-06 02:13:43.318		100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-06 02:13:43.318
90	50	14	\N	Sục nữ thấp	\N	\N	\N	null	2	70000.000000000000000000000000000000	140000.000000000000000000000000000000	2026-09-06 03:04:01.974		70000.000000000000000000000000000000	30000.000000000000000000000000000000	140000.000000000000000000000000000000	60000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-06 03:04:01.974
91	51	132	\N	Quần túi hộp	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-06 06:14:13.462		200000.000000000000000000000000000000	130000.000000000000000000000000000000	200000.000000000000000000000000000000	130000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-06 06:14:13.462
92	52	73	\N	Váy 4	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-06 13:54:28.919	https://res.cloudinary.com/danh7181/image/upload/v1780372325/finance-app/products/wb1ij8kzcj68nlesfyon.jpg	280000.000000000000000000000000000000	160000.000000000000000000000000000000	200000.000000000000000000000000000000	160000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-06 13:54:28.919
93	52	211	\N	s44	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-06 13:54:28.919		210000.000000000000000000000000000000	105000.000000000000000000000000000000	200000.000000000000000000000000000000	105000.000000000000000000000000000000	95000.000000000000000000000000000000	2026-09-06 13:54:28.919
94	52	51	\N	Dây nịt	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-06 13:54:28.919		80000.000000000000000000000000000000	37000.000000000000000000000000000000	80000.000000000000000000000000000000	37000.000000000000000000000000000000	43000.000000000000000000000000000000	2026-09-06 13:54:28.919
95	53	6	\N	Dù lớn	\N	\N	\N	null	1	100000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-06 17:12:43.572		100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-06 17:12:43.572
96	54	40	\N	Quần bí	\N	\N	\N	null	1	80000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-07 03:40:53.963		80000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-07 03:40:53.963
97	55	53	\N	Sục nam	\N	\N	\N	null	1	90000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-07 10:31:47.268		90000.000000000000000000000000000000	46000.000000000000000000000000000000	90000.000000000000000000000000000000	46000.000000000000000000000000000000	44000.000000000000000000000000000000	2026-09-07 10:31:47.268
98	55	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-07 10:31:47.268		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-07 10:31:47.268
99	56	16	\N	Giày nữ	\N	\N	\N	null	1	120000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-07 10:41:07.437		120000.000000000000000000000000000000	63000.000000000000000000000000000000	120000.000000000000000000000000000000	63000.000000000000000000000000000000	57000.000000000000000000000000000000	2026-09-07 10:41:07.437
104	57	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-07 11:14:43.431		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-07 11:14:43.431
105	57	1	\N	Vớ	\N	\N	\N	null	2	15000.000000000000000000000000000000	30000.000000000000000000000000000000	2026-09-07 11:14:43.431		10000.000000000000000000000000000000	7000.000000000000000000000000000000	30000.000000000000000000000000000000	14000.000000000000000000000000000000	16000.000000000000000000000000000000	2026-09-07 11:14:43.431
106	57	9	\N	Khẩu trang	\N	\N	\N	null	2	10000.000000000000000000000000000000	20000.000000000000000000000000000000	2026-09-07 11:14:43.431		10000.000000000000000000000000000000	0.000000000000000000000000000000	20000.000000000000000000000000000000	0.000000000000000000000000000000	20000.000000000000000000000000000000	2026-09-07 11:14:43.431
107	57	194	\N	Giày nhựa nữ	\N	\N	\N	null	1	100000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-07 11:14:43.431		120000.000000000000000000000000000000	64000.000000000000000000000000000000	100000.000000000000000000000000000000	64000.000000000000000000000000000000	36000.000000000000000000000000000000	2026-09-07 11:14:43.431
108	58	26	\N	Áo thun nam-nữ	\N	\N	\N	null	1	60000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-07 12:54:41.578		60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-07 12:54:41.578
109	59	47	\N	Nón kết	\N	\N	\N	null	3	45000.000000000000000000000000000000	135000.000000000000000000000000000000	2026-09-07 14:18:49.505		50000.000000000000000000000000000000	25000.000000000000000000000000000000	135000.000000000000000000000000000000	75000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-07 14:18:49.505
110	60	14	\N	Sục nữ thấp	\N	\N	\N	null	1	70000.000000000000000000000000000000	70000.000000000000000000000000000000	2026-09-07 14:25:32.059		70000.000000000000000000000000000000	30000.000000000000000000000000000000	70000.000000000000000000000000000000	30000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-07 14:25:32.059
111	60	69	\N	Dép xốp	\N	\N	\N	null	1	20000.000000000000000000000000000000	20000.000000000000000000000000000000	2026-09-07 14:25:32.059		20000.000000000000000000000000000000	11000.000000000000000000000000000000	20000.000000000000000000000000000000	11000.000000000000000000000000000000	9000.000000000000000000000000000000	2026-09-07 14:25:32.059
112	61	51	\N	Dây nịt	\N	\N	\N	null	1	90000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-08 08:31:54.495		80000.000000000000000000000000000000	37000.000000000000000000000000000000	90000.000000000000000000000000000000	37000.000000000000000000000000000000	53000.000000000000000000000000000000	2026-09-08 08:31:54.495
113	61	42	\N	Quần lót nam	\N	\N	\N	null	2	40000.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-08 08:31:54.495		40000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	0.000000000000000000000000000000	80000.000000000000000000000000000000	2026-09-08 08:31:54.495
114	61	47	\N	Nón kết	\N	\N	\N	null	1	50000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-08 08:31:54.495		50000.000000000000000000000000000000	25000.000000000000000000000000000000	50000.000000000000000000000000000000	25000.000000000000000000000000000000	25000.000000000000000000000000000000	2026-09-08 08:31:54.495
115	62	26	\N	Áo thun nam-nữ	\N	\N	\N	null	1	60000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-08 09:52:07.725		60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-08 09:52:07.725
116	62	47	\N	Nón kết	\N	\N	\N	null	1	40000.000000000000000000000000000000	40000.000000000000000000000000000000	2026-09-08 09:52:07.725		50000.000000000000000000000000000000	25000.000000000000000000000000000000	40000.000000000000000000000000000000	25000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-08 09:52:07.725
119	63	26	\N	Áo thun nam-nữ	\N	\N	\N	null	2	60000.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-08 11:15:07.756		60000.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	0.000000000000000000000000000000	120000.000000000000000000000000000000	2026-09-08 11:15:07.756
120	63	214	\N	Quần thun dài mỏng nữ	\N	\N	\N	null	1	110000.000000000000000000000000000000	110000.000000000000000000000000000000	2026-09-08 11:15:07.756		130000.000000000000000000000000000000	37000.000000000000000000000000000000	110000.000000000000000000000000000000	37000.000000000000000000000000000000	73000.000000000000000000000000000000	2026-09-08 11:15:07.756
121	64	26	\N	Áo thun nam-nữ	\N	\N	\N	null	1	60000.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-08 13:55:05.019		60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	0.000000000000000000000000000000	60000.000000000000000000000000000000	2026-09-08 13:55:05.019
122	64	10	\N	Lót giày	\N	\N	\N	null	1	15000.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-08 13:55:05.019		15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000	0.000000000000000000000000000000	15000.000000000000000000000000000000	2026-09-08 13:55:05.019
123	65	30	\N	Quần tây nam	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-08 14:06:51.575		200000.000000000000000000000000000000	104000.000000000000000000000000000000	200000.000000000000000000000000000000	104000.000000000000000000000000000000	96000.000000000000000000000000000000	2026-09-08 14:06:51.575
124	65	7	\N	Túi nhỏ	\N	\N	\N	null	1	50000.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-08 14:06:51.575		50000.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	0.000000000000000000000000000000	50000.000000000000000000000000000000	2026-09-08 14:06:51.575
125	66	30	\N	Quần tây nam	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-09 08:46:39.955		200000.000000000000000000000000000000	104000.000000000000000000000000000000	200000.000000000000000000000000000000	104000.000000000000000000000000000000	96000.000000000000000000000000000000	2026-09-09 08:46:39.955
126	66	93	\N	Áo polo nam cao cấp	\N	\N	\N	null	1	150000.000000000000000000000000000000	150000.000000000000000000000000000000	2026-09-09 08:46:39.955		150000.000000000000000000000000000000	75000.000000000000000000000000000000	150000.000000000000000000000000000000	75000.000000000000000000000000000000	75000.000000000000000000000000000000	2026-09-09 08:46:39.955
127	66	19	\N	Dép quai ngang Nam	\N	\N	\N	null	1	90000.000000000000000000000000000000	90000.000000000000000000000000000000	2026-09-09 08:46:39.955		90000.000000000000000000000000000000	34000.000000000000000000000000000000	90000.000000000000000000000000000000	34000.000000000000000000000000000000	56000.000000000000000000000000000000	2026-09-09 08:46:39.955
128	66	128	\N	Quần short nam	\N	\N	\N	null	1	100000.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-09 08:46:39.955		100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	100000.000000000000000000000000000000	2026-09-09 08:46:39.955
129	67	30	\N	Quần tây nam	\N	\N	\N	null	1	200000.000000000000000000000000000000	200000.000000000000000000000000000000	2026-09-09 09:55:25.063		200000.000000000000000000000000000000	104000.000000000000000000000000000000	200000.000000000000000000000000000000	104000.000000000000000000000000000000	96000.000000000000000000000000000000	2026-09-09 09:55:25.063
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, "orderId", "previousStatus", "currentStatus", "changedById", note, "createdAt") FROM stdin;
1	1	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-27 10:56:16.322
2	2	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-27 11:50:53.879
3	3	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-27 11:58:06.024
4	4	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-27 12:26:35.537
5	5	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-27 12:48:13.986
6	6	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 08:20:23.47
7	7	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 08:30:16.444
8	6	COMPLETED	CANCELLED	2	Hủy đơn tại shop và hoàn tồn kho	2026-08-28 08:30:23.87
9	8	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 08:43:04.401
10	9	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 10:08:35.747
11	10	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 10:11:09.581
12	11	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 10:23:02.899
13	12	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 12:20:23.47
14	13	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 12:51:31.845
15	14	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 13:42:49.944
16	15	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-28 14:08:26.449
17	16	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-29 06:50:00.233
18	17	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-29 11:10:26.691
19	18	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-29 11:36:23.904
20	19	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-29 13:57:10.425
21	20	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-31 12:11:21.531
22	21	\N	COMPLETED	2	Tạo đơn tại shop	2026-08-31 13:14:21.642
23	22	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-01 10:12:14.477
24	23	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-01 10:13:32.62
25	24	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-01 10:14:04.253
26	25	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-01 12:41:50.718
27	26	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-02 09:52:25.299
28	27	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-02 10:08:31.649
29	28	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-02 10:17:46.383
30	29	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-02 10:33:03.492
31	30	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-02 11:21:27.776
32	31	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-02 12:39:37.688
33	32	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 09:34:47.091
34	33	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 10:16:10.156
35	34	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 10:20:34.84
36	35	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 10:22:08.995
37	36	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 11:12:13.349
38	37	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 14:12:00.454
39	38	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 14:18:29.36
40	39	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-03 14:25:42.684
41	40	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 04:43:07.225
42	41	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 07:46:09.762
43	42	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 08:48:16.384
44	43	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 08:55:31.284
45	44	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 11:25:28.427
46	45	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 11:40:44.071
47	46	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-04 12:48:41.107
48	47	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-05 03:53:51.631
49	48	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-05 11:03:24.69
50	49	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-06 02:13:43.318
51	50	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-06 03:04:01.974
52	51	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-06 06:14:13.462
53	52	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-06 13:54:28.919
54	53	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-06 17:12:43.572
55	54	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 03:40:53.963
56	55	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 10:31:47.268
57	56	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 10:41:07.437
58	57	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 11:14:09.621
59	58	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 12:54:41.578
60	59	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 14:18:49.505
61	60	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-07 14:25:32.059
62	61	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-08 08:31:54.495
63	62	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-08 09:52:07.725
64	63	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-08 11:14:57.413
65	64	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-08 13:55:05.019
66	65	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-08 14:06:51.575
67	66	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-09 08:46:39.955
68	67	\N	COMPLETED	2	Tạo đơn tại shop	2026-09-09 09:55:25.063
\.


--
-- Data for Name: otp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otp (id, "userId", phone, "codeHash", purpose, "expiresAt", "consumedAt", "attemptCount", "ipAddress", device, "userAgent", "createdAt", email) FROM stdin;
1	2	\N	Y72maH-RPEPWaMiJwLZLTBfK-q4R3mMZAwFU0Oxi0-Q	REGISTER	2026-08-26 05:32:32.284	2026-08-26 05:27:47.655	0	14.241.253.25	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-26 05:27:32.287	nguyencongdanh872001@gmail.com
\.


--
-- Data for Name: password_reset_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_token (id, "userId", "tokenHash", "expiresAt", "consumedAt", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment (id, "orderId", method, status, amount, currency, "transactionId", "providerTransactionId", "providerResponse", "failureReason", "webhookPayload", "providerPayload", "paidAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payment_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_log (id, "paymentId", type, message, payload, "createdAt") FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product (id, title, "imageUrl", "imagePublicId", "categoryId", "importPrice", "sellPrice", quantity, "createdAt", "updatedAt", brand, "brandId", "careInstructions", description, gender, height, "isFeatured", "isPublished", length, material, "productStatus", "publishedAt", "seoDescription", "seoKeywords", "seoTitle", slug, "soldCount", tags, "videoUrl", "viewCount", visibility, weight, width, status, "organicFavoriteCount", "favoriteCountAdjustment", "descriptionContent", "descriptionHtml") FROM stdin;
220	S51			33	125000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-08-29 11:28:34.023	2026-08-29 11:28:34.023	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s51	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
225	S58			33	120000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-08-29 11:31:53.461	2026-08-29 11:31:53.461	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s58	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
21	Quần jean đùi nam			8	110000.000000000000000000000000000000	200000.000000000000000000000000000000	29	2026-04-06 09:46:15.978	2026-08-29 13:57:10.5	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
229	Dép da khâu			6	81000.000000000000000000000000000000	180000.000000000000000000000000000000	15	2026-08-29 14:10:35.969	2026-08-29 14:10:57.792	\N	\N	\N	\N	MEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	dep-da-khau	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
7	Túi nhỏ			4	0.000000000000000000000000000000	50000.000000000000000000000000000000	13	2026-04-06 09:02:41.846	2026-09-08 14:06:51.676	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
128	Quần short nam			9	0.000000000000000000000000000000	100000.000000000000000000000000000000	27	2026-05-23 14:06:25.054	2026-09-09 08:46:40.132	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
221	S52			33	140000.000000000000000000000000000000	290000.000000000000000000000000000000	1	2026-08-29 11:29:25.168	2026-08-29 11:29:25.168	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s52	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
226	S59			33	95000.000000000000000000000000000000	200000.000000000000000000000000000000	1	2026-08-29 11:32:48.802	2026-08-29 11:32:48.802	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s59	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
20	Dép da nam			6	64000.000000000000000000000000000000	160000.000000000000000000000000000000	29	2026-04-06 09:45:41.622	2026-08-29 14:12:11.269	\N	\N	\N	\N	\N	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	dep-da-nam	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
26	Áo thun nam-nữ			11	0.000000000000000000000000000000	60000.000000000000000000000000000000	72	2026-04-06 09:50:59.376	2026-09-08 13:55:05.095	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
93	Áo polo nam cao cấp			11	75000.000000000000000000000000000000	150000.000000000000000000000000000000	53	2026-05-12 15:53:02.852	2026-09-09 08:46:40.075	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
91	Giày thể thao nữ			7	85000.000000000000000000000000000000	140000.000000000000000000000000000000	19	2026-05-12 10:26:20.276	2026-06-22 14:52:41.137	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
216	S47			33	85000.000000000000000000000000000000	200000.000000000000000000000000000000	1	2026-08-29 11:00:04.487	2026-08-29 11:00:04.487	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s47	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
222	S55			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-08-29 11:30:17.709	2026-08-29 11:30:17.709	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s55	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
227	S53			33	145000.000000000000000000000000000000	290000.000000000000000000000000000000	1	2026-08-29 11:34:12.481	2026-08-29 11:34:12.481	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s53	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
133	Nón tai bèo			22	20000.000000000000000000000000000000	40000.000000000000000000000000000000	20	2026-06-02 03:30:12.049	2026-09-02 10:08:31.721	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
164	S3			33	125000.000000000000000000000000000000	250000.000000000000000000000000000000	0	2026-07-27 12:54:09.859	2026-08-19 04:25:14.256	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
174	S13			33	150000.000000000000000000000000000000	295000.000000000000000000000000000000	0	2026-07-27 12:57:47.512	2026-08-12 13:01:03.325	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
166	S5			33	135000.000000000000000000000000000000	280000.000000000000000000000000000000	0	2026-07-27 12:54:53.295	2026-08-07 15:30:17.843	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
32	Quần tây nữ			13	33000.000000000000000000000000000000	120000.000000000000000000000000000000	89	2026-04-06 09:54:28.769	2026-08-28 13:42:50.076	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
217	S48			33	103000.000000000000000000000000000000	220000.000000000000000000000000000000	1	2026-08-29 11:02:31.508	2026-08-29 11:02:31.508	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s48	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
223	S56			33	130000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-08-29 11:30:50.656	2026-08-29 11:30:50.656	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s56	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
228	S54			33	130000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-08-29 11:34:43.212	2026-08-29 11:34:43.212	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s54	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
41	Áo ngực			19	28000.000000000000000000000000000000	45000.000000000000000000000000000000	83	2026-04-06 09:59:33.172	2026-08-29 11:36:23.997	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
14	Sục nữ thấp			6	30000.000000000000000000000000000000	70000.000000000000000000000000000000	40	2026-04-06 09:12:37.787	2026-09-07 14:25:32.134	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
51	Dây nịt			5	37000.000000000000000000000000000000	80000.000000000000000000000000000000	16	2026-04-06 10:02:43.615	2026-09-08 08:31:54.59	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
34	Quần jean đùi nữ			8	0.000000000000000000000000000000	150000.000000000000000000000000000000	1	2026-04-06 09:55:11.128	2026-09-02 09:52:25.39	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
42	Quần lót nam			19	0.000000000000000000000000000000	40000.000000000000000000000000000000	44	2026-04-06 09:59:50.922	2026-09-08 08:31:54.628	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
13	Áo mưa			27	0.000000000000000000000000000000	10000.000000000000000000000000000000	10	2026-04-06 09:12:03.886	2026-04-06 09:12:03.886	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
23	Quần kaki nam			9	0.000000000000000000000000000000	100000.000000000000000000000000000000	17	2026-04-06 09:47:02.754	2026-08-12 14:11:32.587	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
57	Quần thun dày nam			10	56000.000000000000000000000000000000	120000.000000000000000000000000000000	11	2026-04-06 10:05:32.218	2026-09-03 10:16:10.233	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
55	Đồ ngủ tay ngắn quần dài			25	110000.000000000000000000000000000000	190000.000000000000000000000000000000	26	2026-04-06 10:04:28.66	2026-08-15 14:04:30.974	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
58	Đồ ngủ tay dài			25	115000.000000000000000000000000000000	190000.000000000000000000000000000000	24	2026-04-06 10:05:53.924	2026-08-10 13:32:05.254	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
29	Đồ bộ nam			12	0.000000000000000000000000000000	50000.000000000000000000000000000000	20	2026-04-06 09:51:51.856	2026-04-06 09:51:51.856	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
141	Dép kiểu nữ			6	35000.000000000000000000000000000000	100000.000000000000000000000000000000	47	2026-06-22 09:40:07.795	2026-08-28 10:23:02.977	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
15	Sục nữ cao			6	45000.000000000000000000000000000000	90000.000000000000000000000000000000	9	2026-04-06 09:13:03.012	2026-08-23 11:19:49.978	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
46	Áo khoác			21	0.000000000000000000000000000000	240000.000000000000000000000000000000	10	2026-04-06 10:01:11.516	2026-04-06 10:01:11.516	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
49	Nước hoa			23	0.000000000000000000000000000000	30000.000000000000000000000000000000	10	2026-04-06 10:02:01.861	2026-04-06 10:02:01.861	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
52	Ví nam			5	0.000000000000000000000000000000	50000.000000000000000000000000000000	10	2026-04-06 10:03:00.755	2026-04-06 10:03:14.613	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
75	Váy 6	https://res.cloudinary.com/danh7181/image/upload/v1780372356/finance-app/products/ozsq4zvrxyhocep5oyre.jpg	finance-app/products/ozsq4zvrxyhocep5oyre	30	110000.000000000000000000000000000000	220000.000000000000000000000000000000	0	2026-05-10 11:16:55.546	2026-06-02 03:52:37.76	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
17	Giày nam			7	70000.000000000000000000000000000000	120000.000000000000000000000000000000	38	2026-04-06 09:44:29.012	2026-09-03 10:20:34.942	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
61	Giày thể thao nam			7	0.000000000000000000000000000000	180000.000000000000000000000000000000	19	2026-04-08 15:05:03.791	2026-06-22 14:52:28.858	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
135	Túi trong suốt vừa			4	27000.000000000000000000000000000000	50000.000000000000000000000000000000	8	2026-06-02 03:41:52.646	2026-07-30 12:02:44.427	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
56	Đồ ngủ ngắn			25	100000.000000000000000000000000000000	150000.000000000000000000000000000000	25	2026-04-06 10:04:59.876	2026-08-13 11:18:17.752	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
24	Quần thun dài nam			10	75000.000000000000000000000000000000	120000.000000000000000000000000000000	0	2026-04-06 09:48:06.379	2026-09-05 11:36:58.323	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
40	Quần bí			18	0.000000000000000000000000000000	80000.000000000000000000000000000000	7	2026-04-06 09:57:36.711	2026-09-07 03:40:54.038	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
86	Váy 17	https://res.cloudinary.com/danh7181/image/upload/v1778412177/finance-app/products/g8sqibptjjgqcbi38pdt.jpg	finance-app/products/g8sqibptjjgqcbi38pdt	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	0	2026-05-10 11:22:57.732	2026-08-07 15:31:24.111	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
28	Áo nam xả			14	0.000000000000000000000000000000	50000.000000000000000000000000000000	18	2026-04-06 09:51:37.056	2026-04-08 12:48:04.019	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
31	Quần nam xả			14	0.000000000000000000000000000000	50000.000000000000000000000000000000	10	2026-04-06 09:54:04.725	2026-06-22 15:22:09.099	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
74	Váy 5	https://res.cloudinary.com/danh7181/image/upload/v1778411780/finance-app/products/ukdzcbvj1eo4ybshmm59.jpg	finance-app/products/ukdzcbvj1eo4ybshmm59	30	105000.000000000000000000000000000000	210000.000000000000000000000000000000	1	2026-05-10 11:16:21.046	2026-05-10 11:16:21.046	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
68	Dép tổ ong			6	0.000000000000000000000000000000	50000.000000000000000000000000000000	4	2026-05-02 08:59:36.812	2026-08-07 11:27:15.189	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
39	Chân váy xả			17	0.000000000000000000000000000000	50000.000000000000000000000000000000	9	2026-04-06 09:57:21.897	2026-05-16 15:21:11.787	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
27	Áo thun nam có cổ			11	0.000000000000000000000000000000	80000.000000000000000000000000000000	4	2026-04-06 09:51:19.562	2026-06-28 11:34:09.536	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
45	Giày da			7	0.000000000000000000000000000000	180000.000000000000000000000000000000	9	2026-04-06 10:00:54.518	2026-04-26 14:03:07.656	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
72	Váy 3	https://res.cloudinary.com/danh7181/image/upload/v1778411694/finance-app/products/nobl2wj2kz4qqb6oqjr4.jpg	finance-app/products/nobl2wj2kz4qqb6oqjr4	30	69000.000000000000000000000000000000	150000.000000000000000000000000000000	0	2026-05-10 11:14:55.239	2026-06-16 14:10:54.807	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
5	Dù nhỏ			3	0.000000000000000000000000000000	80000.000000000000000000000000000000	7	2026-04-06 09:02:02.427	2026-08-22 12:31:13.206	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
48	Ống tay			5	7500.000000000000000000000000000000	15000.000000000000000000000000000000	19	2026-04-06 10:01:47.689	2026-08-25 04:49:50.236	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
70	Váy 1	https://res.cloudinary.com/danh7181/image/upload/v1778411595/finance-app/products/dnbr7toxehl7qd5il6so.jpg	finance-app/products/dnbr7toxehl7qd5il6so	30	125000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-05-10 11:13:16.222	2026-05-10 11:13:16.222	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
50	Áo hai dây			24	0.000000000000000000000000000000	60000.000000000000000000000000000000	9	2026-04-06 10:02:21.559	2026-05-10 10:48:43.888	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
67	Áo xả 3 cái			14	0.000000000000000000000000000000	100000.000000000000000000000000000000	49	2026-04-29 15:04:39.054	2026-05-09 13:08:35.271	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
4	Balo lớn			2	0.000000000000000000000000000000	250000.000000000000000000000000000000	8	2026-04-06 09:01:44.171	2026-07-03 12:41:38.428	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
59	Khăn nhỏ			28	0.000000000000000000000000000000	20000.000000000000000000000000000000	3	2026-04-08 07:29:32.88	2026-07-19 12:15:33.676	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
143	Chân váy			17	0.000000000000000000000000000000	80000.000000000000000000000000000000	19	2026-06-28 09:48:43.697	2026-06-28 09:49:04.55	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
36	Đồ xả			14	0.000000000000000000000000000000	50000.000000000000000000000000000000	459	2026-04-06 09:56:00.593	2026-08-22 11:01:34.622	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
12	Bao tay lao động			26	0.000000000000000000000000000000	10000.000000000000000000000000000000	9	2026-04-06 09:10:06.261	2026-06-28 09:53:31.939	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
76	Váy 7	https://res.cloudinary.com/danh7181/image/upload/v1778411843/finance-app/products/nafdx3gww9kjlbj7ogw4.jpg	finance-app/products/nafdx3gww9kjlbj7ogw4	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-10 11:17:24.323	2026-05-10 11:17:24.323	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
148	Áo khoác jean			31	0.000000000000000000000000000000	250000.000000000000000000000000000000	6	2026-07-05 12:48:24.646	2026-08-23 11:52:32.162	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
11	Bao tay			26	0.000000000000000000000000000000	15000.000000000000000000000000000000	18	2026-04-06 09:09:45.927	2026-07-08 13:14:15.701	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
77	Váy 8	https://res.cloudinary.com/danh7181/image/upload/v1778411865/finance-app/products/byssdkd10ec7daxglagt.jpg	finance-app/products/byssdkd10ec7daxglagt	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-10 11:17:46.346	2026-05-10 11:17:46.346	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
35	Quần kaki nữ			9	0.000000000000000000000000000000	80000.000000000000000000000000000000	0	2026-04-06 09:55:28.866	2026-08-24 10:24:56.522	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
38	Áo kiểu			16	0.000000000000000000000000000000	170000.000000000000000000000000000000	16	2026-04-06 09:57:07.124	2026-08-14 12:52:59.785	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
66	Áo ba lỗ nam			29	28.000000000000000000000000000000	60.000000000000000000000000000000	3	2026-04-24 09:07:46.888	2026-04-25 06:10:28.413	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
62	Balo kiểu nữ lớn			2	0.000000000000000000000000000000	120000.000000000000000000000000000000	8	2026-04-09 11:37:57.716	2026-06-10 13:41:02.134	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
2	Balo kiểu nữ nhỏ			2	0.000000000000000000000000000000	100000.000000000000000000000000000000	6	2026-04-06 08:57:14.135	2026-08-16 10:52:08.404	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
152	Váy lô 19k			30	19000.000000000000000000000000000000	190000.000000000000000000000000000000	0	2026-07-11 12:40:38.071	2026-07-11 12:42:36.521	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
71	Váy 2	https://res.cloudinary.com/danh7181/image/upload/v1780372277/finance-app/products/tpvuezvpbri6abspoedn.jpg	finance-app/products/tpvuezvpbri6abspoedn	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-05-10 11:13:56.153	2026-06-02 03:51:18.722	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
101	Váy 24	https://res.cloudinary.com/danh7181/image/upload/v1779201215/finance-app/products/tqfyipnw01ablybzdzx6.jpg	finance-app/products/tqfyipnw01ablybzdzx6	30	100000.000000000000000000000000000000	200000.000000000000000000000000000000	0	2026-05-19 14:33:36.073	2026-07-11 12:41:03.849	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
107	Váy 30	https://res.cloudinary.com/danh7181/image/upload/v1779201678/finance-app/products/fb0cyynlmucpyrdupfjk.jpg	finance-app/products/fb0cyynlmucpyrdupfjk	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	1	2026-05-19 14:41:19.802	2026-07-12 05:35:00.17	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
102	Váy 25	https://res.cloudinary.com/danh7181/image/upload/v1779201382/finance-app/products/bw2za8xv85shizuuqsdg.jpg	finance-app/products/bw2za8xv85shizuuqsdg	30	135000.000000000000000000000000000000	270000.000000000000000000000000000000	0	2026-05-19 14:36:23.517	2026-08-16 15:12:00.13	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
84	Váy 15	https://res.cloudinary.com/danh7181/image/upload/v1778412107/finance-app/products/hfv6soemvc2nwrq83boz.jpg	finance-app/products/hfv6soemvc2nwrq83boz	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-10 11:21:48.424	2026-05-10 11:21:48.424	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
85	Váy 16	https://res.cloudinary.com/danh7181/image/upload/v1778412132/finance-app/products/kvlklbuwei94gveexaih.jpg	finance-app/products/kvlklbuwei94gveexaih	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-10 11:22:13.085	2026-05-10 11:22:13.085	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
80	Váy 11	https://res.cloudinary.com/danh7181/image/upload/v1780372383/finance-app/products/x9dxivctwoxksjv9ijgi.jpg	finance-app/products/x9dxivctwoxksjv9ijgi	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-05-10 11:19:58.328	2026-06-02 04:15:07.973	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
114	Váy 37	https://res.cloudinary.com/danh7181/image/upload/v1780374547/finance-app/products/parnm5shofftmehmgfxx.jpg	finance-app/products/parnm5shofftmehmgfxx	30	125000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-05-19 14:45:49.026	2026-06-02 04:29:09.755	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
92	Áo thun nam cao cấp			11	65000.000000000000000000000000000000	150000.000000000000000000000000000000	21	2026-05-12 15:50:56.561	2026-08-25 11:10:23.082	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
98	Váy 21	https://res.cloudinary.com/danh7181/image/upload/v1779201096/finance-app/products/bsa0y4jhbetqhge6c9ew.jpg	finance-app/products/bsa0y4jhbetqhge6c9ew	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-05-19 14:31:37.534	2026-05-23 14:34:38.956	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
90	Sơ mi nữ			20	90000.000000000000000000000000000000	180000.000000000000000000000000000000	18	2026-05-11 13:09:45.594	2026-08-01 16:07:42.486	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
44	Sơ mi nam			20	23000.000000000000000000000000000000	150000.000000000000000000000000000000	20	2026-04-06 10:00:37.386	2026-08-28 12:20:23.544	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
33	Quần jean nữ dài			8	105000.000000000000000000000000000000	250000.000000000000000000000000000000	38	2026-04-06 09:54:51.144	2026-08-28 12:51:31.918	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
149	Áo thun JetJet			11	36000.000000000000000000000000000000	150000.000000000000000000000000000000	18	2026-07-06 12:57:12.01	2026-09-04 08:48:16.49	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
218	S49			33	100000.000000000000000000000000000000	200000.000000000000000000000000000000	1	2026-08-29 11:03:07.292	2026-08-29 11:03:07.292	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s49	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
64	Dép kẹp nam			6	0.000000000000000000000000000000	50000.000000000000000000000000000000	20	2026-04-12 11:25:30.65	2026-09-01 10:14:04.328	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
22	Quần jean dài nam			8	145000.000000000000000000000000000000	230000.000000000000000000000000000000	10	2026-04-06 09:46:43.12	2026-09-01 10:12:14.556	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
16	Giày nữ			7	63000.000000000000000000000000000000	120000.000000000000000000000000000000	12	2026-04-06 09:33:34.536	2026-09-07 10:41:07.513	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
9	Khẩu trang			5	0.000000000000000000000000000000	10000.000000000000000000000000000000	49	2026-04-06 09:05:17.096	2026-09-07 11:14:09.754	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
37	Quần ống suôn			15	0.000000000000000000000000000000	160000.000000000000000000000000000000	3	2026-04-06 09:56:50.933	2026-09-03 09:34:47.22	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
43	Quần lót nữ			19	9000.000000000000000000000000000000	15000.000000000000000000000000000000	195	2026-04-06 10:00:18.624	2026-09-03 11:12:13.426	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
54	Dép da nam hai quai			6	95000.000000000000000000000000000000	160000.000000000000000000000000000000	5	2026-04-06 10:03:59.994	2026-09-04 12:48:41.182	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
53	Sục nam			6	46000.000000000000000000000000000000	90000.000000000000000000000000000000	35	2026-04-06 10:03:39.114	2026-09-07 10:31:47.337	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
6	Dù lớn			3	0.000000000000000000000000000000	100000.000000000000000000000000000000	6	2026-04-06 09:02:20.569	2026-09-06 17:12:43.645	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
10	Lót giày			5	0.000000000000000000000000000000	15000.000000000000000000000000000000	8	2026-04-06 09:05:42.201	2026-09-08 13:55:05.127	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
19	Dép quai ngang Nam			6	34000.000000000000000000000000000000	90000.000000000000000000000000000000	33	2026-04-06 09:45:18.368	2026-09-09 08:46:40.103	\N	\N	\N	\N	MEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	dep-quai-ngang-nam	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
99	Váy 22	https://res.cloudinary.com/danh7181/image/upload/v1779201134/finance-app/products/xzhskaxjudlg7vcoqdw3.jpg	finance-app/products/xzhskaxjudlg7vcoqdw3	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-19 14:32:15.387	2026-05-19 14:32:15.387	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
97	Váy 20	https://res.cloudinary.com/danh7181/image/upload/v1779201063/finance-app/products/cr6ab8kvgom7c3dm5rfi.jpg	finance-app/products/cr6ab8kvgom7c3dm5rfi	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-05-19 14:31:04.497	2026-07-10 11:52:27.41	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
95	Áo thun nam tay dài			11	0.000000000000000000000000000000	80000.000000000000000000000000000000	18	2026-05-13 14:14:19.77	2026-05-13 14:14:33.328	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
103	Váy 26	https://res.cloudinary.com/danh7181/image/upload/v1779201423/finance-app/products/jxhxx9fnn4kn3q3mdu0i.jpg	finance-app/products/jxhxx9fnn4kn3q3mdu0i	30	125000.000000000000000000000000000000	250000.000000000000000000000000000000	0	2026-05-19 14:37:04.228	2026-07-10 11:55:24.274	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
160	L71 Demi DingDing			32	71000.000000000000000000000000000000	220000.000000000000000000000000000000	26	2026-07-23 15:48:10.104	2026-08-13 12:45:45.119	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
150	Váy 49			30	85000.000000000000000000000000000000	190000.000000000000000000000000000000	0	2026-07-10 13:30:37.98	2026-07-10 13:30:48.927	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
146	Đồ tole dây			25	60000.000000000000000000000000000000	130000.000000000000000000000000000000	22	2026-06-30 09:44:05.045	2026-08-28 10:36:54.172	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
89	Khăn tắm			28	28000.000000000000000000000000000000	60000.000000000000000000000000000000	2	2026-05-10 14:23:36.908	2026-08-28 10:08:35.833	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
96	Sandal nữ			7	0.000000000000000000000000000000	100000.000000000000000000000000000000	10	2026-05-14 14:41:14.331	2026-08-22 12:13:41.318	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
147	Đồ tole đùi			25	86000.000000000000000000000000000000	150000.000000000000000000000000000000	9	2026-06-30 09:44:32.361	2026-08-13 11:18:11.758	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
79	Váy 10	https://res.cloudinary.com/danh7181/image/upload/v1778411965/finance-app/products/ygvhh8lg3bwi6fiyqcnf.jpg	finance-app/products/ygvhh8lg3bwi6fiyqcnf	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-05-10 11:19:26.606	2026-06-02 04:14:59.954	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
94	Áo mưa một lần			27	0.000000000000000000000000000000	10000.000000000000000000000000000000	16	2026-05-12 15:55:59.213	2026-08-10 15:20:17.435	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
88	Váy 19	https://res.cloudinary.com/danh7181/image/upload/v1778412234/finance-app/products/yeedbc80omwpanot9bpx.jpg	finance-app/products/yeedbc80omwpanot9bpx	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-05-10 11:23:55.2	2026-06-16 14:11:01.775	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
81	Váy 12	https://res.cloudinary.com/danh7181/image/upload/v1778412027/finance-app/products/kg5csv1zcdpviyuwksfq.jpg	finance-app/products/kg5csv1zcdpviyuwksfq	30	110000.000000000000000000000000000000	220000.000000000000000000000000000000	1	2026-05-10 11:20:27.711	2026-06-02 04:15:14.461	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
115	Váy 38	https://res.cloudinary.com/danh7181/image/upload/v1780374568/finance-app/products/omxkmrfky6yor0ljjays.jpg	finance-app/products/omxkmrfky6yor0ljjays	30	90000.000000000000000000000000000000	180000.000000000000000000000000000000	0	2026-05-19 14:46:17.176	2026-06-07 14:20:34.12	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
116	Váy 39	https://res.cloudinary.com/danh7181/image/upload/v1779202002/finance-app/products/a7yrmoty8fdflv4qcp2e.jpg	finance-app/products/a7yrmoty8fdflv4qcp2e	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	0	2026-05-19 14:46:43.493	2026-06-02 04:17:36.71	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
87	Váy 18	https://res.cloudinary.com/danh7181/image/upload/v1778412207/finance-app/products/npquqhvfxquzq2h0w6wc.jpg	finance-app/products/npquqhvfxquzq2h0w6wc	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	0	2026-05-10 11:23:28.044	2026-05-25 10:56:08.622	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
82	Váy 13	https://res.cloudinary.com/danh7181/image/upload/v1778412054/finance-app/products/ylvacqux7qkwacqiqhma.jpg	finance-app/products/ylvacqux7qkwacqiqhma	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-05-10 11:20:55.356	2026-06-02 04:15:22.952	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
83	Váy 14	https://res.cloudinary.com/danh7181/image/upload/v1778412084/finance-app/products/nyeygiphhvwvnb9mbycp.jpg	finance-app/products/nyeygiphhvwvnb9mbycp	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-10 11:21:25.582	2026-06-02 04:15:31.564	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
104	Váy 27	https://res.cloudinary.com/danh7181/image/upload/v1779201576/finance-app/products/ayzxbqiyifceseg8czpb.jpg	finance-app/products/ayzxbqiyifceseg8czpb	30	135000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-05-19 14:39:37.831	2026-06-02 04:16:21.775	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
105	Váy 28	https://res.cloudinary.com/danh7181/image/upload/v1779201609/finance-app/products/ls9aep3g0iwlhx1l9xgw.jpg	finance-app/products/ls9aep3g0iwlhx1l9xgw	30	150000.000000000000000000000000000000	300000.000000000000000000000000000000	1	2026-05-19 14:40:10.4	2026-06-02 04:16:27.01	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
106	Váy 29	https://res.cloudinary.com/danh7181/image/upload/v1779201648/finance-app/products/okesa3wpvdzrd7e2mxxp.jpg	finance-app/products/okesa3wpvdzrd7e2mxxp	30	135000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-05-19 14:40:48.981	2026-06-02 04:16:33.181	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
109	Váy 32	https://res.cloudinary.com/danh7181/image/upload/v1779201738/finance-app/products/mdwzmuqulsgdims7zlbg.jpg	finance-app/products/mdwzmuqulsgdims7zlbg	30	105000.000000000000000000000000000000	210000.000000000000000000000000000000	1	2026-05-19 14:42:19.908	2026-06-02 04:16:52.458	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
110	Váy 33	https://res.cloudinary.com/danh7181/image/upload/v1779201786/finance-app/products/tnnuiuyuyxwcbbyw6kgx.jpg	finance-app/products/tnnuiuyuyxwcbbyw6kgx	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	1	2026-05-19 14:43:07.122	2026-06-02 04:17:00.978	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
111	Váy 34	https://res.cloudinary.com/danh7181/image/upload/v1779201821/finance-app/products/sjzmu9mq6mjb0rrfuycp.jpg	finance-app/products/sjzmu9mq6mjb0rrfuycp	30	145000.000000000000000000000000000000	290000.000000000000000000000000000000	1	2026-05-19 14:43:42.144	2026-06-02 04:17:06.735	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
113	Váy 36	https://res.cloudinary.com/danh7181/image/upload/v1779201919/finance-app/products/vprsvsq09liic9vhytiu.jpg	finance-app/products/vprsvsq09liic9vhytiu	30	120000.000000000000000000000000000000	240000.000000000000000000000000000000	1	2026-05-19 14:45:20.644	2026-06-02 04:17:19.246	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
100	Váy 23	https://res.cloudinary.com/danh7181/image/upload/v1780372672/finance-app/products/tlojm7npxqdvjvptqh8x.jpg	finance-app/products/tlojm7npxqdvjvptqh8x	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	0	2026-05-19 14:32:47.247	2026-06-07 14:20:45.602	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
134	Túi trong suốt nhỏ			4	22000.000000000000000000000000000000	40000.000000000000000000000000000000	10	2026-06-02 03:41:28.519	2026-06-02 03:41:28.519	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
142	Mắt kính			5	0.000000000000000000000000000000	30.000000000000000000000000000000	29	2026-06-28 08:49:36.231	2026-06-28 08:49:47.408	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
189	Thun nam lô 51k			11	51000.000000000000000000000000000000	150000.000000000000000000000000000000	44	2026-07-29 11:27:49.486	2026-08-21 14:39:49.129	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
165	S4			33	150000.000000000000000000000000000000	295000.000000000000000000000000000000	1	2026-07-27 12:54:32.555	2026-07-27 12:54:32.555	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
117	Váy 40	https://res.cloudinary.com/danh7181/image/upload/v1779202036/finance-app/products/vhxydptdsmwbxbhjzctu.jpg	finance-app/products/vhxydptdsmwbxbhjzctu	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	1	2026-05-19 14:47:17.277	2026-06-02 04:17:41.328	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
167	S6			33	65000.000000000000000000000000000000	160000.000000000000000000000000000000	1	2026-07-27 12:55:09.113	2026-07-27 12:55:09.113	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
119	Váy 42	https://res.cloudinary.com/danh7181/image/upload/v1779202104/finance-app/products/bsmnyy7lpriwlwtcc0po.jpg	finance-app/products/bsmnyy7lpriwlwtcc0po	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	1	2026-05-19 14:48:25.188	2026-06-02 04:17:50.25	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
122	Váy 45	https://res.cloudinary.com/danh7181/image/upload/v1780373573/finance-app/products/dfao992zijdhofzlszyd.jpg	finance-app/products/dfao992zijdhofzlszyd	30	95000.000000000000000000000000000000	190000.000000000000000000000000000000	1	2026-05-19 14:49:49.144	2026-06-02 04:18:28.183	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
123	Váy 46	https://res.cloudinary.com/danh7181/image/upload/v1779202228/finance-app/products/c4oscnt7zpndjoajyyl8.jpg	finance-app/products/c4oscnt7zpndjoajyyl8	30	95000.000000000000000000000000000000	190000.000000000000000000000000000000	0	2026-05-19 14:50:29.081	2026-06-02 04:18:34.867	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
144	Đồ ngủ la tinh			25	40000.000000000000000000000000000000	100000.000000000000000000000000000000	88	2026-06-28 10:07:33.705	2026-09-03 10:22:09.07	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
157	Jean ống suông nam			8	46000.000000000000000000000000000000	220000.000000000000000000000000000000	41	2026-07-18 12:59:12.643	2026-09-04 08:48:16.459	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
69	Dép xốp			6	11000.000000000000000000000000000000	20000.000000000000000000000000000000	48	2026-05-08 12:28:01.728	2026-09-07 14:25:32.185	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
124	Váy 47	https://res.cloudinary.com/danh7181/image/upload/v1779202254/finance-app/products/hsdhsph22gtlmmhvo5uh.jpg	finance-app/products/hsdhsph22gtlmmhvo5uh	30	95000.000000000000000000000000000000	190000.000000000000000000000000000000	1	2026-05-19 14:50:55.084	2026-06-02 04:18:39.565	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
130	Váy 48	https://res.cloudinary.com/danh7181/image/upload/v1780231001/finance-app/products/foh8f33hu80e2wvrzzyp.jpg	finance-app/products/foh8f33hu80e2wvrzzyp	30	40000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-05-31 12:36:42.22	2026-06-02 04:18:43.329	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
112	Váy 35	https://res.cloudinary.com/danh7181/image/upload/v1780374496/finance-app/products/dx4wi9lzakhwpjrzn6xy.jpg	finance-app/products/dx4wi9lzakhwpjrzn6xy	30	130000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-05-19 14:44:43.287	2026-06-02 04:28:17.449	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
121	Váy 44	https://res.cloudinary.com/danh7181/image/upload/v1780374632/finance-app/products/ymhu6lhykdzuzj4khhli.jpg	finance-app/products/ymhu6lhykdzuzj4khhli	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	1	2026-05-19 14:49:15.975	2026-06-02 04:30:33.7	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
120	Váy 43	https://res.cloudinary.com/danh7181/image/upload/v1779202130/finance-app/products/pzbzlzk12wur0ejmvaif.jpg	finance-app/products/pzbzlzk12wur0ejmvaif	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	0	2026-05-19 14:48:51.811	2026-07-11 12:40:56.575	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
151	Váy 50			30	150000.000000000000000000000000000000	295000.000000000000000000000000000000	0	2026-07-11 12:39:36.56	2026-07-11 12:42:42.495	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
153	Giày sục gót vải	https://res.cloudinary.com/danh7181/image/upload/v1784032726/finance-app/products/pjhdqz4bo0qjwzdaa6uw.jpg	finance-app/products/pjhdqz4bo0qjwzdaa6uw	7	55000.000000000000000000000000000000	100000.000000000000000000000000000000	1	2026-07-14 12:38:47.207	2026-07-23 09:20:39.619	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
129	Đồ ngủ tăm lạnh			25	28000.000000000000000000000000000000	70000.000000000000000000000000000000	34	2026-05-29 09:07:33.65	2026-08-14 12:54:52.335	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
178	S17			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-07-27 12:59:29.248	2026-07-27 12:59:29.248	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
127	Giày nam siêu nhẹ			7	110000.000000000000000000000000000000	200000.000000000000000000000000000000	8	2026-05-22 13:14:59.054	2026-06-16 14:24:59.921	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
145	Đồ tole dài			25	94000.000000000000000000000000000000	190000.000000000000000000000000000000	20	2026-06-30 09:43:29.857	2026-07-12 12:57:59.242	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
158	Váy 51			30	0.000000000000000000000000000000	250000.000000000000000000000000000000	0	2026-07-19 11:16:19.624	2026-07-19 11:16:30.336	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
170	S9			33	120000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-07-27 12:56:25.493	2026-07-27 12:56:25.493	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
171	S10			33	135000.000000000000000000000000000000	280000.000000000000000000000000000000	1	2026-07-27 12:56:40.287	2026-07-27 12:56:40.287	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
159	Quần kaki nam			9	29000.000000000000000000000000000000	100000.000000000000000000000000000000	58	2026-07-21 14:28:39.564	2026-08-13 12:45:35.679	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
118	Váy 41	https://res.cloudinary.com/danh7181/image/upload/v1779202070/finance-app/products/pxn85h8qqmghvphiwfeh.jpg	finance-app/products/pxn85h8qqmghvphiwfeh	30	69000.000000000000000000000000000000	140000.000000000000000000000000000000	0	2026-05-19 14:47:51.794	2026-07-05 11:11:05.325	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
155	Giày kiểu nữ	https://res.cloudinary.com/danh7181/image/upload/v1784032827/finance-app/products/nawgpcnqlgqhulvvgbqz.jpg	finance-app/products/nawgpcnqlgqhulvvgbqz	7	75000.000000000000000000000000000000	180000.000000000000000000000000000000	15	2026-07-14 12:40:28.733	2026-07-14 12:40:28.733	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
168	S7			33	130000.000000000000000000000000000000	270000.000000000000000000000000000000	0	2026-07-27 12:55:34.036	2026-08-05 13:58:07.707	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
140	Túi xách			4	0.000000000000000000000000000000	50000.000000000000000000000000000000	19	2026-06-21 09:24:26.051	2026-06-21 09:24:38.182	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
78	Váy 9	https://res.cloudinary.com/danh7181/image/upload/v1778411934/finance-app/products/clp4vllwfmynlz27h4zg.jpg	finance-app/products/clp4vllwfmynlz27h4zg	30	140000.000000000000000000000000000000	280000.000000000000000000000000000000	0	2026-05-10 11:18:55.175	2026-07-05 11:11:10.792	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
163	S2			33	130000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-07-26 09:22:47.562	2026-07-26 09:22:47.562	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
162	S1			33	135000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-07-26 09:19:57.016	2026-07-26 09:23:21.119	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
108	Váy 31	https://res.cloudinary.com/danh7181/image/upload/v1779201707/finance-app/products/tqm5xexza90tphw9ckgv.jpg	finance-app/products/tqm5xexza90tphw9ckgv	30	210000.000000000000000000000000000000	210000.000000000000000000000000000000	0	2026-05-19 14:41:48.882	2026-07-05 12:50:30.287	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
137	Dép bánh mì			6	22000.000000000000000000000000000000	90000.000000000000000000000000000000	48	2026-06-18 04:37:07.118	2026-08-12 12:04:16.606	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
173	S12			33	155000.000000000000000000000000000000	300000.000000000000000000000000000000	1	2026-07-27 12:57:27.914	2026-07-27 12:57:27.914	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
179	S18			33	115000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-07-27 12:59:46.648	2026-07-27 12:59:46.648	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
177	S16			33	130000.000000000000000000000000000000	270000.000000000000000000000000000000	0	2026-07-27 12:59:03.547	2026-08-14 13:04:21.957	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
136	Nón kết nike			22	20000.000000000000000000000000000000	40000.000000000000000000000000000000	0	2026-06-02 03:42:33.608	2026-08-22 14:13:27.35	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
161	Hàng tồn			5	0.000000000000000000000000000000	100000.000000000000000000000000000000	46	2026-07-24 07:52:13.399	2026-07-27 12:52:37.076	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
186	S25			33	120000.000000000000000000000000000000	250000.000000000000000000000000000000	0	2026-07-27 13:02:15.71	2026-08-16 01:31:12.338	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
175	S14			33	115000.000000000000000000000000000000	240000.000000000000000000000000000000	1	2026-07-27 12:58:12.9	2026-07-27 12:58:12.9	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
176	S15			33	80000.000000000000000000000000000000	170000.000000000000000000000000000000	1	2026-07-27 12:58:41.999	2026-07-27 12:58:41.999	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
180	S19			33	115000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-07-27 13:00:09.241	2026-07-27 13:00:09.241	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
181	S20			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-07-27 13:00:30.355	2026-07-27 13:00:30.355	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
182	S21			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-07-27 13:00:50.391	2026-07-27 13:00:50.391	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
183	S22			33	120000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-07-27 13:01:11.99	2026-07-27 13:01:11.99	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
184	S23			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	1	2026-07-27 13:01:30.406	2026-07-27 13:01:30.406	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
187	S26			33	95000.000000000000000000000000000000	190000.000000000000000000000000000000	1	2026-07-27 13:02:40.873	2026-07-27 13:02:40.873	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
188	S27			33	80000.000000000000000000000000000000	170000.000000000000000000000000000000	1	2026-07-27 13:02:57.197	2026-07-27 13:02:57.197	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
185	S24			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-07-27 13:01:58.145	2026-07-27 13:03:18.715	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
125	Áo polo nam			11	60000.000000000000000000000000000000	130000.000000000000000000000000000000	35	2026-05-20 08:28:58.912	2026-07-27 13:03:45.268	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
138	Sục nam lô 22k			6	22000.000000000000000000000000000000	90000.000000000000000000000000000000	36	2026-06-19 12:51:35.164	2026-08-24 06:39:10.371	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
126	Dép chữ H			6	55000.000000000000000000000000000000	100000.000000000000000000000000000000	3	2026-05-22 13:08:17.543	2026-08-07 15:32:32.628	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
172	S11			33	90000.000000000000000000000000000000	200000.000000000000000000000000000000	0	2026-07-27 12:57:02.761	2026-08-23 10:37:09.267	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
65	Giày sục	https://res.cloudinary.com/danh7181/image/upload/v1784032684/finance-app/products/fej2fev08wbapjrrycva.jpg	finance-app/products/fej2fev08wbapjrrycva	7	70000.000000000000000000000000000000	120000.000000000000000000000000000000	5	2026-04-24 09:01:28.17	2026-08-23 13:04:56.239	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
191	Sục nữ 19k			6	19000.000000000000000000000000000000	70000.000000000000000000000000000000	0	2026-08-09 11:08:03.287	2026-08-09 11:08:16.376	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
215	Quần tây nữ umi lưng thun			13	40000.000000000000000000000000000000	140000.000000000000000000000000000000	50	2026-08-28 10:03:28.849	2026-08-28 10:03:40.537	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
214	Quần thun dài mỏng nữ			10	37000.000000000000000000000000000000	130000.000000000000000000000000000000	30	2026-08-28 08:29:54.655	2026-09-08 11:14:57.513	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
169	S8			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	0	2026-07-27 12:55:50.243	2026-08-29 11:10:26.762	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
192	Polo 43k			11	43000.000000000000000000000000000000	170000.000000000000000000000000000000	86	2026-08-09 11:58:32.347	2026-09-01 10:13:34.072	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
139	Sục nữ  33k			6	33000.000000000000000000000000000000	70000.000000000000000000000000000000	18	2026-06-20 12:56:52.335	2026-09-02 11:21:27.935	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
132	Quần túi hộp			10	130000.000000000000000000000000000000	200000.000000000000000000000000000000	3	2026-06-01 14:38:44.48	2026-09-06 06:14:13.534	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
30	Quần tây nam			13	104000.000000000000000000000000000000	200000.000000000000000000000000000000	34	2026-04-06 09:53:43.869	2026-09-09 09:55:25.133	\N	\N	\N	\N	\N	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	quan-tay-nam	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
154	Giày sục nhựa	https://res.cloudinary.com/danh7181/image/upload/v1784032767/finance-app/products/blnuhmzptagyllaq00go.jpg	finance-app/products/blnuhmzptagyllaq00go	7	55000.000000000000000000000000000000	120000.000000000000000000000000000000	2	2026-07-14 12:39:28.639	2026-08-11 14:50:50.467	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
190	Lô áo thun nữ 59			11	59000.000000000000000000000000000000	130000.000000000000000000000000000000	46	2026-07-30 12:13:11.667	2026-08-22 12:14:33.511	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
193	Dán cúp ngực			19	30000.000000000000000000000000000000	50000.000000000000000000000000000000	7	2026-08-19 04:29:53.033	2026-08-23 10:37:19.98	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
3	Balo nhỏ			2	0.000000000000000000000000000000	150000.000000000000000000000000000000	6	2026-04-06 09:01:25.266	2026-08-25 11:11:22.659	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
195	s28			33	110000.000000000000000000000000000000	200000.000000000000000000000000000000	4	2026-08-27 09:59:37.687	2026-08-27 09:59:37.687	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
196	s29			33	140000.000000000000000000000000000000	280000.000000000000000000000000000000	3	2026-08-27 09:59:55.768	2026-08-27 09:59:55.768	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
197	s30			33	145000.000000000000000000000000000000	290000.000000000000000000000000000000	1	2026-08-27 10:00:30.914	2026-08-27 10:00:30.914	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
198	s31			33	95000.000000000000000000000000000000	180000.000000000000000000000000000000	1	2026-08-27 10:00:53.646	2026-08-27 10:00:53.646	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
199	s32			33	85000.000000000000000000000000000000	190000.000000000000000000000000000000	1	2026-08-27 10:01:13.027	2026-08-27 10:01:13.027	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
201	s34			33	145000.000000000000000000000000000000	290000.000000000000000000000000000000	1	2026-08-27 10:01:55.896	2026-08-27 10:01:55.896	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
202	s35			33	125000.000000000000000000000000000000	260000.000000000000000000000000000000	2	2026-08-27 10:02:16.531	2026-08-27 10:02:16.531	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
203	s36			33	145000.000000000000000000000000000000	290000.000000000000000000000000000000	1	2026-08-27 10:02:55.834	2026-08-27 10:02:55.834	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
205	s38			33	120000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-08-27 10:03:37.801	2026-08-27 10:03:37.801	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
206	s39			33	110000.000000000000000000000000000000	240000.000000000000000000000000000000	1	2026-08-27 10:03:52.925	2026-08-27 10:03:52.925	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
207	s40			33	110000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-08-27 10:04:08.926	2026-08-27 10:04:14.402	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
208	s41			33	145000.000000000000000000000000000000	290000.000000000000000000000000000000	2	2026-08-27 10:12:05.405	2026-08-27 10:12:05.405	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
209	s42			33	90000.000000000000000000000000000000	180000.000000000000000000000000000000	3	2026-08-27 10:12:21.72	2026-08-27 10:12:21.72	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
210	s43			33	80000.000000000000000000000000000000	170000.000000000000000000000000000000	2	2026-08-27 10:15:39.85	2026-08-27 10:15:39.85	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
212	s45			33	100000.000000000000000000000000000000	200000.000000000000000000000000000000	3	2026-08-27 10:25:00.474	2026-08-27 10:25:00.474	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
8	Túi lớn			4	38000.000000000000000000000000000000	60000.000000000000000000000000000000	4	2026-04-06 09:03:02.625	2026-08-27 11:58:06.099	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
18	Dép nữ			6	0.000000000000000000000000000000	50000.000000000000000000000000000000	78	2026-04-06 09:44:55.963	2026-08-28 08:43:04.502	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
219	S50			33	165000.000000000000000000000000000000	330000.000000000000000000000000000000	1	2026-08-29 11:06:47.189	2026-08-29 11:06:47.189	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s50	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
200	s33			33	125000.000000000000000000000000000000	250000.000000000000000000000000000000	1	2026-08-27 10:01:35.264	2026-08-29 11:10:26.793	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
224	S57			33	131000.000000000000000000000000000000	270000.000000000000000000000000000000	1	2026-08-29 11:31:15.518	2026-08-29 11:31:15.518	\N	\N	\N	\N	WOMEN	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	s57	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
204	s37			33	131000.000000000000000000000000000000	265000.000000000000000000000000000000	0	2026-08-27 10:03:18.359	2026-08-31 13:14:21.715	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
213	S46			33	100000.000000000000000000000000000000	200000.000000000000000000000000000000	1	2026-08-27 10:31:07.239	2026-08-31 13:14:21.75	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
25	Quần thun mỏng nam			10	40000.000000000000000000000000000000	80000.000000000000000000000000000000	42	2026-04-06 09:49:08.256	2026-09-02 10:33:03.597	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
63	Quần lót nam boxy			19	0.000000000000000000000000000000	45000.000000000000000000000000000000	5	2026-04-12 08:12:25.799	2026-09-04 04:43:07.293	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
73	Váy 4	https://res.cloudinary.com/danh7181/image/upload/v1780372325/finance-app/products/wb1ij8kzcj68nlesfyon.jpg	finance-app/products/wb1ij8kzcj68nlesfyon	30	160000.000000000000000000000000000000	280000.000000000000000000000000000000	0	2026-05-10 11:15:25.433	2026-09-06 13:54:29.078	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
211	s44			33	105000.000000000000000000000000000000	210000.000000000000000000000000000000	1	2026-08-27 10:20:47.75	2026-09-06 13:54:29.111	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
1	Vớ			1	7000.000000000000000000000000000000	10000.000000000000000000000000000000	98	2026-04-06 08:56:49.326	2026-09-07 11:14:09.727	\N	\N	\N	\N	\N	\N	f	f	\N	\N	ACTIVE	\N	\N	\N	\N	vo	0	\N	\N	0	PRIVATE	\N	\N	PRIVATE	0	0	\N	\N
194	Giày nhựa nữ			7	64000.000000000000000000000000000000	120000.000000000000000000000000000000	4	2026-08-24 08:30:03.951	2026-09-07 11:14:09.782	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
47	Nón kết			22	25000.000000000000000000000000000000	50000.000000000000000000000000000000	37	2026-04-06 10:01:28.049	2026-09-08 09:52:07.837	\N	\N	\N	\N	\N	\N	f	f	\N	\N	DRAFT	\N	\N	\N	\N	\N	0	\N	\N	0	PUBLIC	\N	\N	PRIVATE	0	0	\N	\N
\.


--
-- Data for Name: product_draft; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_draft (id, mode, status, "originalProductId", "createdById", "currentStep", data, version, "appliedAt", "discardedAt", "createdAt", "updatedAt") FROM stdin;
7	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S55", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "260000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "125000", "productStatus": "PRIVATE", "seoDescription": ""}	11	2026-08-29 11:30:17.719	\N	2026-08-29 11:29:33.083	2026-08-29 11:30:17.72
11	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S59", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "200000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "95000", "productStatus": "PRIVATE", "seoDescription": ""}	9	2026-08-29 11:32:48.813	\N	2026-08-29 11:32:18.527	2026-08-29 11:32:48.814
6	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S52", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "290000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "140000", "productStatus": "PRIVATE", "seoDescription": ""}	10	2026-08-29 11:29:25.181	\N	2026-08-29 11:28:40.01	2026-08-29 11:29:25.181
3	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S49", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "200000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "100000", "productStatus": "PRIVATE", "seoDescription": ""}	8	2026-08-29 11:03:07.302	\N	2026-08-29 11:02:39.169	2026-08-29 11:03:07.302
10	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S58", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "250000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "120000", "productStatus": "PRIVATE", "seoDescription": ""}	8	2026-08-29 11:31:53.47	\N	2026-08-29 11:31:18.739	2026-08-29 11:31:53.471
1	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S47", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "200000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "85000", "productStatus": "PRIVATE", "seoDescription": ""}	11	2026-08-29 11:00:04.5	\N	2026-08-28 11:24:16.302	2026-08-29 11:00:04.502
5	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S51", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "250000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "125000", "productStatus": "PRIVATE", "seoDescription": ""}	13	2026-08-29 11:28:34.033	\N	2026-08-29 11:27:18.624	2026-08-29 11:28:34.035
9	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S57", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "270000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "131000", "productStatus": "PRIVATE", "seoDescription": ""}	8	2026-08-29 11:31:15.528	\N	2026-08-29 11:30:52.117	2026-08-29 11:31:15.528
4	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S50", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "330000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "165000", "productStatus": "PRIVATE", "seoDescription": ""}	7	2026-08-29 11:06:47.199	\N	2026-08-29 11:06:20.816	2026-08-29 11:06:47.2
2	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S48", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "220000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "103000", "productStatus": "PRIVATE", "seoDescription": ""}	7	2026-08-29 11:02:31.519	\N	2026-08-29 11:01:57.617	2026-08-29 11:02:31.52
8	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S56", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "270000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "130000", "productStatus": "PRIVATE", "seoDescription": ""}	9	2026-08-29 11:30:50.671	\N	2026-08-29 11:30:19.079	2026-08-29 11:30:50.671
14	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "Dép da khâu", "gender": "MEN", "images": [], "quantity": "15", "seoTitle": "", "variants": [], "sellPrice": "1800000", "categoryId": "6", "colorGroups": [], "description": "", "importPrice": "81000", "productStatus": "PRIVATE", "seoDescription": ""}	9	2026-08-29 14:10:35.98	\N	2026-08-29 14:09:48.03	2026-08-29 14:10:35.981
16	EDIT	APPLIED	20	2	review	{"slug": "", "title": "Dép da nam", "gender": "", "images": [], "quantity": "29", "seoTitle": "", "variants": [], "sellPrice": "160000", "categoryId": "6", "colorGroups": [], "description": "", "importPrice": "64000", "productStatus": "PRIVATE", "seoDescription": ""}	5	2026-08-29 14:12:11.302	\N	2026-08-29 14:11:07.292	2026-08-29 14:12:11.302
15	EDIT	APPLIED	229	2	review	{"slug": "dep-da-khau", "title": "Dép da khâu", "gender": "MEN", "images": [], "quantity": "15", "seoTitle": "", "variants": [], "sellPrice": "180000", "categoryId": "6", "colorGroups": [], "description": "", "importPrice": "81000", "productStatus": "PRIVATE", "seoDescription": ""}	3	2026-08-29 14:10:57.823	\N	2026-08-29 14:10:51.439	2026-08-29 14:10:57.824
12	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S53", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "290000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "145000", "productStatus": "PRIVATE", "seoDescription": ""}	8	2026-08-29 11:34:12.49	\N	2026-08-29 11:32:55.215	2026-08-29 11:34:12.49
13	CREATE	APPLIED	\N	2	review	{"slug": "", "title": "S54", "gender": "WOMEN", "images": [], "quantity": "1", "seoTitle": "", "variants": [], "sellPrice": "270000", "categoryId": "33", "colorGroups": [], "description": "", "importPrice": "130000", "productStatus": "PRIVATE", "seoDescription": ""}	8	2026-08-29 11:34:43.222	\N	2026-08-29 11:34:15.352	2026-08-29 11:34:43.222
17	EDIT	APPLIED	19	2	review	{"slug": "", "title": "Dép quai ngang Nam", "gender": "MEN", "images": [], "quantity": "34", "seoTitle": "", "variants": [], "sellPrice": "90000", "categoryId": "6", "colorGroups": [], "description": "", "importPrice": "34000", "productStatus": "PRIVATE", "seoDescription": ""}	4	2026-08-29 14:13:17.572	\N	2026-08-29 14:12:25.44	2026-08-29 14:13:17.573
18	EDIT	APPLIED	30	2	review	{"slug": "", "title": "Quần tây nam", "gender": "", "images": [], "quantity": "38", "seoTitle": "", "variants": [], "sellPrice": "200000", "categoryId": "13", "colorGroups": [], "description": "", "importPrice": "104000", "productStatus": "PRIVATE", "seoDescription": ""}	4	2026-08-31 13:16:47.385	\N	2026-08-31 13:16:09.257	2026-08-31 13:16:47.386
19	EDIT	APPLIED	1	2	review	{"slug": "", "title": "Vớ", "gender": "", "images": [], "quantity": "100", "seoTitle": "", "variants": [], "sellPrice": "10000", "categoryId": "1", "colorGroups": [], "description": "", "importPrice": "7000", "productStatus": "PRIVATE", "seoDescription": ""}	3	2026-09-07 11:13:15.422	\N	2026-09-07 11:13:04.343	2026-09-07 11:13:15.423
\.


--
-- Data for Name: product_favorite_adjustment_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_favorite_adjustment_log (id, "productId", "adminId", "previousAdjustment", "newAdjustment", "organicCount", "previousDisplayCount", "newDisplayCount", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: product_image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_image (id, "productId", "variantId", url, "publicId", "altText", "position", "isPrimary", "createdAt") FROM stdin;
\.


--
-- Data for Name: product_import_job; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_import_job (id, status, "fileName", mode, "createMissingCategories", "forcePrivate", "totalProducts", "totalVariants", "totalImages", processed, succeeded, failed, skipped, "sourceData", "validationErrors", "resultData", "processingToken", "processingStartedAt", "createdById", "createdAt", "updatedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: product_variant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant (id, "productId", sku, size, color, barcode, price, "importPrice", "sellPrice", "comparePrice", quantity, "reservedQuantity", "lowStockThreshold", "isActive", weight, "averageCost", "imagePriority", "createdAt", "updatedAt", "colorCode") FROM stdin;
\.


--
-- Data for Name: product_variant_image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant_image (id, "variantId", url, "publicId", "altText", "position", "isPrimary", "createdAt") FROM stdin;
\.


--
-- Data for Name: product_variant_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant_option (id, "variantId", "optionId") FROM stdin;
\.


--
-- Data for Name: recently_viewed_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recently_viewed_product (id, "userId", "productId", "viewedAt") FROM stdin;
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review (id, "userId", "productId", "variantId", rating, title, comment, "adminReply", "repliedAt", "isApproved", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: review_image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_image (id, "reviewId", url, "publicId", "altText", "position", "createdAt") FROM stdin;
\.


--
-- Data for Name: search_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.search_history (id, "userId", keyword, filters, "resultCount", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: shipping; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping (id, "orderId", "warehouseId", carrier, "trackingNumber", status, "shippingDistanceKm", "shippingFee", "estimatedMinutes", "routePolyline", "originLatitude", "originLongitude", "destinationLatitude", "destinationLongitude", "shippedAt", "deliveredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: store_policy; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_policy (id, type, title, slug, summary, content, status, "showInFooter", "footerOrder", "seoTitle", "seoDescription", "publishedAt", "createdById", "updatedById", "createdAt", "updatedAt", "contentJson", "contentHtml", "summaryJson", "summaryHtml", "summaryText") FROM stdin;
\.


--
-- Data for Name: store_setting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_setting (id, "storeName", phone, email, address, "logoUrl", "taxCode", "invoiceFooter", "returnPolicy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, phone, "passwordHash", role, status, "firstName", "lastName", "displayName", "avatarUrl", birthday, gender, "totalOrders", "totalSpent", "rewardPoints", "phoneVerifiedAt", "lastLoginAt", "membershipId", "createdAt", "updatedAt", email, "googleId", "authProvider", "emailVerifiedAt") FROM stdin;
2	\N	FeKw08M4keuw8e9gnsQZQgwg4yDOlMZfvIwzEkSOsiU	SUPER_ADMIN	ACTIVE	\N	\N	admin	\N	2003-12-11 00:00:00	FEMALE	0	0.000000000000000000000000000000	0	\N	2026-08-26 05:27:47.655	\N	2026-08-26 05:27:32.268	2026-08-26 05:27:47.685	admin112025@gmail.com	\N	WEB	2026-08-26 05:27:47.655
3	\N	\N	CUSTOMER	ACTIVE	Danh 	Nguyen 	Danh Nguyen	https://lh3.googleusercontent.com/a/ACg8ocKh7ersa5P9s_R6USiG1H-s74CxZoi08v1zmIdqTVAgTcX4z3A=s96-c	\N	\N	0	0.000000000000000000000000000000	0	\N	2026-08-26 07:34:45.608	\N	2026-08-26 07:34:45.638	2026-09-03 14:52:30.852	danh.nguyen@executionlab.asia	112932753658079777373	GOOGLE	2026-08-26 07:34:45.608
\.


--
-- Data for Name: user_address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_address (id, "userId", type, "fullName", phone, line1, line2, ward, district, city, province, "postalCode", country, latitude, longitude, "isDefaultShipping", "isDefaultBilling", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_session (id, "userId", "tokenHash", "expiresAt", "revokedAt", device, "userAgent", "ipAddress", "refreshTokenExpiresAt", "createdAt", "updatedAt") FROM stdin;
11	2	n5g0l5k9yrePagaPdEgpX9jhgVsTTjMwUPJw5MNfsmU	2026-09-01 09:23:15.167	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	::1	2026-09-28 09:23:15.167	2026-08-29 09:23:15.196	2026-08-29 09:23:15.196
5	3	9vFRYdOqfJg6AruIP64hvBDoZ1LHH5Pb1TRnNW4gPLI	2026-08-29 07:34:45.723	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	14.241.253.25	2026-09-25 07:34:45.723	2026-08-26 07:34:45.727	2026-08-26 07:34:45.727
4	2	rO7Jl1fsXgl25KPshTwTt5nR6n31iDj7KOvRpsM6dys	2026-08-29 11:16:03.595	2026-08-26 11:16:40.867	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	42.116.144.129	2026-09-25 11:16:03.595	2026-08-26 05:29:35.489	2026-08-26 11:16:40.885
6	2	m6BgyTbMg1GToSLS7veSdo2e6rd5FQYlubZn1O9M9Rg	2026-08-29 11:16:46.02	2026-08-26 11:16:52.669	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	171.251.232.59	2026-09-25 11:16:46.02	2026-08-26 11:16:46.026	2026-08-26 11:16:52.67
10	2	91geT1vMLnk8-dzHIRMD0sgd4xZ-VipHuac1jsTovqw	2026-09-11 09:27:44.4	2026-09-08 09:27:49.414	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	171.236.49.241	2026-10-08 09:27:44.4	2026-08-27 12:25:28.083	2026-09-08 09:27:49.416
3	2	pm-oFEkSRzwFHdghdfN5rlv3Wb4vqSZttfPnU2jqJ7Y	2026-09-11 09:35:42.674	2026-09-08 09:35:47.462	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	14.241.253.25	2026-10-08 09:35:42.674	2026-08-26 05:27:47.736	2026-09-08 09:35:47.463
9	2	MZ-tGmH1Iq0rZHVBEBz8vbfIYM1CI-SALUe38EeNk_M	2026-09-11 14:18:32.746	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1	45.118.138.222	2026-10-08 14:18:32.746	2026-08-27 10:58:11.222	2026-09-08 14:18:32.767
12	2	17FDzpL2h9mJF4T2e8mqHukPEjA68ZDUZSV9vte_UKI	2026-09-12 08:32:27.604	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	42.116.144.30	2026-10-09 08:32:27.604	2026-09-08 09:36:29.838	2026-09-09 08:32:27.611
13	2	_HSx4GkjrrcEwSPAyglVZ6JbDryQ6XWTSxVj73Lx2T4	2026-09-12 09:52:29.975	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	115.79.136.225	2026-10-09 09:52:29.975	2026-09-09 08:45:57.022	2026-09-09 09:52:29.997
8	2	7L9jmbpXNdY-lk7bBO7wzhbFvWlesuTgyw9Rh-3fufA	2026-08-30 12:16:52.184	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	171.251.232.59	2026-09-26 12:16:52.184	2026-08-26 11:17:47.959	2026-08-27 12:16:52.192
14	2	qXoevozQSAiaHmMgSlhEDMUPlwIaCLtU9atEVlZXEvg	2026-09-12 10:21:59.1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	115.79.136.225	2026-10-09 10:21:59.1	2026-09-09 09:55:14.466	2026-09-09 10:21:59.114
7	2	0W6R9Iqu0i16wN0ShINFsnpBsYhbUVhpZt9k5ev8q8w	2026-09-06 14:25:38.118	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1	45.118.138.222	2026-10-03 14:25:38.118	2026-08-26 11:17:25.946	2026-09-03 14:25:38.126
\.


--
-- Data for Name: variant_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.variant_group (id, "productId", name, slug, "position", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: variant_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.variant_option (id, "groupId", value, slug, metadata, "position", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse (id, name, code, phone, address, ward, district, province, country, latitude, longitude, "isDefault", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouse_inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse_inventory (id, "warehouseId", "variantId", quantity, "reservedQuantity", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlist (id, "userId", name, "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: wishlist_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlist_item (id, "wishlistId", "userId", "productId", "createdAt") FROM stdin;
\.


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 2, true);


--
-- Name: brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brand_id_seq', 1, false);


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_id_seq', 1, false);


--
-- Name: cart_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_item_id_seq', 1, false);


--
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.category_id_seq', 33, true);


--
-- Name: coupon_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coupon_category_id_seq', 1, false);


--
-- Name: coupon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coupon_id_seq', 1, true);


--
-- Name: coupon_membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coupon_membership_id_seq', 1, false);


--
-- Name: coupon_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coupon_product_id_seq', 1, false);


--
-- Name: daily_finance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_finance_id_seq', 304, true);


--
-- Name: daily_sold_product_contribution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_sold_product_contribution_id_seq', 1, false);


--
-- Name: daily_sold_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_sold_product_id_seq', 23729, true);


--
-- Name: discount_redemption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.discount_redemption_id_seq', 1, false);


--
-- Name: excluded_coupon_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.excluded_coupon_category_id_seq', 1, false);


--
-- Name: excluded_coupon_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.excluded_coupon_product_id_seq', 1, false);


--
-- Name: homepage_banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.homepage_banner_id_seq', 1, false);


--
-- Name: homepage_featured_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.homepage_featured_product_id_seq', 1, false);


--
-- Name: homepage_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.homepage_section_id_seq', 1, false);


--
-- Name: homepage_section_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.homepage_section_product_id_seq', 1, false);


--
-- Name: inventory_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_transaction_id_seq', 120, true);


--
-- Name: membership_benefit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_benefit_id_seq', 1, false);


--
-- Name: membership_benefit_redemption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_benefit_redemption_id_seq', 1, false);


--
-- Name: membership_benefit_tier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_benefit_tier_id_seq', 1, false);


--
-- Name: membership_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_history_id_seq', 1, true);


--
-- Name: membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_id_seq', 3, true);


--
-- Name: membership_reset_run_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_reset_run_id_seq', 1, false);


--
-- Name: monthly_expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.monthly_expense_id_seq', 74, true);


--
-- Name: monthly_finance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.monthly_finance_id_seq', 10, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_id_seq', 1, false);


--
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_id_seq', 67, true);


--
-- Name: order_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_invoice_id_seq', 1, false);


--
-- Name: order_invoice_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_invoice_item_id_seq', 1, false);


--
-- Name: order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_item_id_seq', 129, true);


--
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 68, true);


--
-- Name: otp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.otp_id_seq', 1, true);


--
-- Name: password_reset_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_token_id_seq', 1, false);


--
-- Name: payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_id_seq', 1, false);


--
-- Name: payment_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_log_id_seq', 1, false);


--
-- Name: product_draft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_draft_id_seq', 19, true);


--
-- Name: product_favorite_adjustment_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_favorite_adjustment_log_id_seq', 1, false);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_id_seq', 229, true);


--
-- Name: product_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_image_id_seq', 1, false);


--
-- Name: product_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_variant_id_seq', 1, false);


--
-- Name: product_variant_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_variant_image_id_seq', 1, false);


--
-- Name: product_variant_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_variant_option_id_seq', 1, false);


--
-- Name: recently_viewed_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recently_viewed_product_id_seq', 1, false);


--
-- Name: review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_id_seq', 1, false);


--
-- Name: review_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_image_id_seq', 1, false);


--
-- Name: search_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.search_history_id_seq', 1, false);


--
-- Name: shipping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipping_id_seq', 1, false);


--
-- Name: store_policy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.store_policy_id_seq', 1, false);


--
-- Name: user_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_address_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_id_seq', 3, true);


--
-- Name: user_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_session_id_seq', 14, true);


--
-- Name: variant_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.variant_group_id_seq', 1, false);


--
-- Name: variant_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.variant_option_id_seq', 1, false);


--
-- Name: warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouse_id_seq', 1, false);


--
-- Name: warehouse_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouse_inventory_id_seq', 1, false);


--
-- Name: wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlist_id_seq', 1, false);


--
-- Name: wishlist_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlist_item_id_seq', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: brand brand_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT brand_pkey PRIMARY KEY (id);


--
-- Name: cart_item cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_pkey PRIMARY KEY (id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: coupon_category coupon_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_category
    ADD CONSTRAINT coupon_category_pkey PRIMARY KEY (id);


--
-- Name: coupon_membership coupon_membership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_membership
    ADD CONSTRAINT coupon_membership_pkey PRIMARY KEY (id);


--
-- Name: coupon coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon
    ADD CONSTRAINT coupon_pkey PRIMARY KEY (id);


--
-- Name: coupon_product coupon_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_product
    ADD CONSTRAINT coupon_product_pkey PRIMARY KEY (id);


--
-- Name: daily_finance daily_finance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_finance
    ADD CONSTRAINT daily_finance_pkey PRIMARY KEY (id);


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT daily_sold_product_contribution_pkey PRIMARY KEY (id);


--
-- Name: daily_sold_product daily_sold_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product
    ADD CONSTRAINT daily_sold_product_pkey PRIMARY KEY (id);


--
-- Name: discount_redemption discount_redemption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_redemption
    ADD CONSTRAINT discount_redemption_pkey PRIMARY KEY (id);


--
-- Name: excluded_coupon_category excluded_coupon_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_category
    ADD CONSTRAINT excluded_coupon_category_pkey PRIMARY KEY (id);


--
-- Name: excluded_coupon_product excluded_coupon_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_product
    ADD CONSTRAINT excluded_coupon_product_pkey PRIMARY KEY (id);


--
-- Name: homepage_banner homepage_banner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_banner
    ADD CONSTRAINT homepage_banner_pkey PRIMARY KEY (id);


--
-- Name: homepage_featured_product homepage_featured_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_featured_product
    ADD CONSTRAINT homepage_featured_product_pkey PRIMARY KEY (id);


--
-- Name: homepage_section homepage_section_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_section
    ADD CONSTRAINT homepage_section_pkey PRIMARY KEY (id);


--
-- Name: homepage_section_product homepage_section_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_section_product
    ADD CONSTRAINT homepage_section_product_pkey PRIMARY KEY (id);


--
-- Name: inventory_transaction inventory_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transaction
    ADD CONSTRAINT inventory_transaction_pkey PRIMARY KEY (id);


--
-- Name: invoice_sequence invoice_sequence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_sequence
    ADD CONSTRAINT invoice_sequence_pkey PRIMARY KEY (key);


--
-- Name: membership_benefit membership_benefit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit
    ADD CONSTRAINT membership_benefit_pkey PRIMARY KEY (id);


--
-- Name: membership_benefit_redemption membership_benefit_redemption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_redemption
    ADD CONSTRAINT membership_benefit_redemption_pkey PRIMARY KEY (id);


--
-- Name: membership_benefit_tier membership_benefit_tier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_tier
    ADD CONSTRAINT membership_benefit_tier_pkey PRIMARY KEY (id);


--
-- Name: membership_history membership_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_history
    ADD CONSTRAINT membership_history_pkey PRIMARY KEY (id);


--
-- Name: membership membership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT membership_pkey PRIMARY KEY (id);


--
-- Name: membership_reset_run membership_reset_run_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_reset_run
    ADD CONSTRAINT membership_reset_run_pkey PRIMARY KEY (id);


--
-- Name: monthly_expense monthly_expense_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_expense
    ADD CONSTRAINT monthly_expense_pkey PRIMARY KEY (id);


--
-- Name: monthly_finance monthly_finance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_finance
    ADD CONSTRAINT monthly_finance_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: order_invoice_item order_invoice_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice_item
    ADD CONSTRAINT order_invoice_item_pkey PRIMARY KEY (id);


--
-- Name: order_invoice order_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice
    ADD CONSTRAINT order_invoice_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: otp otp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp
    ADD CONSTRAINT otp_pkey PRIMARY KEY (id);


--
-- Name: password_reset_token password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_pkey PRIMARY KEY (id);


--
-- Name: payment_log payment_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_log
    ADD CONSTRAINT payment_log_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: product_draft product_draft_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_draft
    ADD CONSTRAINT product_draft_pkey PRIMARY KEY (id);


--
-- Name: product_favorite_adjustment_log product_favorite_adjustment_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_favorite_adjustment_log
    ADD CONSTRAINT product_favorite_adjustment_log_pkey PRIMARY KEY (id);


--
-- Name: product_image product_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image
    ADD CONSTRAINT product_image_pkey PRIMARY KEY (id);


--
-- Name: product_import_job product_import_job_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_import_job
    ADD CONSTRAINT product_import_job_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_variant_image product_variant_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_image
    ADD CONSTRAINT product_variant_image_pkey PRIMARY KEY (id);


--
-- Name: product_variant_option product_variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_pkey PRIMARY KEY (id);


--
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- Name: recently_viewed_product recently_viewed_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recently_viewed_product
    ADD CONSTRAINT recently_viewed_product_pkey PRIMARY KEY (id);


--
-- Name: review_image review_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_image
    ADD CONSTRAINT review_image_pkey PRIMARY KEY (id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: shipping shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping
    ADD CONSTRAINT shipping_pkey PRIMARY KEY (id);


--
-- Name: store_policy store_policy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_policy
    ADD CONSTRAINT store_policy_pkey PRIMARY KEY (id);


--
-- Name: store_setting store_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_setting
    ADD CONSTRAINT store_setting_pkey PRIMARY KEY (id);


--
-- Name: user_address user_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT user_address_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (id);


--
-- Name: variant_group variant_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variant_group
    ADD CONSTRAINT variant_group_pkey PRIMARY KEY (id);


--
-- Name: variant_option variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variant_option
    ADD CONSTRAINT variant_option_pkey PRIMARY KEY (id);


--
-- Name: warehouse_inventory warehouse_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_inventory
    ADD CONSTRAINT warehouse_inventory_pkey PRIMARY KEY (id);


--
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (id);


--
-- Name: wishlist_item wishlist_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_item
    ADD CONSTRAINT wishlist_item_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: audit_log_actorId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_log_actorId_createdAt_idx" ON public.audit_log USING btree ("actorId", "createdAt");


--
-- Name: audit_log_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_log_entityType_entityId_idx" ON public.audit_log USING btree ("entityType", "entityId");


--
-- Name: brand_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "brand_isActive_idx" ON public.brand USING btree ("isActive");


--
-- Name: brand_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brand_name_key ON public.brand USING btree (name);


--
-- Name: brand_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brand_slug_key ON public.brand USING btree (slug);


--
-- Name: brand_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "brand_sortOrder_idx" ON public.brand USING btree ("sortOrder");


--
-- Name: cart_item_cartId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cart_item_cartId_idx" ON public.cart_item USING btree ("cartId");


--
-- Name: cart_item_cartId_productId_variantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cart_item_cartId_productId_variantId_key" ON public.cart_item USING btree ("cartId", "productId", "variantId");


--
-- Name: cart_item_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cart_item_productId_idx" ON public.cart_item USING btree ("productId");


--
-- Name: cart_item_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cart_item_variantId_idx" ON public.cart_item USING btree ("variantId");


--
-- Name: cart_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_status_idx ON public.cart USING btree (status);


--
-- Name: cart_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cart_userId_idx" ON public.cart USING btree ("userId");


--
-- Name: category_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "category_isActive_idx" ON public.category USING btree ("isActive");


--
-- Name: category_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "category_parentId_idx" ON public.category USING btree ("parentId");


--
-- Name: category_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX category_position_idx ON public.category USING btree ("position");


--
-- Name: category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX category_slug_key ON public.category USING btree (slug);


--
-- Name: coupon_category_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_category_categoryId_idx" ON public.coupon_category USING btree ("categoryId");


--
-- Name: coupon_category_couponId_categoryId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_category_couponId_categoryId_key" ON public.coupon_category USING btree ("couponId", "categoryId");


--
-- Name: coupon_category_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_category_couponId_idx" ON public.coupon_category USING btree ("couponId");


--
-- Name: coupon_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupon_code_idx ON public.coupon USING btree (code);


--
-- Name: coupon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coupon_code_key ON public.coupon USING btree (code);


--
-- Name: coupon_firstOrderOnly_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_firstOrderOnly_idx" ON public.coupon USING btree ("firstOrderOnly");


--
-- Name: coupon_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_isActive_idx" ON public.coupon USING btree ("isActive");


--
-- Name: coupon_membership_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_membership_couponId_idx" ON public.coupon_membership USING btree ("couponId");


--
-- Name: coupon_membership_couponId_membershipId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_membership_couponId_membershipId_key" ON public.coupon_membership USING btree ("couponId", "membershipId");


--
-- Name: coupon_membership_membershipId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_membership_membershipId_idx" ON public.coupon_membership USING btree ("membershipId");


--
-- Name: coupon_normalizedCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_normalizedCode_key" ON public.coupon USING btree ("normalizedCode");


--
-- Name: coupon_product_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_product_couponId_idx" ON public.coupon_product USING btree ("couponId");


--
-- Name: coupon_product_couponId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_product_couponId_productId_key" ON public.coupon_product USING btree ("couponId", "productId");


--
-- Name: coupon_product_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_product_productId_idx" ON public.coupon_product USING btree ("productId");


--
-- Name: coupon_publicToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_publicToken_key" ON public.coupon USING btree ("publicToken");


--
-- Name: coupon_recipientUserId_birthdayYear_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_recipientUserId_birthdayYear_key" ON public.coupon USING btree ("recipientUserId", "birthdayYear");


--
-- Name: coupon_source_birthdayYear_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_source_birthdayYear_idx" ON public.coupon USING btree (source, "birthdayYear");


--
-- Name: daily_finance_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX daily_finance_date_key ON public.daily_finance USING btree (date);


--
-- Name: daily_sold_product_contribution_dailyFinanceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_contribution_dailyFinanceId_idx" ON public.daily_sold_product_contribution USING btree ("dailyFinanceId");


--
-- Name: daily_sold_product_contribution_dailySoldProductId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_contribution_dailySoldProductId_idx" ON public.daily_sold_product_contribution USING btree ("dailySoldProductId");


--
-- Name: daily_sold_product_contribution_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_contribution_orderId_idx" ON public.daily_sold_product_contribution USING btree ("orderId");


--
-- Name: daily_sold_product_contribution_orderItemId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "daily_sold_product_contribution_orderItemId_key" ON public.daily_sold_product_contribution USING btree ("orderItemId");


--
-- Name: daily_sold_product_contribution_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_contribution_productId_idx" ON public.daily_sold_product_contribution USING btree ("productId");


--
-- Name: daily_sold_product_contribution_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_contribution_variantId_idx" ON public.daily_sold_product_contribution USING btree ("variantId");


--
-- Name: daily_sold_product_dailyFinanceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_dailyFinanceId_idx" ON public.daily_sold_product USING btree ("dailyFinanceId");


--
-- Name: daily_sold_product_dailyFinanceId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "daily_sold_product_dailyFinanceId_productId_key" ON public.daily_sold_product USING btree ("dailyFinanceId", "productId");


--
-- Name: daily_sold_product_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "daily_sold_product_productId_idx" ON public.daily_sold_product USING btree ("productId");


--
-- Name: discount_redemption_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "discount_redemption_couponId_idx" ON public.discount_redemption USING btree ("couponId");


--
-- Name: discount_redemption_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "discount_redemption_orderId_key" ON public.discount_redemption USING btree ("orderId");


--
-- Name: excluded_coupon_category_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "excluded_coupon_category_categoryId_idx" ON public.excluded_coupon_category USING btree ("categoryId");


--
-- Name: excluded_coupon_category_couponId_categoryId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "excluded_coupon_category_couponId_categoryId_key" ON public.excluded_coupon_category USING btree ("couponId", "categoryId");


--
-- Name: excluded_coupon_category_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "excluded_coupon_category_couponId_idx" ON public.excluded_coupon_category USING btree ("couponId");


--
-- Name: excluded_coupon_product_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "excluded_coupon_product_couponId_idx" ON public.excluded_coupon_product USING btree ("couponId");


--
-- Name: excluded_coupon_product_couponId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "excluded_coupon_product_couponId_productId_key" ON public.excluded_coupon_product USING btree ("couponId", "productId");


--
-- Name: excluded_coupon_product_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "excluded_coupon_product_productId_idx" ON public.excluded_coupon_product USING btree ("productId");


--
-- Name: homepage_banner_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_banner_isActive_idx" ON public.homepage_banner USING btree ("isActive");


--
-- Name: homepage_banner_placement_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_banner_placement_idx ON public.homepage_banner USING btree (placement);


--
-- Name: homepage_banner_placement_isActive_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_banner_placement_isActive_position_idx" ON public.homepage_banner USING btree (placement, "isActive", "position");


--
-- Name: homepage_banner_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_banner_position_idx ON public.homepage_banner USING btree ("position");


--
-- Name: homepage_banner_startsAt_endsAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_banner_startsAt_endsAt_idx" ON public.homepage_banner USING btree ("startsAt", "endsAt");


--
-- Name: homepage_featured_product_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_featured_product_isActive_idx" ON public.homepage_featured_product USING btree ("isActive");


--
-- Name: homepage_featured_product_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_featured_product_position_idx ON public.homepage_featured_product USING btree ("position");


--
-- Name: homepage_featured_product_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "homepage_featured_product_productId_key" ON public.homepage_featured_product USING btree ("productId");


--
-- Name: homepage_section_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_section_isActive_idx" ON public.homepage_section USING btree ("isActive");


--
-- Name: homepage_section_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_section_position_idx ON public.homepage_section USING btree ("position");


--
-- Name: homepage_section_product_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_section_product_position_idx ON public.homepage_section_product USING btree ("position");


--
-- Name: homepage_section_product_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_section_product_productId_idx" ON public.homepage_section_product USING btree ("productId");


--
-- Name: homepage_section_product_sectionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "homepage_section_product_sectionId_idx" ON public.homepage_section_product USING btree ("sectionId");


--
-- Name: homepage_section_product_sectionId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "homepage_section_product_sectionId_productId_key" ON public.homepage_section_product USING btree ("sectionId", "productId");


--
-- Name: homepage_section_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_section_type_idx ON public.homepage_section USING btree (type);


--
-- Name: inventory_transaction_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transaction_createdAt_idx" ON public.inventory_transaction USING btree ("createdAt");


--
-- Name: inventory_transaction_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transaction_productId_idx" ON public.inventory_transaction USING btree ("productId");


--
-- Name: inventory_transaction_referenceType_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transaction_referenceType_referenceId_idx" ON public.inventory_transaction USING btree ("referenceType", "referenceId");


--
-- Name: inventory_transaction_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transaction_type_idx ON public.inventory_transaction USING btree (type);


--
-- Name: inventory_transaction_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transaction_variantId_idx" ON public.inventory_transaction USING btree ("variantId");


--
-- Name: inventory_transaction_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transaction_warehouseId_idx" ON public.inventory_transaction USING btree ("warehouseId");


--
-- Name: membership_benefit_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX membership_benefit_code_key ON public.membership_benefit USING btree (code);


--
-- Name: membership_benefit_isActive_startsAt_endsAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_benefit_isActive_startsAt_endsAt_idx" ON public.membership_benefit USING btree ("isActive", "startsAt", "endsAt");


--
-- Name: membership_benefit_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX membership_benefit_position_idx ON public.membership_benefit USING btree ("position");


--
-- Name: membership_benefit_redemption_benefitId_redeemedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_benefit_redemption_benefitId_redeemedAt_idx" ON public.membership_benefit_redemption USING btree ("benefitId", "redeemedAt");


--
-- Name: membership_benefit_redemption_benefitId_userId_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "membership_benefit_redemption_benefitId_userId_orderId_key" ON public.membership_benefit_redemption USING btree ("benefitId", "userId", "orderId");


--
-- Name: membership_benefit_redemption_userId_cycleYear_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_benefit_redemption_userId_cycleYear_idx" ON public.membership_benefit_redemption USING btree ("userId", "cycleYear");


--
-- Name: membership_benefit_tier_benefitId_membershipId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "membership_benefit_tier_benefitId_membershipId_key" ON public.membership_benefit_tier USING btree ("benefitId", "membershipId");


--
-- Name: membership_benefit_tier_membershipId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_benefit_tier_membershipId_idx" ON public.membership_benefit_tier USING btree ("membershipId");


--
-- Name: membership_benefit_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX membership_benefit_type_idx ON public.membership_benefit USING btree (type);


--
-- Name: membership_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX membership_code_key ON public.membership USING btree (code);


--
-- Name: membership_history_cycleYear_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_history_cycleYear_idx" ON public.membership_history USING btree ("cycleYear");


--
-- Name: membership_history_membershipId_cycleYear_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_history_membershipId_cycleYear_idx" ON public.membership_history USING btree ("membershipId", "cycleYear");


--
-- Name: membership_history_userId_cycleYear_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "membership_history_userId_cycleYear_key" ON public.membership_history USING btree ("userId", "cycleYear");


--
-- Name: membership_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membership_isActive_idx" ON public.membership USING btree ("isActive");


--
-- Name: membership_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX membership_level_idx ON public.membership USING btree (level);


--
-- Name: membership_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX membership_name_key ON public.membership USING btree (name);


--
-- Name: membership_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX membership_priority_idx ON public.membership USING btree (priority);


--
-- Name: membership_reset_run_cycleYear_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "membership_reset_run_cycleYear_key" ON public.membership_reset_run USING btree ("cycleYear");


--
-- Name: membership_reset_run_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX membership_reset_run_status_idx ON public.membership_reset_run USING btree (status);


--
-- Name: monthly_finance_year_month_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX monthly_finance_year_month_key ON public.monthly_finance USING btree (year, month);


--
-- Name: notification_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_isRead_idx" ON public.notification USING btree ("isRead");


--
-- Name: notification_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_priority_idx ON public.notification USING btree (priority);


--
-- Name: notification_readAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_readAt_idx" ON public.notification USING btree ("readAt");


--
-- Name: notification_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_userId_idx" ON public.notification USING btree ("userId");


--
-- Name: order_billingAddressId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_billingAddressId_idx" ON public."order" USING btree ("billingAddressId");


--
-- Name: order_completedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_completedAt_idx" ON public."order" USING btree ("completedAt");


--
-- Name: order_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_couponId_idx" ON public."order" USING btree ("couponId");


--
-- Name: order_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_createdById_idx" ON public."order" USING btree ("createdById");


--
-- Name: order_deliveredAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_deliveredAt_idx" ON public."order" USING btree ("deliveredAt");


--
-- Name: order_idempotencyKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "order_idempotencyKey_key" ON public."order" USING btree ("idempotencyKey");


--
-- Name: order_invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "order_invoice_invoiceNumber_key" ON public.order_invoice USING btree ("invoiceNumber");


--
-- Name: order_invoice_issuedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_invoice_issuedAt_idx" ON public.order_invoice USING btree ("issuedAt");


--
-- Name: order_invoice_item_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_invoice_item_invoiceId_idx" ON public.order_invoice_item USING btree ("invoiceId");


--
-- Name: order_invoice_one_primary_issued_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX order_invoice_one_primary_issued_idx ON public.order_invoice USING btree ("orderId") WHERE ((status = 'ISSUED'::public."InvoiceStatus") AND ("isPrimary" = true));


--
-- Name: order_invoice_orderId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_invoice_orderId_status_idx" ON public.order_invoice USING btree ("orderId", status);


--
-- Name: order_invoice_orderId_version_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "order_invoice_orderId_version_key" ON public.order_invoice USING btree ("orderId", version);


--
-- Name: order_invoice_publicToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "order_invoice_publicToken_key" ON public.order_invoice USING btree ("publicToken");


--
-- Name: order_isPaid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_isPaid_idx" ON public."order" USING btree ("isPaid");


--
-- Name: order_item_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_item_orderId_idx" ON public.order_item USING btree ("orderId");


--
-- Name: order_item_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_item_productId_idx" ON public.order_item USING btree ("productId");


--
-- Name: order_item_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_item_variantId_idx" ON public.order_item USING btree ("variantId");


--
-- Name: order_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_latitude_longitude_idx ON public."order" USING btree (latitude, longitude);


--
-- Name: order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "order_orderNumber_key" ON public."order" USING btree ("orderNumber");


--
-- Name: order_paidAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_paidAt_idx" ON public."order" USING btree ("paidAt");


--
-- Name: order_paymentMethod_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_paymentMethod_idx" ON public."order" USING btree ("paymentMethod");


--
-- Name: order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_paymentStatus_idx" ON public."order" USING btree ("paymentStatus");


--
-- Name: order_placedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_placedAt_idx" ON public."order" USING btree ("placedAt");


--
-- Name: order_shippingAddressId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_shippingAddressId_idx" ON public."order" USING btree ("shippingAddressId");


--
-- Name: order_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_source_idx ON public."order" USING btree (source);


--
-- Name: order_status_history_changedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_status_history_changedById_idx" ON public.order_status_history USING btree ("changedById");


--
-- Name: order_status_history_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_status_history_createdAt_idx" ON public.order_status_history USING btree ("createdAt");


--
-- Name: order_status_history_currentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_status_history_currentStatus_idx" ON public.order_status_history USING btree ("currentStatus");


--
-- Name: order_status_history_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_status_history_orderId_idx" ON public.order_status_history USING btree ("orderId");


--
-- Name: order_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_status_idx ON public."order" USING btree (status);


--
-- Name: order_updatedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_updatedById_idx" ON public."order" USING btree ("updatedById");


--
-- Name: order_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_userId_idx" ON public."order" USING btree ("userId");


--
-- Name: otp_email_purpose_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_email_purpose_idx ON public.otp USING btree (email, purpose);


--
-- Name: otp_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "otp_expiresAt_idx" ON public.otp USING btree ("expiresAt");


--
-- Name: otp_ipAddress_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "otp_ipAddress_idx" ON public.otp USING btree ("ipAddress");


--
-- Name: otp_phone_purpose_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_phone_purpose_idx ON public.otp USING btree (phone, purpose);


--
-- Name: otp_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "otp_userId_idx" ON public.otp USING btree ("userId");


--
-- Name: password_reset_token_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "password_reset_token_expiresAt_idx" ON public.password_reset_token USING btree ("expiresAt");


--
-- Name: password_reset_token_tokenHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "password_reset_token_tokenHash_key" ON public.password_reset_token USING btree ("tokenHash");


--
-- Name: password_reset_token_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "password_reset_token_userId_idx" ON public.password_reset_token USING btree ("userId");


--
-- Name: payment_log_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_log_createdAt_idx" ON public.payment_log USING btree ("createdAt");


--
-- Name: payment_log_paymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_log_paymentId_idx" ON public.payment_log USING btree ("paymentId");


--
-- Name: payment_log_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_log_type_idx ON public.payment_log USING btree (type);


--
-- Name: payment_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_method_idx ON public.payment USING btree (method);


--
-- Name: payment_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_orderId_idx" ON public.payment USING btree ("orderId");


--
-- Name: payment_providerTransactionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_providerTransactionId_idx" ON public.payment USING btree ("providerTransactionId");


--
-- Name: payment_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_status_idx ON public.payment USING btree (status);


--
-- Name: payment_transactionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_transactionId_idx" ON public.payment USING btree ("transactionId");


--
-- Name: product_brandId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_brandId_idx" ON public.product USING btree ("brandId");


--
-- Name: product_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_brand_idx ON public.product USING btree (brand);


--
-- Name: product_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_categoryId_idx" ON public.product USING btree ("categoryId");


--
-- Name: product_draft_createdById_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_draft_createdById_status_idx" ON public.product_draft USING btree ("createdById", status);


--
-- Name: product_draft_originalProductId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_draft_originalProductId_status_idx" ON public.product_draft USING btree ("originalProductId", status);


--
-- Name: product_favorite_adjustment_log_adminId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_favorite_adjustment_log_adminId_createdAt_idx" ON public.product_favorite_adjustment_log USING btree ("adminId", "createdAt");


--
-- Name: product_favorite_adjustment_log_productId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_favorite_adjustment_log_productId_createdAt_idx" ON public.product_favorite_adjustment_log USING btree ("productId", "createdAt");


--
-- Name: product_image_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_image_productId_idx" ON public.product_image USING btree ("productId");


--
-- Name: product_image_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_image_variantId_idx" ON public.product_image USING btree ("variantId");


--
-- Name: product_import_job_createdById_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_import_job_createdById_createdAt_idx" ON public.product_import_job USING btree ("createdById", "createdAt");


--
-- Name: product_import_job_status_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_import_job_status_updatedAt_idx" ON public.product_import_job USING btree (status, "updatedAt");


--
-- Name: product_isFeatured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_isFeatured_idx" ON public.product USING btree ("isFeatured");


--
-- Name: product_isPublished_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_isPublished_idx" ON public.product USING btree ("isPublished");


--
-- Name: product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_slug_key ON public.product USING btree (slug);


--
-- Name: product_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_status_idx ON public.product USING btree (status);


--
-- Name: product_title_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_title_idx ON public.product USING btree (title);


--
-- Name: product_variant_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variant_barcode_idx ON public.product_variant USING btree (barcode);


--
-- Name: product_variant_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_variant_barcode_key ON public.product_variant USING btree (barcode);


--
-- Name: product_variant_colorCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_colorCode_idx" ON public.product_variant USING btree ("colorCode");


--
-- Name: product_variant_color_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variant_color_idx ON public.product_variant USING btree (color);


--
-- Name: product_variant_imagePriority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_imagePriority_idx" ON public.product_variant USING btree ("imagePriority");


--
-- Name: product_variant_image_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_image_variantId_idx" ON public.product_variant_image USING btree ("variantId");


--
-- Name: product_variant_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_isActive_idx" ON public.product_variant USING btree ("isActive");


--
-- Name: product_variant_option_optionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_option_optionId_idx" ON public.product_variant_option USING btree ("optionId");


--
-- Name: product_variant_option_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_option_variantId_idx" ON public.product_variant_option USING btree ("variantId");


--
-- Name: product_variant_option_variantId_optionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "product_variant_option_variantId_optionId_key" ON public.product_variant_option USING btree ("variantId", "optionId");


--
-- Name: product_variant_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variant_productId_idx" ON public.product_variant USING btree ("productId");


--
-- Name: product_variant_size_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variant_size_idx ON public.product_variant USING btree (size);


--
-- Name: product_variant_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_variant_sku_key ON public.product_variant USING btree (sku);


--
-- Name: recently_viewed_product_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_product_productId_idx" ON public.recently_viewed_product USING btree ("productId");


--
-- Name: recently_viewed_product_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_product_userId_idx" ON public.recently_viewed_product USING btree ("userId");


--
-- Name: recently_viewed_product_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "recently_viewed_product_userId_productId_key" ON public.recently_viewed_product USING btree ("userId", "productId");


--
-- Name: recently_viewed_product_viewedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_product_viewedAt_idx" ON public.recently_viewed_product USING btree ("viewedAt");


--
-- Name: review_image_reviewId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_image_reviewId_idx" ON public.review_image USING btree ("reviewId");


--
-- Name: review_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_productId_idx" ON public.review USING btree ("productId");


--
-- Name: review_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_userId_idx" ON public.review USING btree ("userId");


--
-- Name: review_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "review_userId_productId_key" ON public.review USING btree ("userId", "productId");


--
-- Name: review_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_variantId_idx" ON public.review USING btree ("variantId");


--
-- Name: search_history_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "search_history_createdAt_idx" ON public.search_history USING btree ("createdAt");


--
-- Name: search_history_keyword_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_history_keyword_idx ON public.search_history USING btree (keyword);


--
-- Name: search_history_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "search_history_userId_idx" ON public.search_history USING btree ("userId");


--
-- Name: shipping_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shipping_orderId_idx" ON public.shipping USING btree ("orderId");


--
-- Name: shipping_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_status_idx ON public.shipping USING btree (status);


--
-- Name: shipping_trackingNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shipping_trackingNumber_idx" ON public.shipping USING btree ("trackingNumber");


--
-- Name: shipping_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shipping_warehouseId_idx" ON public.shipping USING btree ("warehouseId");


--
-- Name: store_policy_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX store_policy_slug_key ON public.store_policy USING btree (slug);


--
-- Name: store_policy_status_showInFooter_footerOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "store_policy_status_showInFooter_footerOrder_idx" ON public.store_policy USING btree (status, "showInFooter", "footerOrder");


--
-- Name: store_policy_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX store_policy_type_idx ON public.store_policy USING btree (type);


--
-- Name: user_address_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_address_latitude_longitude_idx ON public.user_address USING btree (latitude, longitude);


--
-- Name: user_address_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_address_userId_idx" ON public.user_address USING btree ("userId");


--
-- Name: user_authProvider_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_authProvider_idx" ON public."user" USING btree ("authProvider");


--
-- Name: user_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_email_idx ON public."user" USING btree (email);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: user_googleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_googleId_idx" ON public."user" USING btree ("googleId");


--
-- Name: user_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_googleId_key" ON public."user" USING btree ("googleId");


--
-- Name: user_membershipId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_membershipId_idx" ON public."user" USING btree ("membershipId");


--
-- Name: user_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_phone_idx ON public."user" USING btree (phone);


--
-- Name: user_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_phone_key ON public."user" USING btree (phone);


--
-- Name: user_rewardPoints_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_rewardPoints_idx" ON public."user" USING btree ("rewardPoints");


--
-- Name: user_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_role_idx ON public."user" USING btree (role);


--
-- Name: user_session_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_session_expiresAt_idx" ON public.user_session USING btree ("expiresAt");


--
-- Name: user_session_refreshTokenExpiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_session_refreshTokenExpiresAt_idx" ON public.user_session USING btree ("refreshTokenExpiresAt");


--
-- Name: user_session_tokenHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_session_tokenHash_key" ON public.user_session USING btree ("tokenHash");


--
-- Name: user_session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_session_userId_idx" ON public.user_session USING btree ("userId");


--
-- Name: user_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_status_idx ON public."user" USING btree (status);


--
-- Name: user_totalOrders_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_totalOrders_idx" ON public."user" USING btree ("totalOrders");


--
-- Name: variant_group_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "variant_group_productId_idx" ON public.variant_group USING btree ("productId");


--
-- Name: variant_group_productId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "variant_group_productId_name_key" ON public.variant_group USING btree ("productId", name);


--
-- Name: variant_group_productId_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "variant_group_productId_slug_key" ON public.variant_group USING btree ("productId", slug);


--
-- Name: variant_option_groupId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "variant_option_groupId_idx" ON public.variant_option USING btree ("groupId");


--
-- Name: variant_option_groupId_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "variant_option_groupId_slug_key" ON public.variant_option USING btree ("groupId", slug);


--
-- Name: variant_option_groupId_value_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "variant_option_groupId_value_key" ON public.variant_option USING btree ("groupId", value);


--
-- Name: warehouse_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX warehouse_code_key ON public.warehouse USING btree (code);


--
-- Name: warehouse_inventory_variantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_inventory_variantId_idx" ON public.warehouse_inventory USING btree ("variantId");


--
-- Name: warehouse_inventory_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_inventory_warehouseId_idx" ON public.warehouse_inventory USING btree ("warehouseId");


--
-- Name: warehouse_inventory_warehouseId_variantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "warehouse_inventory_warehouseId_variantId_key" ON public.warehouse_inventory USING btree ("warehouseId", "variantId");


--
-- Name: warehouse_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_isActive_idx" ON public.warehouse USING btree ("isActive");


--
-- Name: warehouse_isDefault_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_isDefault_idx" ON public.warehouse USING btree ("isDefault");


--
-- Name: warehouse_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX warehouse_latitude_longitude_idx ON public.warehouse USING btree (latitude, longitude);


--
-- Name: wishlist_item_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlist_item_productId_idx" ON public.wishlist_item USING btree ("productId");


--
-- Name: wishlist_item_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlist_item_userId_idx" ON public.wishlist_item USING btree ("userId");


--
-- Name: wishlist_item_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlist_item_userId_productId_key" ON public.wishlist_item USING btree ("userId", "productId");


--
-- Name: wishlist_item_wishlistId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlist_item_wishlistId_idx" ON public.wishlist_item USING btree ("wishlistId");


--
-- Name: wishlist_item_wishlistId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlist_item_wishlistId_productId_key" ON public.wishlist_item USING btree ("wishlistId", "productId");


--
-- Name: wishlist_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlist_userId_idx" ON public.wishlist USING btree ("userId");


--
-- Name: wishlist_userId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlist_userId_name_key" ON public.wishlist USING btree ("userId", name);


--
-- Name: cart_item cart_item_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT "cart_item_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_item cart_item_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT "cart_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_item cart_item_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT "cart_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: category category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: coupon_category coupon_category_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_category
    ADD CONSTRAINT "coupon_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_category coupon_category_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_category
    ADD CONSTRAINT "coupon_category_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_membership coupon_membership_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_membership
    ADD CONSTRAINT "coupon_membership_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_membership coupon_membership_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_membership
    ADD CONSTRAINT "coupon_membership_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public.membership(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_product coupon_product_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_product
    ADD CONSTRAINT "coupon_product_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_product coupon_product_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_product
    ADD CONSTRAINT "coupon_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon coupon_recipientUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon
    ADD CONSTRAINT "coupon_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_finance daily_finance_monthlyFinanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_finance
    ADD CONSTRAINT "daily_finance_monthlyFinanceId_fkey" FOREIGN KEY ("monthlyFinanceId") REFERENCES public.monthly_finance(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_dailyFinanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT "daily_sold_product_contribution_dailyFinanceId_fkey" FOREIGN KEY ("dailyFinanceId") REFERENCES public.daily_finance(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_dailySoldProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT "daily_sold_product_contribution_dailySoldProductId_fkey" FOREIGN KEY ("dailySoldProductId") REFERENCES public.daily_sold_product(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT "daily_sold_product_contribution_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT "daily_sold_product_contribution_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public.order_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT "daily_sold_product_contribution_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_sold_product_contribution daily_sold_product_contribution_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product_contribution
    ADD CONSTRAINT "daily_sold_product_contribution_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_sold_product daily_sold_product_dailyFinanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product
    ADD CONSTRAINT "daily_sold_product_dailyFinanceId_fkey" FOREIGN KEY ("dailyFinanceId") REFERENCES public.daily_finance(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: daily_sold_product daily_sold_product_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sold_product
    ADD CONSTRAINT "daily_sold_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: discount_redemption discount_redemption_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_redemption
    ADD CONSTRAINT "discount_redemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: discount_redemption discount_redemption_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_redemption
    ADD CONSTRAINT "discount_redemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: excluded_coupon_category excluded_coupon_category_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_category
    ADD CONSTRAINT "excluded_coupon_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: excluded_coupon_category excluded_coupon_category_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_category
    ADD CONSTRAINT "excluded_coupon_category_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: excluded_coupon_product excluded_coupon_product_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_product
    ADD CONSTRAINT "excluded_coupon_product_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: excluded_coupon_product excluded_coupon_product_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.excluded_coupon_product
    ADD CONSTRAINT "excluded_coupon_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homepage_featured_product homepage_featured_product_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_featured_product
    ADD CONSTRAINT "homepage_featured_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homepage_section_product homepage_section_product_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_section_product
    ADD CONSTRAINT "homepage_section_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homepage_section_product homepage_section_product_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_section_product
    ADD CONSTRAINT "homepage_section_product_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.homepage_section(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transaction inventory_transaction_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transaction
    ADD CONSTRAINT "inventory_transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_transaction inventory_transaction_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transaction
    ADD CONSTRAINT "inventory_transaction_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transaction inventory_transaction_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transaction
    ADD CONSTRAINT "inventory_transaction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouse(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: membership_benefit_redemption membership_benefit_redemption_benefitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_redemption
    ADD CONSTRAINT "membership_benefit_redemption_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES public.membership_benefit(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: membership_benefit_redemption membership_benefit_redemption_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_redemption
    ADD CONSTRAINT "membership_benefit_redemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: membership_benefit_redemption membership_benefit_redemption_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_redemption
    ADD CONSTRAINT "membership_benefit_redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: membership_benefit_tier membership_benefit_tier_benefitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_tier
    ADD CONSTRAINT "membership_benefit_tier_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES public.membership_benefit(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: membership_benefit_tier membership_benefit_tier_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_benefit_tier
    ADD CONSTRAINT "membership_benefit_tier_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public.membership(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: membership_history membership_history_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_history
    ADD CONSTRAINT "membership_history_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public.membership(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: membership_history membership_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_history
    ADD CONSTRAINT "membership_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: monthly_expense monthly_expense_monthlyFinanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_expense
    ADD CONSTRAINT "monthly_expense_monthlyFinanceId_fkey" FOREIGN KEY ("monthlyFinanceId") REFERENCES public.monthly_finance(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order order_billingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES public.user_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order order_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupon(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order order_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_invoice order_invoice_issuedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice
    ADD CONSTRAINT "order_invoice_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_invoice_item order_invoice_item_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice_item
    ADD CONSTRAINT "order_invoice_item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.order_invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_invoice_item order_invoice_item_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice_item
    ADD CONSTRAINT "order_invoice_item_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public.order_item(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_invoice order_invoice_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice
    ADD CONSTRAINT "order_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_invoice order_invoice_voidedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_invoice
    ADD CONSTRAINT "order_invoice_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_item order_item_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_item order_item_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order order_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public.user_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "order_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order order_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: otp otp_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp
    ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_token password_reset_token_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_log payment_log_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_log
    ADD CONSTRAINT "payment_log_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brand(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_draft product_draft_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_draft
    ADD CONSTRAINT "product_draft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_draft product_draft_originalProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_draft
    ADD CONSTRAINT "product_draft_originalProductId_fkey" FOREIGN KEY ("originalProductId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_favorite_adjustment_log product_favorite_adjustment_log_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_favorite_adjustment_log
    ADD CONSTRAINT "product_favorite_adjustment_log_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_favorite_adjustment_log product_favorite_adjustment_log_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_favorite_adjustment_log
    ADD CONSTRAINT "product_favorite_adjustment_log_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_image product_image_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image
    ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_image product_image_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image
    ADD CONSTRAINT "product_image_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_import_job product_import_job_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_import_job
    ADD CONSTRAINT "product_import_job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_image product_variant_image_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_image
    ADD CONSTRAINT "product_variant_image_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_option product_variant_option_optionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT "product_variant_option_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES public.variant_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_option product_variant_option_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT "product_variant_option_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant product_variant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recently_viewed_product recently_viewed_product_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recently_viewed_product
    ADD CONSTRAINT "recently_viewed_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recently_viewed_product recently_viewed_product_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recently_viewed_product
    ADD CONSTRAINT "recently_viewed_product_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review_image review_image_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_image
    ADD CONSTRAINT "review_image_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public.review(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review review_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "review_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: search_history search_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT "search_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shipping shipping_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping
    ADD CONSTRAINT "shipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping shipping_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping
    ADD CONSTRAINT "shipping_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouse(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_address user_address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT "user_address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user user_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public.membership(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_session user_session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT "user_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_group variant_group_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variant_group
    ADD CONSTRAINT "variant_group_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_option variant_option_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variant_option
    ADD CONSTRAINT "variant_option_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.variant_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_inventory warehouse_inventory_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_inventory
    ADD CONSTRAINT "warehouse_inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_inventory warehouse_inventory_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_inventory
    ADD CONSTRAINT "warehouse_inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouse(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_item wishlist_item_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_item
    ADD CONSTRAINT "wishlist_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_item wishlist_item_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_item
    ADD CONSTRAINT "wishlist_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_item wishlist_item_wishlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_item
    ADD CONSTRAINT "wishlist_item_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES public.wishlist(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict p8fkmG9bQPhf0m2WDhkSfPFiPzn3a83fT9Xc9q3hkb1d0GTQi7O3aOiYsAuN3lF

