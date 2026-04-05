# Contributing to WOFES SFF Browser

Thank you for your interest in contributing to WOFES SFF Browser! This document provides guidelines for contributing to the project.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or identity.

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Any conduct that could be considered inappropriate

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Gather relevant information

Create an issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, version, platform)
- Screenshots if applicable
- Error logs if available

### Suggesting Features

Feature requests should include:
- Clear use case
- Expected behavior
- Why this feature would benefit users
- Possible implementation approach

### Code Contributions

#### Setup Development Environment

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/wofes-sff-browser.git
cd wofes-sff-browser

# Add upstream remote
git remote add upstream https://github.com/wofes/sff-browser.git

# Install dependencies
./build.sh setup

# Create branch
git checkout -b feature/your-feature-name
```

#### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes**
   - Follow code style guidelines
   - Write tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   cargo test --all
   cargo clippy --all-targets
   cargo fmt --check
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/my-new-feature
   ```

#### Commit Message Guidelines

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```
feat(tor): add bridge support for censored networks

Implements obfs4, meek, and snowflake bridge types.
Users can now configure bridges through settings panel.

Closes #123
```

```
fix(privacy): resolve canvas fingerprinting bypass

Canvas noise was not being applied correctly in some edge cases.
Fixed by ensuring noise is applied before any read operations.

Fixes #456
```

### Code Style

#### Rust

Follow Rust standard style:
```bash
# Format code
cargo fmt

# Run linter
cargo clippy --all-targets
```

**Guidelines:**
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Write documentation for public APIs
- Avoid unwrap() in production code
- Use Result<T, E> for error handling

#### JavaScript

```javascript
// Use const/let, not var
const data = fetchData();

// Descriptive names
function handleUserAuthentication() { }

// Comments for complex logic
// Calculate Fibonacci using dynamic programming
const fibonacci = (n) => { };
```

#### TypeScript (if using)

```typescript
// Use types
interface User {
  id: string;
  name: string;
}

// Explicit return types
function getUser(id: string): Promise<User> { }
```

### Testing

#### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_decryption() {
        let crypto = CryptoManager::new(&key);
        let data = b"test data";
        let encrypted = crypto.encrypt(data).unwrap();
        let decrypted = crypto.decrypt(&encrypted).unwrap();
        assert_eq!(data, decrypted.as_slice());
    }
}
```

#### Integration Tests

```rust
#[tokio::test]
async fn test_tor_connection() {
    let tor = TorManager::new(TorConfig::default());
    tor.start().await.unwrap();
    
    assert!(tor.is_running());
    assert!(tor.check_onion_connectivity().await.unwrap());
    
    tor.stop().await.unwrap();
}
```

### Documentation

#### Code Documentation

```rust
/// Encrypts data using AES-256-GCM
///
/// # Arguments
///
/// * `data` - The plaintext data to encrypt
///
/// # Returns
///
/// Returns encrypted data with nonce prepended
///
/// # Errors
///
/// Returns error if encryption fails
///
/// # Examples
///
/// ```
/// let crypto = CryptoManager::new(&key);
/// let encrypted = crypto.encrypt(b"secret").unwrap();
/// ```
pub fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
    // implementation
}
```

#### Markdown Documentation

- Use clear headings
- Provide code examples
- Include screenshots for UI changes
- Keep language simple and concise

### Pull Request Process

1. **Update documentation**
   - README.md if feature is user-facing
   - CONFIGURATION.md for new settings
   - Code comments and API docs

2. **Add tests**
   - Unit tests for new functions
   - Integration tests for features
   - Test coverage should not decrease

3. **Update CHANGELOG.md**
   ```markdown
   ## [Unreleased]
   ### Added
   - New feature description (#PR_NUMBER)
   
   ### Fixed
   - Bug fix description (#PR_NUMBER)
   ```

4. **Create pull request**
   - Reference related issues
   - Describe changes clearly
   - Include screenshots for UI changes
   - List any breaking changes

5. **Code review**
   - Address reviewer feedback
   - Update based on suggestions
   - Keep discussion professional

6. **Merge**
   - Squash commits if requested
   - Delete branch after merge

### Review Process

PRs will be reviewed for:
- Code quality and style
- Test coverage
- Documentation completeness
- Security implications
- Performance impact
- Breaking changes

Expect feedback within 48 hours.

## Project Structure

```
wofes-sff-browser/
├── core/              # Core browser logic
│   ├── src/
│   │   ├── lib.rs    # Main module
│   │   ├── privacy.rs
│   │   ├── storage.rs
│   │   └── network.rs
│   └── Cargo.toml
├── ui/                # Web interface
│   ├── src/
│   │   └── lib.rs    # Web server
│   └── static/       # HTML/CSS/JS
├── tor-integration/   # Tor support
├── vpn-manager/       # VPN management
├── platform-desktop/  # Desktop platforms
├── platform-mobile/   # Mobile platforms
└── docs/             # Documentation
```

## Areas for Contribution

### High Priority

- [ ] Performance optimizations
- [ ] Additional VPN protocols
- [ ] More Tor bridge types
- [ ] Enhanced fingerprint protection
- [ ] Mobile platform improvements

### Medium Priority

- [ ] UI/UX improvements
- [ ] Additional themes
- [ ] More widget types
- [ ] Browser extensions support
- [ ] Sync across devices

### Low Priority

- [ ] Additional search engines
- [ ] More wallpapers
- [ ] Translations
- [ ] Accessibility features

### Security-Critical

Security-related PRs get highest priority:
- Vulnerability fixes
- Privacy improvements
- Encryption enhancements
- Leak prevention

## Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security@wofes.org
2. Include description and reproduction steps
3. Wait for response before disclosure

We aim to respond within 24 hours.

## Release Process

Releases follow semantic versioning:
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

Release cycle: Monthly for minor, as-needed for patches.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in commits

## Questions?

- Open a discussion on GitHub
- Join our community chat
- Email contribute@wofes.org

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to WOFES SFF Browser!
