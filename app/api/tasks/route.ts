import { env } from "cloudflare:workers";
import { headers } from "next/headers";

type TaskInput = {
  id?: string; title?: string; dueDate?: string; dueTime?: string | null;
  duration?: number; priority?: string; category?: string; energy?: string;
  repeat?: string; guide?: string; reminder?: boolean; done?: boolean;
};

async function userId() {
  const h = await headers();
  return h.get("oai-authenticated-user-id");
}

function unavailable(error: unknown) {
  console.error("FJP Flow database error", error);
  return Response.json({ error: "A sincronização está temporariamente indisponível. Tente novamente." }, { status: 503 });
}

export async function GET() {
  const uid = await userId();
  if (!uid) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const result = await env.DB.prepare(`SELECT id, title, due_date AS dueDate, due_time AS dueTime,
      duration, priority, category, energy, repeat, guide, reminder, done,
      completed_at AS completedAt, created_at AS createdAt, updated_at AS updatedAt
      FROM tasks WHERE user_id = ? ORDER BY done ASC, due_date ASC, COALESCE(due_time, '23:59') ASC`)
      .bind(uid).all();
    return Response.json({ tasks: result.results });
  } catch (error) { return unavailable(error); }
}

export async function POST(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const p = await request.json() as TaskInput;
    const title = p.title?.trim();
    if (!title || !p.dueDate) return Response.json({ error: "Informe tarefa e data" }, { status: 400 });
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO tasks
      (id,user_id,title,due_date,due_time,duration,priority,category,energy,repeat,guide,reminder,done,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id,uid,title,p.dueDate,p.dueTime||null,p.duration||30,p.priority||"normal",p.category||"Pessoal",p.energy||"medium",p.repeat||"none",p.guide||"",p.reminder===false?0:1,0,now,now).run();
    return Response.json({ id }, { status: 201 });
  } catch (error) { return unavailable(error); }
}

export async function PATCH(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const p = await request.json() as TaskInput;
    if (!p.id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    const current = await env.DB.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?").bind(p.id,uid).first<Record<string, unknown>>();
    if (!current) return Response.json({ error: "Tarefa não encontrada" }, { status: 404 });
    const done = p.done ?? Boolean(current.done); const now = new Date().toISOString();
    await env.DB.prepare(`UPDATE tasks SET title=?,due_date=?,due_time=?,duration=?,priority=?,category=?,energy=?,repeat=?,guide=?,reminder=?,done=?,completed_at=?,updated_at=? WHERE id=? AND user_id=?`)
      .bind(p.title??current.title,p.dueDate??current.due_date,p.dueTime===undefined?current.due_time:p.dueTime,p.duration??current.duration,p.priority??current.priority,p.category??current.category,p.energy??current.energy,p.repeat??current.repeat,p.guide??current.guide,p.reminder===undefined?current.reminder:(p.reminder?1:0),done?1:0,done?(current.completed_at||now):null,now,p.id,uid).run();
    if (done && current.repeat && current.repeat !== "none") {
      const d = new Date(String(current.due_date)+"T12:00:00");
      if (current.repeat === "daily") d.setDate(d.getDate()+1);
      if (current.repeat === "weekly") d.setDate(d.getDate()+7);
      if (current.repeat === "monthly") d.setMonth(d.getMonth()+1);
      const next = d.toISOString().slice(0,10);
      const existing = await env.DB.prepare("SELECT id FROM tasks WHERE user_id=? AND title=? AND due_date=? AND done=0").bind(uid,current.title,next).first();
      if (!existing) await env.DB.prepare(`INSERT INTO tasks (id,user_id,title,due_date,due_time,duration,priority,category,energy,repeat,guide,reminder,done,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(crypto.randomUUID(),uid,current.title,next,current.due_time,current.duration,current.priority,current.category,current.energy,current.repeat,current.guide,current.reminder,0,now,now).run();
    }
    return Response.json({ ok: true });
  } catch (error) { return unavailable(error); }
}

export async function DELETE(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    await env.DB.prepare("DELETE FROM tasks WHERE id=? AND user_id=?").bind(id,uid).run();
    return Response.json({ ok: true });
  } catch (error) { return unavailable(error); }
}
