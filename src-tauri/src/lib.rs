// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// 导入子模块
mod api;
mod database;
mod models;

// 重新导出模块内容
pub use api::*;
pub use database::init_db;
pub use models::{ApiResponse, GarageOverview, VehicleBrand, VehicleOverview, FeatureTypeDict};

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
            // 载具品牌管理
            get_vehicle_brands,
            add_vehicle_brand,
            update_vehicle_brand,
            delete_vehicle_brand,
            // 载具概览管理
            get_vehicle_overviews,
            get_vehicle_overviews_by_brand,
            get_vehicle_overview_by_id,
            add_vehicle_overview,
            update_vehicle_overview,
            delete_vehicle_overview,
            // 特性类型字典管理
            get_feature_type_dicts,
            get_feature_type_dict_by_key,
            // 载具类型字典管理
            get_vehicle_type_dicts,
            get_vehicle_type_dict_by_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
