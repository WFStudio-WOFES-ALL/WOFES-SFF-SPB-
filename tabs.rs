use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    pub id: Uuid,
    pub title: String,
    pub url: String,
    pub custom_icon: Option<String>,
    pub is_active: bool,
    pub is_pinned: bool,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
    pub page_modifications: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabManager {
    pub tabs: Vec<Tab>,
    pub active_tab_id: Option<Uuid>,
}

impl Tab {
    pub fn new(url: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            title: "New Tab".to_string(),
            url,
            custom_icon: None,
            is_active: false,
            is_pinned: false,
            created_at: now,
            last_accessed: now,
            page_modifications: HashMap::new(),
        }
    }

    pub fn update_title(&mut self, title: String) {
        self.title = title;
        self.last_accessed = Utc::now();
    }

    pub fn navigate(&mut self, url: String) {
        self.url = url;
        self.last_accessed = Utc::now();
    }

    pub fn add_modification(&mut self, selector: String, modification: String) {
        self.page_modifications.insert(selector, modification);
    }

    pub fn clear_modifications(&mut self) {
        self.page_modifications.clear();
    }
}

impl TabManager {
    pub fn new() -> Self {
        Self {
            tabs: Vec::new(),
            active_tab_id: None,
        }
    }

    pub fn create_tab(&mut self, url: String) -> Uuid {
        let mut tab = Tab::new(url);
        let tab_id = tab.id;
        
        if self.tabs.is_empty() {
            tab.is_active = true;
            self.active_tab_id = Some(tab_id);
        }
        
        self.tabs.push(tab);
        tab_id
    }

    pub fn close_tab(&mut self, tab_id: Uuid) -> Result<(), String> {
        let index = self.tabs.iter()
            .position(|t| t.id == tab_id)
            .ok_or("Tab not found")?;
        
        let was_active = self.tabs[index].is_active;
        self.tabs.remove(index);

        if was_active && !self.tabs.is_empty() {
            let new_active_index = index.min(self.tabs.len() - 1);
            self.tabs[new_active_index].is_active = true;
            self.active_tab_id = Some(self.tabs[new_active_index].id);
        } else if self.tabs.is_empty() {
            self.active_tab_id = None;
        }

        Ok(())
    }

    pub fn switch_tab(&mut self, tab_id: Uuid) -> Result<(), String> {
        if let Some(current_id) = self.active_tab_id {
            if let Some(current_tab) = self.tabs.iter_mut().find(|t| t.id == current_id) {
                current_tab.is_active = false;
            }
        }

        let tab = self.tabs.iter_mut()
            .find(|t| t.id == tab_id)
            .ok_or("Tab not found")?;
        
        tab.is_active = true;
        tab.last_accessed = Utc::now();
        self.active_tab_id = Some(tab_id);

        Ok(())
    }

    pub fn get_active_tab(&self) -> Option<&Tab> {
        self.active_tab_id.and_then(|id| {
            self.tabs.iter().find(|t| t.id == id)
        })
    }

    pub fn get_active_tab_mut(&mut self) -> Option<&mut Tab> {
        self.active_tab_id.and_then(|id| {
            self.tabs.iter_mut().find(|t| t.id == id)
        })
    }

    pub fn pin_tab(&mut self, tab_id: Uuid) -> Result<(), String> {
        let tab = self.tabs.iter_mut()
            .find(|t| t.id == tab_id)
            .ok_or("Tab not found")?;
        
        tab.is_pinned = !tab.is_pinned;
        Ok(())
    }

    pub fn close_all_tabs(&mut self) {
        self.tabs.clear();
        self.active_tab_id = None;
    }

    pub fn get_tab(&self, tab_id: Uuid) -> Option<&Tab> {
        self.tabs.iter().find(|t| t.id == tab_id)
    }

    pub fn get_tab_mut(&mut self, tab_id: Uuid) -> Option<&mut Tab> {
        self.tabs.iter_mut().find(|t| t.id == tab_id)
    }
}

impl Default for TabManager {
    fn default() -> Self {
        Self::new()
    }
}
