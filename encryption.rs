use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use anyhow::{Result, Context};
use rand::RngCore;
use sha2::{Sha256, Digest};

pub struct CryptoManager {
    key: [u8; 32],
}

impl CryptoManager {
    pub fn new() -> Result<Self> {
        let mut key = [0u8; 32];
        OsRng.fill_bytes(&mut key);
        
        Ok(Self { key })
    }

    pub fn from_password(password: &str) -> Self {
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let result = hasher.finalize();
        
        let mut key = [0u8; 32];
        key.copy_from_slice(&result);
        
        Self { key }
    }

    pub fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        let cipher = Aes256Gcm::new(&self.key.into());
        
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let ciphertext = cipher
            .encrypt(nonce, data)
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;
        
        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);
        
        Ok(result)
    }

    pub fn decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>> {
        if encrypted_data.len() < 12 {
            anyhow::bail!("Invalid encrypted data: too short");
        }
        
        let (nonce_bytes, ciphertext) = encrypted_data.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        
        let cipher = Aes256Gcm::new(&self.key.into());
        
        cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))
    }

    pub fn encrypt_file(&self, input_path: &std::path::Path, output_path: &std::path::Path) -> Result<()> {
        let data = std::fs::read(input_path)
            .context("Failed to read input file")?;
        
        let encrypted = self.encrypt(&data)?;
        
        std::fs::write(output_path, encrypted)
            .context("Failed to write encrypted file")?;
        
        Ok(())
    }

    pub fn decrypt_file(&self, input_path: &std::path::Path, output_path: &std::path::Path) -> Result<()> {
        let encrypted_data = std::fs::read(input_path)
            .context("Failed to read encrypted file")?;
        
        let decrypted = self.decrypt(&encrypted_data)?;
        
        std::fs::write(output_path, decrypted)
            .context("Failed to write decrypted file")?;
        
        Ok(())
    }

    pub fn get_key_base64(&self) -> String {
        base64::encode(&self.key)
    }

    pub fn from_key_base64(key_base64: &str) -> Result<Self> {
        let key_bytes = base64::decode(key_base64)
            .context("Invalid base64 key")?;
        
        if key_bytes.len() != 32 {
            anyhow::bail!("Invalid key length: expected 32 bytes");
        }
        
        let mut key = [0u8; 32];
        key.copy_from_slice(&key_bytes);
        
        Ok(Self { key })
    }
}

impl Default for CryptoManager {
    fn default() -> Self {
        Self::new().expect("Failed to create CryptoManager")
    }
}

pub fn generate_random_password(length: usize) -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    
    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let crypto = CryptoManager::new().unwrap();
        let data = b"Hello, WOFES SFF Browser!";
        
        let encrypted = crypto.encrypt(data).unwrap();
        let decrypted = crypto.decrypt(&encrypted).unwrap();
        
        assert_eq!(data.to_vec(), decrypted);
    }

    #[test]
    fn test_password_based_encryption() {
        let password = "test_password_123";
        let crypto = CryptoManager::from_password(password);
        
        let data = b"Sensitive data";
        let encrypted = crypto.encrypt(data).unwrap();
        let decrypted = crypto.decrypt(&encrypted).unwrap();
        
        assert_eq!(data.to_vec(), decrypted);
    }
}
