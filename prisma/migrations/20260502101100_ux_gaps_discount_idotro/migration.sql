-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "codigoPais" TEXT,
ADD COLUMN     "foreignId" TEXT,
ADD COLUMN     "idScheme" TEXT NOT NULL DEFAULT 'NIF',
ADD COLUMN     "idType" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerCodigoPais" TEXT,
ADD COLUMN     "customerForeignId" TEXT,
ADD COLUMN     "customerIdScheme" TEXT NOT NULL DEFAULT 'NIF',
ADD COLUMN     "customerIdType" TEXT;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "discountConcept" TEXT;
