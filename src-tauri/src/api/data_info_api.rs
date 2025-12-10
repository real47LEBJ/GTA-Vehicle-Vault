// 导入必要的依赖
use rusqlite::{Connection, Result};
use tauri::{command, AppHandle, Manager};

// 导入数据模型
use crate::models::{ApiResponse, DataInfo};

// 获取数据信息
#[command]
pub fn get_data_info(app: AppHandle) -> Result<ApiResponse<DataInfo>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = app_dir.join("gtavm_common.db"); // 使用通用数据库文件

    match Connection::open(&db_path) {
        Ok(conn) => match conn.prepare("SELECT dlc_name, dlc_name_en, update_time FROM data_info LIMIT 1") {
            Ok(mut stmt) => {
                match stmt.query_map([], |row| {
                    Ok(DataInfo {
                        dlc_name: row.get(0)?,
                        dlc_name_en: row.get(1)?,
                        update_time: row.get(2)?,
                    })
                }) {
                    Ok(data_info_iter) => match data_info_iter.collect::<Result<Vec<_>, _>>() {
                        Ok(mut data_info_list) => {
                            if let Some(data_info) = data_info_list.pop() {
                                Ok(ApiResponse {
                                    success: true,
                                    data: Some(data_info),
                                    error: None,
                                })
                            } else {
                                Ok(ApiResponse {
                                    success: false,
                                    data: None,
                                    error: Some("No data found".to_string()),
                                })
                            }
                        },
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
            },
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
