// 导入必要的依赖
use rusqlite::{params, Connection, Result};
use tauri::{command, AppHandle, Manager};

// 导入数据模型
use crate::models::{ApiResponse, VehicleOverview};

// 获取所有车辆概览
#[command]
pub fn get_vehicle_overviews(app: AppHandle) -> Result<ApiResponse<Vec<VehicleOverview>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, brand_id, vehicle_name, vehicle_name_en, remarks, feature, vehicle_type FROM vehicle_overview") {
            Ok(mut stmt) => {
                match stmt.query_map([], |row| {
                    Ok(VehicleOverview {
                        id: row.get(0)?,
                        brand_id: row.get(1)?,
                        vehicle_name: row.get(2)?,
                        vehicle_name_en: row.get(3)?,
                        remarks: row.get(4)?,
                        feature: row.get(5)?,
                        vehicle_type: row.get(6)?,
                    })
                }) {
                    Ok(vehicle_iter) => match vehicle_iter.collect::<Result<_>>() {
                        Ok(vehicles) => Ok(ApiResponse {
                    success: true,
                    data: Some(vehicles),
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

// 按品牌获取车辆概览
#[command]
pub fn get_vehicle_overviews_by_brand(
    app: AppHandle,
    brand_id: i32,
) -> Result<ApiResponse<Vec<VehicleOverview>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储车辆数据

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, brand_id, vehicle_name, vehicle_name_en, remarks, feature, vehicle_type FROM vehicle_overview WHERE brand_id = ?1") {
            Ok(mut stmt) => {
                match stmt.query_map(params![brand_id], |row| {
                    Ok(VehicleOverview {
                        id: row.get(0)?,
                        brand_id: row.get(1)?,
                        vehicle_name: row.get(2)?,
                        vehicle_name_en: row.get(3)?,
                        remarks: row.get(4)?,
                        feature: row.get(5)?,
                        vehicle_type: row.get(6)?,
                    })
                }) {
                    Ok(vehicle_iter) => match vehicle_iter.collect::<Result<_>>() {
                        Ok(vehicles) => Ok(ApiResponse {
                            success: true,
                            data: Some(vehicles),
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

// 添加车辆概览
#[command]
pub fn add_vehicle_overview(
    app: AppHandle,
    vehicle: VehicleOverview,
) -> Result<ApiResponse<VehicleOverview>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储车辆数据

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    // 检查品牌是否存在
                    let brand_exists: i64 = match tx.query_row(
                        "SELECT COUNT(*) FROM vehicle_brand WHERE id = ?1",
                        params![vehicle.brand_id],
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

                    if brand_exists == 0 {
                        return Err("指定的品牌不存在".to_string());
                    }

                    match tx.execute(
                        "INSERT INTO vehicle_overview (id, brand_id, vehicle_name, vehicle_name_en, remarks, feature, vehicle_type) 
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                        params![
                            vehicle.id,
                            vehicle.brand_id,
                            vehicle.vehicle_name,
                            vehicle.vehicle_name_en,
                            vehicle.remarks,
                            vehicle.feature,
                            vehicle.vehicle_type
                        ],
                    ) {
                        Ok(_) => {
                            match tx.commit() {
                                Ok(_) => {
                                    Ok(ApiResponse {
                                        success: true,
                                        data: Some(vehicle),
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

// 更新车辆概览
#[command]
pub fn update_vehicle_overview(
    app: AppHandle,
    vehicle: VehicleOverview,
) -> Result<ApiResponse<VehicleOverview>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储车辆数据

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    // 检查品牌是否存在
                    let brand_exists: i64 = match tx.query_row(
                        "SELECT COUNT(*) FROM vehicle_brand WHERE id = ?1",
                        params![vehicle.brand_id],
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

                    if brand_exists == 0 {
                        return Ok(ApiResponse {
                            success: false,
                            data: None,
                            error: Some("指定的品牌不存在".to_string()),
                        });
                    }

                    match tx.execute(
                        "UPDATE vehicle_overview SET brand_id = ?1, vehicle_name = ?2, vehicle_name_en = ?3, remarks = ?4, feature = ?5, vehicle_type = ?6 WHERE id = ?7",
                        params![
                            vehicle.brand_id,
                            vehicle.vehicle_name,
                            vehicle.vehicle_name_en,
                            vehicle.remarks,
                            vehicle.feature,
                            vehicle.vehicle_type,
                            vehicle.id
                        ],
                    ) {
                        Ok(_) => {
                            match tx.commit() {
                                Ok(_) => {
                                    Ok(ApiResponse {
                                        success: true,
                                        data: Some(vehicle),
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

// 删除车辆概览
#[command]
pub fn delete_vehicle_overview(app: AppHandle, id: String) -> Result<ApiResponse<()>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储车辆数据

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    match tx.execute("DELETE FROM vehicle_overview WHERE id = ?1", params![id]) {
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

// 更新前端调用的greet函数
#[command]
pub fn greet(name: &str) -> Result<String, String> {
    Ok(format!(
        "Hello, {}! You've been greeted from Rust with SQLite!",
        name
    ))
}
