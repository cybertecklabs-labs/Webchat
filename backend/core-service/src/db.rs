use mongodb::{bson::doc, options::IndexOptions, Client, Database, IndexModel};

pub async fn get_database() -> mongodb::error::Result<Database> {
    let mongo_uri = std::env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client = Client::with_uri_str(&mongo_uri).await?;
    let db = client.database("webchat");
    
    // Create indexes for performance
    create_indexes(&db).await?;
    
    Ok(db)
}

async fn create_indexes(db: &Database) -> mongodb::error::Result<()> {
    // Users collection indexes
    let users = db.collection::<mongodb::bson::Document>("users");
    users.create_index(
        IndexModel::builder()
            .keys(doc! { "email": 1 })
            .options(IndexOptions::builder().unique(true).build())
            .build()
    ).await?;
    
    // Servers collection indexes
    let servers = db.collection::<mongodb::bson::Document>("servers");
    servers.create_index(
        IndexModel::builder()
            .keys(doc! { "owner_id": 1 })
            .build()
    ).await?;
    servers.create_index(
        IndexModel::builder()
            .keys(doc! { "invite_code": 1 })
            .options(IndexOptions::builder().unique(true).build())
            .build()
    ).await?;
    
    // Channels collection indexes
    let channels = db.collection::<mongodb::bson::Document>("channels");
    channels.create_index(
        IndexModel::builder()
            .keys(doc! { "server_id": 1 })
            .build()
    ).await?;
    
    // Messages collection indexes
    let messages = db.collection::<mongodb::bson::Document>("messages");
    messages.create_index(
        IndexModel::builder()
            .keys(doc! { "channel_id": 1, "created_at": -1 })
            .build()
    ).await?;
    messages.create_index(
        IndexModel::builder()
            .keys(doc! { "user_id": 1 })
            .build()
    ).await?;
    
    println!("✅ Database indexes created successfully");
    
    Ok(())
}
