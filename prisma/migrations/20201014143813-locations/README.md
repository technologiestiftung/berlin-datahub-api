# Migration `20201014143813-locations`

This migration has been generated by fabianmoronzirfas at 10/14/2020, 4:38:13 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Device" ADD COLUMN "latitude" Decimal(65,30)   ,
ADD COLUMN "longitude" Decimal(65,30)   
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200929141926-remove-app..20201014143813-locations
--- datamodel.dml
+++ datamodel.dml
@@ -2,30 +2,32 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
 }
 // this is for the harvester to be able to login
 model User {
-  id        Int      @default(autoincrement()) @id
+  id        Int      @id @default(autoincrement())
   createdAt DateTime @default(now())
   username  String   @unique
   password  String
 }
 model Device {
-  id Int @default(autoincrement()) @id
+  id Int @id @default(autoincrement())
   ttnDeviceId String
   ttnAppId    String
   description String?
   records     Record[]
+  latitude    Float?
+  longitude   Float?
   // possible more MetdData
   // location
   // SSID
   // foo
@@ -33,9 +35,9 @@
 }
 model Record {
-  id    Int    @default(autoincrement()) @id
+  id    Int    @id @default(autoincrement())
   value String // could also be a Float?
   recordedAt DateTime
   Device     Device?  @relation(fields: [deviceId], references: [id])
```


