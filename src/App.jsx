import { useMemo, useState } from "react";
import { atribuirSalas } from "./utils/intervalPartition";
import "./App.css";

const DEMO_EVENTS = [
  { title: "Aula de Dados", start: "09:00", end: "10:30", attendees: 32 },
  { title: "UX Sprint", start: "09:15", end: "11:00", attendees: 18 },
  { title: "Front-end Lab", start: "09:45", end: "10:15", attendees: 22 },
  { title: "Design Critique", start: "10:30", end: "12:00", attendees: 16 },
  { title: "AI Seminar", start: "10:45", end: "11:30", attendees: 40 },
  { title: "Reuniao Produto", start: "11:00", end: "12:30", attendees: 10 },
  { title: "Marketing Talk", start: "12:00", end: "13:00", attendees: 28 },
  {
    title: "JavaScript Deep Dive",
    start: "13:00",
    end: "14:30",
    attendees: 35,
  },
  { title: "Sprint Planning", start: "13:15", end: "14:00", attendees: 12 },
  { title: "Startup Pitch", start: "14:30", end: "15:30", attendees: 50 },
];

let idSeed = 0;
const createId = () =>
  `ev-${idSeed++}-${Math.random().toString(16).slice(2, 6)}`;

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(":")) return null;
  const [hours, minutes] = timeStr.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const formatMinutes = (totalMinutes) => {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const buildDemoEvents = () =>
  DEMO_EVENTS.map((event) => {
    const start = parseTimeToMinutes(event.start);
    const end = parseTimeToMinutes(event.end);
    if (start === null || end === null || end <= start) return null;
    return {
      id: createId(),
      title: event.title,
      start,
      end,
      attendees: event.attendees ?? 0,
    };
  }).filter(Boolean);

function App() {
  const [events, setEvents] = useState(() => buildDemoEvents());
  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    attendees: "24",
  });
  const [error, setError] = useState("");

  const schedule = useMemo(() => atribuirSalas(events), [events]);
  const stats = useMemo(() => {
    if (events.length === 0) {
      return { totalHours: "0.0", daySpan: 0, utilization: 0, attendees: 0 };
    }
    const totalMinutes = events.reduce(
      (sum, event) => sum + (event.end - event.start),
      0,
    );
    const earliest = Math.min(...events.map((event) => event.start));
    const latest = Math.max(...events.map((event) => event.end));
    const daySpan = Math.max(1, latest - earliest);
    const utilization = schedule.totalSalas
      ? Math.round((totalMinutes / (schedule.totalSalas * daySpan)) * 100)
      : 0;
    const attendees = events.reduce(
      (sum, event) => sum + (event.attendees || 0),
      0,
    );
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      daySpan,
      utilization,
      attendees,
    };
  }, [events, schedule.totalSalas]);

  const windowHours = stats.daySpan ? (stats.daySpan / 60).toFixed(1) : "0.0";

  const handleFieldChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleAddEvent = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const start = parseTimeToMinutes(form.start);
    const end = parseTimeToMinutes(form.end);
    const attendees = Number.parseInt(form.attendees, 10) || 0;

    if (!title) {
      setError("Informe um titulo.");
      return;
    }

    if (start === null || end === null) {
      setError("Preencha inicio e fim com horario valido.");
      return;
    }

    if (end <= start) {
      setError("Horario final deve ser depois do inicio.");
      return;
    }

    setEvents((prev) => [
      ...prev,
      { id: createId(), title, start, end, attendees },
    ]);
    setForm((prev) => ({ ...prev, title: "", start: "", end: "" }));
    setError("");
  };

  const handleRemove = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const handleLoadDemo = () => {
    setEvents(buildDemoEvents());
  };

  const handleClear = () => {
    setEvents([]);
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-copy">
          <h1 className="tittle">Gestor de Salas para Coworking</h1>
          <p className="lead">
            Organize eventos simultaneos e calcule o numero minimo de salas
            usando uma estrategia ambiciosa (greedy) com fila de prioridade.
          </p>
          <div className="hero-actions">
            <button
              className="btn ghost"
              type="button"
              onClick={handleLoadDemo}
            >
              Carregar demo
            </button>
            <button className="btn ghost" type="button" onClick={handleClear}>
              Limpar agenda
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-row">
            <div className="stat-card">
              <p className="stat-label">Eventos</p>
              <strong>{events.length}</strong>
            </div>
            <div className="stat-card">
              <p className="stat-label">Salas minimas</p>
              <strong>{schedule.totalSalas}</strong>
            </div>
            <div className="stat-card">
              <p className="stat-label">Horas reservadas</p>
              <strong>{stats.totalHours}h</strong>
            </div>
            <div className="stat-card">
              <p className="stat-label">Uso estimado</p>
              <strong>{stats.utilization}%</strong>
            </div>
          </div>
          <div className="summary-panel">
            <div>
              <span className="panel-label">Janela do dia</span>
              <strong>{windowHours}h</strong>
            </div>
            <div>
              <span className="panel-label">Pessoas totais</span>
              <strong>{stats.attendees}</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="card form-card">
          <div className="card-header">
            <h2>Novo evento</h2>
            <span className="badge">Manual</span>
          </div>
          <form className="event-form" onSubmit={handleAddEvent}>
            <label className="field">
              <span>Titulo</span>
              <input
                type="text"
                placeholder="Ex: Aula de Dados"
                value={form.title}
                onChange={handleFieldChange("title")}
                maxLength={48}
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Inicio</span>
                <input
                  type="time"
                  value={form.start}
                  onChange={handleFieldChange("start")}
                  required
                />
              </label>
              <label className="field">
                <span>Fim</span>
                <input
                  type="time"
                  value={form.end}
                  onChange={handleFieldChange("end")}
                  required
                />
              </label>
              <label className="field">
                <span>Pessoas</span>
                <input
                  type="number"
                  min="1"
                  value={form.attendees}
                  onChange={handleFieldChange("attendees")}
                />
              </label>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="btn primary" type="submit">
              Adicionar evento
            </button>
          </form>
        </section>
        <div className="stack">
          <section className="card list-card">
            <div className="card-header">
              <h2>Eventos ordenados</h2>
              <span className="badge">Greedy</span>
            </div>
            {schedule.agendados.length === 0 ? (
              <p className="empty">Nenhum evento na agenda.</p>
            ) : (
              <ul className="event-list">
                {schedule.agendados.map((event) => (
                  <li className="event-item" key={event.id}>
                    <div>
                      <p className="event-title">{event.title}</p>
                      <p className="event-time">
                        {formatMinutes(event.start)} -{" "}
                        {formatMinutes(event.end)}
                        <span className="event-meta">
                          {event.attendees} pessoas
                        </span>
                      </p>
                    </div>
                    <div className="event-actions">
                      <span className="tag">Sala {event.salaId + 1}</span>
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => handleRemove(event.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card rooms-card">
            <div className="card-header">
              <h2>Distribuicao por salas</h2>
              <span className="badge accent">{schedule.totalSalas} salas</span>
            </div>
            {schedule.salas.length === 0 ? (
              <p className="empty">Inclua eventos para gerar salas.</p>
            ) : (
              <div className="rooms">
                {schedule.salas.map((room) => (
                  <article className="room-card" key={room.id}>
                    <header className="room-head">
                      <div>
                        <p className="room-title">Sala {room.id}</p>
                        <p className="room-meta">
                          {room.events.length} eventos
                        </p>
                      </div>
                    </header>
                    <div className="room-events">
                      {room.events.map((event) => (
                        <div className="room-event" key={event.id}>
                          <span className="room-event-title">
                            {event.title}
                          </span>
                          <span className="room-event-time">
                            {formatMinutes(event.start)} -{" "}
                            {formatMinutes(event.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
