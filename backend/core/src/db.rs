use mongodb::{options::ClientOptions, Client, Database};
use std::error::Error;

pub async fn init_db(uri: &str, db_name: &str) -> Result<Database, Box<dyn Error>> {
    let mut client_options = ClientOptions::parse(uri).await?;
    client_options.app_name = Some("WebChat-Core".to_string());
    let client = Client::with_options(client_options)?;
    Ok(client.database(db_name))
}
