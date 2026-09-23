import { notFound } from 'next/navigation';
import { controlPath, readControlResource } from '../control-client';
import { sections } from '../sections';
import { StateView } from '../state-view';

function redact(value: unknown, key = ''): unknown {
  if (/secret|token|password|authorization|credential/i.test(key)) {
    return '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => [
        nestedKey,
        redact(nestedValue, nestedKey),
      ]),
    );
  }

  return value;
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const selected = sections.find((candidate) => candidate.slug === section);

  if (!selected) {
    notFound();
  }

  const destructive = section === 'changes' || section === 'infrastructure';
  const response = await readControlResource(controlPath(section));
  const safeData = redact(response.data);

  return (
    <>
      <header className="pageHeader">
        <p className="eyebrow">PRODUCTION OPERATIONS · ap-south-1</p>
        <h2>{selected.title}</h2>
        <p>{selected.responsibility}</p>
      </header>

      <section className="card controlNotice">
        <div>
          <strong>Desired-state control plane</strong>
          <p>
            Production changes are validated, dependency-checked, attributable,
            approval-gated, and reversible. Disabling a capability never means
            deleting its infrastructure.
          </p>
        </div>

        <span className={response.ok ? 'status healthy' : 'status unavailable'}>
          {response.ok ? 'Control API available' : `Unavailable · ${response.status}`}
        </span>
      </section>

      {destructive && (
        <section className="warning">
          Infrastructure destruction is not exposed as a direct UI action. It
          requires the approved IaC orchestration path after stabilization,
          retention, and rollback checks.
        </section>
      )}

      <section className="card" aria-live="polite">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">LIVE READ MODEL</p>
            <h3>{selected.title} state</h3>
          </div>
          {response.requestId && <code>Request {response.requestId}</code>}
        </div>

        <StateView data={safeData} />
      </section>
    </>
  );
}
