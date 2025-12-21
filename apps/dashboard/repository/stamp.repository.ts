import { injectable } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { container } from 'tsyringe';

@injectable()
export class StampRepository {
  private supabase: HibiscusSupabaseClient;

  constructor() {
    this.supabase = container.resolve(HibiscusSupabaseClient);
  }

  async getStampTypes() {
    return this.supabase
      .getClient()
      .from('stamp_types')
      .select('*')
      .order('id', { ascending: true });
  }

  async getUserStamps(userId: string) {
    return this.supabase
      .getClient()
      .from('user_stamps')
      .select(
        `
        id,
        slot_position,
        is_system_gift,
        message,
        created_at,
        stamp_type:stamp_types(id, name, emoji, description),
        giver:user_profiles!giver_id(user_id, first_name, last_name)
      `
      )
      .eq('recipient_id', userId)
      .order('slot_position', { ascending: true });
  }

  async giveStamp(
    recipientId: string,
    stampTypeId: number,
    slotPosition: number,
    giverId: string | null,
    isSystemGift: boolean = false,
    message: string | null = null
  ) {
    this.supabase.setOptions({ useServiceKey: isSystemGift });

    return this.supabase.getClient().from('user_stamps').insert({
      recipient_id: recipientId,
      stamp_type_id: stampTypeId,
      slot_position: slotPosition,
      giver_id: giverId,
      is_system_gift: isSystemGift,
      message: message,
    });
  }

  async deleteStamp(stampId: string, userId: string) {
    return this.supabase
      .getClient()
      .from('user_stamps')
      .delete()
      .eq('id', stampId)
      .eq('recipient_id', userId);
  }

  async getOccupiedSlots(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('user_stamps')
      .select('slot_position')
      .eq('recipient_id', userId);

    if (error) return { slots: [], error };
    return { slots: data.map((s) => s.slot_position), error: null };
  }

  async findFirstAvailableSlot(userId: string): Promise<number | null> {
    const { slots, error } = await this.getOccupiedSlots(userId);
    if (error) return null;

    for (let i = 0; i < 9; i++) {
      if (!slots.includes(i)) return i;
    }
    return null; // All slots full
  }
}
