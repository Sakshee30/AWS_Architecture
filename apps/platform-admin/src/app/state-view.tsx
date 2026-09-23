interface MetricCard {
  label: string;
  value: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function humanize(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString('en-US')
      : value.toLocaleString('en-US', { maximumFractionDigits: 3 });
  }
  return String(value);
}

function metricCards(data: unknown): MetricCard[] {
  if (!isRecord(data)) return [];

  const cards: MetricCard[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (
      value === null ||
      ['string', 'number', 'boolean'].includes(typeof value)
    ) {
      cards.push({ label: humanize(key), value: formatValue(value) });
      continue;
    }

    if (!isRecord(value)) continue;

    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      if (
        nestedValue === null ||
        ['string', 'number', 'boolean'].includes(typeof nestedValue)
      ) {
        cards.push({
          label: `${humanize(key)} · ${humanize(nestedKey)}`,
          value: formatValue(nestedValue),
        });
      }
    }
  }

  return cards.slice(0, 24);
}

export function StateView({ data }: { data: unknown }) {
  const cards = metricCards(data);

  return (
    <div className="stateView">
      {cards.length > 0 && (
        <div className="metricGrid" aria-label="Operational metrics">
          {cards.map((card) => (
            <article className="metricCard" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      )}

      <details className="rawState">
        <summary>Structured operational details</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}
