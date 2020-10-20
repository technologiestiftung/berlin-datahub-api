# Migration `20201014144714-value-to-number`

This migration has been generated by fabianmoronzirfas at 10/14/2020, 4:47:14 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Record" DROP COLUMN "value",
ADD COLUMN "value" Decimal(65,30)   NOT NULL 
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201014143813-locations..20201014144714-value-to-number
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -35,10 +35,10 @@
 }
 model Record {
-  id    Int    @id @default(autoincrement())
-  value String // could also be a Float?
+  id    Int   @id @default(autoincrement())
+  value Float // could also be a Float?
   recordedAt DateTime
   Device     Device?  @relation(fields: [deviceId], references: [id])
   deviceId   Int?
```

