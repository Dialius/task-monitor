/**
 * Permission Service
 * Requirements: 1.1, 1.2, 1.3, 1.4, 18.1
 */

import Admin from '../models/Admin';
import Member from '../models/Member';
import { getLogger } from '../utils/Logger';
import { GuildMember } from 'discord.js';

const logger = getLogger();

export type UserRole = 'ketua' | 'wakil' | 'koordinator' | 'member';
export type Platform = 'discord' | 'whatsapp';

interface PermissionMatrix {
  [command: string]: UserRole[];
}

interface CachedUser {
  user_identifier: string;
  platform: Platform;
  role: UserRole;
  nama: string;
}

/**
 * Permission Service for role-based access control
 */
export class PermissionService {
  private userCache: Map<string, CachedUser> = new Map();
  private permissionMatrix: PermissionMatrix;
  private adminRoleIds: string[] = [];
  private leaderRoleIds: string[] = [];

  constructor() {
    this.permissionMatrix = this.buildPermissionMatrix();
    this.loadRoleIds();
  }

  /**
   * Load Discord role IDs from environment
   */
  private loadRoleIds(): void {
    // Load admin role IDs
    const adminRoles = process.env.DISCORD_ADMIN_ROLE_IDS || '';
    this.adminRoleIds = adminRoles.split(',').map(id => id.trim()).filter(id => id.length > 0);

    // Load leader role IDs
    const leaderRoles = process.env.DISCORD_LEADER_ROLE_IDS || '';
    this.leaderRoleIds = leaderRoles.split(',').map(id => id.trim()).filter(id => id.length > 0);

    logger.info('Discord role IDs loaded', {
      adminRoles: this.adminRoleIds.length,
      leaderRoles: this.leaderRoleIds.length
    });
  }

  /**
   * Build permission matrix for all commands
   * Requirement: 1.3, 1.4
   */
  private buildPermissionMatrix(): PermissionMatrix {
    return {
      // Admin-only commands (all admin roles)
      'add_tugas': ['ketua', 'wakil', 'koordinator'],
      'add_tugas_cepat': ['ketua', 'wakil', 'koordinator'],
      'edit_tugas': ['ketua', 'wakil', 'koordinator'],
      'hapus_tugas': ['ketua', 'wakil', 'koordinator'],
      'tandai_selesai': ['ketua', 'wakil', 'koordinator'],
      
      'add_jadwal': ['ketua', 'wakil', 'koordinator'],
      'edit_jadwal': ['ketua', 'wakil', 'koordinator'],
      'hapus_jadwal': ['ketua', 'wakil', 'koordinator'],
      'ganti_jadwal': ['ketua', 'wakil', 'koordinator'],
      
      'set_piket': ['ketua', 'wakil', 'koordinator'],
      'edit_piket': ['ketua', 'wakil', 'koordinator'],
      
      'add_pengumuman': ['ketua', 'wakil', 'koordinator'],
      'hapus_pengumuman': ['ketua', 'wakil', 'koordinator'],
      
      'test_reminder': ['ketua', 'wakil', 'koordinator'],
      
      // Restricted commands (Ketua and Wakil only, not Koordinator)
      'broadcast': ['ketua', 'wakil'],
      'broadcast_urgent': ['ketua', 'wakil'],
      'connect_notion': ['ketua', 'wakil'],
      'sync_notion': ['ketua', 'wakil'],
      'add_admin': ['ketua', 'wakil'],
      'remove_admin': ['ketua', 'wakil'],
      'add_member': ['ketua', 'wakil'],
      'remove_member': ['ketua', 'wakil'],
      
      // Member commands (all users including admins)
      'tugas': ['ketua', 'wakil', 'koordinator', 'member'],
      'tugas_hari_ini': ['ketua', 'wakil', 'koordinator', 'member'],
      'tugas_minggu_ini': ['ketua', 'wakil', 'koordinator', 'member'],
      'jadwal': ['ketua', 'wakil', 'koordinator', 'member'],
      'jadwal_hari_ini': ['ketua', 'wakil', 'koordinator', 'member'],
      'jadwal_besok': ['ketua', 'wakil', 'koordinator', 'member'],
      'jadwal_minggu_ini': ['ketua', 'wakil', 'koordinator', 'member'],
      'piket': ['ketua', 'wakil', 'koordinator', 'member'],
      'piket_minggu_ini': ['ketua', 'wakil', 'koordinator', 'member'],
      'help': ['ketua', 'wakil', 'koordinator', 'member'],
      'bantuan': ['ketua', 'wakil', 'koordinator', 'member'],
      'status': ['ketua', 'wakil', 'koordinator', 'member']
    };
  }

  /**
   * Check if Discord member has admin or leader role
   */
  checkDiscordRoles(member: GuildMember): UserRole {
    // Check leader roles first (higher priority)
    for (const roleId of this.leaderRoleIds) {
      if (member.roles.cache.has(roleId)) {
        return 'ketua'; // Leader role
      }
    }

    // Check admin roles
    for (const roleId of this.adminRoleIds) {
      if (member.roles.cache.has(roleId)) {
        return 'koordinator'; // Admin role
      }
    }

    // Default to member
    return 'member';
  }

