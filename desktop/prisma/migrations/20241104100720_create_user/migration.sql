-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "employee_id" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employee_id_key" ON "User"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
