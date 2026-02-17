use mongodb::{Client, Database};

pub async fn get_database() -> mongodb::error::Result<Database> {
    let mongo_uri = std::env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client = Client::with_uri_str(&mongo_uri).await?;
    Ok(client.database("webchat"))
}