  /**
   * Load all users into memory cache
   * Requirement: 1.1
   */
  async loadUsers(): Promise<void> {
    try {
      // Load admins
      const admins = await Admin.find({});
      admins.forEach(admin => {
        const key = this.getCacheKey(admin.user_identifier, admin.platform);
        this.userCache.set(key, {
          user_identifier: admin.user_identifier,
          platform: admin.platform,
          role: admin.role,
          nama: admin.nama
        });
      });

      // Load members
      const members = await Member.find({ is_active: true });
      members.forEach(member => {
        const key = this.getCacheKey(member.user_identifier, member.platform);
        this.userCache.set(key, {
          user_identifier: member.user_identifier,
          platform: member.platform,
          role: 'member',
          nama: member.nama
        });
      });

      logger.info('Users loaded into cache', {
        adminCount: admins.length,
        memberCount: members.length
      });
    } catch (error) {
      logger.error('Failed to load users', error as Error);
      throw error;
    }
  }

  /**
   * Get cache key for user
   */
  private getCacheKey(userIdentifier: string, platform: Platform): string {
    return `${platform}:${userIdentifier}`;
  }

  /**
   * Check if user has admin role
   * Requirement: 1.2
   * 
   * For WhatsApp channels/groups: All admins are allowed
   * For Discord: Check database
   */
  async isAdmin(userIdentifier: string, platform: Platform): Promise<boolean> {
    const key = this.getCacheKey(userIdentifier, platform);
    const user = this.userCache.get(key);

    if (!user) {
      // User not in cache, check database
      const admin = await Admin.findOne({ user_identifier: userIdentifier, platform });
      if (admin) {
        // Add to cache
        this.userCache.set(key, {
          user_identifier: admin.user_identifier,
          platform: admin.platform,
          role: admin.role,
          nama: admin.nama
        });
        return true;
      }
      
      // For WhatsApp: Allow all users (assume they are admins if in channel)
      // This is because WhatsApp channels don't have easy admin detection
      if (platform === 'whatsapp') {
        logger.info('WhatsApp user not in database, allowing as admin', {
          userIdentifier
        });
        return true;
      }
      
      return false;
    }

    return user.role !== 'member';
  }

  /**
   * Get user role
   * Requirement: 1.2
   * 
   * For Discord: Check roles first, then database
   * For WhatsApp: Default to 'ketua' if not in database
   */
  async getUserRole(userIdentifier: string, platform: Platform, discordMember?: GuildMember): Promise<UserRole | null> {
    const key = this.getCacheKey(userIdentifier, platform);
    const user = this.userCache.get(key);

    // For Discord, check roles first if member object provided
    if (platform === 'discord' && discordMember) {
      const roleFromDiscord = this.checkDiscordRoles(discordMember);
      
      // Cache the role
      this.userCache.set(key, {
        user_identifier: userIdentifier,
        platform: platform,
        role: roleFromDiscord,
        nama: discordMember.user.username
      });
      
      return roleFromDiscord;
    }

    if (!user) {
      // Check database
      const admin = await Admin.findOne({ user_identifier: userIdentifier, platform });
      if (admin) {
        this.userCache.set(key, {
          user_identifier: admin.user_identifier,
          platform: admin.platform,
          role: admin.role,
          nama: admin.nama
        });
        return admin.role;
      }

      const member = await Member.findOne({ user_identifier: userIdentifier, platform, is_active: true });
      if (member) {
        this.userCache.set(key, {
          user_identifier: member.user_identifier,
          platform: member.platform,
          role: 'member',
          nama: member.nama
        });
        return 'member';
      }

      // For WhatsApp: Default to 'ketua' (full access)
      // This allows all channel members to use all commands
      if (platform === 'whatsapp') {
        logger.info('WhatsApp user not in database, defaulting to ketua role', {
          userIdentifier
        });
        return 'ketua';
      }

      // For Discord: Default to 'member' (all users can use member commands)
      if (platform === 'discord') {
        logger.info('Discord user not in database, defaulting to member role', {
          userIdentifier
        });
        return 'member';
      }

      return null;
    }

    return user.role;
  }

  /**
   * Check if user can execute specific command
   * Requirement: 1.3, 1.4
   */
  async canExecuteCommand(
    userIdentifier: string,
    platform: Platform,
    command: string,
    discordMember?: GuildMember
  ): Promise<boolean> {
    const role = await this.getUserRole(userIdentifier, platform, discordMember);
    
    if (!role) {
      logger.warn('Unknown user attempted command', {
        userIdentifier,
        platform,
        command
      });
      return false;
    }

    // Get allowed roles for this command
    const allowedRoles = this.permissionMatrix[command];
    
    if (!allowedRoles) {
      // Command not in matrix, allow all users
      return true;
    }

    const canExecute = allowedRoles.includes(role);

    if (!canExecute) {
      logger.warn('Permission denied', {
        userIdentifier,
        platform,
        role,
        command,
        allowedRoles
      });
    }

    return canExecute;
  }

  /**
   * Get user info from cache
   */
  getUserInfo(userIdentifier: string, platform: Platform): CachedUser | null {
    const key = this.getCacheKey(userIdentifier, platform);
    return this.userCache.get(key) || null;
  }

  /**
   * Refresh user cache (call after adding/removing users)
   */
  async refreshCache(): Promise<void> {
    this.userCache.clear();
    await this.loadUsers();
  }

  /**
   * Get all commands available for a role
   */
  getCommandsForRole(role: UserRole): string[] {
    const commands: string[] = [];
    
    for (const [command, allowedRoles] of Object.entries(this.permissionMatrix)) {
      if (allowedRoles.includes(role)) {
        commands.push(command);
      }
    }

    return commands;
  }
}
