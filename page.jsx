"use client";

import "./globals.css";
import { useEffect, useMemo, useRef, useState } from "react";

const notes = [
  ["G4", 0.38], ["G4", 0.18], ["A4", 0.55], ["G4", 0.55], ["C5", 0.55], ["B4", 0.95],
  ["G4", 0.38], ["G4", 0.18], ["A4", 0.55], ["G4", 0.55], ["D5", 0.55], ["C5", 0.95],
  ["G4", 0.38], ["G4", 0.18], ["G5", 0.55], ["E5", 0.55], ["C5", 0.55], ["B4", 0.55], ["A4", 0.95],
  ["F5", 0.38], ["F5", 0.18], ["E5", 0.55], ["C5", 0.55], ["D5", 0.55], ["C5", 1.2],
];

const frequency = {
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

function playTone(ctx, destination, note, start, duration) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.value = frequency[note];

  filter.type = "lowpass";
  filter.frequency.value = 1600;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration * 0.92);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(start);
  osc.stop(start + duration);
}

export default function Page() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photo, setPhoto] = useState(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const totalDuration = useMemo(
    () => notes.reduce((sum, [, duration]) => sum + duration, 0) + notes.length * 0.045,
    []
  );

  useEffect(() => {
    const photoTimer = setInterval(() => setPhoto((p) => (p + 1) % 2), 2600);
    return () => clearInterval(photoTimer);
  }, []);

  function stopExisting() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
    }
  }

  function playHappyBirthday() {
    stopExisting();

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioRef.current = ctx;

    const master = ctx.createGain();
    const delay = ctx.createDelay();
    const feedback = ctx.createGain();

    master.gain.value = 0.72;
    delay.delayTime.value = 0.16;
    feedback.gain.value = 0.16;

    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(ctx.destination);

    let cursor = ctx.currentTime + 0.08;
    notes.forEach(([note, duration]) => {
      playTone(ctx, master, note, cursor, duration);
      cursor += duration + 0.045;
    });

    setPlaying(true);
    setProgress(0);
    const start = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const value = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(value);
      if (value >= 100) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setPlaying(false);
      }
    }, 100);
  }

  useEffect(() => {
    return () => stopExisting();
  }, []);

  const confetti = Array.from({ length: 46 }, (_, i) => ({
    x: `${(i * 17) % 100}%`,
    hue: (i * 47) % 360,
    duration: `${4 + (i % 6) * 0.45}s`,
    delay: `${-(i % 13) * 0.33}s`,
  }));

  return (
    <main className="page">
      <div className="music-note note-1">♪</div>
      <div className="music-note note-2">♫</div>
      <div className="music-note note-3">♬</div>
      <div className="music-note note-4">♩</div>

      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span
            key={i}
            style={{
              "--x": c.x,
              "--hue": c.hue,
              "--duration": c.duration,
              "--delay": c.delay,
            }}
          />
        ))}
      </div>

      <section className="ipod" aria-label="Classic iPod birthday player">
        <div className="screen">
          <div className="status">
            <span>{playing ? "▶ Playing" : "Birthday iPod"}</span>
            <span>12:00</span>
            <span className="battery" />
          </div>

          <div className="screen-body">
            <aside className="menu-panel">
              <div className="menu-title">Music</div>
              <div className="menu-item active">
                <span>Now Playing</span>
                <span>›</span>
              </div>
              <div className="menu-item">
                <span>Birthday Songs</span>
                <span>›</span>
              </div>
              <div className="menu-item">
                <span>For P&apos;Lita</span>
                <span>›</span>
              </div>
              <div className="menu-item">
                <span>Memories</span>
                <span>›</span>
              </div>
              <div className="menu-item">
                <span>Best Wishes</span>
                <span>›</span>
              </div>
            </aside>

            <section className="now-playing">
              <div className="album">
                <img
                  src={photo === 0 ? "/images/plita-1.jpg" : "/images/plita-2.jpg"}
                  alt="Birthday portrait"
                />
              </div>

              <div>
                <div className="track-title">Happy Birthday, P&apos;Lita</div>
                <div className="artist">A little song just for you</div>
              </div>

              <div className="progress">
                <div className="progress-row">
                  <span>{playing ? "0:12" : "0:00"}</span>
                  <span>0:22</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ "--progress": `${progress}%` }} />
                </div>
              </div>
            </section>
          </div>

          <div className="message">
            Wishing you a birthday filled with happiness, beautiful music, warm smiles, and every good thing you deserve. 🎂
          </div>
        </div>

        <div className="wheel-wrap">
          <div className="wheel">
            <div className="wheel-label label-menu">MENU</div>
            <div className="wheel-label label-prev">◀◀</div>
            <div className="wheel-label label-next">▶▶</div>
            <div className="wheel-label label-play">▶❚❚</div>
            <button className="center-button" onClick={playHappyBirthday}>
              {playing ? "PLAYING" : "PLAY"}
            </button>
          </div>
        </div>

        <div className="caption">
          Press PLAY to hear the birthday melody.
        </div>
      </section>
    </main>
  );
}
