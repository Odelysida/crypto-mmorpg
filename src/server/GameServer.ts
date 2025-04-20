import { Server, Socket } from 'socket.io';
import { Player, Item, EquipmentSlot, ItemType, Stats } from '../shared/types.js';

interface GameState {
  players: Map<string, Player>;
  items: Map<string, Item>;
  worldMap: {
    width: number;
    height: number;
    collisionMap: boolean[][];
  };
}

export class GameServer {
  private io: Server;
  private state: GameState;
  private readonly TICK_RATE = 60;
  private readonly TILE_SIZE = 32;

  constructor(io: Server) {
    this.io = io;
    this.state = {
      players: new Map(),
      items: new Map(),
      worldMap: {
        width: 100,
        height: 100,
        collisionMap: Array(100).fill(Array(100).fill(false))
      }
    };

    this.initializeCollisionMap();
    this.startGameLoop();
    this.setupSocketHandlers();
  }

  private initializeCollisionMap(): void {
    // Add walls around the map edges
    for (let x = 0; x < this.state.worldMap.width; x++) {
      this.state.worldMap.collisionMap[0][x] = true;
      this.state.worldMap.collisionMap[this.state.worldMap.height - 1][x] = true;
    }
    for (let y = 0; y < this.state.worldMap.height; y++) {
      this.state.worldMap.collisionMap[y][0] = true;
      this.state.worldMap.collisionMap[y][this.state.worldMap.width - 1] = true;
    }
  }

  private startGameLoop(): void {
    setInterval(() => {
      this.update();
    }, 1000 / this.TICK_RATE);
  }

  private update(): void {
    // Update game state
    this.updatePlayers();
    this.broadcastGameState();
  }

  private updatePlayers(): void {
    this.state.players.forEach(player => {
      // Handle any continuous effects (regeneration, status effects, etc.)
      if (player.health < player.maxHealth) {
        player.health = Math.min(player.health + 1, player.maxHealth);
      }
      if (player.mana < player.maxMana) {
        player.mana = Math.min(player.mana + 0.5, player.maxMana);
      }
    });
  }

