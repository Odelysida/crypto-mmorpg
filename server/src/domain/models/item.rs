use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemAttribute {
    pub name: String,
    pub value: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ItemRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ItemType {
    Weapon,
    Armor,
    Consumable,
    Quest,
    Currency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: Uuid,
    pub name: String,
    pub item_type: ItemType,
    pub rarity: ItemRarity,
    pub value: i32,
    pub attributes: Vec<ItemAttribute>,
}

impl Item {
    pub fn new(
        name: String,
        item_type: ItemType,
        rarity: ItemRarity,
        value: i32,
        attributes: Vec<ItemAttribute>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            item_type,
            rarity,
            value,
            attributes,
        }
    }

    pub fn get_attribute_value(&self, name: &str) -> Option<i32> {
        self.attributes
            .iter()
            .find(|attr| attr.name == name)
            .map(|attr| attr.value)
    }
} 