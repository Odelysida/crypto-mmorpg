use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

use super::item::{Item, ItemType};

const MAX_INVENTORY_SLOTS: usize = 30;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EquipmentSlot {
    MainHand,
    OffHand,
    Head,
    Chest,
    Legs,
    Feet,
    Hands,
    Neck,
    Ring1,
    Ring2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Equipment {
    slots: HashMap<EquipmentSlot, Item>,
}

impl Equipment {
    pub fn new() -> Self {
        Self {
            slots: HashMap::new(),
        }
    }

    pub fn equip(&mut self, slot: EquipmentSlot, item: Item) -> Option<Item> {
        if !item.is_equippable() {
            return None;
        }
        self.slots.insert(slot, item)
    }

    pub fn unequip(&mut self, slot: EquipmentSlot) -> Option<Item> {
        self.slots.remove(&slot)
    }

    pub fn get_equipped(&self, slot: EquipmentSlot) -> Option<&Item> {
        self.slots.get(&slot)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventorySlot {
    pub item: Item,
    pub position: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Inventory {
    slots: Vec<Option<InventorySlot>>,
    equipment: Equipment,
}

impl Inventory {
    pub fn new() -> Self {
        Self {
            slots: vec![None; MAX_INVENTORY_SLOTS],
            equipment: Equipment::new(),
        }
    }

    pub fn add_item(&mut self, item: Item) -> Result<(), String> {
        // Try to stack with existing items first
        if item.stackable {
            for slot in self.slots.iter_mut().flatten() {
                if slot.item.id == item.id && slot.item.stackable {
                    slot.item.add_to_stack(item.stack_size);
                    return Ok(());
                }
            }
        }

        // Find first empty slot
        let empty_slot = self.slots
            .iter()
            .position(|slot| slot.is_none())
            .ok_or_else(|| "Inventory is full".to_string())?;

        self.slots[empty_slot] = Some(InventorySlot {
            item,
            position: empty_slot,
        });
        Ok(())
    }

    pub fn remove_item(&mut self, position: usize, amount: u32) -> Option<Item> {
        let slot = self.slots.get_mut(position)?;
        
        if let Some(inv_slot) = slot {
            if inv_slot.item.stackable {
                if inv_slot.item.remove_from_stack(amount) {
                    if inv_slot.item.stack_size == 0 {
                        return self.slots[position].take().map(|s| s.item);
                    }
                    return None;
                }
            } else if amount == 1 {
                return self.slots[position].take().map(|s| s.item);
            }
        }
        None
    }

    pub fn get_item(&self, position: usize) -> Option<&Item> {
        self.slots.get(position)?.as_ref().map(|slot| &slot.item)
    }

    pub fn equip_item(&mut self, position: usize, slot: EquipmentSlot) -> Result<(), String> {
        let item = self.remove_item(position, 1)
            .ok_or_else(|| "No item in that position".to_string())?;

        if !item.is_equippable() {
            self.add_item(item)?;
            return Err("Item cannot be equipped".to_string());
        }

        if let Some(old_item) = self.equipment.equip(slot, item) {
            self.add_item(old_item)?;
        }
        Ok(())
    }

    pub fn unequip_item(&mut self, slot: EquipmentSlot) -> Result<(), String> {
        let item = self.equipment.unequip(slot)
            .ok_or_else(|| "No item equipped in that slot".to_string())?;
        
        self.add_item(item)
    }

    pub fn get_equipment(&self) -> &Equipment {
        &self.equipment
    }
} 