  private broadcastGameState(): void {
    const gameState = {
      players: Array.from(this.state.players.values()),
      items: Array.from(this.state.items.values())
    };
    this.io.emit('gameState', gameState);
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Player connected:', socket.id);

      // Handle player join
      socket.on('joinGame', (playerData: Partial<Player>) => {
        const player = this.createPlayer(socket.id, playerData);
        this.state.players.set(socket.id, player);
        socket.emit('playerJoined', player);
        this.broadcastGameState();
      });

      // Handle movement
      socket.on('movePlayer', (movement: { x: number; y: number }) => {
        const player = this.state.players.get(socket.id);
        if (!player) return;

        const newPos = {
          x: player.position.x + movement.x,
          y: player.position.y + movement.y
        };

        if (this.isValidMove(newPos)) {
          player.position = newPos;
          socket.emit('playerMoved', player);
          socket.broadcast.emit('otherPlayerMoved', player);
        }
      });

      // Handle combat
      socket.on('attack', (targetId: string) => {
        const attacker = this.state.players.get(socket.id);
        const target = this.state.players.get(targetId);
        
        if (attacker && target && this.isInRange(attacker, target)) {
          const damage = this.calculateDamage(attacker);
          target.health = Math.max(0, target.health - damage);
          
          this.io.emit('combatUpdate', {
            attackerId: socket.id,
            targetId,
            damage,
            targetHealth: target.health
          });

          if (target.health <= 0) {
            this.handlePlayerDeath(target);
          }
        }
      });

      // Handle inventory actions
      socket.on('useItem', (itemId: string) => {
        const player = this.state.players.get(socket.id);
        if (!player) return;

        const item = player.inventory.items.find(i => i?.id === itemId);
        if (item && item.itemType === ItemType.Consumable) {
          this.useItem(player, item);
          socket.emit('inventoryUpdated', player.inventory);
        }
      });

      socket.on('equipItem', ({ itemId, slot }: { itemId: string; slot: EquipmentSlot }) => {
        const player = this.state.players.get(socket.id);
        if (!player) return;

        if (this.equipItem(player, itemId, slot)) {
          socket.emit('equipmentUpdated', player.inventory.equipment);
          socket.emit('statsUpdated', this.getPlayerStats(player));
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        this.state.players.delete(socket.id);
        this.io.emit('playerLeft', socket.id);
      });
    });
  }

  private isValidMove(position: { x: number; y: number }): boolean {
    // Check map boundaries
    if (position.x < 0 || position.x >= this.state.worldMap.width ||
        position.y < 0 || position.y >= this.state.worldMap.height) {
      return false;
    }

    // Check collision map
    const tileX = Math.floor(position.x / this.TILE_SIZE);
    const tileY = Math.floor(position.y / this.TILE_SIZE);
    return !this.state.worldMap.collisionMap[tileY][tileX];
  }

  private isInRange(attacker: Player, target: Player): boolean {
    const dx = attacker.position.x - target.position.x;
    const dy = attacker.position.y - target.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= 2 * this.TILE_SIZE; // Melee range = 2 tiles
  }

  private calculateDamage(attacker: Player): number {
    // Basic damage calculation
    let damage = attacker.stats.strength;
    
    // Add weapon damage if equipped
    const weapon = attacker.inventory.equipment[EquipmentSlot.MainHand];
    if (weapon?.stats.damage) {
      damage += weapon.stats.damage;
    }

    // Add random variance (-10% to +10%)
    const variance = damage * 0.2;
    damage += Math.random() * variance - variance / 2;

    return Math.floor(damage);
  }

  private handlePlayerDeath(player: Player): void {
    // Reset player health and position
    player.health = player.maxHealth;
    player.position = this.getRandomSpawnPoint();

    // Drop some items
    const droppedItems = this.dropRandomItems(player);
    if (droppedItems.length > 0) {
      this.io.emit('itemsDropped', {
        position: player.position,
        items: droppedItems
      });
    }

    this.io.emit('playerDied', {
      playerId: player.id,
      newPosition: player.position
    });
  }

  private getRandomSpawnPoint(): { x: number; y: number } {
    // Find a random non-colliding position
    let x, y;
    do {
      x = Math.floor(Math.random() * (this.state.worldMap.width - 2) + 1) * this.TILE_SIZE;
      y = Math.floor(Math.random() * (this.state.worldMap.height - 2) + 1) * this.TILE_SIZE;
    } while (!this.isValidMove({ x, y }));

    return { x, y };
  }

  private dropRandomItems(player: Player): Item[] {
    const droppedItems: Item[] = [];
    player.inventory.items.forEach(item => {
      if (item && Math.random() < 0.3) { // 30% chance to drop each item
        droppedItems.push(item);
      }
    });
    return droppedItems;
  }

  private createPlayer(id: string, data: Partial<Player>): Player {
    return {
      id,
      name: data.name || `Player ${id}`,
      position: this.getRandomSpawnPoint(),
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      exp: 0,
      maxExp: 100,
      level: 1,
      stats: {
        strength: 10,
        dexterity: 10,
        intelligence: 10
      },
      inventory: {
        items: Array(30).fill(null),
        equipment: {}
      },
      wallet: {
        address: data.wallet?.address || `0x${id.slice(0, 40)}`,
        balance: data.wallet?.balance || 0
      }
    };
  }

  private getPlayerStats(player: Player): Stats {
    // Calculate total stats including equipment bonuses
    const stats: Stats = {
      strength: player.stats.strength,
      dexterity: player.stats.dexterity,
      intelligence: player.stats.intelligence,
      damage: 0,
      armor: 0,
      healthBonus: 0,
      manaBonus: 0
    };

    Object.values(player.inventory.equipment).forEach(item => {
      if (!item?.stats) return;
      
      stats.strength += item.stats.strength || 0;
      stats.dexterity += item.stats.dexterity || 0;
      stats.intelligence += item.stats.intelligence || 0;
      stats.damage = (stats.damage || 0) + (item.stats.damage || 0);
      stats.armor = (stats.armor || 0) + (item.stats.armor || 0);
      stats.healthBonus = (stats.healthBonus || 0) + (item.stats.healthBonus || 0);
      stats.manaBonus = (stats.manaBonus || 0) + (item.stats.manaBonus || 0);
    });

    return stats;
  }

  private useItem(player: Player, item: Item): void {
    // Handle consumable effects
    if (item.stats.healthBonus) {
      player.health = Math.min(player.health + item.stats.healthBonus, player.maxHealth);
    }
    if (item.stats.manaBonus) {
      player.mana = Math.min(player.mana + item.stats.manaBonus, player.maxMana);
    }

    // Remove the item from inventory
    const itemIndex = player.inventory.items.findIndex(i => i?.id === item.id);
    if (itemIndex !== -1) {
      if (item.stackable && item.stackSize > 1) {
        item.stackSize--;
      } else {
        player.inventory.items[itemIndex] = null;
      }
    }
  }

  private equipItem(player: Player, itemId: string, slot: EquipmentSlot): boolean {
    const itemIndex = player.inventory.items.findIndex(i => i?.id === itemId);
    if (itemIndex === -1) return false;

    const item = player.inventory.items[itemIndex]!;
    
    // Validate equipment slot
    if (!this.canEquipItemInSlot(item, slot)) return false;

    // Unequip current item if any
    const currentEquipped = player.inventory.equipment[slot];
    if (currentEquipped) {
      const emptySlot = player.inventory.items.findIndex(i => i === null);
      if (emptySlot === -1) return false;
      player.inventory.items[emptySlot] = currentEquipped;
    }

    // Equip new item
    player.inventory.equipment[slot] = item;
    player.inventory.items[itemIndex] = null;

    return true;
  }

  private canEquipItemInSlot(item: Item, slot: EquipmentSlot): boolean {
    switch (item.itemType) {
      case ItemType.Weapon:
        return slot === EquipmentSlot.MainHand || slot === EquipmentSlot.OffHand;
      case ItemType.Armor:
        return [
          EquipmentSlot.Head,
          EquipmentSlot.Chest,
          EquipmentSlot.Legs,
          EquipmentSlot.Feet,
          EquipmentSlot.Hands
        ].includes(slot);
      default:
        return false;
    }
  }
} 