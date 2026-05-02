-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerTipoPersona" TEXT,
ADD COLUMN     "fechaOperacion" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "calificacion" TEXT NOT NULL DEFAULT 'S1',
ADD COLUMN     "claveRegimen" TEXT NOT NULL DEFAULT '01',
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipoImpositivo" TEXT NOT NULL DEFAULT '21.0';

-- AlterTable
ALTER TABLE "user_verifactu_accounts" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT,
    "email" TEXT,
    "tipoPersona" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "tipoImpositivo" TEXT NOT NULL DEFAULT '21.0',
    "claveRegimen" TEXT NOT NULL DEFAULT '01',
    "calificacion" TEXT NOT NULL DEFAULT 'S1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
