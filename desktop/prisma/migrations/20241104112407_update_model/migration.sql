-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cost_center_id" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "department_id" INTEGER,
ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "employee_category_id" INTEGER,
ADD COLUMN     "is_acc_verify" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role_id" INTEGER;

-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "role_code" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Country" (
    "country_id" SERIAL NOT NULL,
    "country_code" TEXT NOT NULL,
    "country_name" TEXT NOT NULL,
    "region_id" INTEGER NOT NULL,
    "currency" TEXT,
    "currency_code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "country_phone_code" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Country_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "UserDetails" (
    "UserDetails_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "mobile_phone" TEXT,
    "img_profile" TEXT,
    "user_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "country_id" INTEGER,
    "privacy_policy_term_condition" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "id_number" TEXT,
    "id_image" TEXT,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("UserDetails_id")
);

-- CreateTable
CREATE TABLE "Region" (
    "region_id" SERIAL NOT NULL,
    "region_code" TEXT NOT NULL,
    "region_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Region_pkey" PRIMARY KEY ("region_id")
);

-- CreateTable
CREATE TABLE "SubsidyType" (
    "subsidy_type_id" SERIAL NOT NULL,
    "subsidy_type_code" TEXT NOT NULL DEFAULT 'meal',
    "subsidy_type_name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "SubsidyType_pkey" PRIMARY KEY ("subsidy_type_id")
);

-- CreateTable
CREATE TABLE "Subsidy" (
    "subsidy_id" SERIAL NOT NULL,
    "subsidy_type_id" INTEGER NOT NULL,
    "applicable" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Subsidy_pkey" PRIMARY KEY ("subsidy_id")
);

-- CreateTable
CREATE TABLE "SubsidyCredit" (
    "subsidy_credit_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subsidy_id" INTEGER NOT NULL,
    "credit_amount" DOUBLE PRECISION NOT NULL,
    "credited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "SubsidyCredit_pkey" PRIMARY KEY ("subsidy_credit_id")
);

-- CreateTable
CREATE TABLE "SubsidyTransaction" (
    "subsidy_transaction_id" SERIAL NOT NULL,
    "subsidy_credit_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL DEFAULT 'DEBIT',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transaction_status" "TransactionStatus" NOT NULL DEFAULT 'FAILED',
    "transaction_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "deleted_by_user_id" INTEGER,

    CONSTRAINT "SubsidyTransaction_pkey" PRIMARY KEY ("subsidy_transaction_id")
);

-- CreateTable
CREATE TABLE "Department" (
    "department_id" SERIAL NOT NULL,
    "department_code" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "cost_center_id" SERIAL NOT NULL,
    "cost_center_code" TEXT NOT NULL,
    "cost_center_description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("cost_center_id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "feature_id" SERIAL NOT NULL,
    "feature_code" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "description" TEXT,
    "feature_link" TEXT,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("feature_id")
);

-- CreateTable
CREATE TABLE "UserFeatures" (
    "UserFeatures_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "feature_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT true,
    "is_write" BOOLEAN NOT NULL DEFAULT true,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "UserFeatures_pkey" PRIMARY KEY ("UserFeatures_id")
);

-- CreateTable
CREATE TABLE "AccessCard" (
    "card_id" SERIAL NOT NULL,
    "card_value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessCard_pkey" PRIMARY KEY ("card_id")
);

-- CreateTable
CREATE TABLE "EmployeeCategory" (
    "employee_category_id" SERIAL NOT NULL,
    "employee_category_code" TEXT NOT NULL,
    "employee_category_name" TEXT NOT NULL,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "EmployeeCategory_pkey" PRIMARY KEY ("employee_category_id")
);

-- CreateTable
CREATE TABLE "Store" (
    "store_id" SERIAL NOT NULL,
    "store_name" TEXT NOT NULL,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Store_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "menu_category_id" SERIAL NOT NULL,
    "menu_category_code" TEXT NOT NULL,
    "menu_category_name" TEXT NOT NULL,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("menu_category_id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "menu_id" SERIAL NOT NULL,
    "menu_code" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "menu_image" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "store_id" INTEGER NOT NULL,
    "menu_category_id" INTEGER NOT NULL,
    "uuid" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("menu_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_code_key" ON "Role"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_country_code_key" ON "Country"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "UserDetails_user_id_key" ON "UserDetails"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Region_region_code_key" ON "Region"("region_code");

-- CreateIndex
CREATE UNIQUE INDEX "SubsidyType_subsidy_type_code_key" ON "SubsidyType"("subsidy_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_department_code_key" ON "Department"("department_code");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_cost_center_code_key" ON "CostCenter"("cost_center_code");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_feature_code_key" ON "Feature"("feature_code");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCard_card_value_key" ON "AccessCard"("card_value");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCategory_employee_category_code_key" ON "EmployeeCategory"("employee_category_code");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_menu_category_code_key" ON "MenuCategory"("menu_category_code");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_menu_code_key" ON "Menu"("menu_code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "CostCenter"("cost_center_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employee_category_id_fkey" FOREIGN KEY ("employee_category_id") REFERENCES "EmployeeCategory"("employee_category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("region_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("country_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_subsidy_type_id_fkey" FOREIGN KEY ("subsidy_type_id") REFERENCES "SubsidyType"("subsidy_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyCredit" ADD CONSTRAINT "SubsidyCredit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyCredit" ADD CONSTRAINT "SubsidyCredit_subsidy_id_fkey" FOREIGN KEY ("subsidy_id") REFERENCES "Subsidy"("subsidy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyTransaction" ADD CONSTRAINT "SubsidyTransaction_subsidy_credit_id_fkey" FOREIGN KEY ("subsidy_credit_id") REFERENCES "SubsidyCredit"("subsidy_credit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyTransaction" ADD CONSTRAINT "SubsidyTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyTransaction" ADD CONSTRAINT "SubsidyTransaction_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyTransaction" ADD CONSTRAINT "SubsidyTransaction_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidyTransaction" ADD CONSTRAINT "SubsidyTransaction_deleted_by_user_id_fkey" FOREIGN KEY ("deleted_by_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeatures" ADD CONSTRAINT "UserFeatures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeatures" ADD CONSTRAINT "UserFeatures_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "Feature"("feature_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCard" ADD CONSTRAINT "AccessCard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_menu_category_id_fkey" FOREIGN KEY ("menu_category_id") REFERENCES "MenuCategory"("menu_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
