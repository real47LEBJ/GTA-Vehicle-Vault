// 导入必要的依赖
use rusqlite::{params, Connection, Result};
use tauri::{command, AppHandle, Manager};

// 导入数据模型
use crate::models::{ApiResponse, VehicleOverview, FeatureTypeDict};

// 获取所有载具概览
#[command]
pub fn get_vehicle_overviews(app: AppHandle) -> Result<ApiResponse<Vec<VehicleOverview>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, brand_id, vehicle_name, vehicle_name_en, vehicle_type, feature, price, remarks FROM vehicle_overview") {
            Ok(mut stmt) => {
                match stmt.query_map([], |row| {
                    Ok(VehicleOverview {
                        id: row.get(0)?,
                        brand_id: row.get(1)?,
                        vehicle_name: row.get(2)?,
                        vehicle_name_en: row.get(3)?,
                        vehicle_type: row.get(4)?,
                        feature: row.get(5)?,
                        price: match row.get(6) {
                            Ok(price_val) => price_val,
                            Err(_) => {
                                // 如果无法直接获取为i32，尝试先获取为文本再转换
                                match row.get::<_, String>(6) {
                                    Ok(text_price) => {
                                        match text_price.parse::<i32>() {
                                            Ok(int_price) => Some(int_price),
                                            Err(_) => None,
                                        }
                                    },
                                    Err(_) => None,
                                }
                            },
                        },
                        remarks: row.get(7)?,
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

// 按品牌获取载具概览
#[command]
pub fn get_vehicle_overviews_by_brand(
    app: AppHandle,
    brand_id: i32,
) -> Result<ApiResponse<Vec<VehicleOverview>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储载具数据

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, brand_id, vehicle_name, vehicle_name_en, vehicle_type, feature, price, remarks FROM vehicle_overview WHERE brand_id = ?1") {
            Ok(mut stmt) => {
                match stmt.query_map(params![brand_id], |row| {
                    Ok(VehicleOverview {
                        id: row.get(0)?,
                        brand_id: row.get(1)?,
                        vehicle_name: row.get(2)?,
                        vehicle_name_en: row.get(3)?,
                        vehicle_type: row.get(4)?,
                        feature: row.get(5)?,
                        price: match row.get(6) {
                            Ok(price_val) => price_val,
                            Err(_) => {
                                // 如果无法直接获取为i32，尝试先获取为文本再转换
                                match row.get::<_, String>(6) {
                                    Ok(text_price) => {
                                        match text_price.parse::<i32>() {
                                            Ok(int_price) => Some(int_price),
                                            Err(_) => None,
                                        }
                                    },
                                    Err(_) => None,
                                }
                            },
                        },
                        remarks: row.get(7)?,
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

// 根据ID获取载具概览
#[command]
pub fn get_vehicle_overview_by_id(
    app: AppHandle,
    id: String,
) -> Result<ApiResponse<VehicleOverview>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, brand_id, vehicle_name, vehicle_name_en, vehicle_type, feature, price, remarks FROM vehicle_overview WHERE id = ?1") {
            Ok(mut stmt) => {
                match stmt.query_row(params![id], |row| {
                    Ok(VehicleOverview {
                        id: row.get(0)?,
                        brand_id: row.get(1)?,
                        vehicle_name: row.get(2)?,
                        vehicle_name_en: row.get(3)?,
                        vehicle_type: row.get(4)?,
                        feature: row.get(5)?,
                        price: match row.get(6) {
                            Ok(price_val) => price_val,
                            Err(_) => {
                                // 如果无法直接获取为i32，尝试先获取为文本再转换
                                match row.get::<_, String>(6) {
                                    Ok(text_price) => {
                                        match text_price.parse::<i32>() {
                                            Ok(int_price) => Some(int_price),
                                            Err(_) => None,
                                        }
                                    },
                                    Err(_) => None,
                                }
                            },
                        },
                        remarks: row.get(7)?,
                    })
                }) {
                    Ok(vehicle) => Ok(ApiResponse {
                        success: true,
                        data: Some(vehicle),
                        error: None,
                    }),
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

// 添加载具概览
#[command]
pub fn add_vehicle_overview(
    app: AppHandle,
    vehicle: VehicleOverview,
) -> Result<ApiResponse<VehicleOverview>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储载具数据

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
                        "INSERT INTO vehicle_overview (id, brand_id, vehicle_name, vehicle_name_en, vehicle_type, feature, price, remarks) 
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                        params![
                            vehicle.id,
                            vehicle.brand_id,
                            vehicle.vehicle_name,
                            vehicle.vehicle_name_en,
                            vehicle.vehicle_type,
                            vehicle.feature,
                            vehicle.price,
                            vehicle.remarks
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

// 更新载具概览
#[command]
pub fn update_vehicle_overview(
    app: AppHandle,
    vehicle: VehicleOverview,
) -> Result<ApiResponse<VehicleOverview>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储载具数据

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
                        "UPDATE vehicle_overview SET brand_id = ?1, vehicle_name = ?2, vehicle_name_en = ?3, vehicle_type = ?4, feature = ?5, price = ?6, remarks = ?7 WHERE id = ?8",
                        params![
                            vehicle.brand_id,
                            vehicle.vehicle_name,
                            vehicle.vehicle_name_en,
                            vehicle.vehicle_type,
                            vehicle.feature,
                            vehicle.price,
                            vehicle.remarks,
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

// 删除载具概览
#[command]
pub fn delete_vehicle_overview(app: AppHandle, id: String) -> Result<ApiResponse<()>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件存储载具数据

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

// 获取所有特性类型字典
#[command]
pub fn get_feature_type_dicts(app: AppHandle) -> Result<ApiResponse<Vec<FeatureTypeDict>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, dict_key, dict_value FROM feature_type_dict") {
            Ok(mut stmt) => {
                match stmt.query_map([], |row| {
                    Ok(FeatureTypeDict {
                        id: row.get(0)?,
                        dict_key: row.get(1)?,
                        dict_value: row.get(2)?,
                    })
                }) {
                    Ok(dict_iter) => match dict_iter.collect::<Result<_>>() {
                        Ok(dicts) => Ok(ApiResponse {
                    success: true,
                    data: Some(dicts),
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

// 根据英文单词获取特性类型中文翻译
#[command]
pub fn get_feature_type_dict_by_key(
    app: AppHandle,
    dict_key: String,
) -> Result<ApiResponse<FeatureTypeDict>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, dict_key, dict_value FROM feature_type_dict WHERE dict_key = ?1") {
            Ok(mut stmt) => {
                match stmt.query_row(params![dict_key], |row| {
                    Ok(FeatureTypeDict {
                        id: row.get(0)?,
                        dict_key: row.get(1)?,
                        dict_value: row.get(2)?,
                    })
                }) {
                    Ok(dict) => Ok(ApiResponse {
                        success: true,
                        data: Some(dict),
                        error: None,
                    }),
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

// 获取所有载具类型字典
#[command]
pub fn get_vehicle_type_dicts(app: AppHandle) -> Result<ApiResponse<Vec<FeatureTypeDict>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, dict_key, dict_value FROM vehicle_type_dict") {
            Ok(mut stmt) => {
                match stmt.query_map([], |row| {
                    Ok(FeatureTypeDict {
                        id: row.get(0)?,
                        dict_key: row.get(1)?,
                        dict_value: row.get(2)?,
                    })
                }) {
                    Ok(dict_iter) => match dict_iter.collect::<Result<_>>() {
                        Ok(dicts) => Ok(ApiResponse {
                    success: true,
                    data: Some(dicts),
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

// 根据英文单词获取载具类型中文翻译
#[command]
pub fn get_vehicle_type_dict_by_key(
    app: AppHandle,
    dict_key: String,
) -> Result<ApiResponse<FeatureTypeDict>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT id, dict_key, dict_value FROM vehicle_type_dict WHERE dict_key = ?1") {
            Ok(mut stmt) => {
                match stmt.query_row(params![dict_key], |row| {
                    Ok(FeatureTypeDict {
                        id: row.get(0)?,
                        dict_key: row.get(1)?,
                        dict_value: row.get(2)?,
                    })
                }) {
                    Ok(dict) => Ok(ApiResponse {
                        success: true,
                        data: Some(dict),
                        error: None,
                    }),
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

// 更新前端调用的greet函数
#[command]
pub fn greet(name: &str) -> Result<String, String> {
    Ok(format!(
        "Hello, {}! You've been greeted from Rust with SQLite!",
        name
    ))
}
