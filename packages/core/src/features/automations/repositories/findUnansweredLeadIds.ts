import { db, sql } from "@vetra/database";

// Leads still in the funnel that Vetra wrote to, whose last text went at least `days` ago, with no message
// from them since, and with no follow-up still waiting: the conversation ran out.
export async function findUnansweredLeadIds(days: number, now: Date): Promise<string[]> {
  const result = await db.execute<{ id: string }>(sql`
    select l.id
    from leads l
    join stages s on s.id = l.stage_id and s.role in ('entry', 'middle')
    cross join lateral (
      select max(c.sent_at) as sent_at
      from completed_actions c
      where c.lead_id = l.id and c.sent_at is not null
    ) last_text
    where last_text.sent_at is not null
      and last_text.sent_at <= ${now.toISOString()}::timestamptz - make_interval(days => ${days})
      and not exists (
        select 1 from next_actions n where n.lead_id = l.id and n.type = 'follow_up'
      )
      and not exists (
        select 1
        from whatsapp_messages m
        join whatsapp_conversations wc on wc.id = m.conversation_id
        where wc.phone_key = l.phone_key
          and m.direction = 'inbound'
          and m.sent_at > last_text.sent_at
      )
  `);

  return result.rows.map((row: { id: string }) => row.id);
}
