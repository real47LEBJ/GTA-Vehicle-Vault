-- SQLite Database Initialization Script

-- ----------------------------
-- Table structure for garage_overview
-- ----------------------------
DROP TABLE IF EXISTS garage_overview;
CREATE TABLE "garage_overview" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "garage_name" text,
  "garage_name_en" text,
  "num" integer,
  "vehicle_list" text,
  "remarks" text,
  "garage_order" integer,
  "garage_type" text
);

-- ----------------------------
-- Table structure for vehicle_brand
-- ----------------------------
DROP TABLE IF EXISTS vehicle_brand;
CREATE TABLE "vehicle_brand" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "brand_name" text,
  "brand_name_en" text,
  "remarks" text
);

-- ----------------------------
-- Table structure for vehicle_overview
-- ----------------------------
DROP TABLE IF EXISTS vehicle_overview;
CREATE TABLE "vehicle_overview" (
  "id" text NOT NULL,
  "brand_id" integer,
  "vehicle_name" text,
  "vehicle_name_en" text,
  "vehicle_type" text,
  "feature" text,
  "price" integer,
  "remarks" text,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("brand_id") REFERENCES "vehicle_brand" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ----------------------------
-- Table structure for feature_type_dict
-- ----------------------------
DROP TABLE IF EXISTS "feature_type_dict";
CREATE TABLE "feature_type_dict" (
  "id" integer NOT NULL,
  "dict_key" text,
  "dict_value" text,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Table structure for data_info
-- ----------------------------
DROP TABLE IF EXISTS "data_info";
CREATE TABLE "data_info" (
  "dlc_name" TEXT,
  "dlc_name_en" TEXT,
  "update_time" DATE
);

-- ----------------------------
-- Records of data_info
-- ----------------------------
INSERT INTO "data_info" VALUES ('山中安全屋DLC', 'Yakuza Safe House DLC', '2025-12-10');
