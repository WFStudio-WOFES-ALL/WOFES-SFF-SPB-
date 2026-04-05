use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: Uuid,
    pub url: String,
    pub title: String,
    pub visit_time: DateTime<Utc>,
    pub visit_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadEntry {
    pub id: Uuid,
    pub url: String,
    pub filename: String,
    pub filepath: String,
    pub size_bytes: u64,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub is_encrypted: bool,
    pub status: DownloadStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DownloadStatus {
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserStorage {
    pub history: Vec<HistoryEntry>,
    pub downloads: Vec<DownloadEntry>,
    pub bookmarks: Vec<Bookmark>,
    pub custom_buttons: Vec<CustomButton>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bookmark {
    pub id: Uuid,
    pub url: String,
    pub title: String,
    pub folder: Option<String>,
    pub created_at: DateTime<Utc>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomButton {
    pub id: Uuid,
    pub label: String,
    pub action: ButtonAction,
    pub position: usize,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ButtonAction {
    ToggleDns,
    ToggleAntiScreenshot,
    ClearHistory,
    ChangeWallpaper,
    ChangeCornerText,
    ToggleVpn,
    OpenUrl(String),
    RunScript(String),
}

impl BrowserStorage {
    pub fn new() -> Self {
        Self {
            history: Vec::new(),
            downloads: Vec::new(),
            bookmarks: Vec::new(),
            custom_buttons: Vec::new(),
        }
    }

    pub fn add_history_entry(&mut self, url: String, title: String) {
        if let Some(entry) = self.history.iter_mut().find(|e| e.url == url) {
            entry.visit_count += 1;
            entry.visit_time = Utc::now();
            entry.title = title;
        } else {
            self.history.push(HistoryEntry {
                id: Uuid::new_v4(),
                url,
                title,
                visit_time: Utc::now(),
                visit_count: 1,
            });
        }
    }

    pub fn clear_history(&mut self) {
        self.history.clear();
    }

    pub fn search_history(&self, query: &str) -> Vec<&HistoryEntry> {
        self.history
            .iter()
            .filter(|e| {
                e.url.to_lowercase().contains(&query.to_lowercase()) ||
                e.title.to_lowercase().contains(&query.to_lowercase())
            })
            .collect()
    }

    pub fn add_bookmark(&mut self, url: String, title: String, folder: Option<String>) -> Uuid {
        let bookmark = Bookmark {
            id: Uuid::new_v4(),
            url,
            title,
            folder,
            created_at: Utc::now(),
            tags: Vec::new(),
        };
        let id = bookmark.id;
        self.bookmarks.push(bookmark);
        id
    }

    pub fn remove_bookmark(&mut self, id: Uuid) -> Result<(), String> {
        let index = self.bookmarks
            .iter()
            .position(|b| b.id == id)
            .ok_or("Bookmark not found")?;
        self.bookmarks.remove(index);
        Ok(())
    }

    pub fn add_download(&mut self, url: String, filename: String, filepath: String, size_bytes: u64, is_encrypted: bool) -> Uuid {
        let download = DownloadEntry {
            id: Uuid::new_v4(),
            url,
            filename,
            filepath,
            size_bytes,
            started_at: Utc::now(),
            completed_at: None,
            is_encrypted,
            status: DownloadStatus::InProgress,
        };
        let id = download.id;
        self.downloads.push(download);
        id
    }

    pub fn update_download_status(&mut self, id: Uuid, status: DownloadStatus) -> Result<(), String> {
        let download = self.downloads
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or("Download not found")?;
        
        download.status = status;
        if matches!(download.status, DownloadStatus::Completed) {
            download.completed_at = Some(Utc::now());
        }
        
        Ok(())
    }

    pub fn add_custom_button(&mut self, label: String, action: ButtonAction, icon: Option<String>) -> Uuid {
        let position = self.custom_buttons.len();
        let button = CustomButton {
            id: Uuid::new_v4(),
            label,
            action,
            position,
            icon,
        };
        let id = button.id;
        self.custom_buttons.push(button);
        id
    }

    pub fn remove_custom_button(&mut self, id: Uuid) -> Result<(), String> {
        let index = self.custom_buttons
            .iter()
            .position(|b| b.id == id)
            .ok_or("Button not found")?;
        self.custom_buttons.remove(index);
        
        for (i, button) in self.custom_buttons.iter_mut().enumerate() {
            button.position = i;
        }
        
        Ok(())
    }

    pub fn reorder_custom_buttons(&mut self, button_ids: Vec<Uuid>) -> Result<(), String> {
        let mut new_buttons = Vec::new();
        
        for (position, id) in button_ids.iter().enumerate() {
            if let Some(mut button) = self.custom_buttons.iter().find(|b| b.id == *id).cloned() {
                button.position = position;
                new_buttons.push(button);
            } else {
                return Err("Button not found".to_string());
            }
        }
        
        self.custom_buttons = new_buttons;
        Ok(())
    }
}

impl Default for BrowserStorage {
    fn default() -> Self {
        Self::new()
    }
}
