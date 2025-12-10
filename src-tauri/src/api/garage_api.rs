// 导入必要的依赖
use rusqlite::{params, Connection, Result};
use tauri::{command, AppHandle, Manager};

// 导入数据模型
use crate::models::{ApiResponse, GarageOverview};

// 获取所有车库概览
#[command]
pub fn get_garage_overviews(app: AppHandle) -> Result<ApiResponse<Vec<GarageOverview>>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_user.db");

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare(
            "SELECT id, garage_name, garage_name_en, num, vehicle_list, remarks, garage_order, garage_type FROM garage_overview ORDER BY garage_order ASC",
        ) {
            Ok(mut stmt) => {
                match stmt.query_map([], |row| {
                    Ok(GarageOverview {
                        id: Some(row.get(0)?),
                        garage_name: row.get(1)?,
                        garage_name_en: row.get(2)?,
                        num: row.get(3)?,
                        vehicle_list: row.get(4)?,
                        remarks: row.get(5)?,
                        garage_order: row.get(6)?,
                        garage_type: row.get(7)?,
                    })
                }) {
                    Ok(garage_iter) => match garage_iter.collect::<Result<_>>() {
                        Ok(garages) => Ok(ApiResponse {
                            success: true,
                            data: Some(garages),
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

// 添加车库概览
#[command]
pub fn add_garage_overview(
    app: AppHandle,
    garage: GarageOverview,
) -> Result<ApiResponse<GarageOverview>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_user.db");

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    // 插入新记录，不指定ID，让SQLite自动生成
                    // 获取当前最大garage_order值，用于设置新车库的默认garage_order
                    let max_order: Option<i32> = tx.query_row(
                        "SELECT MAX(garage_order) FROM garage_overview",
                        [],
                        |row| row.get(0)
                    ).unwrap_or(None);
                    
                    // 新车库的默认garage_order为当前最大garage_order值+1，若没有车库则为1
                    let new_order = max_order.map(|o| o + 1).unwrap_or(1);
                    
                    match tx.execute(
                        "INSERT INTO garage_overview (garage_name, garage_name_en, num, vehicle_list, remarks, garage_order, garage_type) 
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                        params![
                            garage.garage_name,
                            garage.garage_name_en,
                            garage.num,
                            garage.vehicle_list,
                            garage.remarks,
                            garage.garage_order.unwrap_or(new_order),
                            garage.garage_type
                        ],
                    ) {
                        Ok(_) => {
                            // 获取刚插入的记录的ID
                            let last_id = match tx.last_insert_rowid() {
                                id => id as i32
                            };
                            
                            match tx.commit() {
                                Ok(_) => {
                                    // 创建包含自动生成ID的返回对象
                            let created_garage = GarageOverview {
                                id: Some(last_id),
                                garage_name: garage.garage_name,
                                garage_name_en: garage.garage_name_en,
                                num: garage.num,
                                vehicle_list: garage.vehicle_list,
                                remarks: garage.remarks,
                                garage_order: Some(garage.garage_order.unwrap_or(new_order)),
                                garage_type: garage.garage_type
                            };
                                    
                                    Ok(ApiResponse {
                                        success: true,
                                        data: Some(created_garage),
                                        error: None,
                                    })
                                },
                                Err(e) => {
                                    Err(e.to_string())
                                }
                            }
                        },
                        Err(e) => {
                            // 回滚事务
                            let _ = tx.rollback();
                            Err(e.to_string())
                        }
                    }
                }
                Err(e) => Err(e.to_string()),
            }
        }
        Err(e) => Err(e.to_string()),
    }
}

// 更新车库概览
#[command]
pub fn update_garage_overview(
    app: AppHandle,
    garage: GarageOverview,
) -> Result<ApiResponse<GarageOverview>, String> {
    // 检查ID是否存在
    let garage_id = match garage.id {
        Some(id) => id,
        None => return Err("Garage ID is required for update".to_string()),
    };
    
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_user.db");

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    match tx.execute(
                        "UPDATE garage_overview SET garage_name = ?1, garage_name_en = ?2, num = ?3, vehicle_list = ?4, remarks = ?5, garage_order = ?6, garage_type = ?7 WHERE id = ?8",
                        params![
                            garage.garage_name,
                            garage.garage_name_en,
                            garage.num,
                            garage.vehicle_list,
                            garage.remarks,
                            garage.garage_order,
                            garage.garage_type,
                            garage_id
                        ],
                    ) {
                        Ok(_) => {
                            match tx.commit() {
                                Ok(_) => {
                                    Ok(ApiResponse {
                                        success: true,
                                        data: Some(garage),
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
// API接口函数 - 车库管理

// 删除车库概览
#[command]
pub fn delete_garage_overview(app: AppHandle, id: i32) -> Result<ApiResponse<()>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_user.db");

    match Connection::open(&db_path) {
        Ok(mut conn) => {
            match conn.transaction() {
                Ok(tx) => {
                    match tx.execute("DELETE FROM garage_overview WHERE id = ?1", params![id]) {
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
