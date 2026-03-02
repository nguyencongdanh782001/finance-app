-- CreateTable
CREATE TABLE "daily_finance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "monthlyFinanceId" INTEGER NOT NULL,
    "capitalCash" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "capitalBank" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "revenueCash" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "revenueBank" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "profitCash" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "profitBank" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_expense" (
    "id" SERIAL NOT NULL,
    "monthlyFinanceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_finance" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalDailyProfit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalExpense" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "profit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_finance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_finance_date_key" ON "daily_finance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_finance_year_month_key" ON "monthly_finance"("year", "month");

-- AddForeignKey
ALTER TABLE "daily_finance" ADD CONSTRAINT "daily_finance_monthlyFinanceId_fkey" FOREIGN KEY ("monthlyFinanceId") REFERENCES "monthly_finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_expense" ADD CONSTRAINT "monthly_expense_monthlyFinanceId_fkey" FOREIGN KEY ("monthlyFinanceId") REFERENCES "monthly_finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
