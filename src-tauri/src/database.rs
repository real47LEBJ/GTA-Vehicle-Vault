// 数据库操作模块
use rusqlite::{Connection, Result};
use std::env;
use std::path::Path;
use tauri::{App, Manager};

// 数据库初始化函数
pub fn init_db(app: &App) -> Result<()> {
    // 使用Tauri提供的正确方法获取应用数据目录
    let app_dir = app
        .handle()
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    // 创建两个数据库文件路径
    let common_db_path = app_dir.join("gtavm_common.db"); // 用于存储通用数据（车辆和品牌）
    let user_db_path = app_dir.join("gtavm_user.db"); // 用于存储用户个性化数据（车库）

    // 确保目录存在
    if !Path::exists(&app_dir) {
        // 不使用?运算符，直接使用panic!因为这是初始化阶段的关键错误
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    }

    // 初始化通用数据库（车辆和品牌）
    init_common_db(app, &common_db_path)?;

    // 初始化用户数据库（车库）
    init_user_db(app, &user_db_path)?;

    Ok(())
}

// 初始化通用数据库（车辆和品牌）
fn init_common_db(app: &App, db_path: &std::path::Path) -> Result<()> {
    println!("Initializing common database (vehicles and brands)...");

    // 检查是否存在外部SQL文件，如果存在则使用它初始化数据库
    // 按优先级顺序检查：
    // 1. 开发阶段：当前工作目录
    // 2. 生产阶段：可执行文件同级目录
    // 3. 生产阶段：应用数据目录

    // 1. 开发阶段：首先检查当前工作目录是否有init.sql文件
    let current_dir = env::current_dir().expect("Failed to get current directory");
    let dev_sql_init_file = current_dir.join("init.sql");

    if dev_sql_init_file.exists() {
        println!("Found init.sql file in current directory, using it to initialize common database (development mode)");
        let conn = match Connection::open(db_path) {
            Ok(conn) => conn,
            Err(e) => return Err(e),
        };

        match std::fs::read_to_string(&dev_sql_init_file) {
            Ok(content) => {
                if let Err(e) = conn.execute_batch(&content) {
                    eprintln!("Failed to execute SQL commands from dev init.sql: {:?}", e);
                    // 如果执行失败，继续使用默认初始化
                } else {
                    println!("Common database initialized successfully from dev init.sql");
                    return Ok(());
                }
            }
            Err(e) => {
                eprintln!("Failed to read dev init.sql file: {:?}", e);
                // 如果读取失败，继续检查其他位置
            }
        }
    }

    // 2. 生产阶段：检查可执行文件同级目录是否有init.sql文件
    let exe_path = env::current_exe().expect("Failed to get executable path");
    let exe_dir = exe_path
        .parent()
        .expect("Failed to get executable directory");
    let prod_sql_init_file = exe_dir.join("init.sql");

    if prod_sql_init_file.exists() {
        println!("Found init.sql file in executable directory, using it to initialize common database (production mode)");
        let conn = match Connection::open(db_path) {
            Ok(conn) => conn,
            Err(e) => return Err(e),
        };

        match std::fs::read_to_string(&prod_sql_init_file) {
            Ok(content) => {
                if let Err(e) = conn.execute_batch(&content) {
                    eprintln!(
                        "Failed to execute SQL commands from prod exe dir init.sql: {:?}",
                        e
                    );
                    // 如果执行失败，继续使用默认初始化
                } else {
                    println!("Common database initialized successfully from prod exe dir init.sql");
                    return Ok(());
                }
            }
            Err(e) => {
                eprintln!("Failed to read prod exe dir init.sql file: {:?}", e);
                // 如果读取失败，继续检查其他位置
            }
        }
    }

    // 3. 生产阶段：检查应用数据目录是否有init.sql文件
    let app_dir = app
        .handle()
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let sql_init_file = app_dir.join("init.sql");
    if sql_init_file.exists() {
        println!(
            "Found init.sql file in app data directory, using it to initialize common database"
        );
        let conn = match Connection::open(db_path) {
            Ok(conn) => conn,
            Err(e) => return Err(e),
        };

        match std::fs::read_to_string(&sql_init_file) {
            Ok(content) => {
                if let Err(e) = conn.execute_batch(&content) {
                    eprintln!(
                        "Failed to execute SQL commands from app data init.sql: {:?}",
                        e
                    );
                    // 如果执行失败，继续使用默认初始化
                } else {
                    println!("Common database initialized successfully from app data init.sql");
                    return Ok(());
                }
            }
            Err(e) => {
                eprintln!("Failed to read app data init.sql file: {:?}", e);
                // 如果读取失败，继续使用默认初始化
            }
        }
    }

    // 打开数据库连接
    let conn = match Connection::open(db_path) {
        Ok(conn) => conn,
        Err(e) => return Err(e),
    };

    // 强制创建所有表，无论它们是否已存在
    // 这样可以确保即使数据库文件存在但表结构不完整，也能被正确修复

    // 创建车辆品牌表
    println!("Creating or updating vehicle_brand table...");
    if let Err(e) = conn.execute(
        "CREATE TABLE IF NOT EXISTS vehicle_brand (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            brand_name VARCHAR(255),
            brand_name_en VARCHAR(255),
            remarks VARCHAR(255)
        )",
        [],
    ) {
        eprintln!("Failed to create vehicle_brand table: {:?}", e);
        return Err(e);
    }

    // 创建车辆概览表
    println!("Creating or updating vehicle_overview table...");
    if let Err(e) = conn.execute(
        "CREATE TABLE IF NOT EXISTS vehicle_overview (
            id INTEGER NOT NULL PRIMARY KEY,
            brand_id INTEGER,
            vehicle_name VARCHAR(255),
            vehicle_name_en VARCHAR(255),
            remarks VARCHAR(255),
            feature VARCHAR(255),
            FOREIGN KEY (brand_id) REFERENCES vehicle_brand (id)
        )",
        [],
    ) {
        eprintln!("Failed to create vehicle_overview table: {:?}", e);
        return Err(e);
    }

    Ok(())
}

// 初始化用户数据库（车库）
fn init_user_db(_app: &App, db_path: &std::path::Path) -> Result<()> {
    println!("Initializing user database (garages)...");

    // 打开数据库连接
    let conn = match Connection::open(db_path) {
        Ok(conn) => conn,
        Err(e) => return Err(e),
    };

    // 强制创建车库概览表，无论它是否已存在
    println!("Creating or updating garage_overview table...");
    // 首先检查是否需要添加remarks字段
    let has_remarks_column =
        match conn.execute("ALTER TABLE garage_overview ADD COLUMN remarks TEXT", []) {
            Ok(_) => true,
            Err(e) => {
                // 如果错误是"duplicate column name"，说明字段已存在，忽略错误
                if e.to_string().contains("duplicate column name") {
                    println!("remarks column already exists in garage_overview table");
                    true
                } else {
                    eprintln!("Failed to add remarks column: {:?}", e);
                    false
                }
            }
        };

    if !has_remarks_column {
        // 如果添加字段失败且不是因为重复，重新创建表（仅用于初始化）
        let result = conn.execute(
            "CREATE TABLE IF NOT EXISTS garage_overview (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                garage_name VARCHAR(255),
                garage_name_en VARCHAR(255),
                num INTEGER,
                vehicle_list TEXT,
                remarks TEXT,
                order INTEGER
            )",
            [],
        );
        if let Err(e) = result {
            eprintln!("Failed to create garage_overview table: {:?}", e);
            return Err(e);
        }
    }

    Ok(())
}
