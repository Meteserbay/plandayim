import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { DailyInteractions } from "../../types/owner";

interface Series {
    key: "profileViews" | "contactClicks";
    label: string;
    className: string;
}

// Renkler CSS'te --series-1 / --series-2 olarak tanımlı (doğrulanmış palet).
const series: Series[] = [
    { key: "profileViews", label: "Görüntülenme", className: "chart-series-1" },
    { key: "contactClicks", label: "İletişim tıklaması", className: "chart-series-2" },
];

const height = 240;
const padding = { top: 16, right: 16, bottom: 28, left: 40 };

const tickCount = 4;

// Eksen 4 eşit adıma bölünür; adım 1, 2 veya 5'in 10'un katlarıyla çarpımı
// olduğu için ara çizgiler her zaman tam sayıya denk gelir.
function niceMax(value: number): number {
    const rawStep = Math.max(1, value / tickCount);
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));

    for (const multiplier of [1, 2, 5, 10]) {
        const step = multiplier * magnitude;

        if (step >= rawStep) {
            return step * tickCount;
        }
    }

    return 10 * magnitude * tickCount;
}

function formatDay(date: string, options: Intl.DateTimeFormatOptions) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("tr-TR", options);
}

function DailyChart({ data }: { data: DailyInteractions[] }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(640);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        const element = containerRef.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            setWidth(Math.max(280, entry.contentRect.width));
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const maxValue = niceMax(
        Math.max(0, ...data.flatMap((d) => [d.profileViews, d.contactClicks]))
    );
    const ticks = Array.from(
        { length: tickCount + 1 },
        (_, index) => (index * maxValue) / tickCount
    );

    const x = (index: number) =>
        padding.left +
        (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const y = (value: number) =>
        padding.top + plotHeight - (value / maxValue) * plotHeight;

    const labelEvery = Math.max(1, Math.ceil(data.length / Math.floor(plotWidth / 70)));

    function handleMove(event: MouseEvent<SVGRectElement>) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const relative = (event.clientX - bounds.left) / bounds.width;
        const index = Math.round(relative * (data.length - 1));

        setHoverIndex(Math.min(data.length - 1, Math.max(0, index)));
    }

    const hovered = hoverIndex !== null ? data[hoverIndex] : null;

    return (
        <div className="daily-chart">
            <div className="chart-legend">
                {series.map((item) => (
                    <span key={item.key} className="chart-legend-item">
                        <span className={`chart-legend-swatch ${item.className}`} />
                        {item.label}
                    </span>
                ))}
            </div>

            <div className="chart-canvas" ref={containerRef}>
                <svg
                    width={width}
                    height={height}
                    role="img"
                    aria-label="Günlük görüntülenme ve iletişim tıklaması grafiği"
                >
                    {ticks.map((tick) => (
                        <g key={tick}>
                            <line
                                className="chart-grid"
                                x1={padding.left}
                                x2={width - padding.right}
                                y1={y(tick)}
                                y2={y(tick)}
                            />
                            <text
                                className="chart-axis-label"
                                x={padding.left - 8}
                                y={y(tick)}
                                textAnchor="end"
                                dominantBaseline="middle"
                            >
                                {tick.toLocaleString("tr-TR")}
                            </text>
                        </g>
                    ))}

                    {data.map((day, index) =>
                        index % labelEvery === 0 ? (
                            <text
                                key={day.date}
                                className="chart-axis-label"
                                x={x(index)}
                                y={height - 8}
                                textAnchor="middle"
                            >
                                {formatDay(day.date, { day: "numeric", month: "short" })}
                            </text>
                        ) : null
                    )}

                    {series.map((item) => (
                        <polyline
                            key={item.key}
                            className={`chart-line ${item.className}`}
                            points={data
                                .map((day, index) => `${x(index)},${y(day[item.key])}`)
                                .join(" ")}
                        />
                    ))}

                    {hovered && hoverIndex !== null && (
                        <g>
                            <line
                                className="chart-crosshair"
                                x1={x(hoverIndex)}
                                x2={x(hoverIndex)}
                                y1={padding.top}
                                y2={padding.top + plotHeight}
                            />
                            {series.map((item) => (
                                <circle
                                    key={item.key}
                                    className={`chart-dot ${item.className}`}
                                    cx={x(hoverIndex)}
                                    cy={y(hovered[item.key])}
                                    r={5}
                                />
                            ))}
                        </g>
                    )}

                    <rect
                        className="chart-hit-area"
                        x={padding.left}
                        y={padding.top}
                        width={plotWidth}
                        height={plotHeight}
                        onMouseMove={handleMove}
                        onMouseLeave={() => setHoverIndex(null)}
                    />
                </svg>

                {hovered && hoverIndex !== null && (
                    <div
                        className="chart-tooltip"
                        style={{
                            left: Math.min(x(hoverIndex) + 12, width - 180),
                            top: padding.top,
                        }}
                    >
                        <strong>
                            {formatDay(hovered.date, {
                                day: "numeric",
                                month: "long",
                                weekday: "short",
                            })}
                        </strong>

                        {series.map((item) => (
                            <span key={item.key} className="chart-tooltip-row">
                                <span className={`chart-legend-swatch ${item.className}`} />
                                {item.label}
                                <b>{hovered[item.key]}</b>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <details className="chart-table">
                <summary>Tablo olarak göster</summary>

                <table>
                    <thead>
                        <tr>
                            <th>Gün</th>
                            {series.map((item) => (
                                <th key={item.key}>{item.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...data].reverse().map((day) => (
                            <tr key={day.date}>
                                <td>
                                    {formatDay(day.date, {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </td>
                                <td>{day.profileViews}</td>
                                <td>{day.contactClicks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </div>
    );
}

export default DailyChart;
