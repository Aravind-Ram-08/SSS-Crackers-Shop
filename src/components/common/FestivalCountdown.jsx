import { useState } from "react";
import { useFestival } from "../../context/FestivalContext";
import "./FestivalCountdown.css";

// ── Shared clock blocks ───────────────────────────────────────────────────
function ClockBlocks({ days, hours, minutes, seconds, compact = false }) {
    return (
        <div className={`fcs-blocks ${compact ? "fcs-blocks-compact" : ""}`}>
            {[
                { val: days, unit: "Days" },
                { val: hours, unit: "Hours" },
                { val: minutes, unit: "Minutes" },
                { val: seconds, unit: "Seconds" },
            ].map(({ val, unit }, idx) => (
                <div key={unit} className="fcs-block-wrap">
                    <div className="fcs-block">
                        <span className="fcs-num">{String(val).padStart(2, "0")}</span>
                        <span className="fcs-unit">{unit}</span>
                    </div>
                    {idx < 3 && <span className="fcs-sep">:</span>}
                </div>
            ))}
        </div>
    );
}

// ── Sale Live Banner (when countdown is over) ─────────────────────────────
function SaleLiveBanner({ message }) {
    return (
        <div className="festival-live-banner" id="festival-live-banner">
            <div className="flb-inner">
                <span className="flb-burst">🎆</span>
                <div className="flb-text">
                    <strong>{message}</strong>
                </div>
                <span className="flb-burst">🎇</span>
            </div>
        </div>
    );
}

// ── Top-Bar style (default) ───────────────────────────────────────────────
function TopBarCountdown({ festival, countdown }) {
    const { days, hours, minutes, seconds, isOver } = countdown;
    if (isOver) return <SaleLiveBanner message={festival.saleLiveMessage} />;
    return (
        <div className="festival-countdown-strip fcs-style-topbar" id="festival-countdown-strip">
            <div className="fcs-inner">
                <span className="fcs-label">
                    {festival.emoji} {festival.name} Countdown
                </span>
                <ClockBlocks days={days} hours={hours} minutes={minutes} seconds={seconds} />
                <span className="fcs-msg">🔥 Shop now &amp; save big!</span>
            </div>
        </div>
    );
}

// ── Banner style (full-width hero strip) ──────────────────────────────────
function BannerCountdown({ festival, countdown }) {
    const { days, hours, minutes, seconds, isOver } = countdown;
    if (isOver) return <SaleLiveBanner message={festival.saleLiveMessage} />;
    return (
        <div className="festival-countdown-strip fcs-style-banner" id="festival-countdown-strip">
            <div className="fcs-banner-inner">
                <div className="fcs-banner-left">
                    <span className="fcs-banner-emoji">{festival.emoji}</span>
                    <div>
                        <p className="fcs-banner-title">{festival.name} Sale</p>
                        <p className="fcs-banner-sub">Countdown to the biggest sale of the year</p>
                    </div>
                </div>
                <ClockBlocks days={days} hours={hours} minutes={minutes} seconds={seconds} />
                <span className="fcs-banner-cta">🔥 Shop &amp; Save!</span>
            </div>
        </div>
    );
}

// ── Popup style (floating bottom-right) ──────────────────────────────────
function PopupCountdown({ festival, countdown }) {
    const { days, hours, minutes, seconds, isOver } = countdown;
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;
    if (isOver) {
        return (
            <div className="fcs-popup fcs-popup-live" id="festival-countdown-popup">
                <button className="fcs-popup-close" onClick={() => setDismissed(true)} aria-label="Close">✕</button>
                <span className="fcs-popup-fire">🎆</span>
                <p className="fcs-popup-live-msg">{festival.saleLiveMessage}</p>
            </div>
        );
    }
    return (
        <div className="fcs-popup" id="festival-countdown-popup">
            <button className="fcs-popup-close" onClick={() => setDismissed(true)} aria-label="Close">✕</button>
            <p className="fcs-popup-label">{festival.emoji} {festival.name} Countdown</p>
            <ClockBlocks days={days} hours={hours} minutes={minutes} seconds={seconds} compact />
            <p className="fcs-popup-cta">🔥 Shop now &amp; save big!</p>
        </div>
    );
}

// ── Main export — routes to the correct display style ──────────────────────
export default function FestivalCountdown() {
    const { festival, countdown } = useFestival();

    // Respect the admin toggle — if disabled, render nothing
    if (!festival.countdownEnabled) return null;

    const style = festival.displayStyle ?? "top-bar";

    if (style === "banner") return <BannerCountdown festival={festival} countdown={countdown} />;
    if (style === "popup") return <PopupCountdown festival={festival} countdown={countdown} />;
    return <TopBarCountdown festival={festival} countdown={countdown} />;
}
