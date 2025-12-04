-- SQLite Database Initialization Script

-- ----------------------------
-- Table structure for garage_overview
-- ----------------------------
DROP TABLE IF EXISTS garage_overview;
CREATE TABLE garage_overview (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  garage_name VARCHAR(255),
  garage_name_en VARCHAR(255),
  num INTEGER,
  vehicle_list TEXT
);

-- ----------------------------
-- Table structure for vehicle_brand
-- ----------------------------
DROP TABLE IF EXISTS vehicle_brand;
CREATE TABLE vehicle_brand (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  brand_name VARCHAR(255),
  brand_name_en VARCHAR(255),
  remarks VARCHAR(255)
);

-- ----------------------------
-- Table structure for vehicle_overview
-- ----------------------------
DROP TABLE IF EXISTS vehicle_overview;
CREATE TABLE vehicle_overview (
  id INTEGER NOT NULL PRIMARY KEY,
  brand_id INTEGER,
  vehicle_name VARCHAR(255),
  vehicle_name_en VARCHAR(255),
  remarks VARCHAR(255),
  feature VARCHAR(255),
  FOREIGN KEY (brand_id) REFERENCES vehicle_brand (id)
);

