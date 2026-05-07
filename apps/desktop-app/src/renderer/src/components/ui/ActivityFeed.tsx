import type { DeviceLogModel } from "../../types/desktop-api";

export function ActivityFeed({ items }: { items: DeviceLogModel[] }) {
  return (
    <div className="activity-feed">
      {items.length === 0 ? (
        <p className="empty-state">Waiting for device activity...</p>
      ) : (
        items.map((item) => (
          <article className="activity-item" key={item.id}>
            <div className={`activity-dot tone-${item.level}`} />
            <div>
              <strong>{item.message}</strong>
              <p>
                {item.pumpId} · {new Date(item.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
