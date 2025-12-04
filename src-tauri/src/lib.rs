// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// 导入子模块
mod api;
mod database;
mod models;

// 重新导出模块内容
pub use api::*;
pub use database::init_db;
pub use models::{ApiResponse, GarageOverview, VehicleBrand, VehicleOverview};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 初始化数据库
            if let Err(e) = init_db(app) {
                eprintln!("Failed to initialize database: {}", e);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            // 车库概览管理
            get_garage_overviews,
            add_garage_overview,
            update_garage_overview,
            delete_garage_overview,
            // 车辆品牌管理
            get_vehicle_brands,
            add_vehicle_brand,
            update_vehicle_brand,
            delete_vehicle_brand,
            // 车辆概览管理
            get_vehicle_overviews,
            get_vehicle_overviews_by_brand,
            add_vehicle_overview,
            update_vehicle_overview,
            delete_vehicle_overview
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
