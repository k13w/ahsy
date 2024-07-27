// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn run_aws_cli_command(command: String) -> Result<String, String> {
    let output = Command::new("sh")
        .arg("-c")
        .arg(command)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
fn main() {
    let _ = fix_path_env::fix(); // <---- Add this
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![run_aws_cli_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
