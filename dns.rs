pub struct DnsResolver {
}

impl DnsResolver {
    pub fn new() -> Self {
        Self {}
    }
}

impl Default for DnsResolver {
    fn default() -> Self {
        Self::new()
    }
}
