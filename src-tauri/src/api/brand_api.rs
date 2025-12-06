// 导入必要的依赖
use rusqlite::{params, Connection, Result};
use tauri::{command, AppHandle, Manager};

// 导入数据模型
use crate::models::{ApiResponse, VehicleBrand};

// 获取所有载具品牌
#[command]
pub fn get_vehicle_brands(app: AppHandle) -> Result<ApiResponse<Vec<VehicleBrand>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储品牌数据

    match Connection::open(&db_path) {
        Ok(conn) => {
            match conn.prepare("SELECT id, brand_name, brand_name_en, remarks FROM vehicle_brand") {
                Ok(mut stmt) => {
                    match stmt.query_map([], |row| {
                        Ok(VehicleBrand {
                            id: row.get(0)?,
                            brand_name: row.get(1)?,
                            brand_name_en: row.get(2)?,
                            remarks: row.get(3)?,
                        })
                    }) {
                        Ok(brand_iter) => match brand_iter.collect::<Result<_>>() {
                            Ok(brands) => Ok(ApiResponse {
                                success: true,
                                data: Some(brands),
                                error: None,
                            }),
                            Err(e) => Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            }),
                        },
                        Err(e) => Ok(ApiResponse {
                            success: false,
                            data: None,
                            error: Some(e.to_string()),
                        }),
                    }
                }
                Err(e) => Err(e.to_string()),
            }
        }
        Err(e) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

// 添加载具品牌
#[command]
pub fn add_vehicle_brand(
    app: AppHandle,
    brand: VehicleBrand,
) -> Result<ApiResponse<VehicleBrand>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储品牌数据

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    match tx.execute(
                        "INSERT INTO vehicle_brand (id, brand_name, brand_name_en, remarks) 
                         VALUES (?1, ?2, ?3, ?4)",
                        params![
                            brand.id,
                            brand.brand_name,
                            brand.brand_name_en,
                            brand.remarks
                        ],
                    ) {
                        Ok(_) => match tx.commit() {
                            Ok(_) => Ok(ApiResponse {
                                success: true,
                                data: Some(brand),
                                error: None,
                            }),
                            Err(e) => Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            }),
                        },
                        Err(e) => {
                            // 回滚事务
                            let _ = tx.rollback();
                            Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            })
                        }
                    }
                }
                Err(e) => Ok(ApiResponse {
                    success: false,
                    data: None,
                    error: Some(e.to_string()),
                }),
            }
        }
        Err(e) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

// 更新载具品牌
#[command]
pub fn update_vehicle_brand(
    app: AppHandle,
    brand: VehicleBrand,
) -> Result<ApiResponse<VehicleBrand>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储品牌数据

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    match tx.execute(
                        "UPDATE vehicle_brand SET brand_name = ?1, brand_name_en = ?2, remarks = ?3 WHERE id = ?4",
                        params![
                            brand.brand_name,
                            brand.brand_name_en,
                            brand.remarks,
                            brand.id
                        ],
                    ) {
                        Ok(_) => {
                            match tx.commit() {
                                Ok(_) => {
                                    Ok(ApiResponse {
                                        success: true,
                                        data: Some(brand),
                                        error: None,
                                    })
                                },
                                Err(e) => {
                            Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            })
                        }
                            }
                        },
                        Err(e) => {
                            // 回滚事务
                            let _ = tx.rollback();
                            Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            })
                        }
                    }
                }
                Err(e) => Ok(ApiResponse {
                    success: false,
                    data: None,
                    error: Some(e.to_string()),
                }),
            }
        }
        Err(e) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

// 删除载具品牌
#[command]
pub fn delete_vehicle_brand(app: AppHandle, id: i32) -> Result<ApiResponse<()>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储品牌数据

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    // 先检查是否有载具关联到该品牌
                    let count: i64 = match tx.query_row(
                        "SELECT COUNT(*) FROM vehicle_overview WHERE brand_id = ?1",
                        params![id],
                        |row| Ok(row.get(0).unwrap_or(0)),
                    ) {
                        Ok(count) => count,
                        Err(e) => {
                            return Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            })
                        }
                    };

                    if count > 0 {
                        return Err("该品牌下存在载具，无法删除".to_string());
                    }

                    match tx.execute("DELETE FROM vehicle_brand WHERE id = ?1", params![id]) {
                        Ok(_) => match tx.commit() {
                            Ok(_) => Ok(ApiResponse {
                                success: true,
                                data: None,
                                error: None,
                            }),
                            Err(e) => Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            }),
                        },
                        Err(e) => {
                            // 回滚事务
                            let _ = tx.rollback();
                            Ok(ApiResponse {
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            })
                        }
                    }
                }
                Err(e) => Ok(ApiResponse {
                    success: false,
                    data: None,
                    error: Some(e.to_string()),
                }),
            }
        }
        Err(e) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}
